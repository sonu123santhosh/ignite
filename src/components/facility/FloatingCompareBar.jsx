/**
 * FloatingCompareBar.jsx
 * Floating glass action bar appearing when 1 or more facilities are selected for comparison.
 * Matches the Liquid Glass navbar design styling.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import Button from '../Button';
import { useCompare } from '../../context/CompareContext';
import { INITIAL_FACILITIES } from '../../data/facilitiesData';

export default function FloatingCompareBar({ facilitiesList = INITIAL_FACILITIES }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedIds, compareCount, removeFromCompare, clearCompare } = useCompare();

  // Hide bar on comparison page itself or when nothing selected
  const isComparisonPage = location.pathname.startsWith('/facilities/compare');
  if (isComparisonPage || compareCount === 0) return null;

  const handleCompareClick = () => {
    if (compareCount < 2) return;
    navigate(`/facilities/compare?ids=${selectedIds.join(',')}`);
  };

  return (
    <aside
      className="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-6 z-40 max-w-4xl mx-auto animate-in slide-in-from-bottom-5 duration-300 pointer-events-none"
      aria-label="Facility comparison toolbar"
    >
      <div className="pointer-events-auto liquid-glass-navbar rounded-2xl sm:rounded-full p-2.5 sm:px-5 sm:py-3 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(225,29,72,0.18)] border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Section: Selected facilities chips */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300 pr-1">
            <Scale className="w-4 h-4 text-[#c6ff3d]" />
            <span>Compare ({compareCount}/4)</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedIds.map((id) => {
              const fac = facilitiesList.find((f) => f && f.id === id);
              const name = fac ? fac.name : id;
              return (
                <span
                  key={id}
                  className="bg-[#0B0F14]/90 border border-[#293442] hover:border-rose-500/40 text-slate-200 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm max-w-[160px] truncate"
                >
                  <span className="truncate">{name}</span>
                  <button
                    type="button"
                    onClick={() => removeFromCompare(id)}
                    className="p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={`Remove ${name}`}
                    aria-label={`Remove ${name} from comparison`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 justify-end w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-white font-medium px-2 py-1 transition-colors cursor-pointer"
          >
            Clear
          </button>

          <Button
            variant="crimson"
            size="sm"
            onClick={handleCompareClick}
            disabled={compareCount < 2}
            className="text-xs font-bold gap-1.5 shadow-md"
            title={compareCount < 2 ? 'Select at least 2 facilities to compare' : 'Compare selected venues'}
          >
            <span>Compare {compareCount >= 2 ? `(${compareCount})` : ''}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

