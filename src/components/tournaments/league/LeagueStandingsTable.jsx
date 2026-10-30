import React from 'react';
import { Trophy, HelpCircle, Shield } from 'lucide-react';

export default function LeagueStandingsTable({
  standings = [],
  scoringSettings = {},
  sport = 'Football',
  tieBreakOrder = ['points', 'headToHead', 'diff', 'scored', 'alpha']
}) {
  const isCricket = sport.toLowerCase().includes('cricket');
  const isVolleyball = sport.toLowerCase().includes('volley');
  const isBasketball = sport.toLowerCase().includes('basket');
  const isIndividual = ['badminton', 'tennis', 'table tennis', 'squash'].some((s) =>
    sport.toLowerCase().includes(s)
  );

  // Column header labels adapting to sport preset
  const scoreLabel = scoringSettings.scoreLabel || (isCricket ? 'Runs' : isIndividual || isVolleyball ? 'Sets' : isBasketball ? 'Points' : 'Goals');
  const forLabel = isCricket ? 'Runs' : isIndividual || isVolleyball ? 'SF' : isBasketball ? 'PF' : 'GF';
  const againstLabel = isCricket ? 'Against' : isIndividual || isVolleyball ? 'SA' : isBasketball ? 'PA' : 'GA';
  const diffLabel = isCricket ? 'NRR / Diff' : isIndividual || isVolleyball ? 'SD' : isBasketball ? 'PD' : 'GD';

  if (!standings || standings.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-[#94A3B8] text-sm bg-[#141B24] border border-[#293442] rounded-2xl">
        <Shield className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
        <p className="font-semibold text-white">No Standings Available</p>
        <p className="text-xs text-slate-400 mt-1">
          Add teams and generate fixtures to calculate live standings.
        </p>
      </div>
    );
  }

  const hasAnyMatchesPlayed = standings.some((s) => s.played > 0);

  return (
    <div className="space-y-4">
      {/* Table container with responsive horizontal scroll */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#1B2530] border-b border-[#293442] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                <th className="py-3.5 px-3 sm:px-4 text-center w-12">Pos</th>
                <th className="py-3.5 px-3 sm:px-4 min-w-[160px]">Team / Club</th>
                <th className="py-3.5 px-2 sm:px-3 text-center" title="Played">P</th>
                <th className="py-3.5 px-2 sm:px-3 text-center text-emerald-400" title="Won">W</th>
                {scoringSettings.drawsAllowed !== false && (
                  <th className="py-3.5 px-2 sm:px-3 text-center text-slate-400" title={isCricket ? 'Tied' : 'Drawn'}>
                    {isCricket ? 'T' : 'D'}
                  </th>
                )}
                <th className="py-3.5 px-2 sm:px-3 text-center text-rose-400" title="Lost">L</th>
                <th className="py-3.5 px-2 sm:px-3 text-center hidden sm:table-cell text-slate-300" title={`${scoreLabel} For`}>
                  {forLabel}
                </th>
                <th className="py-3.5 px-2 sm:px-3 text-center hidden sm:table-cell text-slate-400" title={`${scoreLabel} Against`}>
                  {againstLabel}
                </th>
                <th className="py-3.5 px-2 sm:px-3 text-center font-mono" title={`${scoreLabel} Difference`}>
                  {diffLabel}
                </th>
                <th className="py-3.5 px-3 sm:px-4 text-center font-bold text-white bg-[#0B0F14]/60 w-16">
                  Pts
                </th>
                <th className="py-3.5 px-3 sm:px-4 text-center hidden md:table-cell w-28">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#293442]/60">
              {standings.map((row) => {
                const isLeader = row.position === 1 && hasAnyMatchesPlayed;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-[#1B2530]/60 transition-colors ${
                      isLeader ? 'bg-[#c6ff3d]/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 sm:px-4 text-center font-bold text-white">
                      {isLeader ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#c6ff3d]/20 text-[#c6ff3d] text-xs font-black shadow-[0_0_10px_rgba(198,255,61,0.25)]">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">{row.position}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        {row.logo ? (
                          <img
                            src={row.logo}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0">
                            {row.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate max-w-[150px] sm:max-w-none font-bold">
                          {row.name}
                        </span>
                        {isLeader && (
                          <Trophy className="w-3.5 h-3.5 text-[#c6ff3d] shrink-0" />
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-2 sm:px-3 text-center text-slate-300 font-mono">
                      {row.played}
                    </td>

                    <td className="py-3.5 px-2 sm:px-3 text-center text-emerald-400 font-semibold font-mono">
                      {row.won}
                    </td>

                    {scoringSettings.drawsAllowed !== false && (
                      <td className="py-3.5 px-2 sm:px-3 text-center text-slate-400 font-mono">
                        {row.drawn}
                      </td>
                    )}

                    <td className="py-3.5 px-2 sm:px-3 text-center text-rose-400 font-semibold font-mono">
                      {row.lost}
                    </td>

                    <td className="py-3.5 px-2 sm:px-3 text-center text-slate-300 hidden sm:table-cell font-mono">
                      {row.for}
                    </td>

                    <td className="py-3.5 px-2 sm:px-3 text-center text-slate-400 hidden sm:table-cell font-mono">
                      {row.against}
                    </td>

                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono text-xs">
                      <span
                        className={
                          row.diff > 0
                            ? 'text-emerald-400 font-bold'
                            : row.diff < 0
                            ? 'text-rose-400 font-bold'
                            : 'text-slate-400'
                        }
                      >
                        {row.diff > 0 ? `+${row.diff}` : row.diff}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-center font-bold font-mono text-base text-[#c6ff3d] bg-[#0B0F14]/50">
                      {row.points}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {(!row.form || row.form.length === 0) ? (
                          <span className="text-[10px] text-slate-600">-</span>
                        ) : (
                          row.form.map((res, idx) => (
                            <span
                              key={idx}
                              className={`w-4 h-4 rounded text-[9px] font-black inline-flex items-center justify-center text-black ${
                                res === 'W'
                                  ? 'bg-emerald-400'
                                  : res === 'D'
                                  ? 'bg-amber-400'
                                  : 'bg-rose-400'
                              }`}
                            >
                              {res}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tie-breaker & Points explanation banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-[#94A3B8]">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-[#c6ff3d] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Tie-Break Priority:</strong>{' '}
            {tieBreakOrder
              .map((r) => {
                if (r === 'points') return 'Points';
                if (r === 'headToHead') return 'Head-to-Head';
                if (r === 'diff') return `${scoreLabel} Diff`;
                if (r === 'scored') return `${scoreLabel} Scored`;
                if (r === 'alpha') return 'Alphabetical';
                return r;
              })
              .join(' → ')}
            . Standings are computed in real time from saved match results.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 shrink-0 font-medium">
          Win: <strong className="text-emerald-400">{scoringSettings.pointsWin ?? 3} pts</strong>
          {scoringSettings.drawsAllowed !== false && (
            <> &bull; Draw: <strong className="text-amber-400">{scoringSettings.pointsDraw ?? 1} pt</strong></>
          )}
          &bull; Loss: <strong className="text-slate-400">{scoringSettings.pointsLoss ?? 0} pts</strong>
        </div>
      </div>
    </div>
  );
}
