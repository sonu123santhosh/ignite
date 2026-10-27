import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ onClearFilters, message }) {
  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-10 text-center max-w-lg mx-auto" aria-live="polite">
      <div className="w-14 h-14 rounded-2xl bg-[#0B0F14] border border-[#293442] flex items-center justify-center text-[#94A3B8] mx-auto mb-4">
        <Search className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-[#F5F7FA] font-['Barlow_Condensed'] uppercase tracking-wide">
        No Matching Facilities Found
      </h3>

      <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 leading-relaxed">
        {message || "We couldn't find any sports facilities matching your current criteria. Widen the distance, remove a filter, or try another sport."}
      </p>

      <div className="mt-6 flex justify-center">
        <Button variant="primary" size="md" onClick={onClearFilters} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Clear All Filters</span>
        </Button>
      </div>
    </div>
  );
}
