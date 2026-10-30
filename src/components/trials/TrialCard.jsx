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
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
          Free Entry
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
        ₹{trial.entryFee} Entry
      </span>
    );
  };

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div className="bg-[#0a0d16]/85 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] group backdrop-blur-md">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <img
            src={trial.coverImage}
            alt={trial.title}
            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-amber-500/20"
          />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#141824] text-slate-300 border border-amber-500/20">
                {trial.sport}
              </span>
              {renderStatusBadge()}
              {renderFeeBadge()}
              {trial.verifiedOrganiser && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate">
              {trial.title}
            </h3>

            <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
              <span className="text-amber-400/90 font-medium">{trial.organisationName}</span>
              <span>•</span>
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{trial.venue}, {trial.city}</span>
              {distance !== null && (
                <span className="text-amber-400 font-mono text-[11px] ml-1">
                  ({distance} km away)
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Trial Date: <strong className="text-white">{trial.trialDate}</strong> ({trial.reportingTime})</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Deadline: <strong className="text-amber-400">{trial.applicationDeadline}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Age: <strong className="text-white">{trial.minAge}–{trial.maxAge} yrs</strong></span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-amber-500/20">
          <button
            type="button"
            onClick={() => toggleSaveTrial(trial.id)}
            title={isSaved ? 'Remove from Saved' : 'Save Trial'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isSaved
                ? 'bg-pink-500/10 text-pink-500 border-pink-500/40'
                : 'bg-[#141824] text-slate-400 border-amber-500/20 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-500' : ''}`} />
          </button>

          <Link
            to={`/trials/${trial.id}`}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141824] hover:bg-amber-950/40 text-xs font-bold text-slate-200 hover:text-white border border-amber-500/20 transition-colors"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {trial.status !== 'Closed' && (
            <Link
              to={`/trials/${trial.id}/apply`}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-black uppercase tracking-wider hover:shadow-[0_4px_18px_rgba(245,158,11,0.5)] border border-amber-400/40 transition-all cursor-pointer"
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
    <div className="bg-[#0a0d16]/85 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] group backdrop-blur-md">
      <div>
        {/* Card Header Image & Overlay Badges */}
        <div className="relative h-44 overflow-hidden bg-slate-900">
          <img
            src={trial.coverImage}
            alt={trial.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16] via-transparent to-black/60" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#07090e]/80 backdrop-blur-sm text-white border border-amber-500/20">
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
                    : 'bg-[#07090e]/70 text-white/80 hover:text-white border border-amber-500/20'
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
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-[#07090e]/80 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-sm">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-amber-400 truncate">
              {trial.organisationName}
            </div>
            <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-400 transition-colors mt-0.5 line-clamp-2">
              {trial.title}
            </h3>
          </div>

          {/* Location & Distance */}
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{trial.venue}, {trial.city}</span>
            {distance !== null && (
              <span className="text-amber-400 font-mono font-semibold text-[11px] shrink-0">
                • {distance} km
              </span>
            )}
          </p>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/15 text-xs">
            <div className="bg-[#141824] p-2 rounded-xl border border-amber-500/20">
              <span className="text-[10px] text-slate-400 block">Trial Date</span>
              <span className="font-bold text-white text-xs">{trial.trialDate}</span>
              <span className="text-[10px] text-slate-500 block">{trial.reportingTime}</span>
            </div>

            <div className="bg-[#141824] p-2 rounded-xl border border-amber-500/20">
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
      <div className="p-5 pt-0 border-t border-amber-500/20 mt-2 flex items-center gap-2">
        <Link
          to={`/trials/${trial.id}`}
          className="flex-1 py-2.5 rounded-xl bg-[#141824] hover:bg-amber-950/40 text-xs font-bold text-slate-200 hover:text-white text-center border border-amber-500/20 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {trial.status !== 'Closed' ? (
          <Link
            to={`/trials/${trial.id}/apply`}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-black uppercase tracking-wider text-center hover:shadow-[0_4px_18px_rgba(245,158,11,0.5)] border border-amber-400/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
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
