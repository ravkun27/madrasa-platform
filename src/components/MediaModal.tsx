import React, { useState, useEffect } from 'react';
import { X, Maximize, Minimize, AlertTriangle, Loader2, FileQuestion } from 'lucide-react';

interface MediaViewerProps {
    url: string;
    isOpen: boolean;
    onClose: () => void;
    contentType?: string; // Optional prop to explicitly specify content type
}

export const MediaModal: React.FC<MediaViewerProps> = ({ 
    url, 
    isOpen, 
    onClose,
    contentType 
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mediaType, setMediaType] = useState<'video' | 'pdf' | 'image' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mediaElement, setMediaElement] = useState<JSX.Element | null>(null);

    useEffect(() => {
        if (!url) return;
        
        setIsLoading(true);
        setError(null);

        const determineMediaType = async () => {
            try {
                // If contentType is explicitly provided, use it
                if (contentType) {
                    if (contentType.startsWith('video/')) {
                        setMediaType('video');
                        return;
                    } else if (contentType.startsWith('image/')) {
                        setMediaType('image');
                        return;
                    } else if (contentType === 'application/pdf') {
                        setMediaType('pdf');
                        return;
                    }
                }

                // Extract filename from the URL path (before query parameters)
                const pathPart = url.split('?')[0];
                const pathSegments = pathPart.split('/');
                const filename = pathSegments[pathSegments.length - 1];
                
                // Check for known file extensions
                if (filename.includes('.')) {
                    const extension = filename.split('.').pop()?.toLowerCase();
                    
                    if (['mp4', 'webm', 'mov', 'avi'].includes(extension || '')) {
                        setMediaType('video');
                        return;
                    } else if (extension === 'pdf') {
                        setMediaType('pdf');
                        return;
                    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
                        setMediaType('image');
                        return;
                    }
                }
                
                // For AWS S3 URLs without clear extensions, perform content type detection
                // First check for hints in the URL
                if (url.toLowerCase().includes('content-type=video') || 
                    url.toLowerCase().includes('content-type=application/mp4')) {
                    setMediaType('video');
                    return;
                } else if (url.toLowerCase().includes('content-type=image')) {
                    setMediaType('image');
                    return;
                } else if (url.toLowerCase().includes('content-type=application/pdf')) {
                    setMediaType('pdf');
                    return;
                }
                
                // If we're still unsure, try to probe the content by loading both video and image
                // This is a fallback approach for S3 URLs with no clear type indicators
                setMediaType(null);
                attemptMediaDetection();
                
            } catch (err) {
                console.error("Error determining media type:", err);
                setError("Failed to determine media type");
                setMediaType(null);
            }
        };

        determineMediaType();
    }, [url, contentType]);

    // Function to detect media type by attempting to load both video and image
    const attemptMediaDetection = () => {
        // Create hidden video element to test if URL is a video
        const videoTest = document.createElement('video');
        
        // Set up video event handlers
        videoTest.onloadeddata = () => {
            setMediaType('video');
            setIsLoading(false);
            videoTest.remove();
        };
        
        videoTest.onerror = () => {
            // If video fails, try as image
            const imgTest = new Image();
            
            imgTest.onload = () => {
                setMediaType('image');
                setIsLoading(false);
            };
            
            imgTest.onerror = () => {
                // If both fail, set to unknown
                setMediaType(null);
                setError("Could not determine media type");
                setIsLoading(false);
            };
            
            imgTest.src = url;
            videoTest.remove();
        };
        
        // Start the test
        videoTest.style.display = 'none';
        videoTest.src = url;
        document.body.appendChild(videoTest);
    };

    // Set up appropriate media element based on detected type
    useEffect(() => {
        if (!mediaType) return;
        
        if (mediaType === 'video') {
            setMediaElement(
                <video
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    src={url}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadedData={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError("Failed to load video");
                    }}
                >
                    Your browser does not support the video tag.
                </video>
            );
        } else if (mediaType === 'pdf') {
            setMediaElement(
                <iframe
                    src={`${url}#toolbar=0&navpanes=0`}
                    className="w-full h-full bg-white"
                    title="PDF viewer"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError("Failed to load PDF");
                    }}
                />
            );
        } else if (mediaType === 'image') {
            setMediaElement(
                <img
                    src={url}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded shadow-lg transition-transform duration-300 hover:scale-105"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError("Failed to load image");
                    }}
                />
            );
        }
    }, [mediaType, url]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div
                className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
                    isFullscreen ? 'w-full h-full rounded-none' : 'w-11/12 h-5/6 max-w-5xl'
                }`}
            >
                {/* Header with controls */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors duration-200 shadow-lg"
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-800 hover:bg-red-600 rounded-full text-white transition-colors duration-200 shadow-lg"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="w-full h-full flex items-center justify-center p-4">
                    {/* Loading state */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-5">
                            <Loader2 size={48} className="text-blue-500 animate-spin" />
                        </div>
                    )}

                    {/* Display the appropriate media element */}
                    {!isLoading && !error && mediaElement}

                    {/* Error state */}
                    {error && (
                        <div className="text-center p-6 bg-red-900/20 rounded-lg">
                            <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
                            <p className="text-lg text-white">{error}</p>
                            <p className="text-sm text-gray-300 mt-2">
                                The URL may be invalid or the resource may be inaccessible.
                            </p>
                        </div>
                    )}

                    {!isLoading && !error && !mediaType && (
                        <div className="text-center p-6 bg-gray-800/50 rounded-lg">
                            <FileQuestion size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-lg text-white">Unsupported file format</p>
                            <p className="text-sm text-gray-300 mt-2">
                                The file type could not be determined.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};