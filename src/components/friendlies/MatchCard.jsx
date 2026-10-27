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
    <div className="bg-[#151B23] border border-[#293442] hover:border-[#B6FF3B]/50 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group hover:-translate-y-0.5">
      {/* Top Source, Status, and Demo Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#293442]">
        <div className="flex items-center gap-2 flex-wrap">
          <MatchStatusBadge status={match.status} />
          <SourceBadge source={match.source} lastVerified={match.lastVerified} />
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-slate-400">
          Demo
        </span>
      </div>

      {/* Team Logos & Match Title Block */}
      <div className="flex items-center justify-between gap-3 py-2">
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-lg text-white shadow-md shrink-0 border border-white/10"
            style={{ backgroundColor: homeTeam?.primaryColor || '#00D9FF' }}
          >
            {homeTeam?.logoInitials || 'HT'}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-[#B6FF3B] transition-colors">
              {homeTeam?.name || 'Home Team'}
            </h4>
            <span className="text-xs text-[#9CA3AF] truncate block">
              {homeTeam?.collegeName || 'Collegiate Squad'}
            </span>
          </div>
        </div>

        {/* VS / Icon */}
        <div className="flex flex-col items-center px-2 shrink-0">
          <span className="w-8 h-8 rounded-full bg-[#0B0F14] border border-[#293442] flex items-center justify-center text-xs font-black text-amber-400">
            VS
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">
            {match.sport}
          </span>
        </div>

        {/* Away Team or Seeking Opponent */}
        <div className="flex items-center justify-end gap-3 flex-1 min-w-0 text-right">
          <div className="min-w-0">
            <h4 className={`font-bold text-sm sm:text-base truncate ${isSeekingOpponent ? 'text-[#B6FF3B]' : 'text-white'}`}>
              {isSeekingOpponent ? 'Seeking Opponent' : (awayTeam?.name || 'Away Team')}
            </h4>
            <span className="text-xs text-[#9CA3AF] truncate block">
              {isSeekingOpponent ? 'Open challenge slot' : (awayTeam?.collegeName || 'Collegiate Squad')}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-lg shadow-md shrink-0 border ${
              isSeekingOpponent
                ? 'bg-dashed border-2 border-[#B6FF3B]/50 bg-[#B6FF3B]/5 text-[#B6FF3B]'
                : 'border-white/10 text-white'
            }`}
            style={!isSeekingOpponent ? { backgroundColor: awayTeam?.primaryColor || '#B6FF3B' } : {}}
          >
            {isSeekingOpponent ? '?' : (awayTeam?.logoInitials || 'AT')}
          </div>
        </div>
      </div>

      {/* Meta Specifications */}
      <div className="bg-[#1B2530]/60 border border-[#293442] rounded-xl p-3 space-y-2 text-xs text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#B6FF3B]" />
            <span>{formatDateDisplay(match.date)} &bull; {match.startTime}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>{match.format} ({match.durationMinutes} mins)</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#293442]/60 text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{match.venue?.name}</span>
          </div>

          {distanceKm !== null && (
            <span className="text-[11px] text-[#00D9FF] shrink-0 font-medium">
              ~{distanceKm} km (approx.)
            </span>
          )}
        </div>
      </div>

      {/* Footer: Fee, Contact Disclaimer, and Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[#9CA3AF] text-[11px] block">Fee / Turf Levy</span>
            <span className="font-['Barlow_Condensed'] text-base font-bold text-[#B6FF3B]">
              {match.fee === 0 ? 'FREE FRIENDLY' : `₹${match.fee} (${match.feeUnit})`}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[#9CA3AF] text-[11px] block">Match Host / Contact</span>
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
            className="flex-1 py-2 px-3 text-center rounded-xl bg-[#1B2530] hover:bg-slate-700 text-white font-semibold text-xs border border-[#293442] transition-colors"
          >
            View Match
          </Link>

          {isRegistrationOpen && isCaptain && (
            <button
              type="button"
              onClick={() => onRegisterTeam?.(match)}
              className="py-2 px-4 rounded-xl bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md"
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
