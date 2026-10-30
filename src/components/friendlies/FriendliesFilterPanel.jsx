import React from 'react';
import { Filter, RotateCcw, X, MapPin, Search, Check } from 'lucide-react';
import { INITIAL_COLLEGES } from '../../data/friendliesData';

export default function FriendliesFilterPanel({
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
    { id: 'basketball', label: 'Basketball' },
    { id: 'volleyball', label: 'Volleyball' },
    { id: 'badminton', label: 'Badminton' }
  ];

  const skillLevels = [
    { id: 'all', label: 'Any Skill Level' },
    { id: 'Competitive', label: 'Competitive (Collegiate)' },
    { id: 'Intermediate', label: 'Intermediate (Club)' },
    { id: 'Beginner', label: 'Beginner / Casual' }
  ];

  const sources = [
    { id: 'all', label: 'All Sources' },
    { id: 'official_fixture', label: 'Official Fixtures' },
    { id: 'verified_organiser', label: 'Verified Organisers' },
    { id: 'community_proposal', label: 'Community Proposals' },
    { id: 'demo_data', label: 'Demo Data' }
  ];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
            Filter Matches
          </h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sport Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
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
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-md shadow-sky-500/25'
                    : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.12] border border-white/5'
                }`}
              >
                {sp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* City Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          City
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['all', 'Pune', 'Mumbai'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onFilterChange('city', c)}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                (filters.city || 'all') === c
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-md shadow-sky-500/25'
                  : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.12] border border-white/5'
              }`}
            >
              {c === 'all' ? 'Any City' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Source Tier Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Verification Source
        </label>
        <div className="space-y-1">
          {sources.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onFilterChange('source', s.id)}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                (filters.source || 'all') === s.id
                  ? 'bg-sky-500/15 border border-sky-400 text-white font-bold'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>{s.label}</span>
              {(filters.source || 'all') === s.id && (
                <Check className="w-3.5 h-3.5 text-sky-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Competition Skill Level
        </label>
        <select
          value={filters.skillLevel || 'all'}
          onChange={(e) => onFilterChange('skillLevel', e.target.value)}
          className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 cursor-pointer"
        >
          {skillLevels.map((lvl) => (
            <option key={lvl.id} value={lvl.id} className="bg-[#0b1326] text-white">
              {lvl.label}
            </option>
          ))}
        </select>
      </div>

      {/* Free Matches Only Checkbox */}
      <div className="pt-2 border-t border-white/10">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(filters.freeOnly)}
            onChange={(e) => onFilterChange('freeOnly', e.target.checked)}
            className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
          />
          <span className="font-medium text-white">Free Friendly Matches Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenOnMobile && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#0c1629]/95 backdrop-blur-xl border-t border-sky-500/30 rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                Filter Matches ({totalResults} found)
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {content}

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl cursor-pointer shadow-[0_4px_16px_rgba(14,165,233,0.35)]"
              >
                Apply Filters ({totalResults} Matches)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
