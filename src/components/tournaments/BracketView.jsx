import React from 'react';
import { Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';
import { formatTimeDisplay, formatDateDisplay } from '../../data/tournamentsData';

/**
 * Accessible interactive Knockout Bracket View
 * Displays rounds horizontally with match cards, byes, scores, and winner highlighting.
 */
export default function BracketView({ fixtures = [], onMatchClick = null }) {
  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="py-12 text-center text-[#94A3B8] text-sm bg-[#141B24] border border-[#293442] rounded-2xl">
        No knockout bracket fixtures have been drawn yet.
      </div>
    );
  }

  // Group fixtures by round
  const roundsMap = {};
  fixtures.forEach((f) => {
    const roundKey = f.roundName || `Round ${f.roundIndex || 1}`;
    if (!roundsMap[roundKey]) {
      roundsMap[roundKey] = {
        name: roundKey,
        index: f.roundIndex || 1,
        matches: []
      };
    }
    roundsMap[roundKey].matches.push(f);
  });

  const rounds = Object.values(roundsMap).sort((a, b) => a.index - b.index);

  return (
    <div className="overflow-x-auto pb-6">
      <div className="inline-flex gap-8 min-w-full p-2">
        {rounds.map((round, rIdx) => (
          <div key={round.name} className="w-72 shrink-0 flex flex-col space-y-4">
            {/* Round Header */}
            <div className="bg-[#1B2530] border border-[#293442] px-4 py-2.5 rounded-xl text-center">
              <span className="font-['Barlow_Condensed'] text-base font-bold uppercase tracking-wider text-white">
                {round.name}
              </span>
              <span className="text-[11px] text-[#94A3B8] block">
                {round.matches.length} match{round.matches.length === 1 ? '' : 'es'}
              </span>
            </div>

            {/* Match Cards in this round */}
            <div className="flex flex-col justify-around gap-6 flex-1 py-2">
              {round.matches.map((m) => {
                const isCompleted = m.status === 'Completed';
                const winnerId = m.result?.winnerId;
                const isAWin = winnerId && winnerId === m.teamA?.id;
                const isBWin = winnerId && winnerId === m.teamB?.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => onMatchClick?.(m)}
                    className={`bg-[#141B24] border rounded-xl p-3 shadow-md space-y-2 transition-all ${
                      onMatchClick ? 'cursor-pointer hover:border-[#B6FF3B]' : ''
                    } ${
                      isCompleted ? 'border-[#293442]' : 'border-[#293442] hover:border-slate-500'
                    }`}
                  >
                    {/* Match Meta */}
                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pb-1 border-b border-[#293442]/60">
                      <span>Match #{m.matchNumber}</span>
                      <span className="truncate max-w-[140px] text-slate-400">
                        {m.courtOrPitch || 'Court 1'}
                      </span>
                    </div>

                    {/* Team A */}
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                        isAWin
                          ? 'bg-[#B6FF3B]/10 text-[#B6FF3B] font-bold border border-[#B6FF3B]/30'
                          : m.teamA?.isBye
                          ? 'text-slate-500 italic'
                          : 'text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isAWin && <CheckCircle2 className="w-3.5 h-3.5 text-[#B6FF3B] shrink-0" />}
                        <span className="truncate">{m.teamA?.name || 'TBD'}</span>
                      </div>
                      <span className="font-mono text-sm ml-2">
                        {m.result ? m.result.teamAScore : '-'}
                      </span>
                    </div>

                    {/* Team B */}
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                        isBWin
                          ? 'bg-[#B6FF3B]/10 text-[#B6FF3B] font-bold border border-[#B6FF3B]/30'
                          : m.teamB?.isBye
                          ? 'text-slate-500 italic'
                          : 'text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isBWin && <CheckCircle2 className="w-3.5 h-3.5 text-[#B6FF3B] shrink-0" />}
                        <span className="truncate">{m.teamB?.name || 'TBD'}</span>
                      </div>
                      <span className="font-mono text-sm ml-2">
                        {m.result ? m.result.teamBScore : '-'}
                      </span>
                    </div>

                    {/* Status note */}
                    <div className="pt-1 text-[10px] text-right text-slate-400 flex items-center justify-between">
                      <span>{formatDateDisplay(m.scheduledTime)}</span>
                      <span
                        className={`font-semibold ${
                          isCompleted ? 'text-emerald-400' : 'text-[#00D4FF]'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
