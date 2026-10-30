import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Swords,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';
import SourceBadge from './SourceBadge';
import MatchStatusBadge from './MatchStatusBadge';
import { formatDateDisplay, maskContact } from '../../data/friendliesData';

export default function MatchCard({
  match,
  homeTeam,
  awayTeam,
  userCoords = null,
  distanceKm = null,
  isCaptain = false,
  onRegisterTeam
}) {
  const isSeekingOpponent = !match.awayTeamId;
  const isRegistrationOpen = match.status === 'Open for Teams' && isSeekingOpponent;

  return (
    <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 hover:border-sky-400/50 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col justify-between space-y-4 group hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(14,165,233,0.15)]">
      {/* Top Source, Status, and Demo Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <MatchStatusBadge status={match.status} />
          <SourceBadge source={match.source} lastVerified={match.lastVerified} />
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-400 border border-white/10">
          Demo
        </span>
      </div>

      {/* Team Logos & Match Title Block */}
      <div className="flex items-center justify-between gap-3 py-2">
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-lg text-slate-100 shrink-0 bg-gradient-to-br from-[#182235] via-[#0f1726] to-[#080d18] border border-sky-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.6)] relative overflow-hidden group-hover:border-sky-400/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <span className="relative z-10 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {homeTeam?.logoInitials || 'HT'}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-sky-300 transition-colors">
              {homeTeam?.name || 'Home Team'}
            </h4>
            <span className="text-xs text-slate-400 truncate block">
              {homeTeam?.collegeName || 'Collegiate Squad'}
            </span>
          </div>
        </div>

        {/* VS / Icon */}
        <div className="flex flex-col items-center px-2 shrink-0">
          <span className="w-8 h-8 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-xs font-black text-amber-400 shadow-inner">
            VS
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
            {match.sport}
          </span>
        </div>

        {/* Away Team or Seeking Opponent */}
        <div className="flex items-center justify-end gap-3 flex-1 min-w-0 text-right">
          <div className="min-w-0">
            <h4 className={`font-bold text-sm sm:text-base truncate ${isSeekingOpponent ? 'text-sky-300' : 'text-white'}`}>
              {isSeekingOpponent ? 'Seeking Opponent' : (awayTeam?.name || 'Away Team')}
            </h4>
            <span className="text-xs text-slate-400 truncate block">
              {isSeekingOpponent ? 'Open challenge slot' : (awayTeam?.collegeName || 'Collegiate Squad')}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-lg shrink-0 ${
              isSeekingOpponent
                ? 'border-2 border-dashed border-sky-400/50 bg-sky-500/10 text-sky-300'
                : 'text-slate-100 bg-gradient-to-br from-[#182235] via-[#0f1726] to-[#080d18] border border-sky-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.6)] relative overflow-hidden group-hover:border-sky-400/50 transition-colors'
            }`}
          >
            {!isSeekingOpponent && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            )}
            <span className="relative z-10 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {isSeekingOpponent ? '?' : (awayTeam?.logoInitials || 'AT')}
            </span>
          </div>
        </div>
      </div>

      {/* Meta Specifications */}
      <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-2 text-xs text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>{formatDateDisplay(match.date)} &bull; {match.startTime}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{match.format} ({match.durationMinutes} mins)</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{match.venue?.name}</span>
          </div>

          {distanceKm !== null && (
            <span className="text-[11px] text-sky-300 shrink-0 font-medium">
              ~{distanceKm} km (approx.)
            </span>
          )}
        </div>
      </div>

      {/* Footer: Fee, Contact Disclaimer, and Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Fee / Turf Levy</span>
            <span className="font-['Barlow_Condensed'] text-base font-bold text-emerald-400">
              {match.fee === 0 ? 'FREE FRIENDLY' : `₹${match.fee} (${match.feeUnit})`}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 text-[11px] block">Match Host / Contact</span>
            <span className="text-white font-medium text-xs">
              {match.organiserName || homeTeam?.captainName}
            </span>
            <span className="block text-[10px] text-slate-500 italic">
              {maskContact(null, false)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            to={`/friendlies/matches/${match.id}`}
            className="flex-1 py-2 px-3 text-center rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 hover:border-sky-400/40 transition-colors backdrop-blur-sm"
          >
            View Match
          </Link>

          {isRegistrationOpen && isCaptain && (
            <button
              type="button"
              onClick={() => onRegisterTeam?.(match)}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-[0_4px_16px_rgba(14,165,233,0.35)] active:translate-y-0.5"
            >
              <span>Accept Open Slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
