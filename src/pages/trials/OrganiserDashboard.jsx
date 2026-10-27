import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Shield,
  Award,
  ChevronRight,
  TrendingUp,
  MapPin,
  Trash2
} from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';
import TrialsRoleSwitcher from '../../components/trials/TrialsRoleSwitcher';

export default function OrganiserDashboard() {
  const {
    activeUser,
    trials,
    applications,
    closeTrialApplications,
    cancelTrial
  } = useTrials();

  const navigate = useNavigate();

  // Cancel trial modal state
  const [cancelModalTrial, setCancelModalTrial] = useState(null);
  const [cancelReason, setCancelReason] = useState('Inclement weather / ground maintenance');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Derived trials for current organiser organisation
  const orgTrials = (trials || []).filter(
    (t) =>
      t.organisationId === activeUser?.organisationId ||
      t.organisationName === activeUser?.organisationName ||
      activeUser?.role === 'organiser'
  );

  // Stats
  const totalTrialsCount = orgTrials.length;
  const upcomingCount = orgTrials.filter(
    (t) => new Date(t.trialDate) >= new Date() && t.status !== 'Cancelled'
  ).length;
  const openApplicationsCount = orgTrials.filter((t) => t.status === 'Open').length;

  const orgTrialIds = orgTrials.map((t) => t.id);
  const orgApps = (applications || []).filter((a) => orgTrialIds.includes(a.trialId));
  const awaitingReviewCount = orgApps.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Review'
  ).length;
  const totalApplicantsCount = orgApps.length;

  const handleConfirmCancel = () => {
    if (!cancelModalTrial) return;
    cancelTrial(cancelModalTrial.id, cancelReason);
    setCancelModalTrial(null);
    setFeedbackMsg(`Trial "${cancelModalTrial.title}" has been cancelled and applicants notified.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Role Switcher */}
        <TrialsRoleSwitcher />

        {/* Dashboard Header Bar */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 tracking-wide uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>Trial Organiser Directorate</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-['Barlow_Condensed',sans-serif]">
              Manage Your Trials & Scouting
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl">
              Conduct trial listings, screen candidate documents, assign evaluation scores, and publish official team selections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/trials/organiser/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] transition-all shadow-md shadow-[#B6FF3B]/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create New Trial</span>
            </Link>

            <Link
              to="/trials"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1B2530] hover:bg-[#253241] text-xs font-bold text-white border border-[#293442] transition-colors"
            >
              <span>Public Directory</span>
            </Link>
          </div>
        </div>

        {/* Flash Message */}
        {feedbackMsg && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
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

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#141B24] border border-[#293442] p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">My Trials</span>
              <Layers className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{totalTrialsCount}</div>
            <p className="text-[11px] text-slate-500">Total events listed</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Upcoming Trials</span>
              <Calendar className="w-4 h-4 text-[#B6FF3B]" />
            </div>
            <div className="text-3xl font-black text-[#B6FF3B] font-mono">{upcomingCount}</div>
            <p className="text-[11px] text-slate-500">Scheduled on calendar</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Applicants</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400 font-mono">{totalApplicantsCount}</div>
            <p className="text-[11px] text-slate-500">Across all trial events</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Awaiting Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">{awaitingReviewCount}</div>
            <p className="text-[11px] text-slate-500">Unprocessed dossiers</p>
          </div>
        </div>

        {/* MY TRIALS MANAGEMENT TABLE */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#293442] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                My Listed Sports Trials
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Select a trial to manage applicants, take attendance, or declare final results.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0F14] text-[#94A3B8] uppercase text-[10px] tracking-wider font-semibold border-b border-[#293442]">
                <tr>
                  <th className="py-3 px-4">Trial Details</th>
                  <th className="py-3 px-4">Sport & Discipline</th>
                  <th className="py-3 px-4">Venue & City</th>
                  <th className="py-3 px-4">Trial Date</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293442]">
                {orgTrials.map((t) => {
                  const tApps = (applications || []).filter((a) => a.trialId === t.id);
                  const shortlisted = tApps.filter(
                    (a) => a.status === 'Shortlisted' || a.status === 'Accepted'
                  ).length;

                  return (
                    <tr key={t.id} className="hover:bg-[#1B2530]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{t.title}</div>
                        <span className="text-[10px] text-[#00D4FF] font-mono">ID: {t.id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white">{t.sport}</span>
                        <div className="text-[11px] text-slate-400">{t.discipline}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{t.venue}</div>
                        <div className="text-[11px] text-slate-400">{t.city}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {t.trialDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-400">
                        {t.applicationDeadline}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white font-mono">{tApps.length} Total</div>
                        <span className="text-[10px] text-[#B6FF3B]">{shortlisted} Shortlisted</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'Open'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : t.status === 'Closing Soon'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : t.status === 'Results Published'
                              ? 'bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/trials/organiser/${t.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-[#00D4FF] text-[#0B0F14] font-bold text-[11px] hover:bg-[#33ddff] transition-colors"
                          >
                            Manage Applicants ({tApps.length})
                          </Link>

                          <Link
                            to={`/trials/${t.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-[#1B2530] text-slate-200 hover:text-white font-medium text-[11px] border border-[#293442]"
                          >
                            Public View
                          </Link>

                          {t.status === 'Open' && (
                            <button
                              type="button"
                              onClick={() => closeTrialApplications(t.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1B2530] hover:bg-[#253241] text-amber-400 font-medium text-[11px] border border-[#293442] cursor-pointer"
                            >
                              Close Reg
                            </button>
                          )}

                          {t.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => setCancelModalTrial(t)}
                              className="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-[11px] border border-red-500/30 cursor-pointer"
                            >
                              Cancel
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
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Cancel Trial Event</h3>
                <p className="text-xs text-slate-400">{cancelModalTrial.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cancelling this trial will mark the event status as Cancelled and immediately trigger cancellation alerts to all registered candidates.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-bold block">Reason for Cancellation:</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalTrial(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#1B2530] text-xs font-bold text-slate-300 border border-[#293442] hover:text-white cursor-pointer"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
