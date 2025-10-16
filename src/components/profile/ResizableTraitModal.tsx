'use client';

import { useRef, useState, useEffect, useCallback, memo, type MouseEvent } from 'react';
import Image from 'next/image';

interface ResizableTraitModalProps {
  title: string;
  description: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  imageUrl?: string;
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
const BASE_Z_INDEX = 1000;
const Z_INDEX_INCREMENT = 10;

let modalCounter = 0;

const ResizableTraitModal = memo<ResizableTraitModalProps>(function ResizableTraitModal({
  title,
  description,
  onClose,
  initialPosition = { x: 100, y: 100 },
  imageUrl,
}) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [zIndex, setZIndex] = useState(() => BASE_Z_INDEX + (modalCounter++ * Z_INDEX_INCREMENT));
  const modalRef = useRef<HTMLDivElement>(null);

  // Memoized cursor style
  const cursorStyle = isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'default';

  // Handle mouse down on header to start dragging
  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    // Don't start dragging if clicking the close button
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      setZIndex(BASE_Z_INDEX + (modalCounter++ * Z_INDEX_INCREMENT));
    }
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
    setIsResizing(true);
    setZIndex(BASE_Z_INDEX + (modalCounter++ * Z_INDEX_INCREMENT));
  }, [size.width, size.height]);

  // Bring to front when clicked
  const handleClick = useCallback(() => {
    setZIndex(BASE_Z_INDEX + (modalCounter++ * Z_INDEX_INCREMENT));
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        setSize({
          width: Math.max(MIN_WIDTH, resizeStart.width + deltaX),
          height: Math.max(MIN_HEIGHT, resizeStart.height + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  return (
    <div
      ref={modalRef}
      className="fixed bg-popover text-popover-foreground border border-border rounded-lg shadow-lg overflow-hidden flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
        cursor: cursorStyle,
      }}
      onClick={handleClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Header */}
      <div
        className="bg-accent/10 px-4 py-3 flex items-center justify-between border-b border-border cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h3 id="modal-title" className="font-semibold text-lg truncate pr-2">{title}</h3>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-sm hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close modal"
          type="button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-popover-foreground"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto">
        {imageUrl && (
          <div className="relative w-full" style={{ minHeight: '300px' }}>
            <Image
              src={imageUrl}
              alt={title}
              width={800}
              height={600}
              className="w-full h-auto object-contain rounded-md"
              priority
              unoptimized
            />
          </div>
        )}
        {description && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap mt-4">
            {description}
          </p>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize group"
        onMouseDown={handleResizeStart}
      >
        <svg
          className="absolute bottom-1 right-1 text-muted-foreground group-hover:text-foreground transition-colors"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="6" x2="6" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="10" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
});

export default ResizableTraitModal;
