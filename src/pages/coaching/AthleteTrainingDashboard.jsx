import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, XCircle, ChevronRight,
  Bookmark, Award, Star, ArrowLeft, RefreshCw, MessageSquare, Phone,
  FileText, ShieldCheck, Dumbbell, MapPin, Search, UserCheck, Trash2, Heart
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import CoachingRoleSwitcher from '../../components/coaching/CoachingRoleSwitcher';

export default function AthleteTrainingDashboard() {
  const {
    currentUser,
    academies,
    coaches,
    programmes,
    batches,
    trialBookings,
    cancelTrialBooking,
    enrolments,
    cancelEnrolment,
    favourites,
    toggleFavourite,
    notifications,
    dismissNotification,
  } = useCoaching();

  // Filter states
  const [trialFilter, setTrialFilter] = useState('all'); // all | pending | confirmed | completed | cancelled
  const [progFilter, setProgFilter] = useState('all'); // all | active | pending | completed

  // Modals / active actions
  const [activeModal, setActiveModal] = useState(null); // { type: 'schedule'|'cancelTrial'|'cancelEnrol'|'contact'|'payment', data: any }
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Safe helpers for matching user fields
  const getEnrolStatus = (e) => e.enrolmentStatus || e.status || 'Active';
  const getTrialStatus = (t) => t.status || 'Pending';

  // Derived user data - matches current user persona or shows relevant demo data
  const userEnrolments = (enrolments || []).filter(e => {
    const name = e.athleteName || e.studentName || '';
    const email = e.athleteEmail || e.contactEmail || '';
    const currName = currentUser?.name || '';
    const currEmail = currentUser?.email || '';
    return (name && currName && name.toLowerCase() === currName.toLowerCase()) ||
           (email && currEmail && email.toLowerCase() === currEmail.toLowerCase()) ||
           !currName;
  });

  const userTrials = (trialBookings || []).filter(t => {
    const name = t.athleteName || t.participantName || '';
    const email = t.athleteEmail || t.contactEmail || '';
    const currName = currentUser?.name || '';
    const currEmail = currentUser?.email || '';
    return (name && currName && name.toLowerCase() === currName.toLowerCase()) ||
           (email && currEmail && email.toLowerCase() === currEmail.toLowerCase()) ||
           !currName;
  });

  // Active / pending counts
  const activeProgCount = userEnrolments.filter(e => {
    const s = getEnrolStatus(e);
    return s === 'Active' || s === 'Approved';
  }).length;
  const pendingEnrolCount = userEnrolments.filter(e => {
    const s = getEnrolStatus(e);
    return s === 'Pending Approval' || s === 'Waitlisted';
  }).length;
  const pendingTrialCount = userTrials.filter(t => {
    const s = getTrialStatus(t);
    return s === 'Pending' || s === 'Confirmed';
  }).length;
  const savedAcademiesList = (academies || []).filter(a => (favourites || []).includes(a.id));

  // Filtered trial bookings
  const filteredTrials = userTrials.filter(t => {
    if (trialFilter === 'all') return true;
    const s = getTrialStatus(t);
    return s.toLowerCase() === trialFilter.toLowerCase();
  });

  // Filtered programmes
  const filteredProgrammes = userEnrolments.filter(e => {
    if (progFilter === 'all') return true;
    const s = getEnrolStatus(e);
    if (progFilter === 'active') return s === 'Active' || s === 'Approved';
    if (progFilter === 'pending') return s === 'Pending Approval' || s === 'Waitlisted';
    if (progFilter === 'completed') return s === 'Completed' || s === 'Cancelled';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
      case 'Confirmed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"><CheckCircle2 className="w-3.5 h-3.5" /> {status}</span>;
      case 'Pending':
      case 'Pending Approval':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"><Clock className="w-3.5 h-3.5" /> {status}</span>;
      case 'Waitlisted':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30"><AlertCircle className="w-3.5 h-3.5" /> Waitlisted</span>;
      case 'Cancelled':
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const handleCancelTrial = (bookingId) => {
    cancelTrialBooking(bookingId);
    setActiveModal(null);
    setFeedbackMsg('Trial booking has been cancelled successfully.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleCancelEnrolment = (enrolmentId) => {
    cancelEnrolment(enrolmentId);
    setActiveModal(null);
    setFeedbackMsg('Enrolment cancellation request recorded.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pb-24">
      {/* Top Banner & Header */}
      <div className="bg-[#141B24] border-b border-[#293442]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link to="/coaching" className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#B6FF3B] transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Discovery
                </Link>
                <span className="text-slate-600">/</span>
                <span className="text-xs text-[#B6FF3B] font-medium">Athlete Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F5F7FA] tracking-tight flex items-center gap-3">
                My Training <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30">Athlete Portal</span>
              </h1>
              <p className="text-sm text-[#94A3B8] mt-1">
                Welcome back, <strong className="text-white">{currentUser?.name}</strong>. Monitor your active training batches, upcoming trial workouts, and academy favourites.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CoachingRoleSwitcher />
              <Link
                to="/coaching"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider hover:bg-[#a6ec31] transition-all shadow-lg shadow-[#B6FF3B]/10"
              >
                <Search className="w-4 h-4" /> Discover Academies
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Flash Message */}
        {feedbackMsg && (
          <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-sm flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {feedbackMsg}
            </span>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Notifications Bar */}
        {notifications.length > 0 && (
          <div className="bg-[#1B2530] border border-[#293442] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-[#00D4FF] tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Recent Alerts & Updates
              </span>
              <span className="text-[11px] text-[#94A3B8]">{notifications.length} unread</span>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 2).map((n) => (
                <div key={n.id} className="flex items-center justify-between text-xs bg-[#141B24] p-2.5 rounded-xl border border-[#293442]">
                  <span className="text-slate-200">{n.message}</span>
                  <button onClick={() => dismissNotification(n.id)} className="text-slate-500 hover:text-white text-[11px] ml-4 shrink-0">
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#94A3B8]">Active Programmes</span>
              <Award className="w-4 h-4 text-[#B6FF3B]" />
            </div>
            <div className="text-2xl font-black text-white">{activeProgCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Confirmed training</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#94A3B8]">Upcoming Sessions</span>
              <Calendar className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div className="text-2xl font-black text-white">4</div>
            <p className="text-[11px] text-slate-500 mt-1">Next: Tomorrow 6:00 AM</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#94A3B8]">Pending Trials</span>
              <Clock className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-white">{pendingTrialCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting completion</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#94A3B8]">Pending Enrolments</span>
              <AlertCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{pendingEnrolCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">In review or waitlist</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#94A3B8]">Saved Academies</span>
              <Bookmark className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl font-black text-white">{favourites.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Shortlisted centres</p>
          </div>
        </div>

        {/* Section 1: My Coaching Programmes */}
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#293442] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#B6FF3B]" /> My Coaching Programmes
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                All training batches you have applied for, active cohorts, and completion statuses.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {['all', 'active', 'pending', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProgFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    progFilter === tab
                      ? 'bg-[#B6FF3B] text-[#0B0F14]'
                      : 'bg-[#1B2530] text-[#94A3B8] hover:text-white border border-[#293442]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredProgrammes.length === 0 ? (
            <div className="text-center py-12 bg-[#0B0F14]/50 rounded-xl border border-dashed border-[#293442]">
              <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No programmes found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                You haven&apos;t enrolled in any coaching batches under this filter yet.
              </p>
              <Link
                to="/coaching"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B2530] hover:bg-[#22303e] text-xs font-bold text-[#B6FF3B] border border-[#293442]"
              >
                Browse Training Programmes
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#1B2530] text-[#94A3B8] uppercase text-[10px] tracking-wider font-semibold border-b border-[#293442]">
                  <tr>
                    <th className="py-3 px-4">Programme & Academy</th>
                    <th className="py-3 px-4">Coach</th>
                    <th className="py-3 px-4">Batch Timing</th>
                    <th className="py-3 px-4">Monthly Fee</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Enrolment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293442]">
                  {filteredProgrammes.map((enrol) => {
                    const prog = programmes.find(p => p.id === enrol.programmeId);
                    const acad = academies.find(a => a.id === enrol.academyId);
                    const coach = coaches.find(c => c.id === enrol.coachId);
                    const batch = batches.find(b => b.id === enrol.batchId);

                    return (
                      <tr key={enrol.id} className="hover:bg-[#1B2530]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{enrol.programmeName}</div>
                          <div className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#B6FF3B]" /> {acad?.name || enrol.academyName}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-200">{coach?.name || enrol.coachName || 'Assigned Staff'}</span>
                          {coach?.verifiedBadge && (
                            <span className="text-[10px] ml-1 text-[#00D4FF]">✓ Verified</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{batch?.timing || enrol.batchDays || enrol.batchTiming || 'Morning Session'}</div>
                          <div className="text-[10px] text-slate-400">{batch?.days ? batch.days.join(', ') : 'Mon / Wed / Fri'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ₹{(enrol.feeMonthly || enrol.monthlyFee || prog?.monthlyFee || 2500).toLocaleString('en-IN')}/mo
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            enrol.paymentStatus === 'Paid' ? 'bg-[#22C55E]/15 text-[#22C55E]' :
                            enrol.paymentStatus === 'Pending' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {enrol.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(getEnrolStatus(enrol))}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveModal({ type: 'schedule', data: { enrol, batch, acad, coach } })}
                              className="px-2.5 py-1 rounded-lg bg-[#1B2530] hover:bg-[#253241] text-slate-200 font-medium text-[11px] border border-[#293442]"
                            >
                              Schedule
                            </button>
                            <button
                              onClick={() => setActiveModal({ type: 'contact', data: { enrol, coach, acad } })}
                              className="px-2.5 py-1 rounded-lg bg-[#1B2530] hover:bg-[#253241] text-[#00D4FF] font-medium text-[11px] border border-[#293442]"
                            >
                              Contact
                            </button>
                            {enrol.status !== 'Cancelled' && (
                              <button
                                onClick={() => setActiveModal({ type: 'cancelEnrol', data: enrol })}
                                className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-[11px] border border-red-500/30"
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
          )}
        </div>

        {/* Section 2: My Trial Bookings */}
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#293442] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00D4FF]" /> My Trial Bookings
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Trial sessions allow you to test coaching drills, equipment, and coach compatibility.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTrialFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    trialFilter === tab
                      ? 'bg-[#00D4FF] text-[#0B0F14]'
                      : 'bg-[#1B2530] text-[#94A3B8] hover:text-white border border-[#293442]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredTrials.length === 0 ? (
            <div className="text-center py-12 bg-[#0B0F14]/50 rounded-xl border border-dashed border-[#293442]">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No trial bookings</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                You do not have any trial sessions under &quot;{trialFilter}&quot;. Book a free or subsidized trial to try an academy!
              </p>
              <Link
                to="/coaching"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B2530] hover:bg-[#22303e] text-xs font-bold text-[#00D4FF] border border-[#293442]"
              >
                Find Free Trial Academies
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#1B2530] text-[#94A3B8] uppercase text-[10px] tracking-wider font-semibold border-b border-[#293442]">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Academy & Programme</th>
                    <th className="py-3 px-4">Coach</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293442]">
                  {filteredTrials.map((trial) => {
                    const acad = academies.find(a => a.id === trial.academyId);
                    const coach = coaches.find(c => c.id === trial.coachId);

                    return (
                      <tr key={trial.id} className="hover:bg-[#1B2530]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                          {trial.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{acad?.name || trial.academyName}</div>
                          <div className="text-[11px] text-[#94A3B8]">{trial.programmeName || 'General Trial Session'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          {coach?.name || trial.coachName || 'Assigned Academy Coach'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{trial.date}</div>
                          <div className="text-[11px] text-[#00D4FF]">{trial.time || trial.timeSlot || '07:00'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {(trial.fee === 0 || trial.trialFee === 0 || trial.isFree) ? (
                            <span className="font-bold text-[#B6FF3B]">Free Trial</span>
                          ) : (
                            <span className="font-bold text-white">₹{trial.fee || trial.trialFee || 200}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(getTrialStatus(trial))}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveModal({ type: 'trialDetails', data: trial })}
                              className="px-2.5 py-1 rounded-lg bg-[#1B2530] hover:bg-[#253241] text-slate-200 font-medium text-[11px] border border-[#293442]"
                            >
                              Details
                            </button>
                            {trial.status === 'Pending' || trial.status === 'Confirmed' ? (
                              <button
                                onClick={() => setActiveModal({ type: 'cancelTrial', data: trial })}
                                className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-[11px] border border-red-500/30"
                              >
                                Cancel
                              </button>
                            ) : null}
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

        {/* Section 3: Favourite Academies & Coaches */}
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#293442] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-pink-400" /> Saved Coaching Centres ({savedAcademiesList.length})
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Quick access to academies you have bookmarked for easy comparison.
              </p>
            </div>
            <Link to="/coaching" className="text-xs text-[#B6FF3B] hover:underline font-semibold">
              Browse More Academies →
            </Link>
          </div>

          {savedAcademiesList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              You haven&apos;t saved any coaching centres yet. Click the heart icon on any academy card to save it here.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedAcademiesList.map((acad) => (
                <div key={acad.id} className="bg-[#1B2530] border border-[#293442] rounded-xl p-4 flex flex-col justify-between hover:border-[#B6FF3B]/40 transition-colors">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30">
                        {acad.sports?.join(', ') || 'Multi-Sport'}
                      </span>
                      <button
                        onClick={() => toggleFavourite(acad.id)}
                        className="text-pink-400 hover:text-pink-300"
                        title="Remove favourite"
                      >
                        <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                      </button>
                    </div>
                    <h3 className="font-bold text-white text-base leading-snug">{acad.name}</h3>
                    <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#B6FF3B]" /> {acad.locality}, {acad.city}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#293442]/60 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400">Monthly from</span>
                      <div className="font-bold font-mono text-sm text-white">₹{acad.monthlyFee?.toLocaleString('en-IN')}</div>
                    </div>
                    <Link
                      to={`/coaching/${acad.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider hover:bg-[#a6ec31] transition-colors"
                    >
                      View Academy
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Action Modals --- */}

      {/* Schedule Detail Modal */}
      {activeModal?.type === 'schedule' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#293442] pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B6FF3B]" /> Batch Weekly Schedule
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Programme:</span>
                <p className="font-bold text-white text-sm">{activeModal.data.enrol.programmeName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-[#1B2530] p-3 rounded-xl border border-[#293442]">
                <div>
                  <span className="text-slate-400">Timing:</span>
                  <p className="font-bold text-[#00D4FF]">{activeModal.data.batch?.timing || activeModal.data.enrol.batchTiming}</p>
                </div>
                <div>
                  <span className="text-slate-400">Days:</span>
                  <p className="font-bold text-white">{activeModal.data.batch?.days ? activeModal.data.batch.days.join(', ') : 'Mon, Wed, Fri'}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Venue / Location:</span>
                <p className="text-slate-200 mt-0.5">{activeModal.data.acad?.address || 'Main Training Ground'}</p>
              </div>
              <div>
                <span className="text-slate-400">Lead Coach:</span>
                <p className="text-slate-200 mt-0.5">{activeModal.data.coach?.name || 'Academy Assigned Specialist'}</p>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 rounded-xl bg-[#1B2530] hover:bg-[#22303e] text-xs font-bold text-white border border-[#293442]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Coach Modal */}
      {activeModal?.type === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#293442] pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00D4FF]" /> Contact Training Team
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                You can reach out directly to the academy management for queries regarding gear, attendance notes, or schedule adjustments.
              </p>
              <div className="bg-[#1B2530] p-3 rounded-xl border border-[#293442] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Academy Phone:</span>
                  <span className="font-mono text-[#B6FF3B] font-bold">{activeModal.data.acad?.phone || '+91 98234 11002'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200">{activeModal.data.acad?.email || 'coaching@sportlink.demo'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Response Time:</span>
                  <span className="text-slate-300">Typically within 2-4 hours</span>
                </div>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px]">
                In-app direct messaging with individual coaches will be enabled in the upcoming communications release.
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#00D4FF] text-[#0B0F14] font-bold text-xs uppercase tracking-wider hover:bg-[#33ddff]"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {(activeModal?.type === 'cancelTrial' || activeModal?.type === 'cancelEnrol') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Confirm Cancellation
                </h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your{' '}
              {activeModal.type === 'cancelTrial' ? 'trial class booking' : 'programme enrolment request'}?
              Your reserved seat will immediately be released to other prospective athletes on the waitlist.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#1B2530] text-slate-300 hover:text-white font-semibold text-xs border border-[#293442]"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  if (activeModal.type === 'cancelTrial') {
                    handleCancelTrial(activeModal.data.id);
                  } else {
                    handleCancelEnrolment(activeModal.data.id);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
