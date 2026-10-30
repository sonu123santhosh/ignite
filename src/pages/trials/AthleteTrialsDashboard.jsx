import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Printer,
  Heart,
  Trash2,
  ArrowRight,
  Sparkles,
  MapPin,
  Bell,
  Eye,
  Edit3
} from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';
import TrialReceiptModal from '../../components/trials/TrialReceiptModal';

export default function AthleteTrialsDashboard() {
  const {
    activeUser,
    applications,
    trials,
    withdrawApplication,
    savedTrials,
    toggleSaveTrial,
    notifications,
    dismissNotification
  } = useTrials();

  // Filter application statuses
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReceiptApp, setSelectedReceiptApp] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // { type: 'withdraw' | 'instructions', data: any }
  const [withdrawReason, setWithdrawReason] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Derived user applications
  const userApplications = (applications || []).filter(
    (a) =>
      a.athleteId === activeUser?.id ||
      a.athleteEmail === activeUser?.email ||
      !activeUser?.id
  );

  // Filtered applications
  const filteredApps = userApplications.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Metrics
  const totalAppsCount = userApplications.length;
  const awaitingCount = userApplications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Review'
  ).length;
  const shortlistedCount = userApplications.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Accepted'
  ).length;
  const upcomingCount = userApplications.filter(
    (a) => new Date(a.trialDate) >= new Date() && a.status !== 'Withdrawn' && a.status !== 'Rejected'
  ).length;

  // Saved trials list
  const savedList = (trials || []).filter((t) => (savedTrials || []).includes(t.id));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> {status}
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
            <Clock className="w-3.5 h-3.5" /> Submitted
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'Waitlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Waitlisted
          </span>
        );
      case 'Withdrawn':
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" /> {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#07090e] text-slate-400 border border-amber-500/20">
            {status}
          </span>
        );
    }
  };

  const handleConfirmWithdraw = () => {
    if (!activeModal?.data) return;
    withdrawApplication(activeModal.data.id, withdrawReason);
    setActiveModal(null);
    setWithdrawReason('');
    setFeedbackMsg('Your application was withdrawn successfully.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Title & Quick Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Athlete Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-['Barlow_Condensed',sans-serif]">
              My Sports Trials Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Monitor your trial applications, download official passes, and review scout instructions.
            </p>
          </div>
          <Link
            to="/trials"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider hover:shadow-[0_4px_18px_rgba(245,158,11,0.5)] border border-amber-400/40 transition-all self-start sm:self-auto cursor-pointer"
          >
            <span>Explore More Trials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Flash Feedback */}
        {feedbackMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notifications Bar */}
        {notifications && notifications.length > 0 && (
          <div className="bg-[#0a0d16]/85 border border-amber-500/20 rounded-2xl p-4 space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-400" /> Recent Trial Alerts & Scout Updates
              </span>
              <span className="text-[11px] text-amber-400/70 font-mono">
                {notifications.length} Unread
              </span>
            </div>
            <div className="space-y-2 pt-1">
              {notifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs"
                >
                  <span className="text-slate-200">{n.message}</span>
                  <button
                    type="button"
                    onClick={() => dismissNotification(n.id)}
                    className="text-slate-500 hover:text-white text-[11px] shrink-0 ml-4 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0a0d16]/85 border border-amber-500/20 p-4 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Total Applications
            </span>
            <div className="text-2xl font-black text-white font-mono">{totalAppsCount}</div>
            <p className="text-[11px] text-slate-400">Submitted trials</p>
          </div>

          <div className="bg-[#0a0d16]/85 border border-amber-500/20 p-4 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Awaiting Review
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">{awaitingCount}</div>
            <p className="text-[11px] text-slate-400">In evaluation</p>
          </div>

          <div className="bg-[#0a0d16]/85 border border-amber-500/20 p-4 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Shortlisted / Accepted
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{shortlistedCount}</div>
            <p className="text-[11px] text-slate-400">Advancing candidates</p>
          </div>

          <div className="bg-[#0a0d16]/85 border border-amber-500/20 p-4 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Upcoming Trials
            </span>
            <div className="text-2xl font-black text-yellow-400 font-mono">{upcomingCount}</div>
            <p className="text-[11px] text-slate-400">Scheduled on calendar</p>
          </div>
        </div>

        {/* SECTION 1: MY APPLICATIONS TABLE */}
        <div className="bg-[#0a0d16]/85 border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                My Trial Applications
              </h2>
              <p className="text-xs text-slate-400">
                Track selection stages, download venue passes, and review decisions.
              </p>
            </div>

            {/* Filter Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'submitted', 'shortlisted', 'accepted', 'waitlisted', 'withdrawn'].map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      statusFilter === tab
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                        : 'bg-[#07090e] text-slate-300 hover:text-white border border-amber-500/20 hover:border-amber-500/40'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="text-center py-12 bg-[#07090e]/70 rounded-2xl border border-dashed border-amber-500/25 space-y-3">
              <Calendar className="w-10 h-10 text-amber-500/40 mx-auto" />
              <p className="text-sm font-bold text-slate-200">No applications found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven&apos;t submitted any trial registrations matching &quot;{statusFilter}&quot;.
              </p>
              <Link
                to="/trials"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-black shadow-md hover:shadow-amber-500/25 transition-all"
              >
                Browse Upcoming Trials
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#07090e] text-amber-200/80 uppercase text-[10px] tracking-wider font-semibold border-b border-amber-500/20">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Trial Name & Sport</th>
                    <th className="py-3 px-4">Organisation</th>
                    <th className="py-3 px-4">Trial Date</th>
                    <th className="py-3 px-4">Applied On</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/15">
                  {filteredApps.map((app) => {
                    const matchedTrial = (trials || []).find((t) => t.id === app.trialId);
                    return (
                      <tr key={app.id} className="hover:bg-amber-950/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {app.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{app.trialTitle}</div>
                          <span className="text-[10px] uppercase font-bold text-amber-400/80">
                            {app.sport} • {app.position || 'General Squad'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          {app.organisationName}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {app.trialDate}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {app.appliedOn}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Receipt Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptApp({ app, trial: matchedTrial })}
                              title="Print Pass / Receipt"
                              className="px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-amber-950/40 text-slate-200 font-medium text-[11px] border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Printer className="w-3 h-3 text-amber-400" />
                              <span className="hidden sm:inline">Pass</span>
                            </button>

                            {/* View Next Round / Instructions Modal Trigger */}
                            {app.nextRoundDetails && (
                              <button
                                type="button"
                                onClick={() => setActiveModal({ type: 'instructions', data: app })}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] border border-amber-500/30 cursor-pointer transition-all"
                              >
                                Instructions
                              </button>
                            )}

                            {/* Withdraw Button */}
                            {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => setActiveModal({ type: 'withdraw', data: app })}
                                className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-[11px] border border-red-500/30 cursor-pointer transition-all"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 2: SAVED TRIALS (WISHLIST) */}
        <div className="bg-[#0a0d16]/85 border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Saved Sports Trials ({savedList.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Keep track of upcoming deadlines for trials you are interested in.
              </p>
            </div>
            <Link to="/trials" className="text-xs text-amber-400 font-bold hover:text-amber-300 hover:underline">
              Browse More →
            </Link>
          </div>

          {savedList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              You haven&apos;t saved any sports trials yet. Click the heart icon on any trial card to shortlist it here.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedList.map((trial) => (
                <div
                  key={trial.id}
                  className="bg-[#07090e]/90 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {trial.sport}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSaveTrial(trial.id)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-bold text-white text-sm line-clamp-2">{trial.title}</h3>
                    <p className="text-xs text-slate-400">{trial.organisationName}</p>

                    <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                      <div>Trial: <strong>{trial.trialDate}</strong></div>
                      <div>Deadline: <strong className="text-amber-400">{trial.applicationDeadline}</strong></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-amber-500/20 mt-3 flex items-center gap-2">
                    <Link
                      to={`/trials/${trial.id}`}
                      className="flex-1 py-1.5 rounded-lg bg-[#141824] hover:bg-amber-950/40 text-xs font-bold text-slate-200 text-center border border-amber-500/30 transition-all"
                    >
                      Details
                    </Link>
                    {trial.status !== 'Closed' && (
                      <Link
                        to={`/trials/${trial.id}/apply`}
                        className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs uppercase text-center hover:shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-all"
                      >
                        Apply
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Official Receipt Modal */}
      {selectedReceiptApp && (
        <TrialReceiptModal
          application={selectedReceiptApp.app}
          trial={selectedReceiptApp.trial}
          onClose={() => setSelectedReceiptApp(null)}
        />
      )}

      {/* Withdraw Confirmation Modal */}
      {activeModal?.type === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0c0f17]/95 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Withdraw Application</h3>
                <p className="text-xs text-slate-400">{activeModal.data.trialTitle}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you wish to withdraw your application? Your scheduled evaluation slot will be released back to the organiser.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 block">Reason for withdrawal (Optional):</label>
              <input
                type="text"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="e.g. Schedule clash, injury, academic commitment"
                className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-amber-500/30 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#141824] text-xs font-bold text-slate-300 border border-amber-500/30 hover:text-white cursor-pointer transition-all"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:from-red-500 hover:to-rose-500 transition-all cursor-pointer shadow-md"
              >
                Yes, Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scout Instructions Modal */}
      {activeModal?.type === 'instructions' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0c0f17]/95 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-left">
            <div className="border-b border-amber-500/20 pb-3">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Official Instruction</span>
              <h3 className="font-extrabold text-white text-base">Reporting & Next Round Notes</h3>
              <p className="text-xs text-slate-400">{activeModal.data.trialTitle}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#07090e] border border-amber-500/25 text-xs text-slate-200 leading-relaxed space-y-2">
              <p className="font-semibold text-white">{activeModal.data.nextRoundDetails}</p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
