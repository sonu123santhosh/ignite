import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Plus, Shield, Search, ArrowDown, Sparkles } from 'lucide-react';

export default function FriendliesHeader({ onScrollToMatches }) {
  return (
    <div className="space-y-4 mb-8">
      {/* Hero Banner with Stadium Night Ambient Glow */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1629]/80 via-[#0a1222]/85 to-[#070d1a]/90 backdrop-blur-xl border border-sky-500/20 p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        {/* Subtle Bernabéu floodlight illumination glints */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Swords className="w-3.5 h-3.5 text-sky-400" />
            <span>Inter-College Sports Community</span>
          </div>

          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            College Friendlies
          </h1>

          <div className="font-['Barlow_Condensed'] text-xl sm:text-2xl font-bold uppercase text-sky-300 tracking-wide drop-shadow-sm">
            Your college. Your team. Your next match.
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Discover upcoming friendly matches, challenge rival colleges, and get your team on the field. Negotiate match dates, find certified grounds, and confirm fixtures seamlessly.
          </p>

          {/* Three Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onScrollToMatches}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-[0_4px_16px_rgba(14,165,233,0.35)] hover:shadow-[0_6px_22px_rgba(14,165,233,0.5)] flex items-center gap-1.5 active:translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>Find a Match</span>
            </button>

            <Link
              to="/friendlies/challenge"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.5)] active:translate-y-0.5"
            >
              <Swords className="w-4 h-4" />
              <span>Challenge a College</span>
            </Link>

            <Link
              to="/friendlies/register-team"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/20 hover:border-sky-400/40 transition-all flex items-center gap-1.5 backdrop-blur-md active:translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Register Your Team</span>
            </Link>

            <Link
              to="/friendlies/feed"
              className="px-4 py-2.5 rounded-xl bg-[#B6FF3B]/15 hover:bg-[#B6FF3B]/25 text-[#B6FF3B] font-bold text-xs sm:text-sm border border-[#B6FF3B]/35 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Match Feed</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Data Notice */}
      <div className="bg-[#0c1629]/75 backdrop-blur-md border border-sky-500/20 py-2.5 px-4 rounded-xl flex items-center justify-between text-xs text-slate-300 shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-400 uppercase tracking-wider">Demo Data Notice:</span>
          <span>All friendly fixtures, colleges, rosters and negotiations are simulated sample data.</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline italic">
          Prototype storage. Not suitable for production, where a backend and database are required.
        </span>
      </div>
    </div>
  );
}
