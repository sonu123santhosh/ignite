import React from 'react';
import {
  Car,
  Bath,
  Shirt,
  Lightbulb,
  Droplets,
  Dumbbell,
  Armchair,
  PlusCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

const AMENITY_CONFIG = {
  parking: { label: 'Parking', Icon: Car },
  washrooms: { label: 'Washrooms', Icon: Bath },
  changingRooms: { label: 'Changing rooms', Icon: Shirt },
  floodlights: { label: 'Floodlights', Icon: Lightbulb },
  drinkingWater: { label: 'Drinking water', Icon: Droplets },
  equipmentRental: { label: 'Equipment rental', Icon: Dumbbell },
  seating: { label: 'Seating', Icon: Armchair },
  firstAid: { label: 'First aid', Icon: PlusCircle }
};

export default function FacilityAmenitiesSection({ amenities = [] }) {
  // Show an amenity ONLY when it is present in data AND confirmedByOwner is true
  const confirmedAmenities = (amenities || []).filter(
    (a) => a && a.key && AMENITY_CONFIG[a.key] && a.confirmedByOwner === true
  );

  return (
    <div
      className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5"
      role="region"
      aria-labelledby="amenities-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#293442] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5C378]">
            Verified Amenities
          </span>
          <h2
            id="amenities-heading"
            className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA] mt-0.5 tracking-wide"
          >
            Facility Amenities
          </h2>
        </div>

        {confirmedAmenities.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-medium w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed by the facility owner</span>
          </span>
        )}
      </div>

      {confirmedAmenities.length === 0 ? (
        <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-6 text-center text-xs text-[#94A3B8] flex flex-col items-center gap-2">
          <Info className="w-5 h-5 text-amber-400" />
          <p>The owner hasn&apos;t confirmed any amenities yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {confirmedAmenities.map(({ key }) => {
            const { label, Icon } = AMENITY_CONFIG[key];
            return (
              <div
                key={key}
                className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3.5 flex items-center gap-3 transition-colors hover:border-[#D4AF37]/50"
              >
                <div className="w-9 h-9 rounded-lg bg-[#141B24] border border-[#293442] flex items-center justify-center text-[#E5C378] shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-[#F5F7FA] truncate">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
