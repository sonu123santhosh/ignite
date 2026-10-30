import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Globe,
  Copy,
  Check,
  Shield
} from 'lucide-react';
import { leagueService } from '../../../services/leagueService';
import LeagueStandingsTable from '../../../components/tournaments/league/LeagueStandingsTable';
import Toast from '../../../components/Toast';
import { formatDateDisplay, formatTimeDisplay } from '../../../data/tournamentsData';

export default function PublicLeagueView() {
  const { shareToken } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'fixtures' | 'teams' | 'rules'
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');

  useEffect(() => {
    try {
      setLoading(true);
      const res = leagueService.getPublicLeagueByToken(shareToken);
      if (res.success) {
        setData(res.data);
        document.title = `${res.data.league.name} | SportLink League`;
      }
    } catch (err) {
      setError(err.message || 'Unable to load public league.');
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setToast({
      title: 'Link Copied',
      message: 'Share URL copied to clipboard.',
      type: 'success'
    });
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-8 text-slate-400">
        <div className="text-center space-y-2">
          <Trophy className="w-8 h-8 text-[#c6ff3d] animate-bounce mx-auto" />
          <p className="text-xs">Loading public league standings...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-transparent p-8 text-center text-slate-400 space-y-4 max-w-md mx-auto pt-20">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Public League Not Found</h2>
        <p className="text-xs text-slate-400">
          {error || 'This league might be set to private, or the share link has been revoked or rotated by the owner.'}
        </p>
        <Link
          to="/tournaments"
          className="inline-block px-4 py-2 rounded-xl bg-[#1B2530] text-[#c6ff3d] text-xs font-bold border border-[#293442] hover:bg-slate-700 transition-colors"
        >
          &larr; Discover Open Tournaments
        </Link>
      </div>
    );
  }

  const { league, teams, matches, standings } = data;
  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  // Group matches by round
  const matchesByRound = {};
  matches.forEach((m) => {
    matchesByRound[m.round] = matchesByRound[m.round] || [];
    matchesByRound[m.round].push(m);
  });
  const roundKeys = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
  const displayedRounds = selectedRoundFilter === 'all'
    ? roundKeys
    : roundKeys.filter((r) => r === Number(selectedRoundFilter));

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pb-24">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Banner Notice */}
      <div className="bg-[#141B24]/90 border-b border-[#293442] py-2 px-4 text-center text-xs text-[#94A3B8]">
        <span className="font-bold text-[#c6ff3d]">PUBLIC SPECTATOR VIEW:</span> Live table &amp; schedule shared via link. Read-only mode.
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* League Hero Card */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#c6ff3d]/15 border border-[#c6ff3d]/35 text-[#c6ff3d] text-xs font-black uppercase tracking-wider">
                  {league.sport}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {league.format}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Globe className="w-3 h-3" />
                  <span>Public View</span>
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-mono">
                  Draw Code: #{league.fixtureSeed || 'N/A'}
                </span>
              </div>

              <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
                {league.name}
              </h1>

              {league.description && (
                <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                  {league.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-[#1B2530] hover:bg-slate-700 text-slate-200 hover:text-white border border-[#293442] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied' : 'Share League'}</span>
              </button>

              <Link
                to="/tournaments"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c6ff3d] to-emerald-400 text-[#0B0F14] text-xs font-bold transition-all shadow-md"
              >
                Explore SportLink
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-[#293442] pt-4 overflow-x-auto">
            {[
              { id: 'standings', label: 'League Table' },
              { id: 'fixtures', label: 'Match Schedule', count: matches.length },
              { id: 'teams', label: 'Teams', count: teams.length },
              { id: 'rules', label: 'Rules & Format' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#c6ff3d] to-emerald-400 text-[#0B0F14] shadow-sm'
                    : 'bg-[#1B2530] text-slate-300 hover:text-white border border-[#293442]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: STANDINGS */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            <LeagueStandingsTable
              standings={standings}
              scoringSettings={league.scoringSettings}
              sport={league.sport}
              tieBreakOrder={league.tieBreakOrder}
            />
          </div>
        )}

        {/* TAB 2: FIXTURES */}
        {activeTab === 'fixtures' && (
          <div className="space-y-6">
            {/* Round Filter Tabs */}
            {roundKeys.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedRoundFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedRoundFilter === 'all'
                      ? 'bg-[#c6ff3d] text-[#0B0F14]'
                      : 'bg-[#141B24] text-slate-300 border border-[#293442] hover:bg-slate-800'
                  }`}
                >
                  All Rounds ({matches.length})
                </button>
                {roundKeys.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRoundFilter(String(r))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedRoundFilter === String(r)
                        ? 'bg-[#c6ff3d] text-[#0B0F14]'
                        : 'bg-[#141B24] text-slate-300 border border-[#293442] hover:bg-slate-800'
                    }`}
                  >
                    Round {r}
                  </button>
                ))}
              </div>
            )}

            {displayedRounds.length === 0 ? (
              <div className="p-8 text-center bg-[#141B24] border border-[#293442] rounded-3xl text-slate-400 text-xs">
                No matches scheduled yet.
              </div>
            ) : (
              displayedRounds.map((roundNum) => {
                const roundMatches = matchesByRound[roundNum] || [];
                const legNum = roundMatches[0]?.leg || 1;

                // Derive BYE team if number of teams is odd
                let byeTeam = null;
                if (teams.length % 2 !== 0) {
                  const playingTeamIds = new Set(roundMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]));
                  byeTeam = teams.find((t) => !playingTeamIds.has(t.id));
                }

                return (
                  <div
                    key={roundNum}
                    className="bg-[#141B24] border border-[#293442] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-[#293442] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-white">
                          Round {roundNum}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Leg {legNum}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {roundMatches.length} match{roundMatches.length === 1 ? '' : 'es'}
                      </span>
                    </div>

                    {/* Bye Banner when odd teams */}
                    {byeTeam && (
                      <div className="p-3 bg-[#1B2530] border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase text-[10px]">
                            Round {roundNum} Bye
                          </span>
                          <span className="font-semibold text-slate-200">
                            <strong className="text-white">{byeTeam.name}</strong> sits out this round.
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">Rest day / No fixture scheduled</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roundMatches.map((m) => {
                        const home = teamsMap[m.homeTeamId];
                        const away = teamsMap[m.awayTeamId];
                        const isDone = m.status === 'Completed' || m.status === 'Forfeit';

                        return (
                          <div
                            key={m.id}
                            className="bg-[#1B2530] border border-[#293442] rounded-2xl p-4 space-y-3 shadow-md"
                          >
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="truncate max-w-[150px]">{m.venue || 'Venue TBD'}</span>
                              <span>{formatDateDisplay(m.scheduledAt)} &bull; {formatTimeDisplay(m.scheduledAt)}</span>
                            </div>

                            <div className="flex items-center justify-between gap-3 py-1">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-bold truncate ${m.homeScore > m.awayScore ? 'text-[#c6ff3d]' : 'text-white'}`}>
                                    {home?.name || 'TBD'}
                                  </span>
                                  {isDone && (
                                    <span className="font-mono text-base font-black text-white pl-2">
                                      {m.homeScore}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-bold truncate ${m.awayScore > m.homeScore ? 'text-[#c6ff3d]' : 'text-white'}`}>
                                    {away?.name || 'TBD'}
                                  </span>
                                  {isDone && (
                                    <span className="font-mono text-base font-black text-white pl-2">
                                      {m.awayScore}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 pl-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                  isDone
                                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {isDone ? 'Final' : m.status}
                                </span>
                              </div>
                            </div>

                            {m.resultNote && (
                              <div className="text-[11px] text-slate-400 pt-1 border-t border-[#293442]">
                                {m.resultNote}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: TEAMS */}
        {activeTab === 'teams' && (
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Participating Clubs &amp; Teams ({teams.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teams.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-4 bg-[#1B2530] border border-[#293442] rounded-2xl flex items-center gap-3 shadow-md"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-[#c6ff3d] shrink-0">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-sm text-white block truncate">{t.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Entrant #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RULES */}
        {activeTab === 'rules' && (
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-xs text-slate-300">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Competition Rules &amp; Protocols
            </h3>
            <div className="p-4 bg-[#1B2530] border border-[#293442] rounded-2xl whitespace-pre-wrap leading-relaxed font-sans text-slate-200">
              {league.rulesText || 'Standard sports regulations apply. Rolling substitutions. Respect the referees.'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#1B2530] border border-[#293442] rounded-2xl space-y-1">
                <span className="font-bold text-white block">Tie-Break Priority Order:</span>
                <p className="text-slate-400">
                  {league.tieBreakOrder?.join(' → ') || 'Points → Head-to-Head → Score Diff → Scored → Alpha'}
                </p>
              </div>

              <div className="p-4 bg-[#1B2530] border border-[#293442] rounded-2xl space-y-1">
                <span className="font-bold text-white block">Scoring System:</span>
                <p className="text-slate-400">
                  Win: {league.scoringSettings?.pointsWin ?? 3} pts &bull;
                  {league.scoringSettings?.drawsAllowed !== false && ` Draw: ${league.scoringSettings?.pointsDraw ?? 1} pt •`}
                  Loss: {league.scoringSettings?.pointsLoss ?? 0} pts
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
