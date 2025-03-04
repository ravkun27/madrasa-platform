import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Maximize,
  Minimize,
  AlertTriangle,
  Loader2,
  FileQuestion,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  MonitorSmartphone,
} from "lucide-react";

interface MediaViewerProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  contentType?: string;
  title?: string;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];

export const MediaModal: React.FC<MediaViewerProps> = ({
  url,
  isOpen,
  onClose,
  contentType,
  title,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [prevVolume, setPrevVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Detect content type
  useEffect(() => {
    const detectType = () => {
      if (contentType) {
        if (contentType.startsWith("image/")) return "image";
        if (contentType.startsWith("video/")) return "video";
        if (contentType === "application/pdf") return "pdf";
      }
      return null;
    };
    setDetectedType(detectType());
  }, [contentType]);

  // Video controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseFloat(e.target.value);
      setVolume(vol);
      if (videoRef.current) {
        videoRef.current.volume = vol;
        setIsMuted(vol === 0);
      }
    },
    []
  );

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
    if (newMuted) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
      videoRef.current.volume = prevVolume;
    }
  }, [isMuted, volume, prevVolume]);

  const skip = useCallback(
    (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          Math.max(videoRef.current.currentTime + seconds, 0),
          duration
        );
      }
    },
    [duration]
  );

  // Playback speed control
  const changePlaybackSpeed = useCallback(() => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  }, [playbackSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case " ":
          togglePlay();
          break;
        case "ArrowLeft":
          skip(-5);
          break;
        case "ArrowRight":
          skip(5);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          handleFullscreenToggle();
          break;
        case "Escape":
          onClose();
          break;
        case ">":
        case ".":
          changePlaybackSpeed();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, togglePlay, skip, toggleMute, changePlaybackSpeed]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setVolume(1);
      setIsMuted(false);
      setPlaybackSpeed(1);
    }
  }, [isOpen]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Fullscreen handling
  const handleFullscreenToggle = useCallback(async () => {
    if (!modalRef.current) return;

    if (!isFullscreen) {
      await modalRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Landscape mode for mobile
  const toggleLandscape = useCallback(async () => {
    if (!("orientation" in screen) || !("lock" in screen.orientation)) {
      console.warn("Screen orientation API is not supported on this device.");
      return;
    }

    try {
      if (!isLandscape) {
        // Request full-screen mode first (needed for some browsers)
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document as any).webkitRequestFullscreen) {
          await (document as any).webkitRequestFullscreen();
        }

        // Lock the screen orientation
        await (screen.orientation as any).lock("landscape");
      } else {
        // Unlock orientation (some browsers do not support this)
        await (screen.orientation as any).unlock();

        // Exit full-screen mode
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }

      setIsLandscape(!isLandscape);
    } catch (error) {
      console.error("Failed to lock orientation:", error);
    }
  }, [isLandscape]);

  // Close handler
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  const ProgressBar = () => (
    <div className="w-full flex items-center gap-2 px-2">
      <span className="text-xs text-gray-300 w-12 sm:w-16">
        {formatTime(currentTime)}
      </span>
      <div className="relative flex-1 h-2 bg-gray-600 rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-blue-400 rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <span className="text-xs text-gray-300 w-12 sm:w-16">
        {formatTime(duration)}
      </span>
    </div>
  );

  const VideoControls = () => (
    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 bg-gradient-to-t from-black/70 to-transparent">
      <div className="space-y-3">
        <ProgressBar />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => skip(-10)}
              className="p-1 sm:p-2 text-gray-300 hover:text-white transition-colors"
            >
              <SkipBack size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <Pause
                  size={20}
                  className="sm:w-6 sm:h-6"
                  fill="currentColor"
                />
              ) : (
                <Play size={20} className="sm:w-6 sm:h-6" fill="currentColor" />
              )}
            </button>
            <button
              onClick={() => skip(10)}
              className="p-1 sm:p-2 text-gray-300 hover:text-white transition-colors"
            >
              <SkipForward size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={changePlaybackSpeed}
              className="px-2 py-1 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-gray-300"
            >
              {playbackSpeed}x
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
            <button
              onClick={toggleLandscape}
              className="p-1 sm:p-2 text-gray-300 hover:text-white transition-colors hidden sm:block"
            >
              <MonitorSmartphone size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={toggleMute}
              className="p-1 sm:p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX size={20} className="sm:w-6 sm:h-6" />
              ) : (
                <Volume2 size={20} className="sm:w-6 sm:h-6" />
              )}
            </button>
            <div className="w-20 sm:w-24 h-1.5 bg-gray-600 rounded-full relative">
              <div
                className="absolute top-0 left-0 h-full bg-blue-400 rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 !mt-0"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-gray-900 rounded-xl overflow-hidden shadow-2xl w-full h-full sm:max-w-4xl sm:min-h-[70vh] flex flex-col ${
          isFullscreen ? "fixed inset-0 max-w-none max-h-none rounded-none" : ""
        } ${isLandscape ? "aspect-video" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 backdrop-blur-sm">
          <h3 className="font-medium text-gray-100 truncate text-sm sm:text-base">
            {title || url.split("/").pop()}
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLandscape}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 sm:hidden"
            >
              <MonitorSmartphone size={16} />
            </button>
            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-400" size={48} />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <AlertTriangle className="text-red-400 mb-3" size={48} />
              <p className="text-gray-300 font-medium text-center">{error}</p>
            </div>
          )}

          {detectedType === "video" && (
            <div
              className="h-full w-full relative group"
              onMouseMove={resetControlsTimeout}
              onTouchMove={resetControlsTimeout}
              onTouchStart={resetControlsTimeout}
            >
              <video
                ref={videoRef}
                src={url}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setError("Failed to load video")}
                playsInline
              />

              {showControls && <VideoControls />}
            </div>
          )}

          {/* Other media types */}
          {detectedType === "image" && (
            <img
              src={url}
              alt="Media content"
              className="w-full h-full object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => setError("Failed to load image")}
            />
          )}

          {detectedType === "pdf" && (
            <iframe
              src={url}
              className="w-full h-full min-h-[70vh] border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => setError("Failed to load PDF")}
            />
          )}

          {!detectedType && !isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <FileQuestion className="text-gray-400 mb-3" size={48} />
              <p className="text-gray-300 font-medium text-center">
                Unsupported file format
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .filter((v, i) => v > 0 || i > 0)
    .map((v) => `${v}`.padStart(2, "0"))
    .join(":");
};
