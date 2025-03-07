import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  PictureInPicture2,
  // Fullscreen,
  Loader2,
  AlertTriangle,
  Maximize,
  Minimize,
} from "lucide-react";

interface MediaPlayerProps {
  url: string;
  contentType?: string;
  title?: string;
  aspectRatio?: "vertical" | "landscape" | "auto";
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const MediaModal: React.FC<MediaPlayerProps> = ({
  url,
  contentType,
  title,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mediaType, setMediaType] = useState<"video" | "image" | "pdf">(
    "video"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect media type from content type
  useEffect(() => {
    const detectMediaType = () => {
      if (contentType) {
        if (contentType.startsWith("image/")) return "image";
        if (contentType.startsWith("video/")) return "video";
        if (contentType === "application/pdf") return "pdf";
      }
      return "video"; // default to video
    };
    setMediaType(detectMediaType());
  }, [contentType]);

  // Common controls
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Video-specific controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Media loading handlers
  const handleImageLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleMediaError = useCallback(() => {
    setError(`Failed to load ${mediaType}`);
    setIsLoading(false);
  }, [mediaType]);

  // Controls visibility
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-red-500 p-4">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-center">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black aspect-video group rounded-lg mb-2`}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center aspect-video">
          <Loader2 className="animate-spin text-white w-12 h-12" />
        </div>
      )}

      {/* Media Renderer */}
      {mediaType === "video" && (
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-contain rounded-lg aspect-video"
          onClick={togglePlay}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={handleVideoLoaded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={handleMediaError}
          playsInline
        />
      )}

      {mediaType === "image" && (
        <img
          src={url}
          alt={title || "Media content"}
          className="w-full h-full object-contain"
          onLoad={handleImageLoaded}
          onError={handleMediaError}
        />
      )}

      {mediaType === "pdf" && (
        <iframe
          src={url}
          className="w-full h-full border-0"
          onLoad={handleImageLoaded}
          onError={handleMediaError}
          title={title || "PDF document"}
        />
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 rounded-xl ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-center rounded-xl">
          <h3 className="text-white font-medium truncate text-sm sm:text-base">
            {title}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={toggleFullscreen}
              className="text-white p-1 sm:p-2 hover:bg-white/10 rounded-xl"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Video-specific controls */}
        {mediaType === "video" && (
          <>
            <div className="absolute inset-0 flex items-center justify-center md:gap-4 rounded-xl">
              <button
                onClick={() =>
                  videoRef.current && (videoRef.current.currentTime -= 10)
                }
                className="text-white p-3 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <SkipBack className="h-4 w-4 md:w-8 md:h-8" />
              </button>
              <button
                onClick={togglePlay}
                className="text-white p-2 md:p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 md:w-8 md:h-8 fill-current" />
                ) : (
                  <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                )}
              </button>
              <button
                onClick={() =>
                  videoRef.current && (videoRef.current.currentTime += 10)
                }
                className="text-white p-3 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <SkipForward className="h-4 w-4 md:w-8 md:h-8" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 md:p-2 bg-gradient-to-t from-black/50 to-transparent md:space-y-3 rounded-xl">
              <div className="w-full flex items-center md:gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    if (videoRef.current) videoRef.current.currentTime = time;
                  }}
                  style={{
                    background: `linear-gradient(to right, #6366f1 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`,
                  }}
                  className="flex-1 h-2 rounded-xl appearance-none cursor-pointer 
  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />

                <span className="text-white text-xs md:text-sm font-mono">
                  {formatTime(currentTime)}/{formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="text-white p-2 hover:bg-white/10 rounded-lg"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Play className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (!videoRef.current) return;
                      videoRef.current.muted = !videoRef.current.muted;
                      setIsMuted(!isMuted);
                    }}
                    className="text-white p-2 hover:bg-white/10 rounded-lg"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      setVolume(vol);
                      if (videoRef.current) videoRef.current.volume = vol;
                    }}
                    style={{
                      background: `linear-gradient(to right, #6366f1 ${volume * 100}%, #4b5563 ${volume * 100}%)`,
                    }}
                    className="w-24 h-2 rounded-lg appearance-none cursor-pointer 
  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />

                  <select
                    value={playbackSpeed}
                    onChange={(e) => {
                      const speed = parseFloat(e.target.value);
                      setPlaybackSpeed(speed);
                      if (videoRef.current)
                        videoRef.current.playbackRate = speed;
                    }}
                    className="bg-black/50 text-white md:px-2 py-1 rounded-md text-sm"
                  >
                    {SPEED_OPTIONS.map((speed) => (
                      <option key={speed} value={speed}>
                        {speed}x
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    className="text-white p-2 hover:bg-white/10 rounded-lg"
                    onClick={() => videoRef.current?.requestPictureInPicture()}
                  >
                    <PictureInPicture2 className="w-5 h-5" />
                  </button>
                  <button className="text-white p-2 hover:bg-white/10 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h > 0 ? h : null, m, s]
    .filter((v) => v !== null)
    .map((v) => `${v}`.padStart(2, "0"))
    .join(":");
};
