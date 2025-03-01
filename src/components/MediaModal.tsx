import React, { useState, useEffect, useRef } from 'react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detectedType, setDetectedType] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Detect content type from URL if not provided
    useEffect(() => {
        if (contentType) {
            setDetectedType(contentType);
            return;
        }

        const extension = url.split('.').pop()?.toLowerCase();
        if (!extension) {
            setDetectedType(null);
            return;
        }

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
            setDetectedType('image');
        } else if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
            setDetectedType('video');
        } else if (extension === 'pdf') {
            setDetectedType('pdf');
        } else {
            setDetectedType(null);
        }
    }, [url, contentType]);

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
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div 
                ref={modalRef}
                className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col ${isFullscreen ? 'fixed inset-0 max-w-none max-h-none rounded-none' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-700 dark:text-gray-200 truncate">
                        {url.split('/').pop()}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleFullscreenToggle}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-grow relative overflow-auto">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <Loader2 className="animate-spin text-gray-400" size={40} />
                        </div>
                    )}
                    
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                            <AlertTriangle className="text-red-500 mb-2" size={40} />
                            <p className="text-gray-600 dark:text-gray-400 text-center">{error}</p>
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
                        <div className="h-full flex items-center justify-center p-4">
                            <video 
                                src={url}
                                className="max-w-full max-h-full" 
                                controls
                                onLoadedData={handleLoad}
                                onError={handleError}
                            />
                        </div>
                    )}

                    {detectedType === 'pdf' && (
                        <div className="h-full w-full">
                            <iframe 
                                src={url} 
                                className="w-full h-full border-0"
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        </div>
                    )}

                    {!detectedType && !isLoading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                            <FileQuestion className="text-gray-400 mb-2" size={40} />
                            <p className="text-gray-600 dark:text-gray-400 text-center">Unsupported file format</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
