import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Users,
  Compass,
  Layers,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function FacilityOverview({ facility }) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  if (!facility) return null;

  const isLongDescription = facility.description && facility.description.length > 200;
  const displayDescription = isLongDescription && !isDescExpanded
    ? `${facility.description.slice(0, 200)}...`
    : facility.description;

  // Build full location string without trailing commas or empty parts
  const locationParts = [facility.address, facility.locality, facility.city].filter(Boolean);
  const fullLocation = locationParts.join(', ');

  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Top Meta Line: Sports Tags, Verification, & Setting */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {facility.sports && facility.sports.map((sport) => (
            <span
              key={sport}
              className="text-xs font-bold uppercase tracking-wider text-[#E5C378] bg-[#0B0F14]/90 px-3 py-1 rounded-full border border-[#D4AF37]/35 shadow-sm"
            >
              {sport}
            </span>
          ))}

          {facility.setting && (
            <span className="text-xs font-medium text-[#94A3B8] bg-[#0B0F14]/90 px-2.5 py-1 rounded-full border border-[#293442] capitalize">
              {facility.setting === 'indoor' ? 'Indoor Venue' : facility.setting === 'outdoor' ? 'Outdoor Turf' : 'Indoor & Outdoor'}
            </span>
          )}
        </div>

        {facility.verified && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            Verified Facility
          </span>
        )}
      </div>

      {/* Prominent Venue Name (Largest text on page) */}
      <div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#F5F7FA] font-['Barlow_Condensed'] leading-tight tracking-wide">
          {facility.name}
        </h1>

        {/* Location with optional View on Map */}
        {fullLocation && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#94A3B8]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{fullLocation}</span>
            </span>

            {facility.mapLink && (
              <a
                href={facility.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#E5C378] hover:text-[#B6FF3B] underline underline-offset-2 transition-colors ml-1 focus-visible:ring-1 focus-visible:ring-[#E5C378] rounded px-1"
                aria-label={`View ${facility.name} on map (opens in new tab)`}
              >
                <span>View on map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Two-Column Info Area on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Info Group 1: Hours, Capacity, Surface */}
        <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4.5 space-y-3.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] block">
            Venue Operations &amp; Surface
          </span>

          <div className="space-y-2.5 text-xs">
            {facility.openingHours && (
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Opening Hours:</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#F5F7FA] font-medium">{facility.openingHours}</span>
                  {facility.isOpenNow !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        facility.isOpenNow
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {facility.isOpenNow ? 'Open now' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {facility.maxCapacity && (
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Capacity:</span>
                </span>
                <span className="text-[#F5F7FA] font-medium">{facility.maxCapacity}</span>
              </div>
            )}

            {facility.surfaceType && (
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Playing Surface:</span>
                </span>
                <span className="text-[#F5F7FA] font-medium text-right truncate max-w-[220px]">
                  {facility.surfaceType}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Group 2: Court / Pitch Breakdown */}
        <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4.5 space-y-3.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] block">
            Pitches &amp; Facilities Included
          </span>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Available Grounds:</span>
              </span>
              <span className="text-[#E5C378] font-bold">
                {facility.grounds.length > 0
                  ? `${facility.grounds.length} ${facility.grounds.length === 1 ? 'Pitch' : 'Pitches'}`
                  : 'Check with venue'}
              </span>
            </div>

            {facility.grounds.length > 0 && (
              <ul className="space-y-1 pt-1 border-t border-[#293442]/50 list-none m-0 p-0">
                {facility.grounds.map((g) => (
                  <li key={g.id} className="text-[#94A3B8] flex items-center gap-2 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378]" />
                    <span className="text-[#F5F7FA] font-medium">{g.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Description with Collapsible "Read more" */}
      {facility.description && (
        <div className="pt-2 border-t border-[#293442]/70 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
            About the Ground
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            {displayDescription}
          </p>

          {isLongDescription && (
            <button
              type="button"
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#E5C378] hover:text-[#B6FF3B] transition-colors mt-1 focus-visible:ring-1 focus-visible:ring-[#E5C378] rounded py-0.5"
              aria-expanded={isDescExpanded}
            >
              <span>{isDescExpanded ? 'Read less' : 'Read more'}</span>
              {isDescExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
