import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import Button from '../../Button';

export default function LeagueAutoScheduleModal({
  isOpen,
  onClose,
  league,
  onApplySchedule
}) {
  const [startDate, setStartDate] = useState(league?.startDate || new Date().toISOString().slice(0, 10));
  const [intervalDays, setIntervalDays] = useState('7'); // weekly default
  const [startHour, setStartHour] = useState('10');
  const [matchesPerDay, setMatchesPerDay] = useState('2');
  const [venue, setVenue] = useState(league?.venue || 'Sanctuary Arena');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (new Date(startDate).getTime() < new Date(todayStr).getTime()) {
      setError('Start date cannot be in the past.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onApplySchedule({
        startDate,
        intervalDays: Number(intervalDays),
        startHour: Number(startHour),
        matchesPerDay: Number(matchesPerDay),
        venue
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Auto-scheduling failed.');
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Matchday Scheduler</span>
          </div>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-black uppercase tracking-wide text-white">
            Auto-Schedule Fixtures
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Distribute rounds across regular weekly or custom calendar intervals and assign venues.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Start Date *
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Interval Between Rounds *
              </label>
              <select
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none cursor-pointer"
              >
                <option value="1">Every Day (Daily Tournament)</option>
                <option value="2">Every 2 Days</option>
                <option value="3">Every 3 Days (Mid-week)</option>
                <option value="7">Weekly (Every 7 Days / Weekends)</option>
                <option value="14">Fortnightly (Every 14 Days)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Match Start Hour
              </label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none cursor-pointer"
              >
                <option value="8">08:00 AM (Morning session)</option>
                <option value="10">10:00 AM (Standard morning)</option>
                <option value="14">02:00 PM (Afternoon)</option>
                <option value="16">04:00 PM (Late afternoon)</option>
                <option value="18">06:00 PM (Evening floodlight)</option>
                <option value="20">08:00 PM (Night match)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Matches Per Day
              </label>
              <select
                value={matchesPerDay}
                onChange={(e) => setMatchesPerDay(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none cursor-pointer"
              >
                <option value="1">1 match per day</option>
                <option value="2">2 matches per day (Staggered)</option>
                <option value="3">3 matches per day</option>
                <option value="4">4 matches per day</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Primary Venue / Turf Arena *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Pune Sports Complex / Turf Arena 1"
              maxLength={80}
              className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
            />
          </div>

          <div className="p-3.5 bg-[#1B2530] border border-[#293442] rounded-xl space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#c6ff3d]" />
              <span>Conflict Detection Enabled</span>
            </div>
            <p className="text-[11px] text-slate-400">
              The scheduler checks for team overlaps, pitch double-bookings, and league date boundary violations. Any conflicts found will be highlighted for override or adjustment.
            </p>
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
              {isSubmitting ? 'Scheduling...' : 'Apply Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
