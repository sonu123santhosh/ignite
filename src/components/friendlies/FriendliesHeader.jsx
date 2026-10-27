import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Plus, Shield, Search, ArrowDown } from 'lucide-react';

export default function FriendliesHeader({ onScrollToMatches }) {
  return (
    <div className="space-y-4 mb-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#151B23] via-[#1B2530] to-[#151B23] border border-[#293442] p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] text-xs font-bold uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5" />
            <span>Inter-College Sports Community</span>
          </div>

          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
            College Friendlies
          </h1>

          <div className="font-['Barlow_Condensed'] text-xl sm:text-2xl font-bold uppercase text-[#00D9FF] tracking-wide">
            Your college. Your team. Your next match.
          </div>

          <p className="text-sm sm:text-base text-[#9CA3AF] max-w-2xl leading-relaxed">
            Discover upcoming friendly matches, challenge rival colleges, and get your team on the field. Negotiate match dates, find certified grounds, and confirm fixtures seamlessly.
          </p>

          {/* Three Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onScrollToMatches}
              className="px-5 py-2.5 rounded-xl bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Find a Match</span>
            </button>

            <Link
              to="/friendlies/challenge"
              className="px-4 py-2.5 rounded-xl bg-[#00D9FF] hover:bg-[#00b3d6] text-[#0B0F14] font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md"
            >
              <Swords className="w-4 h-4" />
              <span>Challenge a College</span>
            </Link>

            <Link
              to="/friendlies/register-team"
              className="px-4 py-2.5 rounded-xl bg-[#1B2530] hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-[#293442] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#B6FF3B]" />
              <span>Register Your Team</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Data Notice */}
      <div className="bg-[#151B23] border border-[#293442] py-2 px-4 rounded-xl flex items-center justify-between text-xs text-[#9CA3AF]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#B6FF3B] uppercase tracking-wider">Demo Data Notice:</span>
          <span>All friendly fixtures, colleges, rosters and negotiations are simulated sample data.</span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline italic">
          Prototype storage. Not suitable for production, where a backend and database are required.
        </span>
      </div>
    </div>
  );
}
