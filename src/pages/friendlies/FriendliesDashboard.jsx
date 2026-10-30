import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Swords, 
  PlusCircle, 
  Bell, 
  ExternalLink, 
  MessageSquare, 
  FileText,
  Star,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  X
} from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';
import FriendliesHeader from '../../components/friendlies/FriendliesHeader';
import FriendliesRoleSwitcher from '../../components/friendlies/FriendliesRoleSwitcher';
import MatchStatusBadge from '../../components/friendlies/MatchStatusBadge';
import SourceBadge from '../../components/friendlies/SourceBadge';

export default function FriendliesDashboard() {
  const { 
    activeRole, 
    activeUser, 
    teams, 
    matches, 
    invitations, 
    announcements, 
    colleges, 
    collegesMap,
    verifyTeam, 
    cancelMatch, 
    publishAnnouncement,
    notifications,
    withdrawFromMatch
  } = useFriendlies();

  const navigate = useNavigate();

  // Cancel match modal state
  const [cancelModalMatch, setCancelModalMatch] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Announcement modal state (for Organiser / Coordinator)
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');
  const [announceType, setAnnounceType] = useState('fixture_update');

  // Verify/Reject state
  const [rejectReasonModal, setRejectReasonModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Data helpers
  const myTeams = teams.filter(t => t.collegeId === activeUser?.collegeId || (activeRole === 'captain' && ((t.captainName && t.captainName === activeUser?.name) || (t.captain?.name && t.captain.name === activeUser?.name))));
  const unverifiedTeams = teams.filter(t => t.status?.toLowerCase() === 'unverified');
  const myInvitations = invitations.filter(inv => 
    inv.senderTeamId === activeUser?.teamId || 
    inv.recipientTeamId === activeUser?.teamId ||
    activeRole === 'coordinator'
  );

  const pendingInvitations = myInvitations.filter(inv => inv.status?.toLowerCase() === 'pending');
  const upcomingMatches = matches.filter(m => m.status?.toLowerCase() === 'confirmed' || m.status?.toLowerCase() === 'open');
  const followedTeamsList = teams.filter(t => (activeUser?.followedTeamIds || []).includes(t.id));

  // Handler for cancelling a match
  const handleConfirmCancel = () => {
    if (!cancelModalMatch || !cancelReason.trim()) return;
    cancelMatch(cancelModalMatch.id, cancelReason);
    setCancelModalMatch(null);
    setCancelReason('');
  };

  // Handler for team rejection
  const handleConfirmReject = () => {
    if (!rejectReasonModal) return;
    verifyTeam(rejectReasonModal.id, false, rejectReason);
    setRejectReasonModal(null);
    setRejectReason('');
  };

  // Handler for posting announcement
  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceBody.trim()) return;
    publishAnnouncement({
      title: announceTitle,
      body: announceBody,
      sourceTier: activeRole === 'coordinator' ? 'official' : 'verified_organiser',
      officialSource: collegesMap?.[activeUser?.collegeId]?.name || 'Inter-Collegiate Sports Board',
      link: '#',
      category: announceType
    });
    setAnnounceTitle('');
    setAnnounceBody('');
    setIsAnnounceModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Role Switcher */}
        <FriendliesHeader />
        <FriendliesRoleSwitcher />

        {/* Dashboard Title & Active Role Overview */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_12px_40px_rgba(14,165,233,0.12)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Layers className="w-4 h-4" />
              <span>Role-Adaptive Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeRole === 'student' && 'Student Spectator & Athlete Hub'}
              {activeRole === 'captain' && `Captain Portal: ${activeUser?.name || 'Captain'} (${activeUser?.collegeName || 'Inter-Collegiate'})`}
              {activeRole === 'coordinator' && `Sports Directorate: ${activeUser?.name || 'Coordinator'}`}
              {activeRole === 'organiser' && `Match Operations: ${activeUser?.name || 'Organiser'}`}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {activeRole === 'student' && 'Follow your favorite college teams, track confirmed fixtures, and access official sports board alerts.'}
              {activeRole === 'captain' && 'Manage your team roster, review and negotiate incoming friendly match challenges, and lock in fixtures.'}
              {activeRole === 'coordinator' && 'Review college squad eligibility rosters, verify collegiate sports affiliations, and inspect match dispute reports.'}
              {activeRole === 'organiser' && 'Coordinate open college friendly fixtures, manage spectator slot capacities, and issue official scheduling bulletins.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {activeRole === 'captain' && (
              <>
                <Link
                  to="/friendlies/challenge"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-[0_4px_20px_rgba(14,165,233,0.35)] hover:shadow-[0_4px_28px_rgba(14,165,233,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Swords className="w-4 h-4" />
                  Challenge College
                </Link>
                <Link
                  to="/friendlies/inbox"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 text-sky-200 border border-sky-400/30 font-semibold text-sm hover:text-white hover:bg-sky-500/20 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  Inbox {pendingInvitations.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-sky-400 text-[#0c1629] font-extrabold text-xs flex items-center justify-center">
                      {pendingInvitations.length}
                    </span>
                  )}
                </Link>
              </>
            )}

            {(activeRole === 'coordinator' || activeRole === 'organiser') && (
              <button
                onClick={() => setIsAnnounceModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-md shadow-sky-600/30 hover:from-sky-400 hover:to-blue-500 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Post Announcement
              </button>
            )}

            {activeRole === 'student' && (
              <Link
                to="/friendlies"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-sky-600/30 hover:shadow-[0_4px_24px_rgba(14,165,233,0.5)] transition-all"
              >
                Browse Upcoming Fixtures
              </Link>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* ROLE VIEW: STUDENT */}
        {/* ============================================================ */}
        {activeRole === 'student' && (
          <div className="space-y-8">
            {/* Followed Teams Section */}
            <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-sky-400 fill-sky-400" />
                    Followed College Teams ({followedTeamsList.length})
                  </h3>
                  <p className="text-xs text-slate-400">Receive schedule updates and notifications when these squads play.</p>
                </div>
                <Link to="/friendlies/teams" className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1">
                  Explore Teams <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {followedTeamsList.length === 0 ? (
                <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-8 text-center space-y-3">
                  <p className="text-sm text-slate-300">You are not following any college teams yet.</p>
                  <Link to="/friendlies/teams" className="inline-block px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-400/30 text-xs font-semibold text-white hover:bg-sky-500/20 transition-all">
                    Browse Teams Directory
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followedTeamsList.map(t => (
                    <div key={t.id} className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-xs text-slate-100 shrink-0 bg-gradient-to-br from-[#182235] via-[#0f1726] to-[#080d18] border border-sky-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                          <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {t.initials || 'SQD'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{t.name}</h4>
                          <span className="text-xs text-slate-400">{t.sport} • {colleges[t.collegeId]?.city}</span>
                        </div>
                      </div>
                      <Link
                        to={`/friendlies?sport=${t.sport}`}
                        className="p-2 text-slate-400 hover:text-sky-400 transition-colors"
                        title="View fixtures"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registered Match Passes / Attendance */}
            <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                My Match Spectator Passes
              </h3>
              <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-6 text-center space-y-3">
                <p className="text-sm text-slate-300">
                  Ready to support your college on ground? Register for spectator passes directly from any match details page.
                </p>
                <Link to="/friendlies" className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-sky-600/30">
                  Discover Live & Upcoming Matches
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE VIEW: TEAM CAPTAIN */}
        {/* ============================================================ */}
        {activeRole === 'captain' && (
          <div className="space-y-8">
            {/* Squad Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Active Squad</div>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{activeUser.teamName || 'College Varsity XI'}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-400/40">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    Verified Roster
                  </span>
                  <span className="text-xs text-slate-400">14 Active Players</span>
                </div>
              </div>

              <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Challenge Requests</div>
                <div className="text-3xl font-extrabold text-sky-400">
                  {pendingInvitations.length}
                </div>
                <p className="text-xs text-slate-400">Awaiting your terms review or opponent response</p>
              </div>

              <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Fixtures</div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {matches.filter(m => m.status === 'confirmed').length}
                </div>
                <p className="text-xs text-slate-400">Ready on official campus / partner grounds</p>
              </div>
            </div>

            {/* Quick Negotiation Tracker */}
            <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-sky-400" />
                    Match Negotiations & Inquiries
                  </h3>
                  <p className="text-xs text-slate-400">Two-way match terms agreement workflow</p>
                </div>
                <Link to="/friendlies/inbox" className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1">
                  View Full Inbox <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {myInvitations.length === 0 ? (
                <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-8 text-center text-sm text-slate-400">
                  No active match negotiations. Send a challenge to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {myInvitations.slice(0, 3).map(inv => (
                    <div 
                      key={inv.id} 
                      className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {inv.proposedTerms?.sport || inv.sport} Match vs {inv.senderTeamName === activeUser.teamName ? inv.recipientTeamName : inv.senderTeamName}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                            inv.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                            inv.status === 'pending' ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>{inv.proposedTerms?.date || inv.terms?.date} • {inv.proposedTerms?.time || inv.terms?.startTime}</span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{inv.proposedTerms?.venue || inv.terms?.venueName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to="/friendlies/inbox"
                          className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-400/30 hover:bg-sky-500/20 text-xs font-semibold text-sky-200 transition-all"
                        >
                          Open Negotiation
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE VIEW: COLLEGE COORDINATOR */}
        {/* ============================================================ */}
        {activeRole === 'coordinator' && (
          <div className="space-y-8">
            {/* Squad Verification Queue */}
            <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    Squad Eligibility Verification Queue ({unverifiedTeams.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verify that student captains have enrolled authentic college players prior to inter-college fixtures.
                  </p>
                </div>
              </div>

              {unverifiedTeams.length === 0 ? (
                <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-8 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">All squads verified</p>
                  <p className="text-xs text-slate-400">There are no pending team registrations requiring administrative sign-off.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unverifiedTeams.map(team => (
                    <div 
                      key={team.id}
                      className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{team.name}</h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Awaiting Approval
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {team.sport} • Captain: <span className="text-slate-200">{team.captainName || team.captain?.name || 'Captain'}</span> ({team.captainEmail || team.captain?.email || 'N/A'}) • {team.roster?.length || 0} Registered Players
                        </div>
                        <div className="text-xs text-slate-500">
                          Affiliated Institution: {collegesMap?.[team.collegeId]?.name || team.collegeName || 'Unknown'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verifyTeam(team.id, true)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/30 hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify Squad
                        </button>
                        <button
                          onClick={() => setRejectReasonModal(team)}
                          className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs hover:bg-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* University Sports Board Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-sky-400">Affiliated Colleges</h3>
                <div className="space-y-2">
                  {(Array.isArray(colleges) ? colleges : Object.values(colleges || {})).map(c => (
                    <div key={c.id} className="p-3 bg-[#070d1a]/80 rounded-xl border border-sky-500/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{c.name}</span>
                        <span className="text-slate-400 ml-2">({c.emailDomain || c.domain || 'edu.in'})</span>
                      </div>
                      <span className="text-slate-400">{c.city}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-emerald-400">Match Dispute & Conduct Inquiries</h3>
                <div className="p-6 bg-[#070d1a]/80 rounded-xl border border-sky-500/20 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">Clean Conduct Record</p>
                  <p className="text-[11px] text-slate-500">No active match disputes or conduct violations reported this week.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE VIEW: MATCH ORGANISER */}
        {/* ============================================================ */}
        {activeRole === 'organiser' && (
          <div className="space-y-8">
            {/* Match Fixture Management Table */}
            <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-400" />
                    Organised Match Fixtures ({matches.length})
                  </h3>
                  <p className="text-xs text-slate-400">Manage spectator quotas, verify match schedules, or invoke rainout cancellations.</p>
                </div>
                <Link
                  to="/friendlies/challenge"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-xs self-start shadow-md shadow-sky-600/30 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all"
                >
                  Create Match Proposal
                </Link>
              </div>

              <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl overflow-hidden divide-y divide-sky-500/20">
                {matches.map(m => {
                  const regCount = m.registeredTeams?.length || 0;
                  const capacityPct = Math.round((regCount / m.slots) * 100);

                  return (
                    <div key={m.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-sky-500/10 transition-colors">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">{m.title}</span>
                          <MatchStatusBadge status={m.status} />
                          <SourceBadge sourceTier={m.sourceTier} />
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-sky-400" /> {m.date} at {m.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sky-400" /> {m.venue}</span>
                        </div>
                      </div>

                      {/* Slot Capacity Gauge */}
                      <div className="w-48 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Slots: {regCount} / {m.slots}</span>
                          <span className="font-bold text-white">{capacityPct}%</span>
                        </div>
                        <div className="w-full bg-[#0c1629] h-2 rounded-full overflow-hidden border border-sky-500/20">
                          <div 
                            className={`h-full transition-all ${capacityPct >= 100 ? 'bg-red-400' : 'bg-gradient-to-r from-sky-400 to-blue-500'}`}
                            style={{ width: `${Math.min(100, capacityPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/friendlies/matches/${m.id}`}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-200 border border-sky-400/30 hover:bg-sky-500/20 text-xs font-semibold transition-all"
                        >
                          View
                        </Link>
                        {m.status !== 'cancelled' && (
                          <button
                            onClick={() => setCancelModalMatch(m)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: CANCEL MATCH REASON */}
        {/* ============================================================ */}
        {cancelModalMatch && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0c1629] border border-sky-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-sky-500/20 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Cancel Match Fixture
                </h3>
                <button onClick={() => setCancelModalMatch(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  You are about to cancel <span className="font-bold text-white">{cancelModalMatch.title}</span>. All registered teams, captains, and spectators will be notified immediately.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Mandatory Cancellation Reason</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Unplayable ground conditions due to rain / college exams conflict..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-[#070d1a] border border-sky-500/30 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-500/20">
                <button
                  onClick={() => setCancelModalMatch(null)}
                  className="px-4 py-2 rounded-xl bg-sky-500/10 text-slate-300 border border-sky-500/20 text-xs font-semibold hover:text-white hover:bg-sky-500/20 transition-all"
                >
                  Go Back
                </button>
                <button
                  disabled={!cancelReason.trim()}
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: REJECT TEAM REASON */}
        {/* ============================================================ */}
        {rejectReasonModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0c1629] border border-sky-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-sky-500/20 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-amber-400" />
                  Decline Squad Verification
                </h3>
                <button onClick={() => setRejectReasonModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Please provide feedback to the captain of <span className="font-bold text-white">{rejectReasonModal.name}</span> explaining what documents or player details need correction.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Feedback / Reason</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Student ID cards missing for 2 players; kindly update the roster..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-[#070d1a] border border-sky-500/30 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-500/20">
                <button
                  onClick={() => setRejectReasonModal(null)}
                  className="px-4 py-2 rounded-xl bg-sky-500/10 text-slate-300 border border-sky-500/20 text-xs font-semibold hover:text-white hover:bg-sky-500/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all cursor-pointer shadow-md"
                >
                  Send Feedback & Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: POST ANNOUNCEMENT */}
        {/* ============================================================ */}
        {isAnnounceModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0c1629] border border-sky-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-sky-500/20 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-400" />
                  Publish Inter-Collegiate Announcement
                </h3>
                <button onClick={() => setIsAnnounceModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={announceType}
                    onChange={(e) => setAnnounceType(e.target.value)}
                    className="w-full bg-[#070d1a] border border-sky-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="fixture_update" className="bg-[#0c1629] text-white">Fixture Schedule Update</option>
                    <option value="ground_alert" className="bg-[#0c1629] text-white">Ground Condition Alert</option>
                    <option value="zonal_notice" className="bg-[#0c1629] text-white">Zonal Sports Committee Circular</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Announcement Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune Inter-Collegiate Football Friendlies Window Extended"
                    value={announceTitle}
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                    className="w-full bg-[#070d1a] border border-sky-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Message Body</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide circular details, guidelines or ground shift info..."
                    value={announceBody}
                    onChange={(e) => setAnnounceBody(e.target.value)}
                    className="w-full bg-[#070d1a] border border-sky-500/30 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-500/20">
                  <button
                    type="button"
                    onClick={() => setIsAnnounceModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-sky-500/10 text-slate-300 border border-sky-500/20 text-xs font-semibold hover:text-white hover:bg-sky-500/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-600/30 transition-all cursor-pointer"
                  >
                    Publish Circular
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
