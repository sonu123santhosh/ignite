import React, { useState } from 'react';
import { Filter, X, RotateCcw, Check, ChevronDown, SlidersHorizontal, MapPin } from 'lucide-react';
import Button from './Button';
import { getRelativeDateStr } from '../data/facilitiesData';

export default function FilterPanel({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0,
  isMobileOpen = false,
  onCloseMobile
}) {
  const todayStr = getRelativeDateStr(0);

  const sports = [
    'All',
    'Football',
    'Cricket',
    'Badminton',
    'Basketball',
    'Tennis',
    'Volleyball',
    'Swimming'
  ];

  const localities = [
    'All',
    'Koramangala',
    'Indiranagar',
    'HSR Layout',
    'Whitefield',
    'JP Nagar',
    'Bellandur'
  ];

  const timeSlots = [
    { id: 'all', label: 'Any Time' },
    { id: 'morning', label: 'Morning (06:00 - 12:00)' },
    { id: 'afternoon', label: 'Afternoon (12:00 - 17:00)' },
    { id: 'evening', label: 'Evening (17:00 - 21:00)' },
    { id: 'night', label: 'Night (21:00 - 00:00)' }
  ];

  const surfaces = [
    { id: 'all', label: 'All Surfaces' },
    { id: 'astroturf', label: 'AstroTurf' },
    { id: 'wooden', label: 'Wooden Sprung' },
    { id: 'hardcourt', label: 'Hardcourt' },
    { id: 'turf', label: 'Natural Turf' },
    { id: 'ceramic', label: 'Ceramic Pool' }
  ];

  const availableAmenities = [
    'Floodlights',
    'Changing Rooms',
    'Showers',
    'Parking',
    'Equipment Rental',
    'Water Dispenser'
  ];

  const handleAmenityToggle = (amenity) => {
    const current = filters.selectedAmenities || [];
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onFilterChange('selectedAmenities', next);
  };

  const removeSingleFilter = (key, defaultVal) => {
    onFilterChange(key, defaultVal);
  };

  // Determine active filter chips
  const activeChips = [];
  if (filters.sport && filters.sport !== 'All') {
    activeChips.push({ label: `Sport: ${filters.sport}`, clear: () => removeSingleFilter('sport', 'All') });
  }
  if (filters.locality && filters.locality !== 'All') {
    activeChips.push({ label: `Area: ${filters.locality}`, clear: () => removeSingleFilter('locality', 'All') });
  }
  if (filters.maxDistance && filters.maxDistance !== 20) {
    activeChips.push({ label: `Within ${filters.maxDistance} km`, clear: () => removeSingleFilter('maxDistance', 20) });
  }
  if (filters.preferredTime && filters.preferredTime !== 'all') {
    activeChips.push({ label: `Time: ${filters.preferredTime}`, clear: () => removeSingleFilter('preferredTime', 'all') });
  }
  if (filters.priceRange && filters.priceRange < 2000) {
    activeChips.push({ label: `Under ₹${filters.priceRange}/hr`, clear: () => removeSingleFilter('priceRange', 2000) });
  }
  if (filters.minRating && filters.minRating > 0) {
    activeChips.push({ label: `${filters.minRating}+ Stars`, clear: () => removeSingleFilter('minRating', 0) });
  }
  if (filters.indoorOutdoor && filters.indoorOutdoor !== 'all') {
    activeChips.push({ label: `${filters.indoorOutdoor}`, clear: () => removeSingleFilter('indoorOutdoor', 'all') });
  }
  if (filters.selectedSurface && filters.selectedSurface !== 'all') {
    activeChips.push({ label: `Surface: ${filters.selectedSurface}`, clear: () => removeSingleFilter('selectedSurface', 'all') });
  }
  if (filters.availableSlotsOnly) {
    activeChips.push({ label: `Available Slots Only`, clear: () => removeSingleFilter('availableSlotsOnly', false) });
  }
  if (filters.selectedAmenities && filters.selectedAmenities.length > 0) {
    filters.selectedAmenities.forEach((a) => {
      activeChips.push({ label: a, clear: () => handleAmenityToggle(a) });
    });
  }

  const content = (
    <div className="space-y-6 text-xs text-[#94A3B8]">
      {/* 1. Sport Selector */}
      <div>
        <label htmlFor="filter-sport" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
          Sport
        </label>
        <div className="flex flex-wrap gap-1.5">
          {sports.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onFilterChange('sport', s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer border ${
                filters.sport === s
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] border-[#D4AF37] font-bold shadow-sm'
                  : 'bg-[#0B0F14] text-[#94A3B8] border-[#293442] hover:text-[#F5F7FA] hover:border-[#94A3B8]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Locality Dropdown */}
      <div>
        <label htmlFor="filter-locality" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
          Locality / Area
        </label>
        <select
          id="filter-locality"
          value={filters.locality}
          onChange={(e) => onFilterChange('locality', e.target.value)}
          className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
        >
          {localities.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* 3. Distance Radius */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="filter-distance" className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
            Max Distance
          </label>
          <span className="text-[#E5C378] font-bold">
            Up to {filters.maxDistance} km approx.
          </span>
        </div>
        <div className="flex gap-2">
          {[2, 5, 10, 20].map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => onFilterChange('maxDistance', km)}
              className={`flex-1 py-1.5 text-xs rounded-lg border font-semibold transition-colors cursor-pointer ${
                filters.maxDistance === km
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] border-[#D4AF37] font-bold shadow-sm'
                  : 'bg-[#0B0F14] text-[#94A3B8] border-[#293442] hover:text-[#F5F7FA]'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* 4. Preferred Playing Time */}
      <div>
        <label htmlFor="filter-time" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
          Preferred Time
        </label>
        <select
          id="filter-time"
          value={filters.preferredTime}
          onChange={(e) => onFilterChange('preferredTime', e.target.value)}
          className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
        >
          {timeSlots.map((slot) => (
            <option key={slot.id} value={slot.id}>{slot.label}</option>
          ))}
        </select>
      </div>

      {/* 5. Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="filter-price" className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
            Max Price / Hour
          </label>
          <span className="text-[#E5C378] font-bold">
            ₹{filters.priceRange}
          </span>
        </div>
        <input
          id="filter-price"
          type="range"
          min="300"
          max="2000"
          step="50"
          value={filters.priceRange}
          onChange={(e) => onFilterChange('priceRange', Number(e.target.value))}
          className="w-full h-2 bg-[#0B0F14] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
        />
        <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
          <span>₹300</span>
          <span>₹2,000+</span>
        </div>
      </div>

      {/* 6. Minimum Rating */}
      <div>
        <label htmlFor="filter-rating" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
          Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 4.0, 4.5, 4.8].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onFilterChange('minRating', rate)}
              className={`py-1.5 text-xs rounded-lg border font-semibold transition-colors cursor-pointer text-center ${
                filters.minRating === rate
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] border-[#D4AF37] font-bold shadow-sm'
                  : 'bg-[#0B0F14] text-[#94A3B8] border-[#293442] hover:text-[#F5F7FA]'
              }`}
            >
              {rate === 0 ? 'All' : `${rate}★`}
            </button>
          ))}
        </div>
      </div>

      {/* 7. Indoor / Outdoor */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
          Venue Environment
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'indoor', label: 'Indoor' },
            { id: 'outdoor', label: 'Outdoor' }
          ].map((env) => (
            <button
              key={env.id}
              type="button"
              onClick={() => onFilterChange('indoorOutdoor', env.id)}
              className={`py-1.5 text-xs rounded-lg border font-semibold transition-colors cursor-pointer text-center ${
                filters.indoorOutdoor === env.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] border-[#D4AF37] font-bold shadow-sm'
                  : 'bg-[#0B0F14] text-[#94A3B8] border-[#293442] hover:text-[#F5F7FA]'
              }`}
            >
              {env.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8. Surface Type */}
      <div>
        <label htmlFor="filter-surface" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
          Court / Pitch Surface
        </label>
        <select
          id="filter-surface"
          value={filters.selectedSurface}
          onChange={(e) => onFilterChange('selectedSurface', e.target.value)}
          className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
        >
          {surfaces.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* 9. Amenities Multi-select */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
          Amenities
        </label>
        <div className="space-y-1.5">
          {availableAmenities.map((amenity) => {
            const isChecked = (filters.selectedAmenities || []).includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center gap-2.5 cursor-pointer py-1 px-1.5 rounded hover:bg-[#1B2530] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="rounded border-[#293442] bg-[#0B0F14] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer accent-[#D4AF37]"
                />
                <span className={isChecked ? 'text-[#F5F7FA] font-medium' : 'text-[#94A3B8]'}>
                  {amenity}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 10. Available Slots Only Toggle */}
      <div className="pt-2 border-t border-[#293442]">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs font-bold text-[#F5F7FA]">Available Slots Only</span>
          <input
            type="checkbox"
            checked={filters.availableSlotsOnly}
            onChange={(e) => onFilterChange('availableSlotsOnly', e.target.value)}
            className="w-4 h-4 rounded border-[#293442] bg-[#0B0F14] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer accent-[#D4AF37]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-5 sticky top-24 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-[#293442] mb-5">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E5C378]" />
              <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase tracking-wide text-[#F5F7FA]">
                Filters
              </h3>
            </div>
            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs text-[#E5C378] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {content}
        </div>
      </aside>

      {/* Mobile Bottom Sheet Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-[#141B24] border-t border-[#293442] rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-bottom duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Filter facilities"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#293442] mb-5 sticky top-0 bg-[#141B24] z-10">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#E5C378]" />
                <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase tracking-wide text-[#F5F7FA]">
                  Filter Grounds ({totalResults})
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F5F7FA] bg-[#0B0F14] border border-[#293442]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {content}

            <div className="pt-6 border-t border-[#293442] flex gap-3 sticky bottom-0 bg-[#141B24] pb-2">
              <Button variant="outline" size="md" onClick={onResetFilters} className="flex-1 hover:border-[#D4AF37] hover:text-[#E5C378]">
                Clear All
              </Button>
              <Button variant="gold" size="md" onClick={onCloseMobile} className="flex-1">
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
