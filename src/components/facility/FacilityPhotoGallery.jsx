import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  AlertTriangle
} from 'lucide-react';

export default function FacilityPhotoGallery({ photos = [], venueName = 'Facility' }) {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [failedImageUrls, setFailedImageUrls] = useState(new Set());
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const touchStartX = useRef(null);

  const isLightboxOpen = activeLightboxIndex !== null;

  // Handle broken images
  const handleImageError = (url) => {
    setFailedImageUrls((prev) => new Set([...prev, url]));
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'main':
        return 'Main Venue';
      case 'surface':
        return 'Playing Surface';
      case 'changing-rooms':
        return 'Changing Rooms';
      case 'amenity':
        return 'Amenity';
      default:
        return 'Facility View';
    }
  };

  const openLightbox = (index, e) => {
    triggerRef.current = e?.currentTarget || document.activeElement;
    setActiveLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
    if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
    }
  }, []);

  const showNext = useCallback(() => {
    if (photos.length <= 1) return;
    setActiveLightboxIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const showPrev = useCallback(() => {
    if (photos.length <= 1) return;
    setActiveLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Keyboard navigation & Esc & Focus trapping for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      } else if (e.key === 'Tab') {
        // Focus trap inside lightbox dialog
        if (!dialogRef.current) return;
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on dialog
    const timer = setTimeout(() => {
      const closeBtn = dialogRef.current?.querySelector('button[aria-label="Close lightbox"]');
      if (closeBtn) closeBtn.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isLightboxOpen, closeLightbox, showNext, showPrev]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showNext();
      } else {
        showPrev();
      }
    }
    touchStartX.current = null;
  };

  // Case 1: No photos exist
  if (!photos || photos.length === 0) {
    return (
      <div
        className="bg-[#141B24] border border-[#293442] rounded-2xl p-8 text-center space-y-3"
        role="region"
        aria-label="Venue Photos"
      >
        <div className="w-12 h-12 rounded-full bg-[#0B0F14] border border-[#293442] flex items-center justify-center text-[#94A3B8] mx-auto">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F7FA]">
          Venue Photos
        </h3>
        <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
          No photos have been added yet for this facility.
        </p>
      </div>
    );
  }

  // Case 2: Only 1 photo exists
  if (photos.length === 1) {
    const single = photos[0];
    const isBroken = failedImageUrls.has(single.url);

    return (
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center text-xs text-[#94A3B8] px-1">
          <span className="font-bold uppercase tracking-wider text-[#E5C378]">Facility Photo</span>
          <span className="text-[11px]">{getCategoryLabel(single.category)}</span>
        </div>

        <button
          type="button"
          onClick={(e) => openLightbox(0, e)}
          className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden bg-[#0B0F14] border border-[#293442] group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E5C378] text-left block"
          aria-label={`View photo of ${venueName} in fullscreen`}
        >
          {isBroken ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8] gap-2 p-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <span className="text-xs font-semibold">Photo unavailable</span>
            </div>
          ) : (
            <>
              <img
                src={single.url}
                alt={single.alt || `Photo of ${venueName}`}
                onError={() => handleImageError(single.url)}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge photo</span>
                </span>
              </div>
            </>
          )}
        </button>

        {single.caption && (
          <p className="text-xs text-[#94A3B8] italic px-1">{single.caption}</p>
        )}

        {/* Lightbox Modal */}
        {renderLightbox()}
      </div>
    );
  }

  // Case 3: Multiple photos (1 featured + smaller supporting images)
  const featured = photos[0];
  const supporting = photos.slice(1, 5); // up to 4 supporting images
  const remainingCount = photos.length - 5;

  function renderLightbox() {
    if (!isLightboxOpen) return null;
    const current = photos[activeLightboxIndex];
    const isCurrentBroken = failedImageUrls.has(current.url);

    return (
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Photo viewer for ${venueName}`}
        className="fixed inset-0 z-50 bg-[#0B0F14]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Bar: Counter & Close */}
        <div className="flex items-center justify-between z-10">
          <div className="text-xs font-mono font-bold text-[#F5F7FA] bg-[#141B24]/90 border border-[#293442] px-3 py-1 rounded-full">
            {activeLightboxIndex + 1} / {photos.length}
          </div>

          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close lightbox"
            className="p-2 rounded-full bg-[#141B24]/90 border border-[#293442] text-[#F5F7FA] hover:text-[#E5C378] hover:border-[#D4AF37] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E5C378]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Image & Navigation Buttons */}
        <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
          {photos.length > 1 && (
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 z-20 p-2.5 rounded-full bg-[#141B24]/80 border border-[#293442] text-[#F5F7FA] hover:text-[#E5C378] hover:border-[#D4AF37] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E5C378]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-4xl max-h-full flex items-center justify-center">
            {isCurrentBroken ? (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-8 text-center text-[#94A3B8] space-y-2">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <span className="text-sm font-semibold block">Photo unavailable</span>
              </div>
            ) : (
              <img
                src={current.url}
                alt={current.alt || `Photo of ${venueName}`}
                onError={() => handleImageError(current.url)}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 z-20 p-2.5 rounded-full bg-[#141B24]/80 border border-[#293442] text-[#F5F7FA] hover:text-[#E5C378] hover:border-[#D4AF37] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E5C378]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Bar: Caption & Category */}
        <div className="bg-[#141B24]/90 border border-[#293442] rounded-xl p-3 sm:p-4 text-center max-w-2xl mx-auto w-full z-10">
          <span className="text-[10px] uppercase font-bold text-[#E5C378] tracking-wider block">
            {getCategoryLabel(current.category)}
          </span>
          {current.caption && (
            <p className="text-xs sm:text-sm text-[#F5F7FA] mt-0.5">
              {current.caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4"
      role="region"
      aria-label="Venue Photo Gallery"
    >
      <div className="flex justify-between items-center text-xs text-[#94A3B8]">
        <span className="font-bold uppercase tracking-wider text-[#E5C378]">
          Gallery ({photos.length} {photos.length === 1 ? 'Photo' : 'Photos'})
        </span>
        <span className="text-[11px]">Click any photo to expand</span>
      </div>

      {/* Grid: 1 large featured photo on left, up to 4 smaller supporting photos on right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Large Featured Photo */}
        <button
          type="button"
          onClick={(e) => openLightbox(0, e)}
          className="md:col-span-2 relative aspect-[16/10] rounded-xl overflow-hidden bg-[#0B0F14] border border-[#293442] group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E5C378] text-left block"
          aria-label={`Featured photo: ${getCategoryLabel(featured.category)} - Click to enlarge`}
        >
          {failedImageUrls.has(featured.url) ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8] gap-2 p-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <span className="text-xs font-semibold">Photo unavailable</span>
            </div>
          ) : (
            <>
              <img
                src={featured.url}
                alt={featured.alt || `Featured photo of ${venueName}`}
                onError={() => handleImageError(featured.url)}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#0B0F14]/90 backdrop-blur-md border border-[#293442] text-[10px] font-bold uppercase tracking-wider text-[#E5C378] px-2.5 py-1 rounded-md">
                {getCategoryLabel(featured.category)}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge photo</span>
                </span>
              </div>
            </>
          )}
        </button>

        {/* Supporting Photos Grid (2x2 on desktop, or stacked row) */}
        <div className="grid grid-cols-2 gap-3">
          {supporting.map((photo, sIdx) => {
            const actualIndex = sIdx + 1;
            const isLastWithMore = sIdx === supporting.length - 1 && remainingCount > 0;
            const isBroken = failedImageUrls.has(photo.url);

            return (
              <button
                key={photo.url + sIdx}
                type="button"
                onClick={(e) => openLightbox(actualIndex, e)}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#0B0F14] border border-[#293442] group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E5C378] text-left block"
                aria-label={`Photo ${actualIndex + 1}: ${getCategoryLabel(photo.category)}`}
              >
                {isBroken ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8] gap-1 p-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-semibold text-center">Photo unavailable</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={photo.url}
                      alt={photo.alt || `Photo of ${venueName}`}
                      loading="lazy"
                      onError={() => handleImageError(photo.url)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#0B0F14]/85 backdrop-blur-sm text-[9px] font-bold text-slate-300 px-1.5 py-0.5 rounded border border-[#293442]">
                      {getCategoryLabel(photo.category)}
                    </div>

                    {isLastWithMore && (
                      <div className="absolute inset-0 bg-[#0B0F14]/80 backdrop-blur-sm flex items-center justify-center text-center p-2">
                        <span className="text-sm font-bold text-[#E5C378]">
                          +{remainingCount} more
                        </span>
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {renderLightbox()}
    </div>
  );
}
