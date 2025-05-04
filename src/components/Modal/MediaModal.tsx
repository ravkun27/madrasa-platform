import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
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
  title = "Media content",
  aspectRatio = "auto",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mediaType, setMediaType] = useState<
    "video" | "image" | "pdf" | "unknown"
  >("unknown");
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
  const [showInfo, setShowInfo] = useState(false);

  // Detect media type from URL and content type more accurately
  useEffect(() => {
    const detectMediaType = () => {
      // First try to determine from contentType if available
      if (contentType) {
        if (contentType.startsWith("image/")) return "image";
        if (contentType.startsWith("video/") || contentType === "video/mp4")
          return "video";
        if (contentType === "application/pdf") return "pdf";
      }

      // If contentType isn't available or is ambiguous, check URL
      const urlLower = url.toLowerCase();
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".webp",
        ".svg",
        ".heic",
      ];
      const videoExtensions = [
        ".mp4",
        ".webm",
        ".mov",
        ".avi",
        ".mkv",
        ".m4v",
        ".3gp",
        ".flv",
      ];
      const pdfExtension = ".pdf";

      // Check for AWS S3 or CloudFront URLs which often don't have extensions
      if (
        urlLower.includes("amazonaws.com") ||
        urlLower.includes("cloudfront.net")
      ) {
        // For AWS URLs, prioritize the contentType if provided
        if (contentType) {
          if (contentType.startsWith("image/")) return "image";
          if (contentType.startsWith("video/") || contentType === "video/mp4")
            return "video";
          if (contentType === "application/pdf") return "pdf";
        } else {
          // If no contentType is provided for AWS links, treat as video for mp4 query params
          if (urlLower.includes("mp4") || urlLower.includes("video"))
            return "video";
        }
      }

      if (imageExtensions.some((ext) => urlLower.endsWith(ext))) return "image";
      if (videoExtensions.some((ext) => urlLower.endsWith(ext))) return "video";
      if (urlLower.endsWith(pdfExtension)) return "pdf";

      // Try a HEAD request to get content-type if we're still not sure
      if (mediaType === "unknown") {
        fetchContentType(url);
        return "unknown"; // Will be updated when fetch completes
      }

      return "unknown";
    };

    const newMediaType = detectMediaType();
    setMediaType(newMediaType);
  }, [url, contentType, mediaType]);

  // Fetch content type if not provided and media type is still unknown
  const fetchContentType = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        // Add credentials and headers to better handle authenticated AWS resources
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const fetchedContentType = response.headers.get("content-type");

      if (fetchedContentType) {
        if (fetchedContentType.startsWith("image/")) setMediaType("image");
        else if (
          fetchedContentType.startsWith("video/") ||
          fetchedContentType === "video/mp4"
        )
          setMediaType("video");
        else if (fetchedContentType === "application/pdf") setMediaType("pdf");
        else setMediaType("unknown");
      } else {
        // If no content type in response, make educated guess for AWS resources
        const urlLower = url.toLowerCase();
        if (
          urlLower.includes("amazonaws.com") ||
          urlLower.includes("cloudfront.net")
        ) {
          // Look for clues in the URL path or query parameters
          if (urlLower.includes("mp4") || urlLower.includes("video")) {
            setMediaType("video");
          } else if (
            urlLower.includes("jpg") ||
            urlLower.includes("png") ||
            urlLower.includes("image")
          ) {
            setMediaType("image");
          } else if (urlLower.includes("pdf")) {
            setMediaType("pdf");
          } else {
            // Default to video for AWS links without clear indicators
            setMediaType("video");
          }
        }
      }
    } catch (err) {
      console.error("Error fetching content type:", err);
      // If we can't determine, make a best guess based on URL
      const urlLower = url.toLowerCase();
      if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
        setMediaType("image");
      else if (
        urlLower.match(/\.(mp4|webm|mov|mkv)$/i) ||
        urlLower.includes("mp4")
      )
        setMediaType("video");
      else if (urlLower.endsWith(".pdf")) setMediaType("pdf");
      else if (
        urlLower.includes("amazonaws.com") ||
        urlLower.includes("cloudfront.net")
      ) {
        // Default to video for AWS links when all detection methods fail
        setMediaType("video");
      } else {
        setMediaType("unknown");
      }
    }
  };

  // Common controls
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen?.();
        document.body.style.overflow = "hidden"; // Prevent scrolling
        setIsFullscreen(true);

        // Add temporary listeners during fullscreen to prevent screenshots/recordings
        const preventKeyboardShortcuts = (e: KeyboardEvent) => {
          // Prevent common screenshot/recording keyboard shortcuts
          if (
            e.key === "PrintScreen" ||
            (e.ctrlKey && e.key === "p") ||
            (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "c")) ||
            (e.metaKey &&
              e.shiftKey &&
              (e.key === "3" || e.key === "4" || e.key === "5"))
          ) {
            e.preventDefault();
            return false;
          }
        };

        document.addEventListener("keydown", preventKeyboardShortcuts);

        // Clean up these listeners when exiting fullscreen
        const cleanupFullscreenListeners = () => {
          if (!document.fullscreenElement) {
            document.removeEventListener("keydown", preventKeyboardShortcuts);
            document.removeEventListener(
              "fullscreenchange",
              cleanupFullscreenListeners
            );
          }
        };

        document.addEventListener(
          "fullscreenchange",
          cleanupFullscreenListeners
        );
      } else if (document.fullscreenElement && document.hasFocus()) {
        await document.exitFullscreen?.();
        document.body.style.overflow = "auto"; // Restore scroll
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  }, []);

  // Handle fullscreen change from browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        document.body.style.overflow = "auto";
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Apply copy protection
  useEffect(() => {
    // Disable right-click on media elements
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable drag for images/videos
    const preventDrag = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Add protection to media elements
    const videoElement = videoRef.current;
    const imageElement = imageRef.current;
    const containerElement = containerRef.current;

    if (videoElement) {
      videoElement.addEventListener("contextmenu", preventContextMenu);
      videoElement.addEventListener("dragstart", preventDrag);
      // Add further protection for video content
      videoElement.addEventListener("copy", preventContextMenu);
      videoElement.addEventListener("cut", preventContextMenu);
    }

    if (imageElement) {
      imageElement.addEventListener("contextmenu", preventContextMenu);
      imageElement.addEventListener("dragstart", preventDrag);
    }

    if (containerElement) {
      containerElement.addEventListener("contextmenu", preventContextMenu);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("contextmenu", preventContextMenu);
        videoElement.removeEventListener("dragstart", preventDrag);
        videoElement.removeEventListener("copy", preventContextMenu);
        videoElement.removeEventListener("cut", preventContextMenu);
      }

      if (imageElement) {
        imageElement.removeEventListener("contextmenu", preventContextMenu);
        imageElement.removeEventListener("dragstart", preventDrag);
      }

      if (containerElement) {
        containerElement.removeEventListener("contextmenu", preventContextMenu);
      }
    };
  }, [mediaType]);

  // Video-specific controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current || mediaType !== "video") return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Handle play promise to avoid uncaught promise rejection
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Play failed:", err);
            setIsPlaying(false);
            // Show user-friendly error message for autoplay policy
            if (err.name === "NotAllowedError") {
              setError("Autoplay blocked. Please click play to continue.");
              setTimeout(() => setError(null), 3000);
            }
          });
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, mediaType]);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setIsLoading(false);
      videoRef.current.playbackRate = playbackSpeed;

      // Initialize volume
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [playbackSpeed, volume, isMuted]);

  // Media loading handlers
  const handleImageLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleMediaError = useCallback(
    (
      e: React.SyntheticEvent<
        HTMLVideoElement | HTMLImageElement | HTMLIFrameElement,
        Event
      >
    ) => {
      console.error("Media error:", e);
      setError(
        `Failed to load ${mediaType}. Please check the URL and try again.`
      );
      setIsLoading(false);
    },
    [mediaType]
  );

  // Controls visibility
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    // Only auto-hide controls when video is playing
    if (isPlaying && mediaType === "video") {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, mediaType]);

  useEffect(() => {
    resetControlsTimeout();

    // Update control visibility on play/pause
    if (!isPlaying) {
      setShowControls(true);
    } else {
      resetControlsTimeout();
    }

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout, isPlaying]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || mediaType !== "video") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          videoRef.current.currentTime += 10;
          break;
        case "ArrowLeft":
          e.preventDefault();
          videoRef.current.currentTime -= 10;
          break;
        case "m":
          e.preventDefault();
          videoRef.current.muted = !videoRef.current.muted;
          setIsMuted(!isMuted);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    if (
      isFullscreen ||
      containerRef.current?.contains(document.activeElement)
    ) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay, isMuted, isFullscreen, toggleFullscreen, mediaType]);

  // Update aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "vertical":
        return "aspect-[9/16]";
      case "landscape":
        return "aspect-video";
      case "auto":
      default:
        return mediaType === "image" ? "aspect-auto" : "aspect-video";
    }
  };

  // We're removing the download functionality as requested

  // Loading fallback
  if (mediaType === "unknown" && isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/10 p-4 rounded-lg min-h-[200px]">
        <Loader2 className="animate-spin text-gray-500 w-12 h-12 mb-4" />
        <p className="text-center text-gray-500">Detecting media type...</p>
      </div>
    );
  }

  // Error display with retry option
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/10 text-red-500 p-4 rounded-lg min-h-[200px]">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-center mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            // Force reload the media
            if (videoRef.current) videoRef.current.load();
            if (imageRef.current) {
              const currentSrc = imageRef.current.src;
              imageRef.current.src = "";
              setTimeout(() => {
                if (imageRef.current) imageRef.current.src = currentSrc;
              }, 100);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const PlatformLogo = () => (
    <img
      src="/favicon.png"
      alt="Platform Logo"
      className="absolute top-4 right-4 h-6 w-6 opacity-80 z-20 transition-opacity hover:opacity-100"
    />
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black ${getAspectRatioClass()} group rounded-lg mb-2 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : ""
      }`}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      onTouchEnd={resetControlsTimeout}
      tabIndex={0} // Make div focusable for keyboard controls
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-white w-12 h-12" />
        </div>
      )}

      {/* Media Renderer */}
      {mediaType === "video" && (
        <>
          <video
            ref={videoRef}
            src={url}
            className={`w-full h-full object-contain rounded-lg ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
            onClick={togglePlay}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={handleVideoLoaded}
            onCanPlay={() => setIsLoading(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleMediaError}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            playsInline
            preload="metadata"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            crossOrigin="anonymous"
          />
          <PlatformLogo />
        </>
      )}

      {mediaType === "image" && (
        <div className="w-full h-full max-h-screen flex items-center justify-center">
          <img
            ref={imageRef}
            src={url}
            alt={title}
            className={`aspect-video object-contain ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300 pointer-events-none select-none`}
            onLoad={handleImageLoaded}
            onError={handleMediaError}
            draggable="false"
            crossOrigin="anonymous"
          />
          <PlatformLogo />
        </div>
      )}

      {mediaType === "pdf" && (
        <>
          <iframe
            src={url}
            className={`w-full h-full border-0 ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
            onLoad={handleImageLoaded}
            onError={handleMediaError}
            title={title}
          />
          <PlatformLogo />
        </>
      )}

      {/* Media controls overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 rounded-lg ${
          showControls || !isPlaying || mediaType === "image"
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        {/* Top bar with title/info */}
        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-center">
          {title && (
            <div className="text-white text-sm md:text-base font-medium truncate max-w-[80%]">
              {title}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`text-white p-1 md:p-2 hover:bg-white/10 rounded-full ${showInfo ? "bg-white/20" : ""}`}
              title="Info"
            ></button>
          </div>
        </div>

        {/* Info panel */}
        {showInfo && (
          <div className="absolute top-12 right-4 p-4 bg-black/80 text-white rounded-lg text-sm z-30">
            <h3 className="font-bold mb-2">{title}</h3>
            <p>
              <strong>Type:</strong> {mediaType}
            </p>
            {mediaType === "video" && duration > 0 && (
              <p>
                <strong>Duration:</strong> {formatTime(duration)}
              </p>
            )}
            {/* Removed the source URL for security */}
          </div>
        )}

        {/* Video-specific controls */}
        {mediaType === "video" && (
          <>
            <div className="absolute inset-0 flex items-center justify-center md:gap-4">
              <button
                onClick={() =>
                  videoRef.current && (videoRef.current.currentTime -= 10)
                }
                className="text-white p-3 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Back 10s"
              >
                <SkipBack className="h-4 w-4 md:w-6 md:h-6" />
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
                title="Forward 10s"
              >
                <SkipForward className="h-4 w-4 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-1 md:p-2 bg-gradient-to-t from-black/70 to-transparent space-y-1 md:space-y-3">
              {/* Progress bar */}
              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={currentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    if (videoRef.current) videoRef.current.currentTime = time;
                  }}
                  style={{
                    backgroundSize: `${(currentTime / duration) * 100 || 0}% 100%`,
                    backgroundImage:
                      "linear-gradient(to right, #6366f1, #6366f1), linear-gradient(to right, #4b5563, #4b5563)",
                    backgroundRepeat: "no-repeat",
                  }}
                  className="w-[90%] h-1 md:h-2 rounded-xl appearance-none cursor-pointer
                    bg-gray-600
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:md:w-4
                    [&::-webkit-slider-thumb]:md:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-md
                    focus:outline-none"
                />

                <span className="text-white text-[8px] md:text-sm font-mono whitespace-nowrap">
                  {formatTime(currentTime)}/{formatTime(duration)}
                </span>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={togglePlay}
                    className="text-white p-1 md:p-2 hover:bg-white/10 rounded-lg"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-3 h-3 md:w-5 md:h-5" />
                    ) : (
                      <Play className="w-3 h-3 md:w-5 md:h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (!videoRef.current) return;
                      videoRef.current.muted = !videoRef.current.muted;
                      setIsMuted(!isMuted);
                    }}
                    className="text-white p-1 md:p-2 hover:bg-white/10 rounded-lg"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-3 h-3 md:w-5 md:h-5" />
                    ) : (
                      <Volume2 className="w-3 h-3 md:w-5 md:h-5" />
                    )}
                  </button>

                  {/* Volume control - hidden on mobile, visible on md+ */}
                  <div className="hidden md:block">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => {
                        const vol = parseFloat(e.target.value);
                        setVolume(vol);
                        if (videoRef.current) {
                          videoRef.current.volume = vol;
                          if (vol > 0) videoRef.current.muted = false;
                          setIsMuted(vol === 0);
                        }
                      }}
                      style={{
                        background: isMuted
                          ? "#9CA3AF"
                          : `linear-gradient(to right, #6366f1 ${volume * 100}%, #4b5563 ${volume * 100}%)`,
                      }}
                      className="w-20 h-1.5 rounded-lg appearance-none cursor-pointer 
                        [&::-webkit-slider-thumb]:w-3 
                        [&::-webkit-slider-thumb]:h-3 
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>

                  {/* Playback speed */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => {
                      const speed = parseFloat(e.target.value);
                      setPlaybackSpeed(speed);
                      if (videoRef.current)
                        videoRef.current.playbackRate = speed;
                    }}
                    className="bg-black/50 text-white px-1 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm"
                    title="Playback Speed"
                  >
                    {SPEED_OPTIONS.map((speed) => (
                      <option key={speed} value={speed}>
                        {speed}x
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  {/* Removed PiP button as requested to make accessing the resource harder */}

                  <button
                    onClick={toggleFullscreen}
                    className="text-white p-1 md:p-2 hover:bg-white/10 rounded-lg cursor-pointer z-10"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-3 h-3 md:w-5 md:h-5" />
                    ) : (
                      <Maximize className="w-3 h-3 md:w-5 md:h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Image-specific controls - just fullscreen */}
        {mediaType === "image" && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={toggleFullscreen}
              className="text-white p-2 bg-black/50 hover:bg-black/70 rounded-full cursor-pointer z-10"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || !isFinite(seconds)) return "00:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return [h, m, s].map((v) => `${v}`.padStart(2, "0")).join(":");
  } else {
    return [m, s].map((v) => `${v}`.padStart(2, "0")).join(":");
  }
};
