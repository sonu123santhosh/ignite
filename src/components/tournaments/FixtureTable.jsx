import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, Trophy, Edit3 } from 'lucide-react';
import { formatDateDisplay, formatTimeDisplay } from '../../data/tournamentsData';

export default function FixtureTable({
  fixtures = [],
  sport = 'Football',
  canEnterResults = false,
  onOpenResultEntry = null
}) {
  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="py-12 text-center text-[#94A3B8] text-sm bg-[#141B24] border border-[#293442] rounded-2xl">
        Match schedule will be announced by the organiser.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table view for Desktop, collapsing to cards on mobile */}
      <div className="hidden md:block bg-[#141B24] border border-[#293442] rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#1B2530] border-b border-[#293442] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              <th className="py-3.5 px-4 w-28">Match</th>
              <th className="py-3.5 px-4">Contestants</th>
              <th className="py-3.5 px-4">Venue / Court</th>
              <th className="py-3.5 px-4">Schedule</th>
              <th className="py-3.5 px-4 text-center">Score / Result</th>
              {canEnterResults && <th className="py-3.5 px-4 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#293442]/60">
            {fixtures.map((m) => {
              const isCompleted = m.status === 'Completed';
              const winnerId = m.result?.winnerId;

              return (
                <tr key={m.id} className="hover:bg-[#1B2530]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#0B0F14] border border-[#293442] text-[#B6FF3B]">
                      {m.roundName || `R${m.roundIndex}`} #{m.matchNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className={winnerId === m.teamA?.id ? 'text-[#B6FF3B] font-bold' : ''}>
                          {m.teamA?.name || 'TBD'}
                        </span>
                        {winnerId === m.teamA?.id && <Trophy className="w-3.5 h-3.5 text-[#B6FF3B]" />}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-normal">vs</div>
                      <div className="flex items-center gap-1.5">
                        <span className={winnerId === m.teamB?.id ? 'text-[#B6FF3B] font-bold' : ''}>
                          {m.teamB?.name || 'TBD'}
                        </span>
                        {winnerId === m.teamB?.id && <Trophy className="w-3.5 h-3.5 text-[#B6FF3B]" />}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{m.courtOrPitch || 'Court 1'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#B6FF3B] shrink-0" />
                        <span>{formatDateDisplay(m.scheduledTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#94A3B8]">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{formatTimeDisplay(m.scheduledTime)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {isCompleted && m.result ? (
                      <div className="inline-block bg-[#0B0F14] border border-[#293442] px-3 py-1.5 rounded-lg text-center font-mono">
                        <span className="font-bold text-white text-base">
                          {m.result.teamAScore} - {m.result.teamBScore}
                        </span>
                        {m.result.tieBreakTeamAScore !== null && m.result.tieBreakTeamAScore !== undefined && (
                          <div className="text-[10px] text-amber-400">
                            ({m.result.tieBreakTeamAScore} - {m.result.tieBreakTeamBScore} pen)
                          </div>
                        )}
                        <span className="block text-[10px] text-emerald-400 font-sans mt-0.5">
                          Final
                        </span>
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        {m.status || 'Scheduled'}
                      </span>
                    )}
                  </td>
                  {canEnterResults && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenResultEntry?.(m)}
                        className="px-3 py-1.5 text-xs font-bold bg-[#1B2530] hover:bg-[#B6FF3B] hover:text-[#0B0F14] text-[#B6FF3B] border border-[#B6FF3B]/40 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isCompleted ? 'Edit' : 'Score'}</span>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="md:hidden space-y-3">
        {fixtures.map((m) => {
          const isCompleted = m.status === 'Completed';
          const winnerId = m.result?.winnerId;

          return (
            <div key={m.id} className="p-4 bg-[#141B24] border border-[#293442] rounded-xl space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#293442]">
                <span className="font-bold text-[#B6FF3B]">
                  {m.roundName || `R${m.roundIndex}`} #{m.matchNumber}
                </span>
                <span className="text-slate-400">{m.courtOrPitch || 'Court 1'}</span>
              </div>

              {/* Matchup */}
              <div className="flex items-center justify-between py-1">
                <div className="space-y-1">
                  <div className={`font-semibold text-sm ${winnerId === m.teamA?.id ? 'text-[#B6FF3B]' : 'text-white'}`}>
                    {m.teamA?.name || 'TBD'}
                  </div>
                  <div className={`font-semibold text-sm ${winnerId === m.teamB?.id ? 'text-[#B6FF3B]' : 'text-white'}`}>
                    {m.teamB?.name || 'TBD'}
                  </div>
                </div>

                {isCompleted && m.result ? (
                  <div className="text-right font-mono text-base font-bold text-white bg-[#0B0F14] px-3 py-1 rounded-lg border border-[#293442]">
                    <div>{m.result.teamAScore}</div>
                    <div>{m.result.teamBScore}</div>
                  </div>
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                    {m.status || 'Scheduled'}
                  </span>
                )}
              </div>

              {/* Date & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-[#293442] text-xs text-slate-400">
                <span>{formatDateDisplay(m.scheduledTime)} &bull; {formatTimeDisplay(m.scheduledTime)}</span>
                {canEnterResults && (
                  <button
                    type="button"
                    onClick={() => onOpenResultEntry?.(m)}
                    className="px-2.5 py-1 text-xs font-bold text-[#B6FF3B] bg-[#1B2530] border border-[#B6FF3B]/30 rounded-lg"
                  >
                    {isCompleted ? 'Edit Score' : 'Enter Score'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
