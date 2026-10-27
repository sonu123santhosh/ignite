import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Layers,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileText,
  HelpCircle,
  Shuffle,
  RefreshCw,
  Send,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../components/tournaments/StatusBadge';
import ConfirmDialog from '../components/tournaments/ConfirmDialog';
import BracketView from '../components/tournaments/BracketView';
import StandingsTable from '../components/tournaments/StandingsTable';
import FixtureTable from '../components/tournaments/FixtureTable';
import ResultEntryModal from '../components/tournaments/ResultEntryModal';
import Toast from '../components/Toast';
import {
  formatDateDisplay,
  formatTimeDisplay,
  generateSingleEliminationFixtures,
  generateRoundRobinFixtures,
  detectFixtureConflicts,
  transitionRegistration,
  checkActionPermission
} from '../data/tournamentsData';

export default function TournamentOrganiserManage({
  sharedTournamentsState,
  setSharedTournamentsState,
  currentDemoUser,
  tournamentRole = 'organiser'
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' | 'fixtures' | 'results'
  const [regFilter, setRegFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Dialog states
  const [selectedRegForApprove, setSelectedRegForApprove] = useState(null);
  const [selectedRegForReject, setSelectedRegForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRegForInfo, setSelectedRegForInfo] = useState(null);
  const [infoRequestReason, setInfoRequestReason] = useState('');
  const [viewingAppDetails, setViewingAppDetails] = useState(null);

  // Fixture generation & conflict override
  const [fixtureConflicts, setFixtureConflicts] = useState([]);
  const [isOverrideConflictOpen, setIsOverrideConflictOpen] = useState(false);
  const [selectedMatchForScoring, setSelectedMatchForScoring] = useState(null);

  const tournament = sharedTournamentsState.tournaments.find((t) => t.id === id);

  if (!tournament) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto px-4">
        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold uppercase text-white mb-2">
          Tournament Not Found
        </h2>
        <Link to="/tournaments/organiser" className="text-xs font-bold text-[#B6FF3B]">
          Return to Organiser Dashboard
        </Link>
      </div>
    );
  }

  // Permission Check: ensure current organiser user matches tournament organiser
  const permissionCheck = checkActionPermission({
    role: tournamentRole,
    currentUserId: currentDemoUser?.id,
    action: 'manage_registrations',
    resource: tournament
  });

  const isOwnerOrganiser = permissionCheck.allowed;

  // Tournament's registrations
  const tournamentRegs = (sharedTournamentsState.registrations || []).filter(
    (r) => r.tournamentId === tournament.id
  );

  const approvedEntrants = tournamentRegs.filter((r) => r.registrationStatus === 'Approved');

  const filteredRegs = tournamentRegs.filter((r) => {
    if (regFilter === 'all') return true;
    if (regFilter === 'Pending') return r.registrationStatus === 'Pending' || r.registrationStatus === 'Submitted';
    if (regFilter === 'Approved') return r.registrationStatus === 'Approved';
    if (regFilter === 'Rejected') return r.registrationStatus === 'Rejected';
    if (regFilter === 'Waitlisted') return r.registrationStatus === 'Waitlisted';
    return true;
  });

  // Action: Approve Registration
  const handleConfirmApprove = () => {
    if (!selectedRegForApprove) return;

    // Check conflict of interest: organiser cannot approve their own registration
    if (selectedRegForApprove.captainId === currentDemoUser?.id) {
      setToast({
        title: 'Conflict of Interest Refusal',
        message: 'Tournament organisers are strictly prohibited from approving their own registrations.',
        type: 'error'
      });
      setSelectedRegForApprove(null);
      return;
    }

    // Check capacity: approvals cannot exceed capacity
    if (approvedEntrants.length >= tournament.capacity) {
      setToast({
        title: 'Capacity Reached',
        message: `Capacity of ${tournament.capacity} approved entrants has been reached. Please place entrant on Waitlist or expand capacity first.`,
        type: 'warning'
      });
      setSelectedRegForApprove(null);
      return;
    }

    const res = transitionRegistration(selectedRegForApprove, 'Approved');
    if (!res.success) {
      setToast({ title: 'Approval Refused', message: res.error, type: 'error' });
      setSelectedRegForApprove(null);
      return;
    }

    setSharedTournamentsState((prev) => ({
      ...prev,
      registrations: prev.registrations.map((r) =>
        r.id === selectedRegForApprove.id ? res.registration : r
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Application Approved',
          message: `Congratulations! ${selectedRegForApprove.entrantName} has been approved for ${tournament.name}.`,
          tournamentId: tournament.id,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'success',
          targetUserId: selectedRegForApprove.captainId
        },
        ...prev.notifications
      ]
    }));

    setToast({
      title: 'Registration Approved',
      message: `${selectedRegForApprove.entrantName} has been approved. Participant spot confirmed.`,
      type: 'success'
    });
    setSelectedRegForApprove(null);
  };

  // Action: Reject Registration
  const handleConfirmReject = () => {
    if (!selectedRegForReject || !rejectionReason.trim()) return;

    const res = transitionRegistration(selectedRegForReject, 'Rejected', rejectionReason);
    if (!res.success) {
      setToast({ title: 'Rejection Refused', message: res.error, type: 'error' });
      setSelectedRegForReject(null);
      return;
    }

    setSharedTournamentsState((prev) => ({
      ...prev,
      registrations: prev.registrations.map((r) =>
        r.id === selectedRegForReject.id ? res.registration : r
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Application Rejected',
          message: `Your entry for ${tournament.name} was rejected: ${rejectionReason}`,
          tournamentId: tournament.id,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'error',
          targetUserId: selectedRegForReject.captainId
        },
        ...prev.notifications
      ]
    }));

    setToast({
      title: 'Registration Rejected',
      message: 'Applicant notified and status marked as Rejected.',
      type: 'info'
    });
    setSelectedRegForReject(null);
    setRejectionReason('');
  };

  // Action: Request Missing Info
  const handleConfirmRequestInfo = () => {
    if (!selectedRegForInfo || !infoRequestReason.trim()) return;

    const res = transitionRegistration(selectedRegForInfo, 'Pending', infoRequestReason);
    if (!res.success) {
      setToast({ title: 'Request Refused', message: res.error, type: 'error' });
      setSelectedRegForInfo(null);
      return;
    }

    setSharedTournamentsState((prev) => ({
      ...prev,
      registrations: prev.registrations.map((r) =>
        r.id === selectedRegForInfo.id ? res.registration : r
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Information Requested by Organiser',
          message: `Organiser for ${tournament.name} requested: "${infoRequestReason}". Please update your submission.`,
          tournamentId: tournament.id,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'warning',
          targetUserId: selectedRegForInfo.captainId
        },
        ...prev.notifications
      ]
    }));

    setToast({
      title: 'Clarification Requested',
      message: 'Notification sent to applicant requesting missing document/info.',
      type: 'info'
    });
    setSelectedRegForInfo(null);
    setInfoRequestReason('');
  };

  // Action: Toggle Document Verified checkbox
  const handleToggleDocVerified = (regId, docName) => {
    setSharedTournamentsState((prev) => ({
      ...prev,
      registrations: prev.registrations.map((r) => {
        if (r.id === regId) {
          const isVerified = r.verifiedDocs?.includes(docName);
          const newVerifiedDocs = isVerified
            ? r.verifiedDocs.filter((d) => d !== docName)
            : [...(r.verifiedDocs || []), docName];

          const updatedDocs = (r.documents || []).map((doc) =>
            doc.name === docName ? { ...doc, verified: !isVerified } : doc
          );

          return { ...r, verifiedDocs: newVerifiedDocs, documents: updatedDocs };
        }
        return r;
      })
    }));
  };

  // Action: Generate Fixtures
  const handleGenerateFixtures = () => {
    const approvedList = approvedEntrants.map((r) => ({
      id: r.entrantId,
      name: r.entrantName
    }));

    if (tournament.format === 'single_elimination') {
      const res = generateSingleEliminationFixtures(
        approvedList,
        tournament.startDate,
        tournament.venue
      );
      if (!res.success) {
        setToast({ title: 'Fixture Generation Refused', message: res.error, type: 'error' });
        return;
      }

      const conflicts = detectFixtureConflicts(res.fixtures);
      setFixtureConflicts(conflicts);

      setSharedTournamentsState((prev) => ({
        ...prev,
        tournaments: prev.tournaments.map((t) =>
          t.id === tournament.id ? { ...t, fixtures: res.fixtures, resultsPublished: true } : t
        )
      }));

      setToast({
        title: 'Fixtures Generated',
        message: `Knockout bracket generated with ${res.fixtures.length} matches.`,
        type: 'success'
      });
    } else {
      // Round Robin or League
      const res = generateRoundRobinFixtures(
        approvedList,
        tournament.startDate,
        tournament.venue
      );
      if (!res.success) {
        setToast({ title: 'Fixture Generation Refused', message: res.error, type: 'error' });
        return;
      }

      const conflicts = detectFixtureConflicts(res.fixtures);
      setFixtureConflicts(conflicts);

      setSharedTournamentsState((prev) => ({
        ...prev,
        tournaments: prev.tournaments.map((t) =>
          t.id === tournament.id ? { ...t, fixtures: res.fixtures, resultsPublished: true } : t
        )
      }));

      setToast({
        title: 'Round-Robin Fixtures Generated',
        message: `${res.fixtures.length} match fixtures created across rounds.`,
        type: 'success'
      });
    }
  };

  // Action: Save Result from Organiser Modal
  const handleSaveResult = (matchId, result) => {
    setSharedTournamentsState((prev) => {
      const updatedTournaments = prev.tournaments.map((t) => {
        if (t.id === tournament.id) {
          const updatedFixtures = (t.fixtures || []).map((m) => {
            if (m.id === matchId) {
              return { ...m, status: 'Completed', result };
            }
            return m;
          });

          // Knockout auto-advancement
          if (t.format === 'single_elimination' && result.winnerId) {
            const currentMatch = updatedFixtures.find((m) => m.id === matchId);
            if (currentMatch && currentMatch.roundIndex) {
              const nextRoundIndex = currentMatch.roundIndex + 1;
              const nextMatchNumber = Math.ceil(currentMatch.matchNumber / 2);

              const nextMatch = updatedFixtures.find(
                (m) => m.roundIndex === nextRoundIndex && m.matchNumber === nextMatchNumber
              );

              if (nextMatch) {
                const winnerTeam =
                  result.winnerId === currentMatch.teamA?.id
                    ? currentMatch.teamA
                    : currentMatch.teamB;

                if (currentMatch.matchNumber % 2 !== 0) {
                  nextMatch.teamA = { id: winnerTeam.id, name: winnerTeam.name };
                } else {
                  nextMatch.teamB = { id: winnerTeam.id, name: winnerTeam.name };
                }
              }
            }
          }

          return { ...t, fixtures: updatedFixtures, resultsPublished: true };
        }
        return t;
      });

      return {
        ...prev,
        tournaments: updatedTournaments,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Match Result Finalised',
            message: `Scores updated for ${tournament.name}. Standings and brackets recomputed.`,
            tournamentId: tournament.id,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'info',
            targetUserId: 'all'
          },
          ...prev.notifications
        ]
      };
    });

    setToast({
      title: 'Result Finalised',
      message: 'Scores published. Standings and knockout brackets re-derived.',
      type: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] pb-24">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Header */}
      <div className="bg-[#141B24] border-b border-[#293442] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/tournaments/organiser"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#B6FF3B]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Organiser Dashboard</span>
          </Link>
          <span className="text-xs text-slate-400">
            Current Organiser: <strong className="text-white">{currentDemoUser?.name}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Permission Refusal Warning Banner if not owner */}
        {!isOwnerOrganiser && (
          <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-red-400 shadow-xl">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm">
                Permission Refused (Demo Matrix)
              </h4>
              <p className="mt-1 leading-relaxed">
                {permissionCheck.message} Use <strong>Demo Tools</strong> to switch persona to &quot;{tournament.organiserName}&quot; to test managing this event.
              </p>
            </div>
          </div>
        )}

        {/* Tournament Management Header */}
        <div className="bg-[#141B24] border border-[#293442] p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {tournament.sport} &bull; {tournament.format}
                </span>
                <StatusBadge type="tournament" status={tournament.status} />
              </div>
              <h1 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase text-white tracking-wide">
                {tournament.name}
              </h1>
              <p className="text-xs text-[#94A3B8]">
                {tournament.venue}, {tournament.city} &bull; Starts {formatDateDisplay(tournament.startDate)}
              </p>
            </div>

            {/* Quick KPIs */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-center min-w-[100px]">
                <span className="text-[10px] text-[#94A3B8] uppercase block font-bold">Approved</span>
                <span className="font-['Barlow_Condensed'] text-2xl font-black text-[#B6FF3B]">
                  {approvedEntrants.length} / {tournament.capacity}
                </span>
              </div>
              <div className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-center min-w-[100px]">
                <span className="text-[10px] text-[#94A3B8] uppercase block font-bold">Pending</span>
                <span className="font-['Barlow_Condensed'] text-2xl font-black text-amber-400">
                  {tournamentRegs.filter((r) => r.registrationStatus === 'Submitted').length}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#293442] overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'registrations', label: `Applications (${tournamentRegs.length})` },
              { id: 'fixtures', label: `Fixtures & Schedule (${tournament.fixtures?.length || 0})` },
              { id: 'results', label: 'Results & Standings' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1B2530] text-[#B6FF3B] border border-[#293442] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: Applications & Registrations Table */}
        {activeTab === 'registrations' && (
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                Entrant Applications
              </h3>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {['all', 'Pending', 'Approved', 'Waitlisted', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRegFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      regFilter === st
                        ? 'bg-[#B6FF3B] text-[#0B0F14]'
                        : 'bg-[#1B2530] text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#1B2530] border-b border-[#293442] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    <th className="py-3 px-3">Ref ID</th>
                    <th className="py-3 px-3">Entrant / Squad</th>
                    <th className="py-3 px-3">Submitted On</th>
                    <th className="py-3 px-3">Docs Verified</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293442]/60">
                  {filteredRegs.map((reg) => {
                    const isSubmittedOrPending =
                      reg.registrationStatus === 'Submitted' ||
                      reg.registrationStatus === 'Pending' ||
                      reg.registrationStatus === 'Waitlisted';

                    return (
                      <tr key={reg.id} className="hover:bg-[#1B2530]/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#B6FF3B]">
                          {reg.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{reg.entrantName}</div>
                          <div className="text-[11px] text-slate-400">
                            Cap: {reg.captainName} &bull; {reg.captainPhone}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {formatDateDisplay(reg.submittedOn)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            {tournament.eligibility?.documents?.map((docName, dIdx) => {
                              const isChecked = reg.verifiedDocs?.includes(docName);
                              return (
                                <label
                                  key={dIdx}
                                  className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    disabled={!isOwnerOrganiser}
                                    checked={Boolean(isChecked)}
                                    onChange={() => handleToggleDocVerified(reg.id, docName)}
                                    className="w-3.5 h-3.5 rounded accent-[#B6FF3B] cursor-pointer"
                                  />
                                  <span className={isChecked ? 'text-emerald-400 font-semibold' : ''}>
                                    {docName}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge type="registration" status={reg.registrationStatus} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                            <button
                              type="button"
                              onClick={() => setViewingAppDetails(reg)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#1B2530] text-slate-300 hover:text-white border border-[#293442] rounded-lg cursor-pointer"
                            >
                              Roster
                            </button>

                            {isOwnerOrganiser && isSubmittedOrPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedRegForApprove(reg)}
                                  className="px-2.5 py-1 text-xs font-bold bg-[#B6FF3B] text-[#0B0F14] rounded-lg hover:bg-[#a3ee28] cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedRegForInfo(reg)}
                                  className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg cursor-pointer"
                                >
                                  Ask Info
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedRegForReject(reg)}
                                  className="px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-lg cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
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
        )}

        {/* TAB 2: Fixtures Management & Generator */}
        {activeTab === 'fixtures' && (
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#293442]">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  Automated Fixture Generator
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  {tournament.format === 'single_elimination'
                    ? 'Generates single elimination brackets with powers-of-two and automatic BYE advancement.'
                    : 'Generates balanced round-robin leagues using the circle method with conflict detection.'}
                </p>
              </div>

              {isOwnerOrganiser && (
                <button
                  type="button"
                  onClick={handleGenerateFixtures}
                  className="px-4 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider hover:bg-[#a3ee28] flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Generate / Redraw Fixtures</span>
                </button>
              )}
            </div>

            {/* Fixture Conflicts Alert */}
            {fixtureConflicts.length > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{fixtureConflicts.length} Scheduling Conflicts Detected</span>
                </div>
                <ul className="text-xs text-amber-300 space-y-1 list-disc list-inside">
                  {fixtureConflicts.map((c, cIdx) => (
                    <li key={cIdx}>{c.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Existing Fixtures */}
            <div className="space-y-4">
              <h4 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                Live Drawn Matches ({tournament.fixtures?.length || 0})
              </h4>

              {tournament.format === 'single_elimination' ? (
                <BracketView
                  fixtures={tournament.fixtures || []}
                  onMatchClick={isOwnerOrganiser ? (m) => setSelectedMatchForScoring(m) : null}
                />
              ) : (
                <FixtureTable
                  fixtures={tournament.fixtures || []}
                  sport={tournament.sport}
                  canEnterResults={isOwnerOrganiser}
                  onOpenResultEntry={(m) => setSelectedMatchForScoring(m)}
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Results & Standings */}
        {activeTab === 'results' && (
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Results &amp; Standings Recalculation
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Finalised match scores automatically recalculate the league standings below and advance knockout winners.
            </p>

            <StandingsTable
              fixtures={tournament.fixtures || []}
              scoringConfig={tournament.scoringConfig}
              teams={approvedEntrants.map((r) => ({ id: r.entrantId, name: r.entrantName }))}
            />
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      {selectedRegForApprove && (
        <ConfirmDialog
          isOpen={Boolean(selectedRegForApprove)}
          title="Approve Entrant Application"
          message={`Confirm approval for ${selectedRegForApprove.entrantName}? This will confirm their spot in the ${tournament.name} and count against capacity.`}
          confirmLabel="Approve Entrant"
          onConfirm={handleConfirmApprove}
          onCancel={() => setSelectedRegForApprove(null)}
        />
      )}

      {/* Reject Dialog */}
      {selectedRegForReject && (
        <ConfirmDialog
          isOpen={Boolean(selectedRegForReject)}
          title="Reject Entrant Application"
          message={`Specify official rejection reason for ${selectedRegForReject.entrantName}. This will be communicated to the registrant.`}
          confirmLabel="Reject Application"
          isDestructive={true}
          onConfirm={handleConfirmReject}
          onCancel={() => setSelectedRegForReject(null)}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Rejection Reason *
            </label>
            <textarea
              rows={2}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Unverified college affiliation / Age eligibility failure"
              className="w-full p-2.5 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs text-white outline-none"
            />
          </div>
        </ConfirmDialog>
      )}

      {/* Request Info Dialog */}
      {selectedRegForInfo && (
        <ConfirmDialog
          isOpen={Boolean(selectedRegForInfo)}
          title="Request Additional Information"
          message={`Send an in-app notice to ${selectedRegForInfo.entrantName} requesting specific clarifications or missing documents.`}
          confirmLabel="Send Request"
          onConfirm={handleConfirmRequestInfo}
          onCancel={() => setSelectedRegForInfo(null)}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Information Requested *
            </label>
            <textarea
              rows={2}
              required
              value={infoRequestReason}
              onChange={(e) => setInfoRequestReason(e.target.value)}
              placeholder="e.g. Upload a clearer scan of Student ID with college seal."
              className="w-full p-2.5 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs text-white outline-none"
            />
          </div>
        </ConfirmDialog>
      )}

      {/* Modal: View Application & Roster Details */}
      {viewingAppDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141B24] border border-[#293442] w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#293442]">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  Application Details
                </h3>
                <span className="text-xs text-[#B6FF3B] font-mono">{viewingAppDetails.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingAppDetails(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-[#1B2530] rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#1B2530] rounded-xl">
                <div>
                  <span className="text-[#94A3B8] block">Entrant Name</span>
                  <span className="font-bold text-white">{viewingAppDetails.entrantName}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block">Captain Contact</span>
                  <span className="font-bold text-white">{viewingAppDetails.captainPhone}</span>
                </div>
              </div>

              {viewingAppDetails.roster && viewingAppDetails.roster.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
                    Squad Roster List ({viewingAppDetails.roster.length})
                  </span>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {viewingAppDetails.roster.map((player, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-2 bg-[#0B0F14] border border-[#293442] rounded-lg flex items-center justify-between"
                      >
                        <span className="font-semibold text-white">{player.name}</span>
                        <span className="text-slate-400">{player.position} &bull; {player.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result Entry Modal */}
      {selectedMatchForScoring && (
        <ResultEntryModal
          isOpen={Boolean(selectedMatchForScoring)}
          onClose={() => setSelectedMatchForScoring(null)}
          match={selectedMatchForScoring}
          sport={tournament.sport}
          format={tournament.format}
          onSaveResult={handleSaveResult}
        />
      )}
    </div>
  );
}
