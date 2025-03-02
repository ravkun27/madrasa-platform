import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize, Minimize, AlertTriangle, Loader2, FileQuestion, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface MediaViewerProps {
    url: string;
    isOpen: boolean;
    onClose: () => void;
    contentType?: string;
    title?: string; // Optional title for the media
}

export const MediaModal: React.FC<MediaViewerProps> = ({
    url,
    isOpen,
    onClose,
    contentType,
    title
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

    // Detect content type from URL if not provided
    useEffect(() => {
        if (contentType) {
            if ([
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp', 'image/svg+xml'
            ].includes(contentType)) {
                setDetectedType('image');
            } else if ([
                'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/mpeg'
            ].includes(contentType)) {
                setDetectedType('video');
            } else if ([
                'application/pdf', 'application/x-pdf'
            ].includes(contentType)) {
                setDetectedType('pdf');
            } else {
                setDetectedType(null);
            }
        } else {
            setDetectedType(null);
        }
    }, [contentType, url]);

    // Video player controls functions
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (videoRef.current) {
            videoRef.current.volume = vol;
            setIsMuted(vol === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
            if (isMuted) {
                // Restore previous volume when unmuting
                videoRef.current.volume = volume || 0.5;
            }
        }
    };

    const skipForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
        }
    };

    const skipBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
        }
    };

    // Format time in MM:SS format
    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Hide controls after inactivity
    const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    // Reset controls timeout on mouse move
    useEffect(() => {
        const handleMouseMove = () => resetControlsTimeout();

        if (detectedType === 'video') {
            window.addEventListener('mousemove', handleMouseMove);
            resetControlsTimeout();
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [detectedType, isPlaying]);

    const handleFullscreenToggle = () => {
        if (!isFullscreen) {
            if (modalRef.current?.requestFullscreen) {
                modalRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
        // Close only if the backdrop is clicked
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
        setError(null);
    };

    const handleError = () => {
        setIsLoading(false);
        setError('Failed to load media');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col ${isFullscreen ? 'fixed inset-0 max-w-none max-h-none rounded-none' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-medium text-gray-700 dark:text-gray-200 truncate">
                        {title || url.split('/').pop()}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleFullscreenToggle}
                            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow relative overflow-hidden bg-black">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <Loader2 className="animate-spin text-blue-500" size={48} />
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-4">
                            <AlertTriangle className="text-red-500 mb-3" size={48} />
                            <p className="text-gray-300 text-center font-medium">{error}</p>
                        </div>
                    )}

                    {detectedType === 'image' && (
                        <div className="h-full flex items-center justify-center p-4">
                            <img
                                src={url}
                                alt="Media content"
                                className="max-w-full max-h-full object-contain"
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        </div>
                    )}

                    {detectedType === 'video' && (
                        <div className="h-full w-full relative group">
                            <video
                                ref={videoRef}
                                src={url}
                                className="w-full h-full object-contain"
                                onClick={togglePlay}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onError={handleError}
                                playsInline
                            />

                            {/* Custom video controls */}
                            <div
                                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                            >
                                {/* Progress bar */}
                                <div className="w-full flex items-center mb-2">
                                    <span className="text-white text-xs font-medium mr-2">{formatTime(currentTime)}</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="w-full h-1.5 rounded-full appearance-none bg-gray-600 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                                    />
                                    <span className="text-white text-xs font-medium ml-2">{formatTime(duration)}</span>
                                </div>

                                {/* Control buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={skipBackward}
                                            className="text-white hover:text-blue-400 transition-colors"
                                            aria-label="Skip back 10 seconds"
                                        >
                                            <SkipBack size={20} />
                                        </button>
                                        <button
                                            onClick={togglePlay}
                                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                                            aria-label={isPlaying ? "Pause" : "Play"}
                                        >
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                                        </button>
                                        <button
                                            onClick={skipForward}
                                            className="text-white hover:text-blue-400 transition-colors"
                                            aria-label="Skip forward 10 seconds"
                                        >
                                            <SkipForward size={20} />
                                        </button>
                                    </div>

                                    <div className="flex items-center">
                                        <button
                                            onClick={toggleMute}
                                            className="text-white hover:text-blue-400 mr-2 transition-colors"
                                            aria-label={isMuted ? "Unmute" : "Mute"}
                                        >
                                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={isMuted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-24 h-1.5 rounded-full appearance-none bg-gray-600 outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Play/pause overlay when video is paused */}
                            {!isPlaying && !isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <button
                                        onClick={togglePlay}
                                        className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                                        aria-label="Play"
                                    >
                                        <Play size={32} className="ml-1" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {detectedType === 'pdf' && (
                        <div className="h-full w-full">
                            <iframe
                                src={url}
                                className="w-full h-full border-0"
                                onLoad={handleLoad}
                                onError={handleError}
                                title="PDF Viewer"
                            />
                        </div>
                    )}

                    {!detectedType && !isLoading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-4">
                            <FileQuestion className="text-gray-400 mb-3" size={48} />
                            <p className="text-gray-300 text-center font-medium">Unsupported file format</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};