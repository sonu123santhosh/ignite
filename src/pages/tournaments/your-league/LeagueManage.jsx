import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Globe,
  Lock,
  AlertTriangle,
  AlertCircle,
  History,
  ExternalLink,
  CalendarCheck,
  Clock,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import {
  leagueService,
  detectLeagueSchedulingConflicts
} from '../../../services/leagueService';
import LeagueStandingsTable from '../../../components/tournaments/league/LeagueStandingsTable';
import LeagueScoreModal from '../../../components/tournaments/league/LeagueScoreModal';
import LeagueAutoScheduleModal from '../../../components/tournaments/league/LeagueAutoScheduleModal';
import LeagueRescheduleModal from '../../../components/tournaments/league/LeagueRescheduleModal';
import ConfirmDialog from '../../../components/tournaments/ConfirmDialog';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';
import { formatDateDisplay, formatTimeDisplay, DEMO_USERS } from '../../../data/tournamentsData';

export default function LeagueManage({
  currentDemoUser,
  _tournamentRole = 'organiser'
}) {
  const { id: leagueId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'standings' | 'fixtures' | 'teams' | 'settings' | 'audit'
  const tabFromUrl = searchParams.get('tab') || 'standings';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const session = useMemo(() => ({
    user: currentDemoUser,
    token: `token-${currentDemoUser?.id || 'demo'}`
  }), [currentDemoUser]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [selectedMatchForScoring, setSelectedMatchForScoring] = useState(null);
  const [selectedMatchForRescheduling, setSelectedMatchForRescheduling] = useState(null);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);

  // Filter state for round tabs in fixtures
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');

  // Team Management State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCaptain, setNewTeamCaptain] = useState('');
  const [newTeamContact, setNewTeamContact] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamDeleteConfirm, setTeamDeleteConfirm] = useState(null);

  // Settings & Managers State
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRules, setEditRules] = useState('');
  const [editVisibility, setEditVisibility] = useState('public via link');
  const [newCoManagerId, setNewCoManagerId] = useState('');

  const loadLeagueData = useCallback(() => {
    try {
      setLoading(true);
      const res = leagueService.getLeagueById(session, leagueId);
      if (res.success) {
        setData(res.data);
        setEditName(res.data.league.name);
        setEditDesc(res.data.league.description || '');
        setEditRules(res.data.league.rulesText || '');
        setEditVisibility(res.data.league.visibility);
      }
    } catch (err) {
      setToast({
        title: 'Access Error',
        message: err.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [leagueId, session]);

  useEffect(() => {
    loadLeagueData();
  }, [loadLeagueData]);

  useEffect(() => {
    if (searchParams.get('tab') !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  const showToast = ({ title, message, type = 'info' }) => {
    setToast({ title, message, type });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-8 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-[#c6ff3d] mb-2" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-transparent p-8 text-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">League Not Found or Access Denied</h2>
        <Link to="/tournaments/your-league" className="text-xs text-[#c6ff3d] hover:underline">
          &larr; Return to Your League Hub
        </Link>
      </div>
    );
  }

  const { league, teams, matches, standings, isOwner, managers = [], auditLogs } = data;
  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  const completedMatchesCount = matches.filter(
    (m) => m.status === 'Completed' || m.status === 'Forfeit'
  ).length;
  const hasRecordedResults = completedMatchesCount > 0;
  const conflicts = detectLeagueSchedulingConflicts(matches, league);

  // Group matches by round
  const matchesByRound = {};
  matches.forEach((m) => {
    matchesByRound[m.round] = matchesByRound[m.round] || [];
    matchesByRound[m.round].push(m);
  });
  const allRoundNumbers = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
  const displayedRounds = selectedRoundFilter === 'all'
    ? allRoundNumbers
    : allRoundNumbers.filter((r) => r === Number(selectedRoundFilter));

  // Copy share link
  const handleCopyShareLink = () => {
    if (!league.shareToken) return;
    const url = `${window.location.origin}/tournaments/your-league/public/${league.shareToken}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    showToast({
      title: 'Share Link Copied',
      message: 'Link copied to clipboard. Anyone with this link can view the live table and schedule.',
      type: 'success'
    });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Copy Standings Table as Text
  const handleCopyTableText = () => {
    if (!standings || standings.length === 0) return;
    const lines = [
      `${league.name.toUpperCase()} - STANDINGS TABLE`,
      'Pos | Team | P | W | D | L | GF | GA | GD | Pts',
      '------------------------------------------------',
      ...standings.map(
        (s) =>
          `${s.position} | ${s.name} | ${s.played} | ${s.won} | ${s.drawn} | ${s.lost} | ${s.for} | ${s.against} | ${s.diff > 0 ? '+' + s.diff : s.diff} | ${s.points}`
      )
    ];
    navigator.clipboard?.writeText(lines.join('\n'));
    showToast({
      title: 'Standings Copied',
      message: 'Table copied to clipboard as formatted text.',
      type: 'success'
    });
  };

  // Rotate share token
  const handleRotateShareToken = () => {
    try {
      const res = leagueService.updateLeague(session, league.id, { rotateShareToken: true });
      if (res.success) {
        showToast({
          title: 'Share Link Rotated',
          message: 'Previous share links have been invalidated. A new random token is now active.',
          type: 'success'
        });
        loadLeagueData();
      }
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Add single team
  const handleAddSingleTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      leagueService.addTeams(session, league.id, [{
        name: newTeamName.trim(),
        captainName: newTeamCaptain.trim(),
        captainContact: newTeamContact.trim()
      }]);

      showToast({
        title: 'Team Added',
        message: `"${newTeamName.trim()}" successfully registered to the league.`,
        type: 'success'
      });
      setNewTeamName('');
      setNewTeamCaptain('');
      setNewTeamContact('');
      loadLeagueData();
    } catch (err) {
      showToast({ title: 'Unable to Add Team', message: err.message, type: 'error' });
    }
  };

  // Bulk add teams
  const handleBulkAddTeams = (e) => {
    e.preventDefault();
    const lines = bulkInput.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    try {
      const res = leagueService.addTeams(session, league.id, lines);
      showToast({
        title: 'Bulk Teams Added',
        message: `Successfully added ${res.data.length} teams.`,
        type: 'success'
      });
      setBulkInput('');
      setIsBulkMode(false);
      loadLeagueData();
    } catch (err) {
      showToast({ title: 'Bulk Add Failed', message: err.message, type: 'error' });
    }
  };

  // Update team
  const handleSaveTeamEdit = (e) => {
    e.preventDefault();
    if (!editingTeam) return;

    try {
      leagueService.updateTeam(session, league.id, editingTeam.id, {
        name: editingTeam.name,
        captainName: editingTeam.captainName,
        captainContact: editingTeam.captainContact
      });
      showToast({ title: 'Team Updated', message: 'Team details updated successfully.', type: 'success' });
      setEditingTeam(null);
      loadLeagueData();
    } catch (err) {
      showToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  };

  // Delete team
  const handleConfirmDeleteTeam = () => {
    if (!teamDeleteConfirm) return;
    try {
      leagueService.removeTeam(session, league.id, teamDeleteConfirm.id);
      showToast({ title: 'Team Removed', message: `Team "${teamDeleteConfirm.name}" removed.`, type: 'info' });
      setTeamDeleteConfirm(null);
      loadLeagueData();
    } catch (err) {
      showToast({ title: 'Cannot Remove Team', message: err.message, type: 'error' });
    }
  };

  // Generate Fixtures
  const handleGenerateFixtures = (resetResults = false) => {
    try {
      const res = leagueService.generateFixtures(session, league.id, { resetResults });
      showToast({
        title: 'Fixtures Generated',
        message: `Generated ${res.data.totalMatches} matches across ${res.data.totalRounds} rounds (Draw Code: #${res.data.drawCode}).`,
        type: 'success'
      });
      setIsRegenerateConfirmOpen(false);
      setIsResetConfirmOpen(false);
      loadLeagueData();
    } catch (err) {
      showToast({ title: 'Generation Blocked', message: err.message, type: 'error' });
    }
  };

  // Save Score
  const handleSaveScore = async (matchId, payload) => {
    const res = leagueService.enterMatchScore(session, league.id, matchId, payload);
    showToast({
      title: 'Score Saved',
      message: 'Match result saved and league table updated.',
      type: 'success'
    });
    loadLeagueData();
    return res;
  };

  // Reschedule Individual Match
  const handleRescheduleMatch = async (matchId, payload) => {
    const res = leagueService.scheduleMatch(session, league.id, matchId, payload);
    showToast({
      title: 'Match Rescheduled',
      message: `Match schedule updated to ${formatDateDisplay(res.data.scheduledAt)} at ${res.data.venue}.`,
      type: 'success'
    });
    loadLeagueData();
    return res;
  };

  // Auto Schedule
  const handleApplyAutoSchedule = async (config) => {
    const res = leagueService.autoScheduleFixtures(session, league.id, config);
    showToast({
      title: 'Fixtures Auto-Scheduled',
      message: `Matches spread across calendar intervals. Conflicts detected: ${res.conflicts.length}.`,
      type: 'success'
    });
    loadLeagueData();
    return res;
  };

  // Save League Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    try {
      leagueService.updateLeague(session, league.id, {
        name: editName,
        description: editDesc,
        rulesText: editRules,
        visibility: editVisibility
      });
      showToast({ title: 'Settings Saved', message: 'League settings updated.', type: 'success' });
      loadLeagueData();
    } catch (err) {
      showToast({ title: 'Error Saving Settings', message: err.message, type: 'error' });
    }
  };

  // Add Co-Manager (Owner only)
  const handleAddCoManager = (e) => {
    e.preventDefault();
    if (!newCoManagerId) return;

    try {
      leagueService.addCoManager(session, league.id, newCoManagerId);
      showToast({
        title: 'Co-Manager Assigned',
        message: 'The user has been granted management rights to this league.',
        type: 'success'
      });
      setNewCoManagerId('');
      loadLeagueData();
    } catch (err) {
      showToast({ title: 'Error Adding Co-Manager', message: err.message, type: 'error' });
    }
  };

  // Remove Co-Manager
  const handleRemoveCoManager = (userId) => {
    try {
      leagueService.removeCoManager(session, league.id, userId);
      showToast({
        title: 'Co-Manager Removed',
        message: 'Management rights revoked.',
        type: 'info'
      });
      loadLeagueData();
    } catch (err) {
      showToast({ title: 'Error Removing Co-Manager', message: err.message, type: 'error' });
    }
  };

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

      {/* Header Bar */}
      <div className="bg-[#141B24]/90 border-b border-[#293442] py-4 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/tournaments/your-league"
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#c6ff3d] transition-colors"
            >
              &larr; Your League Hub
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
              {league.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {league.shareToken && league.visibility === 'public via link' && (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 rounded-xl bg-[#1B2530] text-slate-200 hover:text-white border border-[#293442] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
              </button>
            )}

            <Link
              to={`/tournaments/your-league/public/${league.shareToken || 'preview'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Preview</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* League Hero Card */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#c6ff3d]/15 border border-[#c6ff3d]/35 text-[#c6ff3d] text-xs font-black uppercase tracking-wider">
                  {league.sport}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {league.format}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    league.status === 'In progress'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : league.status === 'Completed'
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                  }`}
                >
                  {league.status}
                </span>
                {league.visibility === 'public via link' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Globe className="w-3 h-3" />
                    <span>Public</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    <Lock className="w-3 h-3" />
                    <span>Private</span>
                  </span>
                )}
                {isOwner && (
                  <span className="text-[10px] font-bold text-[#c6ff3d] bg-[#c6ff3d]/10 px-2 py-0.5 rounded border border-[#c6ff3d]/30">
                    Primary Owner
                  </span>
                )}
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

            {/* Quick KPIs on Right */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-3 bg-[#0B0F14] border border-[#293442] rounded-2xl text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Teams
                </span>
                <span className="font-['Barlow_Condensed'] text-2xl font-black text-white">
                  {teams.length} / {league.plannedTeamCount}
                </span>
              </div>

              <div className="px-4 py-3 bg-[#0B0F14] border border-[#293442] rounded-2xl text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Matches
                </span>
                <span className="font-['Barlow_Condensed'] text-2xl font-black text-purple-400">
                  {completedMatchesCount} / {matches.length}
                </span>
              </div>

              <div className="px-4 py-3 bg-[#0B0F14] border border-[#293442] rounded-2xl text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Draw Code
                </span>
                <span className="font-mono text-sm font-bold text-[#c6ff3d] block mt-1">
                  {league.fixtureSeed ? `#${league.fixtureSeed}` : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-[#293442] pt-4 overflow-x-auto">
            {[
              { id: 'standings', label: 'Standings & Table', count: standings.length },
              { id: 'fixtures', label: 'Fixtures & Schedule', count: matches.length },
              { id: 'teams', label: 'Registered Teams', count: teams.length },
              { id: 'settings', label: 'Rules & Settings' },
              { id: 'audit', label: 'Audit Trail', count: auditLogs.length }
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  Championship Standings
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Table dynamically updates with every score entered. Standings are never manually manipulated.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTableText}
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#c6ff3d]" />
                  <span>Copy Table</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('fixtures')}
                  className="text-xs font-bold"
                >
                  Enter Scores &rarr;
                </Button>
              </div>
            </div>

            <LeagueStandingsTable
              standings={standings}
              scoringSettings={league.scoringSettings}
              sport={league.sport}
              tieBreakOrder={league.tieBreakOrder}
            />
          </div>
        )}

        {/* TAB 2: FIXTURES & SCHEDULE */}
        {activeTab === 'fixtures' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141B24] border border-[#293442] p-4 rounded-2xl shadow-md">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  Round-Robin Schedule ({matches.length} Matches)
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Generated using the circle method with home/away alternation and seeded PRNG.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {matches.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAutoScheduleOpen(true)}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Auto-Schedule</span>
                  </Button>
                )}

                {hasRecordedResults ? (
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Results &amp; Regenerate</span>
                  </button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (matches.length > 0) setIsRegenerateConfirmOpen(true);
                      else handleGenerateFixtures(false);
                    }}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{matches.length > 0 ? 'Regenerate Draw' : 'Generate Fixtures'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Round Filter Tabs */}
            {allRoundNumbers.length > 1 && (
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
                {allRoundNumbers.map((r) => (
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

            {/* Conflicts Warning Banner */}
            {conflicts.length > 0 && (
              <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl space-y-2 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{conflicts.length} Scheduling Conflict{conflicts.length === 1 ? '' : 's'} Detected</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {conflicts.map((c, idx) => (
                    <li key={idx}>{c.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Matches Grouped by Round */}
            {displayedRounds.length === 0 ? (
              <div className="p-12 text-center bg-[#141B24] border border-[#293442] rounded-3xl space-y-4">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  No Fixtures Generated Yet
                </h4>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                  {teams.length < 2
                    ? 'Register at least 2 teams to unlock round-robin fixture generation.'
                    : 'Click "Generate Fixtures" to generate a fair circle-method draw with reproducible Draw Code.'}
                </p>
                {teams.length >= 2 ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleGenerateFixtures(false)}
                    className="font-bold uppercase text-xs"
                  >
                    Generate Fixtures Now
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setActiveTab('teams')}
                    className="font-bold text-xs"
                  >
                    Add Teams First &rarr;
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {displayedRounds.map((roundNum) => {
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
                            Matchday / Round {roundNum}
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

                      {/* Match Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {roundMatches.map((m) => {
                          const home = teamsMap[m.homeTeamId];
                          const away = teamsMap[m.awayTeamId];
                          const isDone = m.status === 'Completed' || m.status === 'Forfeit';

                          return (
                            <div
                              key={m.id}
                              className="bg-[#1B2530] border border-[#293442] hover:border-slate-600 rounded-2xl p-4 space-y-3 transition-colors shadow-md"
                            >
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <div className="flex items-center gap-1.5 font-medium text-slate-300">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span className="truncate max-w-[150px]">{m.venue || 'Venue TBD'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-medium text-slate-300">
                                  <Calendar className="w-3.5 h-3.5 text-[#c6ff3d] shrink-0" />
                                  <span>{formatDateDisplay(m.scheduledAt)} &bull; {formatTimeDisplay(m.scheduledAt)}</span>
                                </div>
                              </div>

                              {/* Contestants & Scores */}
                              <div className="flex items-center justify-between gap-3 py-1">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  {/* Home */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                                        {home?.name.slice(0, 2).toUpperCase() || 'H'}
                                      </span>
                                      <span className={`text-sm font-bold truncate ${m.homeScore > m.awayScore ? 'text-[#c6ff3d]' : 'text-white'}`}>
                                        {home?.name || 'TBD'}
                                      </span>
                                    </div>
                                    {isDone && (
                                      <span className="font-mono text-base font-black text-white pl-2">
                                        {m.homeScore}
                                      </span>
                                    )}
                                  </div>

                                  {/* Away */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                                        {away?.name.slice(0, 2).toUpperCase() || 'A'}
                                      </span>
                                      <span className={`text-sm font-bold truncate ${m.awayScore > m.homeScore ? 'text-[#c6ff3d]' : 'text-white'}`}>
                                        {away?.name || 'TBD'}
                                      </span>
                                    </div>
                                    {isDone && (
                                      <span className="font-mono text-base font-black text-white pl-2">
                                        {m.awayScore}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Status / Score action pill */}
                                <div className="shrink-0 pl-2 text-right">
                                  {isDone ? (
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                      m.status === 'Forfeit'
                                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                        : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                                    }`}>
                                      {m.status === 'Forfeit' ? 'Forfeit' : 'Final'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                      {m.status}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Footer Note, Reschedule Button & Score Button */}
                              <div className="flex items-center justify-between pt-2 border-t border-[#293442] text-xs">
                                <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                  {m.resultNote || 'No match notes'}
                                </span>

                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedMatchForRescheduling(m)}
                                    className="px-2.5 py-1 rounded-lg bg-[#0B0F14] hover:bg-slate-700 text-slate-300 hover:text-white border border-[#293442] text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Schedule or adjust kickoff and venue"
                                  >
                                    <Clock className="w-3 h-3 text-sky-400" />
                                    <span>Schedule</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedMatchForScoring(m)}
                                    className="px-2.5 py-1 rounded-lg bg-[#0B0F14] hover:bg-[#c6ff3d] text-[#c6ff3d] hover:text-[#0B0F14] border border-[#c6ff3d]/30 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>{isDone ? 'Edit Score' : 'Score'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REGISTERED TEAMS */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Planned vs Actual Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141B24] border border-[#293442] p-5 rounded-3xl shadow-md">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  League Squads ({teams.length} of {league.plannedTeamCount} planned)
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Min 2 teams, max 20 teams. The actual team count drives the schedule when fixtures are generated.
                </p>
              </div>

              {teams.length !== league.plannedTeamCount && (
                <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                  Team count differs from planned ({league.plannedTeamCount}). You can still generate fixtures with {teams.length} teams.
                </div>
              )}
            </div>

            {/* Add Team Panel (Only enabled before fixtures exist or for editing) */}
            {matches.length > 0 ? (
              <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-start gap-3 text-xs text-sky-200">
                <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Fixtures already exist for this league:</strong> Adding or removing teams is locked to preserve schedule integrity. You can still rename teams or update logos safely. To add or remove teams, click "Regenerate Draw" or reset fixtures first.
                </div>
              </div>
            ) : (
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#293442] pb-3">
                  <h4 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                    {isBulkMode ? 'Bulk Add Teams' : 'Add New Team'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className="text-xs text-[#c6ff3d] hover:underline font-semibold cursor-pointer"
                  >
                    {isBulkMode ? 'Switch to Single Team Form' : 'Switch to Bulk Paste'}
                  </button>
                </div>

                {isBulkMode ? (
                  <form onSubmit={handleBulkAddTeams} className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Paste a list of team names (one per line). Duplicates and invalid lengths will be reported before saving.
                    </p>
                    <textarea
                      rows={5}
                      required
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="FC United&#10;Arsenal FC&#10;Chelsea Blues&#10;Liverpool Reds"
                      className="w-full p-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-xs text-white font-mono outline-none"
                    />
                    <div className="flex justify-end">
                      <Button variant="primary" size="sm" type="submit" className="font-bold">
                        Add All Teams
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddSingleTeam} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase text-slate-400">
                        Team Name * (2 to 40 characters)
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={40}
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="e.g. Pune City Strikers"
                        className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">
                        Captain Name (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={60}
                        value={newTeamCaptain}
                        onChange={(e) => setNewTeamCaptain(e.target.value)}
                        placeholder="e.g. Rahul S."
                        className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <Button variant="primary" size="md" type="submit" className="w-full font-bold text-xs py-2">
                        + Add Team
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Teams Listing Table */}
            <div className="bg-[#141B24] border border-[#293442] rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#1B2530] border-b border-[#293442] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Squad Name</th>
                      <th className="py-3 px-4">Captain</th>
                      <th className="py-3 px-4">Contact (Manager Only)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#293442]/60">
                    {teams.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-[#1B2530]/50 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-500 font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-[#c6ff3d]">
                              {t.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{t.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {t.captainName || <span className="text-slate-600">-</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                          {t.captainContact || <span className="text-slate-600">-</span>}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingTeam({ ...t })}
                              className="p-1.5 rounded-lg bg-[#1B2530] text-slate-300 hover:text-white border border-[#293442] text-xs transition-colors cursor-pointer"
                              title="Edit team"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {matches.length === 0 && (
                              <button
                                type="button"
                                onClick={() => setTeamDeleteConfirm(t)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs transition-colors cursor-pointer"
                                title="Remove team"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-[#293442] pb-3">
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  League Settings &amp; Public Visibility
                </h3>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 block">
                    League Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 block">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 block">
                    Match Rules
                  </label>
                  <textarea
                    rows={3}
                    value={editRules}
                    onChange={(e) => setEditRules(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none resize-none"
                  />
                </div>

                {/* Visibility and Token Rotation */}
                <div className="p-4 bg-[#1B2530] border border-[#293442] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-xs block">Public Share Link</span>
                      <span className="text-[11px] text-slate-400">
                        Enable read-only link access for spectators, players, and alumni.
                      </span>
                    </div>
                    <select
                      value={editVisibility}
                      onChange={(e) => setEditVisibility(e.target.value)}
                      className="px-3 py-1.5 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="public via link">Public via Link</option>
                      <option value="private">Private (Managers only)</option>
                    </select>
                  </div>

                  {league.shareToken && editVisibility === 'public via link' && (
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#293442]">
                      <div className="font-mono text-xs text-slate-300 truncate max-w-md bg-[#0B0F14] px-3 py-2 rounded-xl border border-[#293442]">
                        {window.location.origin}/tournaments/your-league/public/{league.shareToken}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={handleCopyShareLink}
                          className="text-xs"
                        >
                          {copiedLink ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={handleRotateShareToken}
                          className="text-xs text-amber-400 hover:text-amber-300"
                        >
                          Rotate Token
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" size="md" type="submit" className="font-bold text-xs uppercase">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>

            {/* Co-Managers Management Section (Owner Only for modifications) */}
            <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-[#293442] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                    League Managers ({managers.length})
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Owners and co-managers can enter scores, manage fixtures, and edit squad details.
                  </p>
                </div>
                <UserCheck className="w-5 h-5 text-[#c6ff3d]" />
              </div>

              {/* Managers List */}
              <div className="space-y-2">
                {managers.map((m) => {
                  const userInfo = DEMO_USERS.find((u) => u.id === m.userId);
                  const isPrimaryOwner = m.role === 'owner';

                  return (
                    <div
                      key={m.userId}
                      className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-[#c6ff3d]">
                          {userInfo?.avatar || userInfo?.name.slice(0, 2).toUpperCase() || 'MG'}
                        </div>
                        <div>
                          <span className="font-bold text-white block">
                            {userInfo?.name || m.userId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {userInfo?.email || 'Authorized Manager'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isPrimaryOwner
                            ? 'bg-[#c6ff3d]/20 text-[#c6ff3d] border border-[#c6ff3d]/40'
                            : 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                        }`}>
                          {m.role}
                        </span>

                        {isOwner && !isPrimaryOwner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCoManager(m.userId)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            title="Remove Co-Manager"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Co-Manager Form (Only Primary Owner) */}
              {isOwner && (
                <form onSubmit={handleAddCoManager} className="pt-2 border-t border-[#293442] space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-300 block">
                    Assign New Co-Manager
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={newCoManagerId}
                      onChange={(e) => setNewCoManagerId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="">Select Persona / Registered User...</option>
                      {DEMO_USERS
                        .filter((u) => u.id !== league.ownerId && !managers.some((m) => m.userId === u.id))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role} - {u.email})
                          </option>
                        ))}
                    </select>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={!newCoManagerId}
                      className="text-xs font-bold shrink-0"
                    >
                      + Add Co-Manager
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-[#293442] pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  League Audit Trail
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Immutable record of manager operations, score changes, reschedules, and fixture draws.
                </p>
              </div>
              <History className="w-5 h-5 text-slate-500" />
            </div>

            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No audit logs recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-[#1B2530] border border-[#293442] rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-white px-2 py-0.5 rounded bg-[#0B0F14] border border-slate-700 font-mono text-[11px] inline-block">
                        {log.action}
                      </span>
                      <p className="text-slate-400 text-[11px]">
                        Actor: <strong className="text-slate-200">{log.actorId}</strong> &bull; {log.matchId ? `Match: ${log.matchId}` : 'League Operation'}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(log.at).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Score Modal */}
      {selectedMatchForScoring && (
        <LeagueScoreModal
          isOpen={Boolean(selectedMatchForScoring)}
          onClose={() => setSelectedMatchForScoring(null)}
          match={selectedMatchForScoring}
          league={league}
          homeTeam={teamsMap[selectedMatchForScoring.homeTeamId]}
          awayTeam={teamsMap[selectedMatchForScoring.awayTeamId]}
          onSaveScore={handleSaveScore}
        />
      )}

      {/* Reschedule Match Modal */}
      {selectedMatchForRescheduling && (
        <LeagueRescheduleModal
          isOpen={Boolean(selectedMatchForRescheduling)}
          onClose={() => setSelectedMatchForRescheduling(null)}
          match={selectedMatchForRescheduling}
          league={league}
          homeTeam={teamsMap[selectedMatchForRescheduling.homeTeamId]}
          awayTeam={teamsMap[selectedMatchForRescheduling.awayTeamId]}
          allMatches={matches}
          onRescheduleMatch={handleRescheduleMatch}
        />
      )}

      {/* Auto Schedule Modal */}
      {isAutoScheduleOpen && (
        <LeagueAutoScheduleModal
          isOpen={isAutoScheduleOpen}
          onClose={() => setIsAutoScheduleOpen(false)}
          league={league}
          onApplySchedule={handleApplyAutoSchedule}
        />
      )}

      {/* Regenerate Confirm Dialog */}
      {isRegenerateConfirmOpen && (
        <ConfirmDialog
          isOpen={isRegenerateConfirmOpen}
          title="Regenerate Fixtures Draw"
          message="Are you sure you want to regenerate all match pairings? A new reproducible Draw Code seed will be generated."
          confirmLabel="Regenerate Draw"
          onConfirm={() => handleGenerateFixtures(false)}
          onCancel={() => setIsRegenerateConfirmOpen(false)}
        />
      )}

      {/* Reset Results & Regenerate Dialog */}
      {isResetConfirmOpen && (
        <ConfirmDialog
          isOpen={isResetConfirmOpen}
          title="Reset All Results & Regenerate Fixtures"
          message="Warning: Completed match scores already exist. Resetting will archive current results to the immutable audit log and draw a fresh schedule. Are you sure you want to proceed?"
          confirmLabel="Reset Scores & Draw"
          isDestructive={true}
          onConfirm={() => handleGenerateFixtures(true)}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}

      {/* Team Delete Confirm Dialog */}
      {teamDeleteConfirm && (
        <ConfirmDialog
          isOpen={Boolean(teamDeleteConfirm)}
          title="Remove Team"
          message={`Are you sure you want to remove "${teamDeleteConfirm.name}" from this league?`}
          confirmLabel="Remove Team"
          isDestructive={true}
          onConfirm={handleConfirmDeleteTeam}
          onCancel={() => setTeamDeleteConfirm(null)}
        />
      )}

      {/* Team Edit Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141B24] border border-[#293442] w-full max-w-md rounded-3xl p-6 space-y-4 text-white shadow-2xl">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase">
              Edit Team Details
            </h3>
            <form onSubmit={handleSaveTeamEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400">Team Name *</label>
                <input
                  type="text"
                  required
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400">Captain Name</label>
                <input
                  type="text"
                  value={editingTeam.captainName || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, captainName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400">Captain Contact</label>
                <input
                  type="text"
                  value={editingTeam.captainContact || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, captainContact: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#293442]">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditingTeam(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
