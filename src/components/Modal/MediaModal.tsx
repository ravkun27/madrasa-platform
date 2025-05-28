import React, { useRef, useEffect, useState, useCallback } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import platformLogo from "/favicon.png";

interface MediaPlayerProps {
  url: string;
  contentType?: string;
  title?: string;
  aspectRatio?: "vertical" | "landscape" | "auto";
}

export const MediaModal: React.FC<MediaPlayerProps> = ({
  url,
  contentType,
  title = "Media content",
  aspectRatio = "auto",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<
    "video" | "image" | "pdf" | "unknown"
  >("unknown");
  const [isVideoJsLoaded, setIsVideoJsLoaded] = useState(false);

  // Enhanced video type detection and normalization
  const getVideoSources = (url: string, contentType?: string) => {
    const sources = [];

    // If we have a specific content type, use it first
    if (contentType && contentType.startsWith("video/")) {
      sources.push({ src: url, type: contentType });
    }

    // Always add multiple fallback options for better compatibility
    const urlLower = url.toLowerCase();

    // Try to detect format and add appropriate sources
    if (
      urlLower.includes(".mp4") ||
      urlLower.includes("mp4") ||
      contentType?.includes("mp4")
    ) {
      if (!sources.some((s) => s.type === "video/mp4")) {
        sources.push({ src: url, type: "video/mp4" });
      }
    } else if (urlLower.includes(".webm") || contentType?.includes("webm")) {
      if (!sources.some((s) => s.type === "video/webm")) {
        sources.push({ src: url, type: "video/webm" });
      }
      sources.push({ src: url, type: "video/mp4" }); // Fallback
    } else if (
      urlLower.includes(".mov") ||
      urlLower.includes("quicktime") ||
      contentType?.includes("quicktime")
    ) {
      sources.push({ src: url, type: "video/mp4" }); // Most compatible first
      sources.push({ src: url, type: "video/quicktime" });
    } else if (urlLower.includes(".avi") || contentType?.includes("avi")) {
      sources.push({ src: url, type: "video/mp4" }); // Most compatible first
      sources.push({ src: url, type: "video/avi" });
      sources.push({ src: url, type: "video/x-msvideo" });
    } else if (urlLower.includes(".mkv") || contentType?.includes("matroska")) {
      sources.push({ src: url, type: "video/mp4" }); // Most compatible first
      sources.push({ src: url, type: "video/x-matroska" });
    } else if (urlLower.includes(".m4v") || contentType?.includes("m4v")) {
      sources.push({ src: url, type: "video/mp4" }); // Most compatible
      sources.push({ src: url, type: "video/x-m4v" });
    } else if (urlLower.includes(".3gp") || contentType?.includes("3gp")) {
      sources.push({ src: url, type: "video/mp4" }); // Most compatible first
      sources.push({ src: url, type: "video/3gpp" });
    } else if (urlLower.includes(".flv") || contentType?.includes("flv")) {
      sources.push({ src: url, type: "video/mp4" }); // Most compatible first
      sources.push({ src: url, type: "video/x-flv" });
    } else if (
      urlLower.includes(".ogg") ||
      urlLower.includes(".ogv") ||
      contentType?.includes("ogg")
    ) {
      sources.push({ src: url, type: "video/ogg" });
      sources.push({ src: url, type: "video/mp4" }); // Fallback
    } else {
      // Unknown format - try all common formats as fallbacks
      sources.push({ src: url, type: "video/mp4" });
      sources.push({ src: url, type: "video/webm" });
      sources.push({ src: url, type: "application/x-mpegURL" }); // HLS streams
      sources.push({ src: url, type: "application/dash+xml" }); // DASH streams
    }

    // Remove duplicates
    const uniqueSources = sources.filter(
      (source, index, self) =>
        index === self.findIndex((s) => s.type === source.type)
    );

    return uniqueSources;
  };

  // Detect media type
  useEffect(() => {
    const detectMediaType = () => {
      if (contentType) {
        if (contentType.startsWith("image/")) return "image";
        if (contentType.startsWith("video/") || contentType === "video/mp4")
          return "video";
        if (contentType === "application/pdf") return "pdf";
      }

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
        ".ogv",
        ".ogg",
      ];

      if (imageExtensions.some((ext) => urlLower.endsWith(ext))) return "image";
      if (videoExtensions.some((ext) => urlLower.endsWith(ext))) return "video";
      if (urlLower.endsWith(".pdf")) return "pdf";

      // Default to video for AWS/CloudFront URLs
      if (
        urlLower.includes("amazonaws.com") ||
        urlLower.includes("cloudfront.net")
      ) {
        return "video";
      }

      return "video"; // Default assumption
    };

    setMediaType(detectMediaType());
  }, [url, contentType]);

  // Load Video.js resources
  useEffect(() => {
    if (mediaType !== "video") return;

    const loadVideoJs = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="video-js.css"]')) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = "https://vjs.zencdn.net/8.6.1/video-js.css";
        document.head.appendChild(cssLink);
      }

      // Load JS if not already loaded
      if (!window.videojs) {
        return new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://vjs.zencdn.net/8.6.1/video.min.js";
          script.onload = () => {
            setIsVideoJsLoaded(true);
            resolve();
          };
          document.body.appendChild(script);
        });
      } else {
        setIsVideoJsLoaded(true);
      }
    };

    loadVideoJs();
  }, [mediaType]);

  // Cleanup function for Video.js player
  const cleanupPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        // Add check for player readiness
        if (!playerRef.current.isDisposed_ && !playerRef.current.isDisposed()) {
          playerRef.current.dispose();
        }
      } catch (err) {
        console.warn("Error disposing Video.js player:", err);
      }
      playerRef.current = null;
    }
    // Remove any leftover video-js DOM elements
    document.querySelectorAll(".vjs-modal-dialog").forEach((el) => el.remove());
  }, []);

  // Initialize Video.js player
  useEffect(() => {
    if (mediaType !== "video" || !isVideoJsLoaded || !window.videojs) return;

    const initializePlayer = () => {
      // Clean up any existing player first
      cleanupPlayer();

      // Ensure video element exists and is in DOM
      if (!videoRef.current || !document.body.contains(videoRef.current)) {
        console.warn("Video element not found in DOM");
        return;
      }

      // Check if this element already has a Video.js player
      const existingPlayer = window.videojs.getPlayer(videoRef.current);
      if (existingPlayer) {
        console.warn("Player already exists for this element");
        try {
          existingPlayer.dispose();
        } catch (err) {
          console.warn("Error disposing existing player:", err);
        }
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create a unique ID for the video element if it doesn't have one
        if (!videoRef.current.id) {
          videoRef.current.id = `video-player-${Math.random().toString(36).substr(2, 9)}`;
        }

        // Get multiple source options for better compatibility
        const sources = getVideoSources(url, contentType);

        // Initialize Video.js player with enhanced configuration
        playerRef.current = window.videojs(videoRef.current, {
          controls: true,
          responsive: false, // Disable to prevent full-screen behavior
          fluid: false, // Disable to maintain aspect ratio
          fill: false, // Prevent filling container completely
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          preload: "auto", // Changed from metadata to auto for better loading
          html5: {
            vhs: {
              overrideNative: true,
              enableLowInitialPlaylist: true,
              smoothQualityChange: true,
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false,
            // Additional HTML5 options for better compatibility
            hls: {
              overrideNative: true,
            },
          },
          sources: sources,
          userActions: {
            hotkeys: true,
          },
          // Enhanced tech order and options
          techOrder: ["html5", "youtube", "vimeo"],
          autoplay: false,
          muted: false,
          // Force HTML5 video element
          preferFullWindow: false,
          // Additional compatibility options
          crossOrigin: "anonymous",
          // Error recovery options
          retryOnError: 3,
          experimentalSvgIcons: false,
          // Aspect ratio and sizing
          aspectRatio: "16:9", // Default aspect ratio
          breakpoints: {
            tiny: 300,
            xsmall: 400,
            small: 500,
            medium: 640,
            large: 1024,
            xlarge: 1440,
            huge: 1920,
          },
        });

        console.log("Video sources configured:", sources);
        console.log("Content type:", contentType);

        // Add event listeners
        playerRef.current.ready(() => {
          console.log("Video.js player ready");
          setIsLoading(false);

          // Ensure proper sizing and aspect ratio
          const player = playerRef.current;
          if (player) {
            // Force proper aspect ratio and prevent full screen behavior
            player.dimensions("100%", "auto");

            // Add custom CSS to maintain aspect ratio and control visibility
            const playerEl = player.el();
            if (playerEl) {
              playerEl.style.maxWidth = "100%";
              playerEl.style.maxHeight = "70vh"; // Limit height on mobile
              playerEl.style.aspectRatio = "auto";

              // Ensure controls are always visible
              const controlBar = playerEl.querySelector(".vjs-control-bar");
              if (controlBar) {
                controlBar.style.opacity = "1";
                controlBar.style.visibility = "visible";
                controlBar.style.position = "absolute";
                controlBar.style.bottom = "0";
                controlBar.style.width = "100%";
                controlBar.style.zIndex = "1000";
              }
            }
          }
        });

        playerRef.current.on("error", (e: any) => {
          console.error("Video.js error:", e);
          const playerError = playerRef.current?.error();
          let errorMessage =
            "Failed to load video. This video format may not be supported by your browser.";

          if (playerError) {
            console.error("Player error details:", playerError);
            console.error(
              "Current sources:",
              playerRef.current?.currentSources()
            );

            // Try to get more specific error information
            const currentSrc = playerRef.current?.currentSrc();
            console.error("Current source URL:", currentSrc);

            switch (playerError.code) {
              case 1: // MEDIA_ERR_ABORTED
                errorMessage = "Video loading was aborted by the user.";
                break;
              case 2: // MEDIA_ERR_NETWORK
                errorMessage =
                  "Network error occurred while loading video. Please check your internet connection.";
                break;
              case 3: // MEDIA_ERR_DECODE
                errorMessage =
                  "Video file is corrupted or contains unsupported encoding.";
                break;
              case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                // Try native HTML5 video as fallback
                console.log("Attempting fallback to native HTML5 video...");
                tryNativeVideoFallback();
                return; // Don't set error immediately, let fallback try first
              default:
                errorMessage = playerError.message || errorMessage;
            }
          }

          setError(errorMessage);
          setIsLoading(false);
        });

        // Fallback function for native HTML5 video
        const tryNativeVideoFallback = () => {
          console.log("Trying native HTML5 video fallback...");

          if (videoRef.current) {
            // Dispose Video.js player
            if (playerRef.current && !playerRef.current.isDisposed()) {
              playerRef.current.dispose();
            }

            // Reset video element
            const videoElement = videoRef.current;
            videoElement.controls = true;
            videoElement.preload = "auto";
            videoElement.style.width = "100%";
            videoElement.style.height = "auto"; // Changed from 100% to auto
            videoElement.style.maxHeight = "70vh"; // Limit height
            videoElement.style.objectFit = "contain"; // Maintain aspect ratio
            videoElement.style.backgroundColor = "black";

            // Clear existing sources
            while (videoElement.firstChild) {
              videoElement.removeChild(videoElement.firstChild);
            }

            // Add sources as <source> elements
            const sources = getVideoSources(url, contentType);
            sources.forEach((source) => {
              const sourceElement = document.createElement("source");
              sourceElement.src = source.src;
              sourceElement.type = source.type;
              videoElement.appendChild(sourceElement);
            });

            // Add error handler for native video
            const handleNativeError = () => {
              console.error("Native HTML5 video also failed");
              setError(
                "This video format is not supported. Please try converting the video to MP4 format."
              );
              setIsLoading(false);
            };

            const handleNativeLoad = () => {
              console.log("Native HTML5 video loaded successfully");
              setIsLoading(false);
              setError(null);
            };

            videoElement.addEventListener("error", handleNativeError);
            videoElement.addEventListener("loadeddata", handleNativeLoad);
            videoElement.addEventListener("canplay", () => setIsLoading(false));

            // Try to load
            videoElement.load();
          }
        };

        playerRef.current.on("loadstart", () => {
          setIsLoading(true);
        });

        playerRef.current.on("canplay", () => {
          setIsLoading(false);
        });

        playerRef.current.on("waiting", () => {
          setIsLoading(true);
        });

        playerRef.current.on("playing", () => {
          setIsLoading(false);
        });

        // Additional event listeners for debugging
        playerRef.current.on("loadedmetadata", () => {
          console.log("Video metadata loaded");
        });

        playerRef.current.on("loadeddata", () => {
          console.log("Video data loaded");
        });
      } catch (err) {
        console.error("Video.js initialization error:", err);
        setError(
          "Failed to initialize video player. Please try refreshing the page."
        );
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is fully ready
    const timeoutId = setTimeout(initializePlayer, 150);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      cleanupPlayer();
    };
  }, [url, contentType, mediaType, isVideoJsLoaded, cleanupPlayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPlayer();
    };
  }, [cleanupPlayer]);

  // Get aspect ratio class
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

  // Handle image loading
  const handleImageLoaded = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setError("Failed to load image. Please check the URL and try again.");
    setIsLoading(false);
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);

    if (
      mediaType === "video" &&
      playerRef.current &&
      !playerRef.current.isDisposed()
    ) {
      try {
        const sources = getVideoSources(url, contentType);
        playerRef.current.src(sources);
      } catch (err) {
        console.error("Error setting new source:", err);
        // Force re-initialization
        cleanupPlayer();
        setIsVideoJsLoaded(false);
        setTimeout(() => setIsVideoJsLoaded(true), 100);
      }
    }
  };

  // Loading state
  if (mediaType === "unknown" && isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/10 p-4 rounded-lg min-h-[200px]">
        <Loader2 className="animate-spin text-gray-500 w-12 h-12 mb-4" />
        <p className="text-center text-gray-500">Detecting media type...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/10 text-red-500 p-4 rounded-lg min-h-[200px]">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-center mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const PlatformLogo = () => (
    <img
      src={platformLogo}
      alt="Platform Logo"
      className="absolute top-4 right-4 h-6 w-6 opacity-80 z-20 transition-opacity hover:opacity-100"
    />
  );

  return (
    <div className="relative w-full bg-black rounded-lg mb-2 overflow-hidden">
      {isLoading && mediaType !== "video" && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
          <Loader2 className="animate-spin text-white w-12 h-12" />
        </div>
      )}

      {/* Video Player with Video.js */}
      {mediaType === "video" && (
        <div className="relative w-full h-auto aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            className="video-js vjs-default-skin w-full h-auto max-h-[70vh] object-contain"
            style={{
              aspectRatio: "auto",
              maxWidth: "100%",
              display: "block",
            }}
          />
          <PlatformLogo />
        </div>
      )}

      {/* Image Display */}
      {mediaType === "image" && (
        <div
          className={`w-full h-full max-h-screen flex items-center justify-center relative ${getAspectRatioClass()}`}
        >
          <img
            src={url}
            alt={title}
            className={`w-full h-full object-contain ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300 pointer-events-none select-none`}
            onLoad={handleImageLoaded}
            onError={handleImageError}
            onContextMenu={(e) => e.preventDefault()}
            draggable="false"
            crossOrigin="anonymous"
          />
          <PlatformLogo />
        </div>
      )}

      {/* PDF Display */}
      {mediaType === "pdf" && (
        <div className={`relative w-full h-full ${getAspectRatioClass()}`}>
          <iframe
            src={url}
            className={`w-full h-full border-0 ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
            onLoad={handleImageLoaded}
            onError={handleImageError}
            title={title}
          />
          <PlatformLogo />
        </div>
      )}
    </div>
  );
};
