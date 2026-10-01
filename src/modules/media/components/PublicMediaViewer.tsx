/**
 * Public Media Lightbox / Modal Viewer Component
 * School News Platform - Step 08 Media Module (G3.3 Public Gallery)
 *
 * Implements accessible, keyboard-navigable lightbox viewer for published album images & videos.
 * - Secure temporary signed URL for private bucket media.
 * - Escape, ArrowLeft, ArrowRight keyboard support.
 * - Focus trapping and restoration to trigger element.
 * - Video playback via native HTML5 video with controls and no autoplay with sound.
 * - Safe text rendering only, zero permanent public URLs.
 */

import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, AlertCircle, Film, Loader2 } from 'lucide-react';
import { useSignedUrl } from '../hooks/useSignedUrl';
import type { AlbumMediaItem } from '../../../types/media';

export interface PublicMediaViewerProps {
  isOpen: boolean;
  items: AlbumMediaItem[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (newIndex: number) => void;
}

export const PublicMediaViewer: React.FC<PublicMediaViewerProps> = ({
  isOpen,
  items,
  currentIndex,
  onClose,
  onIndexChange,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const currentItem = items[currentIndex] as AlbumMediaItem | undefined;
  const currentMedia = currentItem?.media;
  const isVideo = currentMedia?.file_type === 'video';

  // Secure temporary signed URL for currently selected item
  const {
    data: signedUrl,
    isLoading: isSignedUrlLoading,
    isError: isSignedUrlError,
  } = useSignedUrl(currentMedia?.file_path, isOpen);

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    // Save previously focused element to restore on close
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button initially
    const focusTimeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          onIndexChange(currentIndex - 1);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          onIndexChange(currentIndex + 1);
        }
        return;
      }

      // Tab trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], video[controls], [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(focusTimeout);

      // Restore focus to original active element
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, currentIndex, items.length, onClose, onIndexChange]);

  if (!isOpen || !currentItem || !currentMedia) {
    return null;
  }

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const captionText = currentItem.caption || currentMedia.title || currentMedia.file_name;
  const altText = currentMedia.alt_text || currentItem.caption || currentMedia.title || 'Ảnh trong album';

  return (
    <div
      id="public-media-viewer-backdrop"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-white animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Trình xem ảnh: ${captionText}`}
      ref={dialogRef}
      tabIndex={-1}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 bg-slate-900/80 border-b border-slate-800/80 z-10 select-none">
        {/* Counter and Media Type Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-semibold tracking-wide px-2.5 py-1 rounded-full bg-slate-800 text-slate-200">
            {currentIndex + 1} / {items.length}
          </span>
          {isVideo && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
              <Film className="h-3.5 w-3.5" />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Title / Caption snippet in header on larger screens */}
        <div className="hidden md:block max-w-md lg:max-w-xl truncate text-xs sm:text-sm text-slate-300 font-medium">
          {captionText}
        </div>

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          id="viewer-close-btn"
          type="button"
          onClick={onClose}
          className="h-11 w-11 inline-flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Đóng trình xem ảnh (Phím Escape)"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Media Viewing Stage */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Previous Button */}
        <button
          id="viewer-prev-btn"
          type="button"
          disabled={!hasPrevious}
          onClick={() => hasPrevious && onIndexChange(currentIndex - 1)}
          className={`absolute left-2 sm:left-4 z-20 h-12 w-12 rounded-full flex items-center justify-center transition-all ${
            hasPrevious
              ? 'bg-slate-900/70 hover:bg-slate-800 text-white cursor-pointer shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Ảnh trước đó (Phím mũi tên trái)"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        {/* Media Content Box */}
        <div className="flex items-center justify-center max-h-[78vh] sm:max-h-[82vh] max-w-full">
          {isSignedUrlLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
              <span className="text-xs sm:text-sm font-medium">Đang tải nội dung...</span>
            </div>
          ) : isSignedUrlError || !signedUrl ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900/90 rounded-2xl border border-slate-800 text-center max-w-sm">
              <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Không thể tải tệp</h4>
              <p className="text-xs text-slate-400">
                Đã xảy ra lỗi khi tạo liên kết bảo mật hoặc tệp tạm thời không khả dụng.
              </p>
            </div>
          ) : isVideo ? (
            <video
              key={`video-item-${currentMedia.id}`}
              controls
              playsInline
              preload="metadata"
              className="max-h-[75vh] sm:max-h-[80vh] max-w-full rounded-xl shadow-2xl bg-black outline-none"
              aria-label={captionText}
            >
              <source src={signedUrl} type={currentMedia.mime_type || 'video/mp4'} />
              Trình duyệt của bạn không hỗ trợ phát video chuẩn HTML5.
            </video>
          ) : (
            <img
              key={`img-item-${currentMedia.id}`}
              src={signedUrl}
              alt={altText}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] sm:max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl select-none"
            />
          )}
        </div>

        {/* Next Button */}
        <button
          id="viewer-next-btn"
          type="button"
          disabled={!hasNext}
          onClick={() => hasNext && onIndexChange(currentIndex + 1)}
          className={`absolute right-2 sm:right-4 z-20 h-12 w-12 rounded-full flex items-center justify-center transition-all ${
            hasNext
              ? 'bg-slate-900/70 hover:bg-slate-800 text-white cursor-pointer shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Ảnh tiếp theo (Phím mũi tên phải)"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>

      {/* Bottom Caption & Information Bar */}
      <div className="px-4 py-3 sm:px-6 bg-slate-900/90 border-t border-slate-800/80 text-center">
        <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed">
          {captionText}
        </p>
        {currentMedia.width && currentMedia.height && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            Kích thước: {currentMedia.width} × {currentMedia.height} px
          </p>
        )}
      </div>
    </div>
  );
};
