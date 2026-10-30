import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, AlertCircle } from 'lucide-react';
import Button from '../../Button';

export default function LeagueRescheduleModal({
  isOpen,
  onClose,
  match,
  league,
  homeTeam,
  awayTeam,
  allMatches = [],
  onRescheduleMatch
}) {
  const defaultDateStr = match?.scheduledAt
    ? match.scheduledAt.slice(0, 10)
    : (league?.startDate || new Date().toISOString().slice(0, 10));

  const defaultTimeStr = match?.scheduledAt
    ? match.scheduledAt.slice(11, 16)
    : '10:00';

  const [dateStr, setDateStr] = useState(defaultDateStr);
  const [timeStr, setTimeStr] = useState(defaultTimeStr);
  const [venue, setVenue] = useState(match?.venue || 'Sanctuary Arena 1');
  const [overrideConflict, setOverrideConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize modal state whenever the match prop changes
  useEffect(() => {
    if (match) {
      const d = match.scheduledAt
        ? match.scheduledAt.slice(0, 10)
        : (league?.startDate || new Date().toISOString().slice(0, 10));
      const t = match.scheduledAt
        ? match.scheduledAt.slice(11, 16)
        : '10:00';
      setDateStr(d);
      setTimeStr(t);
      setVenue(match.venue || 'Sanctuary Arena 1');
      setOverrideConflict(false);
      setError(null);
    }
  }, [match?.id, match?.scheduledAt, match?.venue, league?.startDate]);

  if (!isOpen || !match) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const parsedDate = dateStr && timeStr ? new Date(`${dateStr}T${timeStr}:00`) : null;
  const isDateValid = Boolean(parsedDate && !isNaN(parsedDate.getTime()));
  const proposedIso = isDateValid ? parsedDate.toISOString() : null;
  const proposedTime = isDateValid ? parsedDate.getTime() : 0;

  // Check conflicts live against other matches in this league
  const liveConflicts = [];
  const matchDurationMinutes = 90;

  if (isDateValid && proposedTime > 0) {
    allMatches.forEach((other) => {
      if (other.id === match.id || !other.scheduledAt) return;
      const otherTime = new Date(other.scheduledAt).getTime();
      const diffMinutes = Math.abs(proposedTime - otherTime) / (1000 * 60);

      if (diffMinutes < matchDurationMinutes) {
        if (venue && other.venue && venue.trim().toLowerCase() === other.venue.trim().toLowerCase()) {
          liveConflicts.push(`Venue "${venue}" is already booked for match #${other.id} at ${other.scheduledAt.slice(11, 16)}.`);
        }
        const sharedTeams = [match.homeTeamId, match.awayTeamId].filter((tId) =>
          [other.homeTeamId, other.awayTeamId].includes(tId)
        );
        if (sharedTeams.length > 0) {
          liveConflicts.push(`A participating team is already playing in match #${other.id} in an overlapping time window.`);
        }
      }
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isDateValid || !proposedIso) {
      setError('Please provide a valid match date and kickoff time.');
      return;
    }

    if (proposedTime < Date.now() - 3600000 * 12) {
      setError('Cannot schedule a match in the past.');
      return;
    }

    if (liveConflicts.length > 0 && !overrideConflict) {
      setError('Scheduling conflicts detected. Please adjust the time/venue or enable "Override and proceed anyway".');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRescheduleMatch(match.id, {
        scheduledAt: proposedIso,
        venue: venue.trim(),
        overridePastDate: false
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Rescheduling failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141B24] border border-[#293442] w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#F5F7FA]">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6ff3d]/15 border border-[#c6ff3d]/35 text-[#c6ff3d] text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Round {match.round} Match #{match.id}</span>
          </div>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-black uppercase tracking-wide text-white">
            Schedule / Reschedule Match
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Set date, kickoff time, and pitch venue. Conflicts are checked in real time.
          </p>
        </div>

        {/* Contestants Summary */}
        <div className="p-3.5 bg-[#1B2530] border border-[#293442] rounded-2xl flex items-center justify-between">
          <div className="font-bold text-sm text-white">
            {homeTeam?.name || 'Home'} <span className="text-xs text-slate-500 font-normal">vs</span> {awayTeam?.name || 'Away'}
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {match.status}
          </span>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {liveConflicts.length > 0 && (
          <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl space-y-2 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Potential Scheduling Conflict Detected:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              {liveConflicts.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
            <label className="flex items-center gap-2 pt-2 text-white font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={overrideConflict}
                onChange={(e) => setOverrideConflict(e.target.checked)}
                className="w-4 h-4 text-[#c6ff3d] rounded"
              />
              <span>Explicitly override conflict and schedule anyway</span>
            </label>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Match Date *
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Kickoff Time *
              </label>
              <input
                type="time"
                required
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Venue / Pitch / Court *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Pune Turf Arena - Pitch 1"
              maxLength={100}
              className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#293442]">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting}
              className="font-bold shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
