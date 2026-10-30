import React from 'react';
import { 
  Filter, 
  X, 
  RotateCcw, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  Award, 
  CheckCircle2,
  Users,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function CoachingFilterPanel({
  filters,
  onFilterChange,
  onResetFilters,
  isOpenOnMobile,
  onCloseMobile,
  totalResults
}) {
  const sports = [
    { id: 'all', label: 'All Sports' },
    { id: 'cricket', label: 'Cricket' },
    { id: 'football', label: 'Football' },
    { id: 'badminton', label: 'Badminton' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'tennis', label: 'Tennis' }
  ];

  const skillLevels = ['all', 'Beginner', 'Intermediate', 'Advanced', 'Competitive', 'Professional development'];
  const ageGroups = [
    { id: 'all', label: 'All Ages' },
    { id: 'Children', label: 'Children (4 - 12)' },
    { id: 'Teenagers', label: 'Teenagers (13 - 18)' },
    { id: 'Adults', label: 'Adults (18+)' }
  ];

  const content = (
    <div className="space-y-6 text-sm">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between border-b border-red-500/20 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-red-400" />
          <h3 className="font-bold text-white text-base">Search Filters</h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Sport Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Sport
        </label>
        <select
          value={filters.sport || 'all'}
          onChange={(e) => onFilterChange('sport', e.target.value)}
          className="w-full bg-[#07070d] border border-red-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
        >
          {sports.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* 2. Location & Radius */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Location Radius</span>
          <span className="text-red-400 font-mono font-semibold">{filters.maxDistance ? `${filters.maxDistance} km` : 'Any'}</span>
        </label>
        <input
          type="range"
          min="2"
          max="30"
          step="2"
          value={filters.maxDistance || 30}
          onChange={(e) => onFilterChange('maxDistance', Number(e.target.value))}
          className="w-full accent-red-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>2 km</span>
          <span>15 km</span>
          <span>30 km</span>
        </div>
      </div>

      {/* 3. Monthly Budget Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Monthly Budget</span>
          <span className="text-red-400 font-mono font-semibold">
            Up to ₹{(filters.maxBudget || 8000).toLocaleString('en-IN')}
          </span>
        </label>
        <input
          type="range"
          min="2500"
          max="8000"
          step="500"
          value={filters.maxBudget || 8000}
          onChange={(e) => onFilterChange('maxBudget', Number(e.target.value))}
          className="w-full accent-red-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>₹2.5k</span>
          <span>₹5k</span>
          <span>₹8k+</span>
        </div>
      </div>

      {/* 4. Skill Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Skill Level
        </label>
        <select
          value={filters.skillLevel || 'all'}
          onChange={(e) => onFilterChange('skillLevel', e.target.value)}
          className="w-full bg-[#07070d] border border-red-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
        >
          {skillLevels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl === 'all' ? 'All Skill Levels' : lvl}</option>
          ))}
        </select>
      </div>

      {/* 5. Age Eligibility */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Target Age Group
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ageGroups.map((ag) => {
            const isSelected = (filters.ageGroup || 'all') === ag.id;
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => onFilterChange('ageGroup', isSelected && ag.id !== 'all' ? 'all' : ag.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-left truncate cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400/50 shadow-sm'
                    : 'bg-[#07070d] text-slate-400 border-red-500/20 hover:text-white hover:border-red-500/40'
                }`}
              >
                {ag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Facility & Training Preference Toggles */}
      <div className="space-y-3 pt-2 border-t border-red-500/20">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Preferences & Features
        </label>

        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={Boolean(filters.trialOnly)}
              onChange={(e) => onFilterChange('trialOnly', e.target.checked)}
              className="w-4 h-4 rounded bg-[#07070d] border-red-500/40 text-red-600 focus:ring-0 accent-red-600"
            />
            <span>Trial Class Available</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={Boolean(filters.freeTrialOnly)}
              onChange={(e) => onFilterChange('freeTrialOnly', e.target.checked)}
              className="w-4 h-4 rounded bg-[#07070d] border-red-500/40 text-red-600 focus:ring-0 accent-red-600"
            />
            <span className="text-red-400 font-semibold">Free Trial Only</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={Boolean(filters.womenCoaches)}
              onChange={(e) => onFilterChange('womenCoaches', e.target.checked)}
              className="w-4 h-4 rounded bg-[#07070d] border-red-500/40 text-red-600 focus:ring-0 accent-red-600"
            />
            <span>Women Coaches on Staff</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={Boolean(filters.womenFocusedBatches)}
              onChange={(e) => onFilterChange('womenFocusedBatches', e.target.checked)}
              className="w-4 h-4 rounded bg-[#07070d] border-red-500/40 text-red-600 focus:ring-0 accent-red-600"
            />
            <span>Women-Focused Batches</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={Boolean(filters.beginnerFriendly)}
              onChange={(e) => onFilterChange('beginnerFriendly', e.target.checked)}
              className="w-4 h-4 rounded bg-[#07070d] border-red-500/40 text-red-600 focus:ring-0 accent-red-600"
            />
            <span>Beginner Friendly Programmes</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={Boolean(filters.scholarshipsOnly)}
              onChange={(e) => onFilterChange('scholarshipsOnly', e.target.checked)}
              className="w-4 h-4 rounded bg-[#07070d] border-red-500/40 text-red-600 focus:ring-0 accent-red-600"
            />
            <span>Scholarship / Fee Assistance</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={Boolean(filters.verifiedOnly)}
              onChange={(e) => onFilterChange('verifiedOnly', e.target.checked)}
              className="w-4 h-4 rounded bg-[#07070d] border-red-500/40 text-red-600 focus:ring-0 accent-red-600"
            />
            <span className="text-emerald-400 font-semibold">Verified Academies Only</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="bg-[#0c0d15]/90 backdrop-blur-xl border border-red-500/25 rounded-2xl p-5 sticky top-28 shadow-xl">
          {content}
        </div>
      </aside>

      {/* Mobile Modal Drawer */}
      {isOpenOnMobile && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0c0d15] border-l border-red-500/30 h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
              <span className="font-bold text-white text-base">Filter Results ({totalResults})</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {content}

            <div className="pt-4 border-t border-red-500/20">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-sm shadow-md shadow-red-950/50 hover:from-red-500 hover:to-red-600 cursor-pointer"
              >
                Apply Filters ({totalResults} Academies)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
