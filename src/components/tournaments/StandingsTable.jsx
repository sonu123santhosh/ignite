import React from 'react';
import { Trophy, HelpCircle } from 'lucide-react';
import { calculateStandings } from '../../data/tournamentsData';

export default function StandingsTable({
  fixtures = [],
  scoringConfig = {},
  teams = []
}) {
  const standings = calculateStandings(fixtures, scoringConfig, teams);

  if (standings.length === 0) {
    return (
      <div className="py-12 text-center text-[#94A3B8] text-sm bg-[#141B24] border border-[#293442] rounded-2xl">
        Standings will appear as matches are played and scores are finalised.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table container with horizontal scroll */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#1B2530] border-b border-[#293442] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                <th className="py-3 px-3 sm:px-4 text-center w-12">Pos</th>
                <th className="py-3 px-3 sm:px-4">Squad / Entrant</th>
                <th className="py-3 px-2 sm:px-3 text-center">P</th>
                <th className="py-3 px-2 sm:px-3 text-center">W</th>
                <th className="py-3 px-2 sm:px-3 text-center">D</th>
                <th className="py-3 px-2 sm:px-3 text-center">L</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">GF</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">GA</th>
                <th className="py-3 px-2 sm:px-3 text-center">GD</th>
                <th className="py-3 px-3 sm:px-4 text-center font-bold text-white bg-[#0B0F14]/50">
                  Pts
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#293442]/60">
              {standings.map((row) => {
                const isLeader = row.position === 1;
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-[#1B2530]/60 transition-colors ${
                      isLeader ? 'bg-[#B6FF3B]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 sm:px-4 text-center font-bold text-white">
                      {isLeader ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs">
                          1
                        </span>
                      ) : (
                        row.position
                      )}
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {isLeader && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span className="truncate max-w-[180px] sm:max-w-none">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center text-slate-300">{row.played}</td>
                    <td className="py-3 px-2 sm:px-3 text-center text-emerald-400 font-medium">
                      {row.won}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center text-slate-400">{row.drawn}</td>
                    <td className="py-3 px-2 sm:px-3 text-center text-rose-400 font-medium">
                      {row.lost}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center text-slate-300 hidden sm:table-cell">
                      {row.for}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center text-slate-400 hidden sm:table-cell">
                      {row.against}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center font-mono">
                      <span
                        className={
                          row.diff > 0
                            ? 'text-emerald-400'
                            : row.diff < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {row.diff > 0 ? `+${row.diff}` : row.diff}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center font-bold font-mono text-base text-[#B6FF3B] bg-[#0B0F14]/40">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tie-breaker order explanation note */}
      <div className="flex items-start gap-2 p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-[#94A3B8]">
        <HelpCircle className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Tie-Break Priority:</strong> Points &rarr; Head-to-Head &rarr; Goal/Run Difference &rarr; Scored &rarr; Alphabetical.
          Scores are derived purely from finalised fixture results.
        </p>
      </div>
    </div>
  );
}
