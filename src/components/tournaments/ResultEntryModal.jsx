import React, { useState } from 'react';
import { X, Trophy, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ResultEntryModal({
  isOpen,
  onClose,
  match,
  sport = 'Football',
  format = 'single_elimination',
  onSaveResult
}) {
  if (!isOpen || !match) return null;

  const s = (sport || '').toLowerCase();
  const isKnockout = format === 'single_elimination' || format === 'group_knockout';

  // Standard scores
  const [teamAScore, setTeamAScore] = useState(match.result?.teamAScore ?? '');
  const [teamBScore, setTeamBScore] = useState(match.result?.teamBScore ?? '');
  const [notes, setNotes] = useState(match.result?.notes || '');

  // Penalties for knockout tie in football/basketball
  const [tieBreakTeamAScore, setTieBreakTeamAScore] = useState(match.result?.tieBreakTeamAScore ?? '');
  const [tieBreakTeamBScore, setTieBreakTeamBScore] = useState(match.result?.tieBreakTeamBScore ?? '');

  // Cricket specifics
  const [cricketTeamAWkts, setCricketTeamAWkts] = useState(match.result?.teamAWkts ?? '');
  const [cricketTeamBWkts, setCricketTeamBWkts] = useState(match.result?.teamBWkts ?? '');
  const [cricketResultType, setCricketResultType] = useState(match.result?.cricketResultType || 'win_by_runs');

  // Badminton / Tennis sets (Best of 3)
  const [set1A, setSet1A] = useState(match.result?.set1A ?? '');
  const [set1B, setSet1B] = useState(match.result?.set1B ?? '');
  const [set2A, setSet2A] = useState(match.result?.set2A ?? '');
  const [set2B, setSet2B] = useState(match.result?.set2B ?? '');
  const [set3A, setSet3A] = useState(match.result?.set3A ?? '');
  const [set3B, setSet3B] = useState(match.result?.set3B ?? '');

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    let finalResult = null;
    let winnerId = null;

    if (s.includes('badminton') || s.includes('tennis') || s.includes('volleyball')) {
      // Validate sets
      if (set1A === '' || set1B === '') {
        setError('At least Set 1 scores must be entered.');
        return;
      }

      let aSetsWon = 0;
      let bSetsWon = 0;

      if (Number(set1A) > Number(set1B)) aSetsWon++;
      else if (Number(set1B) > Number(set1A)) bSetsWon++;

      if (set2A !== '' && set2B !== '') {
        if (Number(set2A) > Number(set2B)) aSetsWon++;
        else if (Number(set2B) > Number(set2A)) bSetsWon++;
      }

      if (set3A !== '' && set3B !== '') {
        if (Number(set3A) > Number(set3B)) aSetsWon++;
        else if (Number(set3B) > Number(set3A)) bSetsWon++;
      }

      if (aSetsWon === bSetsWon) {
        setError('A winner must be determined by set scores (no draws permitted in set-based sports).');
        return;
      }

      winnerId = aSetsWon > bSetsWon ? match.teamA.id : match.teamB.id;

      finalResult = {
        teamAScore: aSetsWon,
        teamBScore: bSetsWon,
        set1A: Number(set1A),
        set1B: Number(set1B),
        set2A: set2A !== '' ? Number(set2A) : null,
        set2B: set2B !== '' ? Number(set2B) : null,
        set3A: set3A !== '' ? Number(set3A) : null,
        set3B: set3B !== '' ? Number(set3B) : null,
        winnerId,
        notes: notes || `Won ${aSetsWon}-${bSetsWon} in sets`
      };
    } else if (s.includes('cricket')) {
      if (teamAScore === '' || teamBScore === '') {
        setError('Please enter runs for both teams.');
        return;
      }

      const runsA = Number(teamAScore);
      const runsB = Number(teamBScore);

      if (runsA > runsB) {
        winnerId = match.teamA.id;
      } else if (runsB > runsA) {
        winnerId = match.teamB.id;
      } else if (isKnockout) {
        setError('Knockout cricket match cannot end in a draw. Specify Super Over winner in notes.');
        return;
      }

      finalResult = {
        teamAScore: runsA,
        teamBScore: runsB,
        teamAWkts: cricketTeamAWkts,
        teamBWkts: cricketTeamBWkts,
        cricketResultType,
        winnerId,
        isDraw: runsA === runsB,
        notes: notes || `${winnerId ? (winnerId === match.teamA.id ? match.teamA.name : match.teamB.name) + ' won' : 'Match tied'}`
      };
    } else {
      // Football, Basketball, etc.
      if (teamAScore === '' || teamBScore === '') {
        setError('Please enter scores for both teams.');
        return;
      }

      const a = Number(teamAScore);
      const b = Number(teamBScore);

      if (a < 0 || b < 0) {
        setError('Scores cannot be negative.');
        return;
      }

      if (a > b) {
        winnerId = match.teamA.id;
      } else if (b > a) {
        winnerId = match.teamB.id;
      } else {
        // Tie
        if (isKnockout) {
          if (tieBreakTeamAScore === '' || tieBreakTeamBScore === '') {
            setError('This is a knockout match. A penalty shootout or tie-break score is required to determine the advancing winner.');
            return;
          }
          const penA = Number(tieBreakTeamAScore);
          const penB = Number(tieBreakTeamBScore);
          if (penA === penB) {
            setError('Penalty shootout score cannot be a tie.');
            return;
          }
          winnerId = penA > penB ? match.teamA.id : match.teamB.id;
        }
      }

      finalResult = {
        teamAScore: a,
        teamBScore: b,
        tieBreakTeamAScore: tieBreakTeamAScore !== '' ? Number(tieBreakTeamAScore) : null,
        tieBreakTeamBScore: tieBreakTeamBScore !== '' ? Number(tieBreakTeamBScore) : null,
        winnerId,
        isDraw: a === b && !isKnockout,
        notes: notes || (winnerId ? `${winnerId === match.teamA.id ? match.teamA.name : match.teamB.name} won` : 'Draw')
      };
    }

    onSaveResult(match.id, finalResult);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-entry-title"
    >
      <div className="bg-[#141B24] border border-[#293442] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#293442] bg-[#0B0F14]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#B6FF3B]/10 text-[#B6FF3B]">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h2 id="result-entry-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                Finalise Match Result
              </h2>
              <span className="text-xs text-[#94A3B8]">
                Match #{match.matchNumber} &bull; {match.roundName}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Teams Header */}
          <div className="grid grid-cols-2 gap-4 text-center pb-2 border-b border-[#293442]">
            <div className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl">
              <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block font-bold">Team A</span>
              <span className="font-bold text-sm text-white truncate block">{match.teamA?.name}</span>
            </div>
            <div className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl">
              <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block font-bold">Team B</span>
              <span className="font-bold text-sm text-white truncate block">{match.teamB?.name}</span>
            </div>
          </div>

          {/* Sport-Specific Score Inputs */}
          {s.includes('badminton') || s.includes('tennis') || s.includes('volleyball') ? (
            /* Set-based score input */
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Sets Scores (Best of 3)
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-16">Set 1:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Team A"
                    value={set1A}
                    onChange={(e) => setSet1A(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-sm font-bold text-white focus:border-[#B6FF3B] outline-none"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Team B"
                    value={set1B}
                    onChange={(e) => setSet1B(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-sm font-bold text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-16">Set 2:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Team A"
                    value={set2A}
                    onChange={(e) => setSet2A(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-sm font-bold text-white focus:border-[#B6FF3B] outline-none"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Team B"
                    value={set2B}
                    onChange={(e) => setSet2B(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-sm font-bold text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-16">Set 3 (if nec.):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Team A"
                    value={set3A}
                    onChange={(e) => setSet3A(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-sm font-bold text-white focus:border-[#B6FF3B] outline-none"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Team B"
                    value={set3B}
                    onChange={(e) => setSet3B(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-sm font-bold text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>
              </div>
            </div>
          ) : s.includes('cricket') ? (
            /* Cricket runs & wickets */
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Innings Scores (Runs / Wickets)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Runs"
                    value={teamAScore}
                    onChange={(e) => setTeamAScore(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-base font-bold text-white focus:border-[#B6FF3B] outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Wkts (0-10)"
                    value={cricketTeamAWkts}
                    onChange={(e) => setCricketTeamAWkts(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-xs text-slate-300 focus:border-[#B6FF3B] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Runs"
                    value={teamBScore}
                    onChange={(e) => setTeamBScore(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-base font-bold text-white focus:border-[#B6FF3B] outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Wkts (0-10)"
                    value={cricketTeamBWkts}
                    onChange={(e) => setCricketTeamBWkts(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-center text-xs text-slate-300 focus:border-[#B6FF3B] outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Football / Basketball standard goals/points */
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Final Score (Goals / Points)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={teamAScore}
                  onChange={(e) => setTeamAScore(e.target.value)}
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-center text-2xl font-black text-white focus:border-[#B6FF3B] outline-none"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={teamBScore}
                  onChange={(e) => setTeamBScore(e.target.value)}
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-center text-2xl font-black text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>

              {/* Penalty shootout inputs if tie in knockout */}
              {isKnockout && teamAScore !== '' && teamBScore !== '' && Number(teamAScore) === Number(teamBScore) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Knockout Match Tied &ndash; Penalty Shootout Score</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Team A Penalties"
                      value={tieBreakTeamAScore}
                      onChange={(e) => setTieBreakTeamAScore(e.target.value)}
                      className="w-full p-2 bg-[#0B0F14] border border-[#293442] rounded-lg text-center text-sm font-bold text-white focus:border-[#B6FF3B] outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Team B Penalties"
                      value={tieBreakTeamBScore}
                      onChange={(e) => setTieBreakTeamBScore(e.target.value)}
                      className="w-full p-2 bg-[#0B0F14] border border-[#293442] rounded-lg text-center text-sm font-bold text-white focus:border-[#B6FF3B] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Match Remarks / Summary
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Clean sheet, stoppage time goal, etc."
              className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
            />
          </div>

          <p className="text-[11px] text-[#94A3B8] italic">
            Finalising this result will recalculate league standings and automatically advance the winner in knockout brackets.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#293442]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#1B2530] border border-[#293442] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] cursor-pointer transition-colors"
            >
              Finalise &amp; Publish Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
