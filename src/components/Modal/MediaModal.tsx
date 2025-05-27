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

        // Initialize Video.js player
        playerRef.current = window.videojs(videoRef.current, {
          controls: true,
          responsive: true,
          fluid: true,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          preload: "metadata",
          html5: {
            vhs: {
              overrideNative: true,
            },
          },
          sources: [
            {
              src: url,
              type: contentType || "video/mp4",
            },
          ],
          userActions: {
            hotkeys: true,
          },
        });

        // Add event listeners
        playerRef.current.ready(() => {
          console.log("Video.js player ready");
          setIsLoading(false);
        });

        playerRef.current.on("error", (e: any) => {
          console.error("Video.js error:", e);
          const playerError = playerRef.current?.error();
          let errorMessage =
            "Failed to load video. Please check the URL and try again.";

          if (playerError) {
            switch (playerError.code) {
              case 1:
                errorMessage = "Video loading was aborted.";
                break;
              case 2:
                errorMessage = "Network error occurred while loading video.";
                break;
              case 3:
                errorMessage = "Video format is not supported.";
                break;
              case 4:
                errorMessage = "Video source is not available.";
                break;
            }
          }

          setError(errorMessage);
          setIsLoading(false);
        });

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
      } catch (err) {
        console.error("Video.js initialization error:", err);
        setError("Failed to initialize video player.");
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
        playerRef.current.src({
          src: url,
          type: contentType || "video/mp4",
        });
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
    <div
      className={`relative w-full bg-black ${getAspectRatioClass()} rounded-lg mb-2 overflow-hidden`}
    >
      {isLoading && mediaType !== "video" && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
          <Loader2 className="animate-spin text-white w-12 h-12" />
        </div>
      )}

      {/* Video Player with Video.js */}
      {mediaType === "video" && (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="video-js vjs-default-skin w-full h-full"
          />
          <PlatformLogo />
        </div>
      )}

      {/* Image Display */}
      {mediaType === "image" && (
        <div className="w-full h-full max-h-screen flex items-center justify-center relative">
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
        <div className="relative w-full h-full">
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
