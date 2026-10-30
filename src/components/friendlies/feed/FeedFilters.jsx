/**
 * src/components/friendlies/feed/FeedFilters.jsx
 *
 * Sidebar / mobile-drawer filter panel for the Friendly Feed.
 * Filters: sport, city, college, date range, skill level, format, 
 * hasHomeGround, post type, "from teams in my city".
 * All active filters are persisted in the URL via props.
 */
import React from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';

const SPORTS = ['all', 'Football', 'Cricket', 'Basketball', 'Badminton', 'Volleyball'];
const CITIES = ['all', 'Pune', 'Mumbai'];
const SKILL_LEVELS = ['all', 'Beginner', 'Intermediate', 'Competitive'];
const POST_TYPES = ['all', 'Looking for a match', 'Hosting, need an opponent'];

const SELECT_CLASS =
  'w-full px-3 py-2 bg-[#0B0F14] border border-[#293442] focus:border-[#B6FF3B] rounded-xl text-xs text-white outline-none transition-colors appearance-none cursor-pointer';
const LABEL_CLASS = 'block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5';

function FilterSection({ title, children }) {
  return (
    <div className="space-y-1.5">
      <p className={LABEL_CLASS}>{title}</p>
      {children}
    </div>
  );
}

export default function FeedFilters({
  filters,
  colleges = [],
  onFilterChange,
  onResetFilters,
  totalResults,
  isOpenOnMobile = false,
  onCloseMobile,
}) {
  const hasActiveFilters =
    filters.sport !== 'all' ||
    filters.city !== 'all' ||
    filters.collegeId !== 'all' ||
    filters.skillLevel !== 'all' ||
    filters.type !== 'all' ||
    filters.hasHomeGround === true ||
    filters.startDate ||
    filters.endDate;

  const todayStr = new Date().toISOString().slice(0, 10);

  const panelContent = (
    <div className="space-y-5">
      {/* Result count */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">
          {totalResults} post{totalResults !== 1 ? 's' : ''} found
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-[#B6FF3B] hover:underline font-bold"
          >
            <RotateCcw className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <FilterSection title="Sport">
        <select value={filters.sport || 'all'} onChange={(e) => onFilterChange('sport', e.target.value)} className={SELECT_CLASS}>
          {SPORTS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Sports' : s}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Post Type">
        <select value={filters.type || 'all'} onChange={(e) => onFilterChange('type', e.target.value)} className={SELECT_CLASS}>
          {POST_TYPES.map((t) => (
            <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="City">
        <select value={filters.city || 'all'} onChange={(e) => onFilterChange('city', e.target.value)} className={SELECT_CLASS}>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Cities' : c}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="College">
        <select value={filters.collegeId || 'all'} onChange={(e) => onFilterChange('collegeId', e.target.value)} className={SELECT_CLASS}>
          <option value="all">All Colleges</option>
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>{c.shortName || c.name}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Skill Level">
        <select value={filters.skillLevel || 'all'} onChange={(e) => onFilterChange('skillLevel', e.target.value)} className={SELECT_CLASS}>
          {SKILL_LEVELS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Levels' : s}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Preferred Date Range">
        <div className="space-y-2">
          <input
            type="date"
            value={filters.startDate || ''}
            min={todayStr}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className={SELECT_CLASS}
            aria-label="Preferred date from"
          />
          <input
            type="date"
            value={filters.endDate || ''}
            min={filters.startDate || todayStr}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className={SELECT_CLASS}
            aria-label="Preferred date to"
          />
        </div>
      </FilterSection>

      {/* Boolean toggles */}
      <FilterSection title="Extras">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.hasHomeGround === true}
            onChange={(e) => onFilterChange('hasHomeGround', e.target.checked ? true : 'all')}
            className="w-4 h-4 rounded bg-[#0B0F14] border border-[#293442] accent-[#B6FF3B]"
          />
          <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Home ground available</span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-5 sticky top-24">
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal className="w-4 h-4 text-[#B6FF3B]" />
            <h2 className="font-['Barlow_Condensed'] text-base font-bold uppercase text-white tracking-wide">Filters</h2>
          </div>
          {panelContent}
        </div>
      </aside>

      {/* Mobile drawer */}
      {isOpenOnMobile && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-[#151B23] border-l border-[#293442] p-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#B6FF3B]" />
                <h2 className="font-['Barlow_Condensed'] text-lg font-bold uppercase text-white tracking-wide">Filters</h2>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-[#1B2530] rounded-lg transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {panelContent}
          </div>
        </div>
      )}
    </>
  );
}

