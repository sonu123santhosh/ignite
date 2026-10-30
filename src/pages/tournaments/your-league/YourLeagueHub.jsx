import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Plus,
  Sparkles,
  Share2,
  Lock,
  Globe,
  ArrowRight,
  Check
} from 'lucide-react';
import { leagueService } from '../../../services/leagueService';
import Toast from '../../../components/Toast';

export default function YourLeagueHub({
  currentDemoUser,
  _tournamentRole = 'organiser'
}) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Load leagues with current session
  const session = useMemo(() => ({
    user: currentDemoUser,
    token: `token-${currentDemoUser?.id || 'demo'}`
  }), [currentDemoUser]);

  const [leagues, setLeagues] = useState([]);

  const loadLeagues = useCallback(() => {
    try {
      const res = leagueService.getLeagues(session);
      if (res.success) {
        setLeagues(res.data);
      }
    } catch (err) {
      setToast({
        title: 'Error loading leagues',
        message: err.message,
        type: 'error'
      });
    }
  }, [session]);

  useEffect(() => {
    document.title = 'Your League | SportLink';
    loadLeagues();
  }, [loadLeagues]);

  const handleCopyShareLink = (league, e) => {
    e.stopPropagation();
    if (!league.shareToken) return;

    const fullUrl = `${window.location.origin}/tournaments/your-league/public/${league.shareToken}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedId(league.id);
    setToast({
      title: 'Share Link Copied',
      message: 'Anyone with this link can view live fixtures and standings in read-only mode.',
      type: 'success'
    });
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Filtered list
  const filteredLeagues = useMemo(() => {
    if (statusFilter === 'all') return leagues;
    if (statusFilter === 'managed') return leagues.filter((l) => l.isManager);
    if (statusFilter === 'in_progress') return leagues.filter((l) => l.status === 'In progress');
    if (statusFilter === 'fixtures_ready') return leagues.filter((l) => l.status === 'Fixtures ready' || l.status === 'Teams open');
    if (statusFilter === 'completed') return leagues.filter((l) => l.status === 'Completed');
    return leagues;
  }, [leagues, statusFilter]);

  // Aggregate KPIs
  const totalLeaguesCount = leagues.length;
  const managedLeaguesCount = leagues.filter((l) => l.isManager).length;
  const totalMatchesCount = leagues.reduce((sum, l) => sum + (l.matchCount || 0), 0);
  const totalCompletedMatches = leagues.reduce((sum, l) => sum + (l.completedCount || 0), 0);
  const totalTeamsCount = leagues.reduce((sum, l) => sum + (l.teamCount || 0), 0);

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

      {/* Subheader Navigation Bar */}
      <div className="bg-[#141B24]/90 border-b border-[#293442] py-4 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/tournaments"
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#c6ff3d] transition-colors"
            >
              &larr; Tournaments Section
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Your League Hub
            </span>
          </div>

          <Link
            to="/tournaments/your-league/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c6ff3d] to-emerald-400 hover:brightness-110 text-[#0B0F14] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_4px_16px_rgba(198,255,61,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New League</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141B24]/95 via-[#1B2530]/90 to-[#141B24]/95 border border-[#293442] p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6ff3d]/15 border border-[#c6ff3d]/35 text-[#c6ff3d] text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Community &amp; Private Leagues</span>
            </div>

            <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
              Run Your League. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c6ff3d] via-emerald-300 to-teal-400">
                Round-Robin &amp; Live Tables.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 max-w-2xl leading-relaxed">
              Create your own sports league in seconds. Add teams, generate mathematically fair and provably complete round-robin schedules with reproducible draw codes, record match scores, and track live standings calculated on the fly.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/tournaments/your-league/new"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c6ff3d] to-emerald-400 hover:brightness-110 text-[#0B0F14] font-bold text-xs sm:text-sm transition-all shadow-[0_4px_16px_rgba(198,255,61,0.3)] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create a League Now</span>
              </Link>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pl-2">
                <span>Active Persona:</span>
                <span className="px-2 py-0.5 rounded bg-[#1B2530] text-[#c6ff3d] font-bold border border-[#293442]">
                  {currentDemoUser?.name || 'Rahul Sharma'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Total Leagues
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-white">
              {totalLeaguesCount}
            </div>
            <span className="text-[10px] text-slate-500">In database</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              You Manage
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-[#c6ff3d]">
              {managedLeaguesCount}
            </div>
            <span className="text-[10px] text-slate-500">Owner or co-manager</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Registered Teams
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-sky-400">
              {totalTeamsCount}
            </div>
            <span className="text-[10px] text-slate-500">Across all leagues</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Matches Scheduled
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-purple-400">
              {totalMatchesCount}
            </div>
            <span className="text-[10px] text-slate-500">Circle method draws</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Scores Recorded
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-emerald-400">
              {totalCompletedMatches}
            </div>
            <span className="text-[10px] text-slate-500">Final results &amp; forfeits</span>
          </div>
        </div>

        {/* Filter Navigation Chips */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Leagues' },
              { id: 'managed', label: 'My Managed Leagues' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'fixtures_ready', label: 'Ready for Matches' },
              { id: 'completed', label: 'Completed' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-[#c6ff3d] to-emerald-400 text-[#0B0F14] shadow-sm'
                    : 'bg-[#141B24] text-slate-300 hover:text-white border border-[#293442]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#94A3B8]">
            Showing {filteredLeagues.length} of {leagues.length} league{leagues.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* League Cards Grid */}
        {filteredLeagues.length === 0 ? (
          <div className="p-12 text-center bg-[#141B24] border border-[#293442] rounded-3xl space-y-4">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              No Leagues Found
            </h3>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              Create your first sports league and begin adding squads, generating fixtures, and tracking the championship table.
            </p>
            <Link
              to="/tournaments/your-league/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c6ff3d] to-emerald-400 text-[#0B0F14] font-bold text-xs uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Create League</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLeagues.map((league) => {
              const isManager = league.isManager;
              const hasPublicLink = Boolean(league.shareToken && league.visibility === 'public via link');

              return (
                <div
                  key={league.id}
                  onClick={() => navigate(`/tournaments/your-league/${league.id}`)}
                  className="bg-[#141B24] hover:bg-[#1B2530]/70 border border-[#293442] hover:border-[#c6ff3d]/50 rounded-3xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between group space-y-5"
                >
                  <div className="space-y-4">
                    {/* Top Row: Sport pill, visibility & status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#c6ff3d]/10 border border-[#c6ff3d]/30 text-[#c6ff3d] text-[11px] font-black uppercase tracking-wider">
                          {league.sport}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                          {league.format}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {league.visibility === 'public via link' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Globe className="w-3 h-3" />
                            <span>Public Link</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            <Lock className="w-3 h-3" />
                            <span>Private</span>
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            league.status === 'In progress'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : league.status === 'Completed'
                              ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                              : 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                          }`}
                        >
                          {league.status}
                        </span>
                      </div>
                    </div>

                    {/* League Name & Description */}
                    <div>
                      <h3 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-black uppercase text-white group-hover:text-[#c6ff3d] transition-colors leading-tight">
                        {league.name}
                      </h3>
                      {league.description && (
                        <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                          {league.description}
                        </p>
                      )}
                    </div>

                    {/* Stats Pill Row */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#0B0F14]/60 border border-[#293442] rounded-2xl text-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Teams
                        </span>
                        <span className="font-['Barlow_Condensed'] text-lg font-bold text-white">
                          {league.teamCount} / {league.plannedTeamCount}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Matches
                        </span>
                        <span className="font-['Barlow_Condensed'] text-lg font-bold text-purple-400">
                          {league.completedCount} / {league.matchCount}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Draw Code
                        </span>
                        <span className="font-mono text-xs font-bold text-[#c6ff3d] block mt-1">
                          {league.fixtureSeed ? `#${league.fixtureSeed}` : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="pt-3 border-t border-[#293442] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isManager && (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Manager Access
                        </span>
                      )}
                      {hasPublicLink && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyShareLink(league, e)}
                          title="Copy public read-only link"
                          className="p-1.5 rounded-lg bg-[#1B2530] text-slate-300 hover:text-white border border-[#293442] hover:border-slate-500 transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          {copiedId === league.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-[#c6ff3d] group-hover:translate-x-0.5 transition-transform">
                      <span>{isManager ? 'Open Cockpit' : 'View League'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Informational Callout: Circle Method & Dynamic Calculations */}
        <div className="p-6 bg-[#141B24] border border-[#293442] rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c6ff3d]">
            <Sparkles className="w-4 h-4" />
            <span>Guaranteed Fairness &amp; Mathematical Completeness</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div>
              <strong className="text-white block mb-1">Circle Method Draw:</strong>
              Every pair meets exactly once per leg. Alternating home/away balance prevents consecutive home or away runs over single round-robin cycles.
            </div>
            <div>
              <strong className="text-white block mb-1">Sport-Specific Scoring:</strong>
              Points systems automatically adapt (Football 3-1-0, Basketball 2-0, Volleyball 3-2 set rules, Cricket net run rates). Draws are disallowed where prohibited.
            </div>
            <div>
              <strong className="text-white block mb-1">Zero Table Drift:</strong>
              League tables are never manually edited or statically cached; standings compute directly from completed match results every render.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
