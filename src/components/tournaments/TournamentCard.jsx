import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Clock,
  ShieldCheck,
  Heart,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDateDisplay, daysUntil, getDerivedLabels } from '../../data/tournamentsData';

// Reusable court SVG schematic backgrounds for each sport
export function SportCourtSVG({ sport, className = '' }) {
  const s = (sport || '').toLowerCase();

  if (s.includes('football')) {
    return (
      <svg className={`w-full h-full object-cover ${className}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Football pitch line schematic">
        <rect width="400" height="200" fill="url(#pitchGrad)" />
        <rect x="20" y="15" width="360" height="170" stroke="rgba(229,195,120,0.3)" strokeWidth="2" />
        <line x1="200" y1="15" x2="200" y2="185" stroke="rgba(229,195,120,0.3)" strokeWidth="2" />
        <circle cx="200" cy="100" r="35" stroke="rgba(229,195,120,0.3)" strokeWidth="2" />
        <circle cx="200" cy="100" r="3" fill="rgba(229,195,120,0.4)" />
        <rect x="20" y="60" width="45" height="80" stroke="rgba(229,195,120,0.3)" strokeWidth="2" />
        <rect x="335" y="60" width="45" height="80" stroke="rgba(229,195,120,0.3)" strokeWidth="2" />
        <defs>
          <linearGradient id="pitchGrad" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f241a" />
            <stop offset="1" stopColor="#0B1319" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (s.includes('cricket')) {
    return (
      <svg className={`w-full h-full object-cover ${className}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Cricket pitch oval schematic">
        <rect width="400" height="200" fill="url(#cricketGrad)" />
        <ellipse cx="200" cy="100" rx="170" ry="85" stroke="rgba(245,158,11,0.25)" strokeWidth="2" />
        <rect x="180" y="60" width="40" height="80" rx="4" stroke="rgba(245,158,11,0.4)" strokeWidth="2" fill="rgba(245,158,11,0.06)" />
        <line x1="180" y1="75" x2="220" y2="75" stroke="rgba(245,158,11,0.5)" strokeWidth="2" />
        <line x1="180" y1="125" x2="220" y2="125" stroke="rgba(245,158,11,0.5)" strokeWidth="2" />
        <defs>
          <linearGradient id="cricketGrad" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2e220a" />
            <stop offset="1" stopColor="#0B1319" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (s.includes('badminton')) {
    return (
      <svg className={`w-full h-full object-cover ${className}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Badminton court schematic">
        <rect width="400" height="200" fill="url(#badmintonGrad)" />
        <rect x="50" y="25" width="300" height="150" stroke="rgba(125,211,252,0.3)" strokeWidth="2" />
        <line x1="200" y1="20" x2="200" y2="180" stroke="rgba(125,211,252,0.5)" strokeWidth="3" strokeDasharray="4 2" />
        <line x1="50" y1="40" x2="350" y2="40" stroke="rgba(125,211,252,0.25)" strokeWidth="1.5" />
        <line x1="50" y1="160" x2="350" y2="160" stroke="rgba(125,211,252,0.25)" strokeWidth="1.5" />
        <line x1="140" y1="25" x2="140" y2="175" stroke="rgba(125,211,252,0.25)" strokeWidth="1.5" />
        <line x1="260" y1="25" x2="260" y2="175" stroke="rgba(125,211,252,0.25)" strokeWidth="1.5" />
        <defs>
          <linearGradient id="badmintonGrad" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0b2438" />
            <stop offset="1" stopColor="#081017" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (s.includes('basketball')) {
    return (
      <svg className={`w-full h-full object-cover ${className}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Basketball court schematic">
        <rect width="400" height="200" fill="url(#basketGrad)" />
        <rect x="25" y="20" width="350" height="160" stroke="rgba(249,115,22,0.3)" strokeWidth="2" />
        <line x1="200" y1="20" x2="200" y2="180" stroke="rgba(249,115,22,0.3)" strokeWidth="2" />
        <circle cx="200" cy="100" r="30" stroke="rgba(249,115,22,0.3)" strokeWidth="2" />
        <path d="M 25 60 A 45 45 0 0 1 25 140" stroke="rgba(249,115,22,0.35)" strokeWidth="2" fill="none" />
        <path d="M 375 60 A 45 45 0 0 0 375 140" stroke="rgba(249,115,22,0.35)" strokeWidth="2" fill="none" />
        <defs>
          <linearGradient id="basketGrad" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#30190a" />
            <stop offset="1" stopColor="#0B0F14" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Default / Tennis / Volleyball
  return (
    <svg className={`w-full h-full object-cover ${className}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Sports court line schematic">
      <rect width="400" height="200" fill="url(#defaultCourtGrad)" />
      <rect x="30" y="25" width="340" height="150" stroke="rgba(229,195,120,0.25)" strokeWidth="2" />
      <line x1="200" y1="20" x2="200" y2="180" stroke="rgba(229,195,120,0.35)" strokeWidth="3" />
      <line x1="30" y1="100" x2="370" y2="100" stroke="rgba(229,195,120,0.18)" strokeWidth="1.5" strokeDasharray="3 3" />
      <defs>
        <linearGradient id="defaultCourtGrad" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#152336" />
          <stop offset="1" stopColor="#0B0F14" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function TournamentCard({
  tournament,
  registrations = [],
  viewMode = 'grid'
}) {
  const [isFav, setIsFav] = useState(false);
  const derivedLabels = getDerivedLabels(tournament, registrations);
  const daysLeft = daysUntil(tournament.registrationDeadline);
  const isRegOpen = tournament.status === 'Registration Open' && daysLeft >= 0;

  // Format label
  const formatDisplayNames = {
    single_elimination: 'Single Elimination (Knockout)',
    round_robin: 'Round Robin',
    group_knockout: 'Group Stage + Knockout',
    league: 'League',
    individual: 'Individual Bracket'
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-[#141B24]/90 border border-[#293442] hover:border-[#D4AF37]/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-md group backdrop-blur-sm">
        {/* Left: Thumbnail & Core Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0 w-full">
          {/* Banner Slot */}
          <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden relative shrink-0 border border-[#293442]">
            <SportCourtSVG sport={tournament.sport} />
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B0F14]/90 text-white border border-[#293442]">
                {tournament.sport}
              </span>
            </div>
            <div className="absolute bottom-2 right-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-slate-400">
                Demo
              </span>
            </div>
          </div>

          {/* Text block */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge type="tournament" status={tournament.status} />
              {derivedLabels.map((lbl, idx) => (
                <StatusBadge key={idx} derived={true} status={lbl.text} />
              ))}
              {tournament.organiserVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Organiser</span>
                </span>
              )}
            </div>

            <Link to={`/tournaments/${tournament.id}`} className="block group-hover:text-[#E5C378] transition-colors">
              <h3 className="font-['Barlow_Condensed'] text-xl sm:text-2xl font-bold uppercase tracking-wide text-white truncate">
                {tournament.name}
              </h3>
            </Link>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{tournament.venue}, {tournament.city}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Starts {formatDateDisplay(tournament.startDate)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDisplayNames[tournament.format] || tournament.format}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Fees, Prizes & Action */}
        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#293442]">
          <div className="text-left md:text-right">
            <div className="text-xs text-[#94A3B8]">Entry Fee</div>
            <div className="font-['Barlow_Condensed'] text-xl font-black text-[#E5C378]">
              {tournament.entryFee === 0 ? 'FREE ENTRY' : `₹${tournament.entryFee.toLocaleString('en-IN')}`}
              {tournament.entryFee > 0 && (
                <span className="text-xs font-normal text-slate-400 ml-1 font-sans">
                  /{tournament.feeUnit === 'per player' ? 'player' : 'team'}
                </span>
              )}
            </div>
            {tournament.prizePool > 0 && (
              <div className="flex items-center md:justify-end gap-1 text-xs text-amber-300 font-semibold mt-0.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Prize: ₹{tournament.prizePool.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFav(!isFav)}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isFav
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                  : 'bg-[#1B2530] border-[#293442] text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <Link
              to={`/tournaments/${tournament.id}`}
              className="px-3.5 py-2 rounded-xl bg-[#1B2530] hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-[#293442] transition-colors"
            >
              View Details
            </Link>

            {isRegOpen && (
              <Link
                to={`/tournaments/${tournament.id}/register`}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:brightness-110 text-[#0F141C] font-bold text-xs transition-all flex items-center gap-1 shadow-[0_2px_10px_rgba(212,175,55,0.2)]"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid Card View (Default)
  return (
    <div className="bg-[#141B24]/90 border border-[#293442] hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-lg group hover:-translate-y-1 backdrop-blur-sm">
      {/* Banner Slot (SVG schematic, clear placeholder for real photo) */}
      <div className="h-44 w-full relative overflow-hidden bg-[#0B0F14] border-b border-[#293442]">
        <SportCourtSVG sport={tournament.sport} />

        {/* Top Floating Tags */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0B0F14]/90 text-white border border-[#293442] backdrop-blur-sm">
              {tournament.sport}
            </span>
            {tournament.organiserVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 backdrop-blur-sm">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Organiser</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFav(!isFav)}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isFav
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-[#0B0F14]/80 text-slate-300 hover:text-white border border-[#293442]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Floating Info */}
        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[11px]">
          <span className="px-2 py-0.5 rounded bg-black/70 text-slate-300 backdrop-blur-sm">
            {formatDisplayNames[tournament.format] || tournament.format}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/70 text-slate-400 font-mono text-[10px]">
            Demo Listing
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge type="tournament" status={tournament.status} />
            {derivedLabels.map((lbl, idx) => (
              <StatusBadge key={idx} derived={true} status={lbl.text} />
            ))}
          </div>

          {/* Title */}
          <Link to={`/tournaments/${tournament.id}`} className="block group-hover:text-[#E5C378] transition-colors">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase tracking-wide text-white leading-tight line-clamp-2">
              {tournament.name}
            </h3>
          </Link>

          {/* Organiser */}
          <div className="text-xs text-[#94A3B8]">
            Organised by <span className="text-white font-medium">{tournament.organiserName}</span>
          </div>

          {/* Meta details list */}
          <div className="space-y-1.5 pt-2 border-t border-[#293442] text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              <span className="truncate">{tournament.venue}, {tournament.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#E5C378] shrink-0" />
              <span>Starts {formatDateDisplay(tournament.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className={daysLeft <= 3 && daysLeft >= 0 ? 'text-amber-300 font-semibold' : ''}>
                Reg closes {formatDateDisplay(tournament.registrationDeadline)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer / Pricing & Actions */}
        <div className="pt-3 border-t border-[#293442] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#94A3B8] block">Entry Fee</span>
              <div className="font-['Barlow_Condensed'] text-2xl font-black text-[#E5C378] leading-none">
                {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee.toLocaleString('en-IN')}`}
                {tournament.entryFee > 0 && (
                  <span className="text-xs font-normal text-slate-400 ml-1 font-sans">
                    /{tournament.feeUnit === 'per player' ? 'player' : 'team'}
                  </span>
                )}
              </div>
            </div>

            {tournament.prizePool > 0 && (
              <div className="text-right">
                <span className="text-[11px] text-[#94A3B8] block">Prize Pool</span>
                <div className="flex items-center gap-1 font-['Barlow_Condensed'] text-xl font-bold text-amber-300 leading-none">
                  <Trophy className="w-4 h-4" />
                  <span>₹{tournament.prizePool.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to={`/tournaments/${tournament.id}`}
              className="w-full py-2 px-3 text-center rounded-xl bg-[#1B2530] hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-[#293442] transition-colors"
            >
              View Details
            </Link>

            {isRegOpen ? (
              <Link
                to={`/tournaments/${tournament.id}/register`}
                className="w-full py-2 px-3 text-center rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:brightness-110 text-[#0F141C] font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-[0_2px_10px_rgba(212,175,55,0.2)]"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-2 px-3 text-center rounded-xl bg-slate-800 text-slate-500 font-semibold text-xs border border-slate-700 cursor-not-allowed"
              >
                {tournament.status}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
