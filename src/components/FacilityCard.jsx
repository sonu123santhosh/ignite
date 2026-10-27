import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ShieldCheck, Heart, Clock, ArrowRight, Zap } from 'lucide-react';
import Button from './Button';
import { getNextAvailableSlot, haversineDistance } from '../data/facilitiesData';

export default function FacilityCard({
  facility,
  referenceCoords,
  selectedDate,
  existingBookings,
  viewMode = 'grid',
  onSelectMarker
}) {
  const [isFav, setIsFav] = useState(false);

  // Compute approx distance if reference coordinates exist
  const approxDistance = referenceCoords
    ? haversineDistance(referenceCoords.lat, referenceCoords.lng, facility.lat, facility.lng)
    : null;

  // Next available slot derived directly from dynamic slot generation
  const nextSlot = getNextAvailableSlot(facility, selectedDate, existingBookings);

  // SVG Court schematic placeholder per sport
  const renderSportSchematic = (sport) => {
    switch (sport.toLowerCase()) {
      case 'football':
        return (
          <svg className="w-full h-full stroke-[#E5C378]/30" fill="none" viewBox="0 0 120 70">
            <rect x="5" y="5" width="110" height="60" rx="4" strokeWidth="1.2" />
            <circle cx="60" cy="35" r="16" strokeWidth="1.2" />
            <line x1="60" y1="5" x2="60" y2="65" strokeWidth="1.2" />
            <rect x="5" y="18" width="16" height="34" strokeWidth="1.2" />
            <rect x="99" y="18" width="16" height="34" strokeWidth="1.2" />
          </svg>
        );
      case 'badminton':
        return (
          <svg className="w-full h-full stroke-amber-400/30" fill="none" viewBox="0 0 120 70">
            <rect x="10" y="8" width="100" height="54" rx="3" strokeWidth="1.2" />
            <line x1="60" y1="8" x2="60" y2="62" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="20" y1="8" x2="20" y2="62" strokeWidth="1" />
            <line x1="100" y1="8" x2="100" y2="62" strokeWidth="1" />
            <line x1="20" y1="35" x2="100" y2="35" strokeWidth="1" />
          </svg>
        );
      case 'cricket':
        return (
          <svg className="w-full h-full stroke-amber-400/30" fill="none" viewBox="0 0 120 70">
            <ellipse cx="60" cy="35" rx="52" ry="28" strokeWidth="1.2" />
            <rect x="52" y="22" width="16" height="26" rx="2" strokeWidth="1.2" />
            <line x1="56" y1="22" x2="56" y2="48" strokeWidth="0.8" />
            <line x1="64" y1="22" x2="64" y2="48" strokeWidth="0.8" />
          </svg>
        );
      case 'swimming':
        return (
          <svg className="w-full h-full stroke-sky-400/30" fill="none" viewBox="0 0 120 70">
            <rect x="8" y="10" width="104" height="50" rx="3" strokeWidth="1.2" />
            <line x1="8" y1="22" x2="112" y2="22" strokeWidth="1" strokeDasharray="4 2" />
            <line x1="8" y1="35" x2="112" y2="35" strokeWidth="1" strokeDasharray="4 2" />
            <line x1="8" y1="48" x2="112" y2="48" strokeWidth="1" strokeDasharray="4 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full stroke-[#E5C378]/30" fill="none" viewBox="0 0 120 70">
            <rect x="10" y="10" width="100" height="50" rx="4" strokeWidth="1.2" />
            <circle cx="60" cy="35" r="14" strokeWidth="1.2" />
            <line x1="60" y1="10" x2="60" y2="60" strokeWidth="1.2" />
          </svg>
        );
    }
  };

  const isList = viewMode === 'list';

  return (
    <div
      className={`bg-[#141B24] border border-[#293442] hover:border-[#D4AF37]/60 rounded-[18px] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.6),0_0_15px_rgba(212,175,55,0.15)] flex flex-col justify-between group ${
        isList ? 'md:flex-row md:items-center md:gap-6' : ''
      }`}
    >
      {/* Top / Left Section: Image Slot & Details */}
      <div className={isList ? 'flex-1 md:flex md:items-start md:gap-5' : ''}>
        {/* Photo Replacement Slot */}
        <div
          className={`relative rounded-xl overflow-hidden bg-[#0B0F14] border border-[#293442] flex items-center justify-center p-3 shrink-0 ${
            isList ? 'w-full md:w-56 h-40 mb-4 md:mb-0' : 'w-full h-44 mb-4'
          }`}
          role="img"
          aria-label={`Court-line schematic for ${facility.name} (${facility.sport})`}
        >
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0F14] via-[#1B2530]/60 to-[#141B24]" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {renderSportSchematic(facility.sport)}
          </div>

          {/* Tags over image slot */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5C378] bg-[#0B0F14]/90 px-2 py-0.5 rounded border border-[#D4AF37]/35 backdrop-blur-sm">
              {facility.sport}
            </span>
            <span className="text-[10px] font-medium text-[#94A3B8] bg-[#0B0F14]/90 px-1.5 py-0.5 rounded border border-[#293442]">
              {facility.indoor ? 'Indoor' : 'Outdoor'}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-400 bg-[#0B0F14]/90 px-1.5 py-0.5 rounded border border-slate-700">
              Demo listing
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsFav(!isFav);
              }}
              aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
              className="p-1 rounded-md bg-[#0B0F14]/90 border border-[#293442] text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Small photo replacement indicator */}
          <span className="absolute bottom-1.5 right-2 text-[9px] text-[#94A3B8]/60">
            Photo slot
          </span>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {facility.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
            <span className="text-xs text-[#94A3B8] font-medium">
              {facility.type}
            </span>
          </div>

          <h3 className="font-['Barlow_Condensed'] text-2xl font-black text-[#F5F7FA] group-hover:text-[#E5C378] transition-colors leading-tight truncate">
            {facility.name}
          </h3>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#94A3B8] mt-1.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {facility.area}
              {approxDistance !== null && (
                <span className="text-[11px] text-[#94A3B8]">
                  ({approxDistance} km approx.)
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              {facility.rating} <span className="font-normal text-[#94A3B8]">({facility.reviewCount})</span>
            </span>
          </div>

          {/* Up to 3 Amenities */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {facility.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] text-[#94A3B8] bg-[#1B2530] border border-[#293442] px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
          </div>

          {/* Next Available Slot */}
          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-[#94A3B8] bg-[#0B0F14]/70 border border-[#293442] rounded-lg px-2.5 py-1.5">
            <Clock className="w-3.5 h-3.5 text-[#E5C378] shrink-0" />
            <span>Next slot:</span>
            <strong className="text-[#F5F7FA] font-medium truncate">{nextSlot}</strong>
          </div>
        </div>
      </div>

      {/* Bottom / Right Section: Pricing & Actions */}
      <div className={`mt-5 pt-4 border-t border-[#293442] flex items-center justify-between gap-3 ${
        isList ? 'md:mt-0 md:pt-0 md:border-t-0 md:flex-col md:items-end md:justify-center shrink-0' : ''
      }`}>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
            Tariff (Sample)
          </span>
          <div className="text-xl font-black text-[#E5C378] font-['Barlow_Condensed']">
            ₹{facility.pricing.offPeak}
            <span className="text-xs font-normal text-[#94A3B8]"> / {facility.sport === 'Swimming' ? 'session' : 'hr'}</span>
          </div>
          <span className="text-[10px] text-[#94A3B8]">
            Peak: ₹{facility.pricing.peak}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/facilities/${facility.id}`}>
            <Button variant="outline" size="sm" className="hover:border-[#D4AF37] hover:text-[#E5C378]">
              Check Slots
            </Button>
          </Link>
          <Link to={`/facilities/${facility.id}`}>
            <Button variant="gold" size="sm" className="gap-1">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
