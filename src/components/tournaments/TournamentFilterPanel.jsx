import React from 'react';
import { X, RotateCcw, Filter, Search, SlidersHorizontal, Trophy, DollarSign, Calendar, MapPin, Check } from 'lucide-react';

export default function TournamentFilterPanel({
  filters,
  onFilterChange,
  onResetFilters,
  isOpenOnMobile,
  onCloseMobile,
  totalResults = 0
}) {
  const sports = [
    { id: 'all', label: 'All Sports' },
    { id: 'football', label: 'Football' },
    { id: 'cricket', label: 'Cricket' },
    { id: 'badminton', label: 'Badminton' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'volleyball', label: 'Volleyball' },
    { id: 'tennis', label: 'Tennis' }
  ];

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'Registration Open', label: 'Registration Open' },
    { id: 'closing_soon', label: 'Closing Soon (≤ 3 days)' },
    { id: 'Ongoing', label: 'Live / Ongoing' },
    { id: 'Completed', label: 'Completed' }
  ];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#293442]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#E5C378]" />
          <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
            Filters &amp; Refine
          </h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-[#94A3B8] hover:text-[#E5C378] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset all</span>
        </button>
      </div>

      {/* Sport Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
          Sport
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {sports.map((sp) => {
            const isSelected = (filters.sport || 'all') === sp.id;
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => onFilterChange('sport', sp.id)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer truncate ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] font-bold shadow-sm'
                    : 'bg-[#1B2530] text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {sp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* City / Location */}
      <div className="space-y-2">
        <label htmlFor="filter-city" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
          City or Locality
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="filter-city"
            type="text"
            value={filters.city || ''}
            onChange={(e) => onFilterChange('city', e.target.value)}
            placeholder="e.g. Pune, Deccan, Mumbai..."
            className="w-full pl-9 pr-3 py-2 bg-[#1B2530] border border-[#293442] focus:border-[#D4AF37] rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Participation Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
          Participation Type
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'all', label: 'Any' },
            { id: 'individual', label: 'Solo' },
            { id: 'team', label: 'Team' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFilterChange('participationType', item.id)}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                (filters.participationType || 'all') === item.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] font-bold'
                  : 'bg-[#1B2530] text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Max Entry Fee Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="max-fee-range" className="font-bold uppercase tracking-wider text-[#94A3B8]">
            Max Entry Fee
          </label>
          <span className="font-bold text-[#E5C378]">
            {filters.maxFee ? `₹${Number(filters.maxFee).toLocaleString('en-IN')}` : 'Any'}
          </span>
        </div>
        <input
          id="max-fee-range"
          type="range"
          min="0"
          max="5000"
          step="250"
          value={filters.maxFee || 5000}
          onChange={(e) => onFilterChange('maxFee', e.target.value === '5000' ? '' : e.target.value)}
          className="w-full accent-[#D4AF37] cursor-pointer"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>₹0</span>
          <span>₹2,500</span>
          <span>₹5,000+</span>
        </div>

        {/* Free Only Checkbox */}
        <label className="flex items-center gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(filters.freeOnly)}
            onChange={(e) => onFilterChange('freeOnly', e.target.checked)}
            className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer"
          />
          <span>Show Free Entry tournaments only</span>
        </label>
      </div>

      {/* Minimum Prize Pool */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
          Minimum Prize Pool
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: '', label: 'Any Prize' },
            { id: '10000', label: '₹10,000+' },
            { id: '20000', label: '₹20,000+' },
            { id: '40000', label: '₹40,000+' }
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onFilterChange('minPrize', p.id)}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                (filters.minPrize || '') === p.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] font-bold shadow-sm'
                  : 'bg-[#1B2530] text-slate-300 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* College Only Checkbox */}
      <div className="pt-2 border-t border-[#293442]">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(filters.collegeOnly)}
            onChange={(e) => onFilterChange('collegeOnly', e.target.checked)}
            className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer"
          />
          <span className="font-medium text-white">College-Only tournaments</span>
        </label>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
          Event Status
        </label>
        <div className="space-y-1">
          {statuses.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onFilterChange('status', st.id)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                (filters.status || 'all') === st.id
                  ? 'bg-[#1B2530] border border-[#D4AF37] text-[#E5C378] font-bold'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{st.label}</span>
              {(filters.status || 'all') === st.id && (
                <Check className="w-3.5 h-3.5 text-[#E5C378]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-[#141B24]/90 border border-[#293442] rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer Sheet */}
      {isOpenOnMobile && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
        >
          <div className="bg-[#141B24] border-t border-[#293442] rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#293442]">
              <span id="mobile-filter-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                Filter Tournaments ({totalResults} found)
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {content}

            <div className="pt-4 border-t border-[#293442]">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] font-bold text-sm rounded-xl hover:brightness-110 shadow-md cursor-pointer"
              >
                Apply Filters ({totalResults} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
