import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Heart, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  Users, 
  CheckCircle2,
  Building,
  Tag
} from 'lucide-react';
import { haversineDistance } from '../../data/coachingData';

export default function AcademyCard({
  academy,
  userCoords,
  isFavourite,
  onToggleFavourite,
  onBookTrial,
  viewMode = 'grid'
}) {
  const distance = (userCoords && academy.lat && academy.lng)
    ? haversineDistance(userCoords.lat, userCoords.lng, academy.lat, academy.lng)
    : null;

  if (viewMode === 'list') {
    return (
      <div className="bg-[#141B24] border border-[#293442] hover:border-[#B6FF3B]/50 rounded-2xl p-5 transition-all shadow-lg hover:shadow-xl group flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Image & Key Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
          <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 border border-[#293442]">
            <img 
              src={academy.coverImage} 
              alt={academy.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Favourite button overlay */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleFavourite(academy.id);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:text-red-400 transition-colors cursor-pointer"
              title={isFavourite ? 'Remove from Favourites' : 'Save to Favourites'}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            {/* Trial badge */}
            {academy.trialClassAvailable && (
              <span className="absolute bottom-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#B6FF3B] text-[#0B0F14]">
                {academy.trialFee === 0 ? 'Free Trial' : `Trial: ₹${academy.trialFee}`}
              </span>
            )}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {academy.sports.map(s => (
                <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25">
                  {s}
                </span>
              ))}

              {academy.verified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Academy
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Demo Listing
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-[#B6FF3B] transition-colors truncate">
              {academy.name}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
                {academy.locality}, {academy.city}
              </span>
              {distance !== null && (
                <span className="text-[#B6FF3B] font-mono font-semibold">
                  • {distance} km away
                </span>
              )}
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {academy.rating} ({academy.reviewCount})
              </span>
            </div>

            <p className="text-xs text-gray-400 line-clamp-1 max-w-xl">
              {academy.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-400">
              <span className="bg-[#1B2530] px-2 py-0.5 rounded">{academy.facilityType}</span>
              <span className="bg-[#1B2530] px-2 py-0.5 rounded">{academy.trainingLevels.slice(0, 2).join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Right: Fees & Action Buttons */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#293442]">
          <div className="text-left md:text-right">
            <div className="text-xs text-[#94A3B8]">Monthly Fee</div>
            <div className="text-base font-extrabold text-white">
              ₹{academy.monthlyFeeMin.toLocaleString('en-IN')} <span className="text-xs text-gray-400 font-normal">/ mo</span>
            </div>
            {academy.perSessionFee && (
              <div className="text-[11px] text-gray-500">
                ₹{academy.perSessionFee} per session
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/coaching/${academy.id}`}
              className="px-3.5 py-2 rounded-xl bg-[#1B2530] text-gray-200 border border-[#293442] hover:text-white hover:bg-[#222f3d] text-xs font-semibold transition-all"
            >
              View Details
            </Link>

            {academy.trialClassAvailable && (
              <button
                type="button"
                onClick={() => onBookTrial(academy)}
                className="px-4 py-2 rounded-xl bg-[#B6FF3B] text-black font-bold text-xs hover:bg-[#a5ef28] transition-all shadow-md cursor-pointer"
              >
                Book Trial
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="bg-[#141B24] border border-[#293442] hover:border-[#B6FF3B]/50 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg hover:shadow-2xl flex flex-col justify-between group hover:-translate-y-1">
      {/* Top Media / Cover with Overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0B0F14]">
        <img 
          src={academy.coverImage} 
          alt={academy.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141B24] via-transparent to-black/40" />

        {/* Top badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {academy.sports.map(s => (
              <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] backdrop-blur-md border border-[#00D4FF]/40">
                {s}
              </span>
            ))}
          </div>

          {/* Favourite button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavourite(academy.id);
            }}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-red-400 transition-colors cursor-pointer"
            title={isFavourite ? 'Remove from Favourites' : 'Save to Favourites'}
          >
            <Heart className={`w-4 h-4 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Bottom tags on image */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          {academy.trialClassAvailable ? (
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-[#B6FF3B] text-[#0B0F14] shadow-md">
              {academy.trialFee === 0 ? 'Free Trial Available' : `Trial Class: ₹${academy.trialFee}`}
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-black/70 text-gray-400 backdrop-blur-sm">
              Full Batches
            </span>
          )}

          {academy.verified ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 backdrop-blur-md border border-emerald-500/40">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-400 backdrop-blur-sm">
              Demo
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Academy Name & Rating */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[#B6FF3B] transition-colors leading-snug">
                {academy.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
                <span className="truncate max-w-[180px]">{academy.locality}, {academy.city}</span>
                {distance !== null && (
                  <span className="text-[#B6FF3B] font-mono font-semibold">
                    • {distance} km
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#1B2530] px-2 py-1 rounded-lg border border-[#293442] shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-white">{academy.rating}</span>
              <span className="text-[10px] text-gray-400 font-mono">({academy.reviewCount})</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {academy.tagline}
          </p>

          {/* Key Attributes Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-gray-300">
            <span className="bg-[#0B0F14] px-2 py-0.5 rounded border border-[#293442]/60">
              {academy.facilityType}
            </span>
            <span className="bg-[#0B0F14] px-2 py-0.5 rounded border border-[#293442]/60">
              {academy.trainingLevels[0]} +{academy.trainingLevels.length - 1} Levels
            </span>
            {academy.womenCoaches && (
              <span className="bg-[#00D4FF]/10 text-[#00D4FF] px-2 py-0.5 rounded border border-[#00D4FF]/30">
                Women Coaches
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-4 border-t border-[#293442] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#94A3B8] block">Starting from</span>
              <span className="text-base font-extrabold text-white">
                ₹{academy.monthlyFeeMin.toLocaleString('en-IN')}
                <span className="text-xs text-gray-400 font-normal"> / mo</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#94A3B8] block">Per Session</span>
              <span className="text-xs font-semibold text-gray-300">
                ₹{academy.perSessionFee}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/coaching/${academy.id}`}
              className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#1B2530] text-gray-200 border border-[#293442] hover:text-white hover:bg-[#222f3d] text-xs font-semibold transition-all"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {academy.trialClassAvailable ? (
              <button
                type="button"
                onClick={() => onBookTrial(academy)}
                className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#B6FF3B] text-black font-bold text-xs hover:bg-[#a5ef28] transition-all shadow-md cursor-pointer"
              >
                <span>Book Trial</span>
              </button>
            ) : (
              <Link
                to={`/coaching/${academy.id}?tab=programmes`}
                className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 text-xs font-bold transition-all"
              >
                <span>View Batches</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
