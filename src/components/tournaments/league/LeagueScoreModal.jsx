import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Trophy, ShieldAlert, RotateCcw } from 'lucide-react';
import Button from '../../Button';

export default function LeagueScoreModal({
  isOpen,
  onClose,
  match,
  league,
  homeTeam,
  awayTeam,
  onSaveScore
}) {
  const scoringSettings = league?.scoringSettings || {};
  const drawsAllowed = scoringSettings.drawsAllowed !== false;
  const scoreLabel = scoringSettings.scoreLabel || 'Goals';

  const [status, setStatus] = useState('Completed');
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');
  const [forfeitWinnerId, setForfeitWinnerId] = useState('');
  const [resultNote, setResultNote] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (match) {
      setStatus(match.status === 'Completed' || match.status === 'Forfeit' ? match.status : 'Completed');
      setHomeScore(match.homeScore !== null && match.homeScore !== undefined ? String(match.homeScore) : '0');
      setAwayScore(match.awayScore !== null && match.awayScore !== undefined ? String(match.awayScore) : '0');
      setForfeitWinnerId(match.forfeitWinnerTeamId || match.homeTeamId || '');
      setResultNote(match.resultNote || '');
      setError(null);
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (status === 'Completed') {
      const h = Number(homeScore);
      const a = Number(awayScore);

      if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
        setError('Scores must be non-negative integers.');
        return;
      }

      if (!drawsAllowed && h === a) {
        setError(`Draws are not permitted in ${league?.sport || 'this sport'}. Please record a winning margin.`);
        return;
      }
    }

    if (status === 'Forfeit' && !forfeitWinnerId) {
      setError('Please select the winning team for the forfeit.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveScore(match.id, {
        status,
        homeScore: status === 'Completed' ? Number(homeScore) : null,
        awayScore: status === 'Completed' ? Number(awayScore) : null,
        forfeitWinnerTeamId: status === 'Forfeit' ? forfeitWinnerId : null,
        resultNote,
        version: match.version
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoidScore = async () => {
    try {
      setIsSubmitting(true);
      await onSaveScore(match.id, {
        status: 'Scheduled',
        homeScore: null,
        awayScore: null,
        forfeitWinnerTeamId: null,
        resultNote: 'Score voided by manager.',
        version: match.version
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to void score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141B24] border border-[#293442] w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#F5F7FA]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6ff3d]/15 border border-[#c6ff3d]/35 text-[#c6ff3d] text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Round {match.round} &bull; Leg {match.leg} Match</span>
          </div>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-black uppercase tracking-wide text-white">
            Enter Match Result
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Record the official score or forfeit. Standings will recalculate automatically.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Selection Pill */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Match Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Completed', label: 'Completed' },
                { id: 'Forfeit', label: 'Forfeit / Walkover' },
                { id: 'Postponed', label: 'Postponed' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    status === s.id
                      ? 'bg-gradient-to-r from-[#c6ff3d] to-emerald-400 text-[#0B0F14] shadow-sm'
                      : 'bg-[#1B2530] text-slate-300 border border-[#293442] hover:bg-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Regular Score Entry */}
          {status === 'Completed' && (
            <div className="bg-[#1B2530] border border-[#293442] p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Score Entry ({scoreLabel})
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Home Team */}
                <div className="flex-1 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                    {homeTeam?.name?.slice(0, 2).toUpperCase() || 'HM'}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-white truncate max-w-[130px] mx-auto">
                    {homeTeam?.name || 'Home Team'}
                  </div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Home</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-20 mx-auto py-2 text-center text-2xl font-black font-mono bg-[#0B0F14] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-white outline-none"
                  />
                </div>

                <div className="text-xl font-black text-slate-500 font-mono pt-8">
                  VS
                </div>

                {/* Away Team */}
                <div className="flex-1 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                    {awayTeam?.name?.slice(0, 2).toUpperCase() || 'AW'}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-white truncate max-w-[130px] mx-auto">
                    {awayTeam?.name || 'Away Team'}
                  </div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Away</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-20 mx-auto py-2 text-center text-2xl font-black font-mono bg-[#0B0F14] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              {!drawsAllowed && (
                <p className="text-[11px] text-amber-400 text-center font-medium">
                  &bull; {league?.sport || 'This sport'} rules require a decisive winner (no draws).
                </p>
              )}
            </div>
          )}

          {/* Forfeit Option */}
          {status === 'Forfeit' && (
            <div className="bg-[#1B2530] border border-amber-500/30 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-300">
                <ShieldAlert className="w-4 h-4" />
                <span>Select Awarded Forfeit Winner</span>
              </div>
              <p className="text-xs text-slate-300">
                The winning team is awarded a default 3-0 margin and full win points.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setForfeitWinnerId(match.homeTeamId)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    forfeitWinnerId === match.homeTeamId
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-[#0B0F14] border-[#293442] text-slate-300 hover:text-white'
                  }`}
                >
                  {homeTeam?.name || 'Home'} (Winner)
                </button>
                <button
                  type="button"
                  onClick={() => setForfeitWinnerId(match.awayTeamId)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    forfeitWinnerId === match.awayTeamId
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-[#0B0F14] border-[#293442] text-slate-300 hover:text-white'
                  }`}
                >
                  {awayTeam?.name || 'Away'} (Winner)
                </button>
              </div>
            </div>
          )}

          {/* Postponed Notice */}
          {status === 'Postponed' && (
            <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-xs text-sky-200">
              The match will be marked as Postponed. Existing scores will be cleared and the match can be rescheduled later.
            </div>
          )}

          {/* Result Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Match Recap / Result Note (Optional)
            </label>
            <input
              type="text"
              value={resultNote}
              onChange={(e) => setResultNote(e.target.value)}
              placeholder="e.g. Clean sheet victory / 3-2 tie-break in 5th set"
              maxLength={200}
              className="w-full px-3.5 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#293442]">
            {match.status === 'Completed' || match.status === 'Forfeit' ? (
              <button
                type="button"
                onClick={handleVoidScore}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Void Score</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                {isSubmitting ? 'Saving...' : 'Save Result'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
