'use client';

import { useEffect, useRef, useState } from 'react';
import { ChronotypeLoadingSpinner } from '@/components/LoadingSpinner';

interface ChronotypeAnimalModalProps {
  type: 'Lion' | 'Bear' | 'Wolf' | 'Dolphin';
  description: string;
  imageUrl: string;
  onClose: () => void;
}

// Map chronotype to graph image
const getGraphImage = (type: 'Lion' | 'Bear' | 'Wolf' | 'Dolphin') => {
  const graphMap = {
    Lion: '/chronotypes/graph_lion.png',
    Bear: '/chronotypes/graph_bear.png',
    Wolf: '/chronotypes/graph_wolf.png',
    Dolphin: '/chronotypes/graph_dolphin.png',
  };
  return graphMap[type];
};

export function ChronotypeAnimalModal({
  type,
  description,
  imageUrl,
  onClose,
}: ChronotypeAnimalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal or exit zoom
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isZoomed]);

  // Focus trap: focus modal on mount
  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    modalRef.current?.focus();

    return () => {
      previouslyFocusedElement?.focus();
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle image click to toggle zoom
  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed && zoomContainerRef.current) {
      // Scroll to top when zooming in
      setTimeout(() => {
        zoomContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  // Handle zoom container click to exit zoom
  const handleZoomContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsZoomed(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in-0"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full h-full bg-popover text-popover-foreground shadow-lg animate-in zoom-in-95 flex flex-col"
        role="document"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-md bg-background/80 hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Modal content */}
        <div className="flex-1 flex flex-col p-6 md:p-8 lg:p-12">
          {/* Title */}
          <h2
            id="modal-title"
            className="text-popover-foreground text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8"
          >
            {type} Chronotype
          </h2>

          {/* Graph Image */}
          <div className="flex-1 flex items-center justify-center relative">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ChronotypeLoadingSpinner />
              </div>
            )}
            <img
              src={getGraphImage(type)}
              alt={`${type} chronotype schedule graph`}
              className="max-w-full max-h-[80vh] object-contain cursor-zoom-in"
              onClick={handleImageClick}
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            />
          </div>
        </div>
      </div>

      {/* Zoom overlay */}
      {isZoomed && (
        <div
          ref={zoomContainerRef}
          className="fixed inset-0 z-[60] bg-black/95 overflow-y-auto overflow-x-hidden animate-in fade-in-0"
          onClick={handleZoomContainerClick}
        >
          <div className="min-h-screen w-full flex justify-center py-4">
            <img
              src={getGraphImage(type)}
              alt={`${type} chronotype schedule graph - zoomed`}
              className="w-auto h-auto max-w-none cursor-zoom-out"
              style={{ minHeight: '100vh' }}
              onClick={() => setIsZoomed(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
