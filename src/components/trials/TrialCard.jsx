import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Heart,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { haversineDistance } from '../../data/trialsData';
import { useTrials } from '../../context/TrialsContext';

export default function TrialCard({ trial, userCoords, viewMode = 'grid' }) {
  const { savedTrials, toggleSaveTrial } = useTrials();
  const isSaved = (savedTrials || []).includes(trial.id);

  // Approximate distance
  const distance =
    userCoords && trial.lat && trial.lng
      ? haversineDistance(userCoords.lat, userCoords.lng, trial.lat, trial.lng)
      : null;

  // Status Badge
  const renderStatusBadge = () => {
    switch (trial.status) {
      case 'Open':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Applications Open
          </span>
        );
      case 'Closing Soon':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            Closing Soon
          </span>
        );
      case 'Closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
            Registration Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300">
            {trial.status}
          </span>
        );
    }
  };

  // Fee Badge
  const renderFeeBadge = () => {
    if (trial.isFree || trial.entryFee === 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/30 font-mono">
          Free Entry
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 font-mono">
        ₹{trial.entryFee} Entry
      </span>
    );
  };

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div className="bg-[#141B24] border border-[#293442] hover:border-[#B6FF3B]/50 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-xl group">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <img
            src={trial.coverImage}
            alt={trial.title}
            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-700"
          />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {trial.sport}
              </span>
              {renderStatusBadge()}
              {renderFeeBadge()}
              {trial.verifiedOrganiser && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00D4FF]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Organiser
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-[#B6FF3B] transition-colors truncate">
              {trial.title}
            </h3>

            <p className="text-xs text-[#94A3B8] flex items-center gap-1 truncate">
              <span className="text-white font-medium">{trial.organisationName}</span>
              <span>•</span>
              <MapPin className="w-3 h-3 text-[#B6FF3B] shrink-0" />
              <span>{trial.venue}, {trial.city}</span>
              {distance !== null && (
                <span className="text-[#00D4FF] font-mono text-[11px] ml-1">
                  ({distance} km away)
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Trial Date: <strong>{trial.trialDate}</strong> ({trial.reportingTime})</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Deadline: <strong>{trial.applicationDeadline}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Age: <strong>{trial.minAge}–{trial.maxAge} yrs</strong></span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#293442]">
          <button
            type="button"
            onClick={() => toggleSaveTrial(trial.id)}
            title={isSaved ? 'Remove from Saved' : 'Save Trial'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isSaved
                ? 'bg-pink-500/10 text-pink-500 border-pink-500/40'
                : 'bg-[#1B2530] text-[#94A3B8] border-[#293442] hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-500' : ''}`} />
          </button>

          <Link
            to={`/trials/${trial.id}`}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1B2530] hover:bg-[#253241] text-xs font-bold text-white border border-[#293442] transition-colors"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {trial.status !== 'Closed' && (
            <Link
              to={`/trials/${trial.id}/apply`}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] text-xs font-black uppercase tracking-wider hover:bg-[#a5ef28] transition-all shadow-md shadow-[#B6FF3B]/10"
            >
              <span>Apply</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT (DEFAULT)
  return (
    <div className="bg-[#141B24] border border-[#293442] hover:border-[#B6FF3B]/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-2xl group">
      <div>
        {/* Card Header Image & Overlay Badges */}
        <div className="relative h-44 overflow-hidden bg-slate-900">
          <img
            src={trial.coverImage}
            alt={trial.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141B24] via-transparent to-black/60" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#0B0F14]/80 backdrop-blur-sm text-white border border-slate-700">
              {trial.sport}
            </span>

            <div className="flex items-center gap-1.5">
              {renderFeeBadge()}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSaveTrial(trial.id);
                }}
                className={`p-1.5 rounded-lg backdrop-blur-sm transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                    : 'bg-[#0B0F14]/70 text-white/80 hover:text-white border border-slate-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-pink-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bottom Overlay Status */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {renderStatusBadge()}
            {trial.verifiedOrganiser && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00D4FF] bg-[#0B0F14]/80 px-2 py-0.5 rounded border border-[#00D4FF]/30 backdrop-blur-sm">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-[#00D4FF] truncate">
              {trial.organisationName}
            </div>
            <h3 className="font-bold text-white text-base leading-snug group-hover:text-[#B6FF3B] transition-colors mt-0.5 line-clamp-2">
              {trial.title}
            </h3>
          </div>

          {/* Location & Distance */}
          <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#B6FF3B] shrink-0" />
            <span className="truncate">{trial.venue}, {trial.city}</span>
            {distance !== null && (
              <span className="text-[#00D4FF] font-mono font-semibold text-[11px] shrink-0">
                • {distance} km
              </span>
            )}
          </p>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#293442] text-xs">
            <div className="bg-[#1B2530] p-2 rounded-xl border border-[#293442]">
              <span className="text-[10px] text-slate-400 block">Trial Date</span>
              <span className="font-bold text-white text-xs">{trial.trialDate}</span>
              <span className="text-[10px] text-slate-500 block">{trial.reportingTime}</span>
            </div>

            <div className="bg-[#1B2530] p-2 rounded-xl border border-[#293442]">
              <span className="text-[10px] text-slate-400 block">Apply Before</span>
              <span className="font-bold text-amber-400 text-xs">{trial.applicationDeadline}</span>
              <span className="text-[10px] text-slate-500 block">Age: {trial.minAge}–{trial.maxAge} yrs</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            {trial.description}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 border-t border-[#293442]/60 mt-2 flex items-center gap-2">
        <Link
          to={`/trials/${trial.id}`}
          className="flex-1 py-2.5 rounded-xl bg-[#1B2530] hover:bg-[#253241] text-xs font-bold text-white text-center border border-[#293442] transition-colors flex items-center justify-center gap-1"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {trial.status !== 'Closed' ? (
          <Link
            to={`/trials/${trial.id}/apply`}
            className="flex-1 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] text-xs font-black uppercase tracking-wider text-center hover:bg-[#a5ef28] transition-all shadow-md shadow-[#B6FF3B]/10 flex items-center justify-center gap-1"
          >
            <span>Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold text-center cursor-not-allowed">
            Closed
          </span>
        )}
      </div>
    </div>
  );
}
