import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  ShieldCheck,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { SPORTS_CATEGORIES } from '../../data/trialsData';

export default function TrialsFilterPanel({
  filters,
  onFilterChange,
  onResetFilters,
  userCoords,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) {
  return (
    <div className="bg-[#0a0d16]/90 border border-amber-500/25 rounded-2xl p-5 space-y-6 backdrop-blur-md shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Filter Trials</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          {isMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sport Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Sport Category
        </label>
        <select
          value={filters.sport}
          onChange={(e) => onFilterChange('sport', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
        >
          <option value="all">All Sports</option>
          {SPORTS_CATEGORIES.filter(s => s.id !== 'all').map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* City / Locality */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          City / Region
        </label>
        <select
          value={filters.city}
          onChange={(e) => onFilterChange('city', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
        >
          <option value="all">All Locations</option>
          <option value="Pune">Pune, Maharashtra</option>
          <option value="Mumbai">Mumbai, Maharashtra</option>
        </select>
      </div>

      {/* Distance Radius Slider (if location available) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-300 uppercase tracking-wider">
            Distance Radius
          </label>
          <span className="font-mono text-amber-400 font-bold">
            {filters.maxDistance ? `${filters.maxDistance} km` : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={filters.maxDistance || 60}
          onChange={(e) => onFilterChange('maxDistance', Number(e.target.value))}
          disabled={!userCoords}
          className="w-full accent-amber-500 cursor-pointer"
        />
        {!userCoords && (
          <span className="text-[10px] text-slate-500 block">
            Click &quot;Use My Location&quot; in search bar to enable radius filtering.
          </span>
        )}
      </div>

      {/* Organisation Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Organisation Type
        </label>
        <select
          value={filters.organisationType}
          onChange={(e) => onFilterChange('organisationType', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
        >
          <option value="all">All Organisations</option>
          <option value="College">College / University</option>
          <option value="Club">Club / Academy</option>
          <option value="Sports Association">Sports Association</option>
        </select>
      </div>

      {/* Entry Fee (Free / Paid) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Entry Fee
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['all', 'free', 'paid'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange('entryFee', f)}
              className={`py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filters.entryFee === f
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'bg-[#07090e] text-slate-300 border border-amber-500/20 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Application Status */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Application Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Closing Soon">Closing Soon</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Skill Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Skill Level
        </label>
        <select
          value={filters.skillLevel}
          onChange={(e) => onFilterChange('skillLevel', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
        >
          <option value="all">Any Skill Level</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Competitive">Competitive / Professional</option>
        </select>
      </div>

      {/* Safety & Trust Checkbox */}
      <div className="pt-2 border-t border-amber-500/20 space-y-3">
        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => onFilterChange('verifiedOnly', e.target.checked)}
            className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
          />
          <span className="flex items-center gap-1 font-semibold text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Verified Organisers Only
          </span>
        </label>
      </div>

      {isMobileDrawer && (
        <button
          type="button"
          onClick={onCloseMobileDrawer}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider hover:shadow-[0_4px_18px_rgba(245,158,11,0.5)] border border-amber-400/40 cursor-pointer"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
}
