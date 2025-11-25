import React, { useState, useEffect, useRef } from 'react';
import Mermaid from '@theme/Mermaid';
import styles from './MermaidFullscreen.module.css';

interface MermaidFullscreenProps {
  value: string;
  title?: string;
}

/**
 * MermaidFullscreen component that displays a Mermaid diagram
 * with a fullscreen button that opens a zoomable and draggable modal
 */
export default function MermaidFullscreen({ 
  value, 
  title = 'Diagram' 
}: MermaidFullscreenProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(3); // Default zoom is 300% (3x)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const zoomableRef = useRef<HTMLDivElement>(null);

  // Reset zoom and position when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(3); // Start at 300%
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((prev) => Math.min(prev + 0.3, 5));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev - 0.3, 1));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(3); // Reset to 300%
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle mouse wheel zoom
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.3 : 0.3;
        setZoom((prev) => Math.max(1, Math.min(5, prev + delta)));
      }
    };

    const modal = modalRef.current;
    modal.addEventListener('wheel', handleWheel, { passive: false });
    return () => modal.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  // Handle drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div className={styles.inlineContainer} ref={containerRef}>
        <div className={styles.diagramWrapper}>
          <Mermaid value={value} />
        </div>
        <button
          className={styles.fullscreenButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open diagram in fullscreen"
          title="Open in fullscreen"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          Fullscreen
        </button>
      </div>

      {isOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <div className={styles.modalHeader}>
              <h2 id="modal-title" className={styles.modalTitle}>
                {title}
              </h2>
              <div className={styles.controls}>
                <div className={styles.zoomControls}>
                  <button
                    className={styles.zoomButton}
                    onClick={() => setZoom((prev) => Math.max(1, prev - 0.3))}
                    aria-label="Zoom out"
                    title="Zoom out (-)"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                  <span className={styles.zoomLevel}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    className={styles.zoomButton}
                    onClick={() => setZoom((prev) => Math.min(5, prev + 0.3))}
                    aria-label="Zoom in"
                    title="Zoom in (+)"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                  <button
                    className={styles.zoomButton}
                    onClick={() => {
                      setZoom(3); // Reset to 300%
                      setPosition({ x: 0, y: 0 });
                    }}
                    aria-label="Reset zoom"
                    title="Reset zoom (0)"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 21v-5h5" />
                    </svg>
                  </button>
                </div>
                <button
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close modal"
                  title="Close (Esc)"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div 
              className={styles.modalBody}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div
                ref={zoomableRef}
                className={styles.zoomableContainer}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              >
                <Mermaid value={value} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <p className={styles.helpText}>
                <kbd>Click & Drag</kbd> to pan, <kbd>Ctrl/Cmd + Scroll</kbd> to zoom,{' '}
                <kbd>+/-</kbd> for zoom controls, <kbd>0</kbd> to reset, <kbd>Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
