import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  Sliders,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Edit,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../components/tournaments/StatusBadge';
import ConfirmDialog from '../components/tournaments/ConfirmDialog';
import Toast from '../components/Toast';
import { formatDateDisplay } from '../data/tournamentsData';

export default function TournamentOrganiserDashboard({
  sharedTournamentsState,
  setSharedTournamentsState,
  currentDemoUser,
  tournamentRole = 'organiser'
}) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [tournamentToCancel, setTournamentToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Organiser's tournaments (or all tournaments for demo if viewing as organiser)
  const allTournaments = sharedTournamentsState.tournaments || [];
  const myTournaments = allTournaments.filter(
    (t) => t.organiserId === currentDemoUser?.id || currentDemoUser?.role === 'organiser'
  );

  // Compute live KPIs
  const totalTournamentsCount = myTournaments.length;
  const activeTournamentsCount = myTournaments.filter(
    (t) => t.status === 'Registration Open' || t.status === 'Ongoing'
  ).length;

  const myTournamentIds = myTournaments.map((t) => t.id);
  const myRegistrations = (sharedTournamentsState.registrations || []).filter((r) =>
    myTournamentIds.includes(r.tournamentId)
  );

  const pendingRegistrationsCount = myRegistrations.filter(
    (r) => r.registrationStatus === 'Submitted' || r.registrationStatus === 'Pending'
  ).length;

  const approvedParticipantsCount = myRegistrations
    .filter((r) => r.registrationStatus === 'Approved')
    .reduce((acc, r) => acc + (r.playerCount || 1), 0);

  const totalRecordedRevenue = myRegistrations
    .filter((r) => r.paymentStatus === 'Demo-paid')
    .reduce((acc, r) => acc + (r.amountPaid || 0), 0);

  // Status-dependent actions
  const handlePublishTournament = (tournament) => {
    // If organiser is not verified, status must be 'Pending Verification', never auto-verified!
    const newStatus = currentDemoUser?.verified ? 'Registration Open' : 'Pending Verification';

    setSharedTournamentsState((prev) => ({
      ...prev,
      tournaments: prev.tournaments.map((t) =>
        t.id === tournament.id ? { ...t, status: newStatus } : t
      )
    }));

    setToast({
      title: 'Tournament Published',
      message: currentDemoUser?.verified
        ? 'Tournament is now live and accepting registrations.'
        : 'Submitted for verification. Unverified organiser listings are placed in Pending Verification.',
      type: 'success'
    });
  };

  const handleCloseRegistration = (tournament) => {
    setSharedTournamentsState((prev) => ({
      ...prev,
      tournaments: prev.tournaments.map((t) =>
        t.id === tournament.id ? { ...t, status: 'Registration Closed' } : t
      )
    }));

    setToast({
      title: 'Registration Closed',
      message: 'Direct player entries closed. You can now draw brackets and generate fixtures.',
      type: 'info'
    });
  };

  const handleConfirmCancelTournament = () => {
    if (!tournamentToCancel) return;

    setSharedTournamentsState((prev) => ({
      ...prev,
      tournaments: prev.tournaments.map((t) =>
        t.id === tournamentToCancel.id ? { ...t, status: 'Cancelled' } : t
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Tournament Cancelled',
          message: `${tournamentToCancel.name} has been cancelled by organiser: ${cancellationReason || 'Unavoidable scheduling conflict.'}`,
          tournamentId: tournamentToCancel.id,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'warning',
          targetUserId: 'all'
        },
        ...prev.notifications
      ]
    }));

    setToast({
      title: 'Tournament Cancelled',
      message: 'All registered participants have been notified in-app.',
      type: 'warning'
    });
    setTournamentToCancel(null);
    setCancellationReason('');
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
      <div className="bg-[#141B24] border-b border-[#293442] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/tournaments"
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#E5C378]"
          >
            &larr; Back to Public Tournaments
          </Link>
          <Link
            to="/tournaments/organiser/create"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:brightness-110 text-[#0F141C] font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Tournament</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Title & Introduction */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#E5C378] text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Organiser Operations Suite</span>
          </div>
          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            Run Your Tournament.
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mt-1">
            Create events, manage registrations, publish schedules, and track tournament progress.
          </p>
        </div>

        {/* 6 KPI Stat Cards Computed from Data */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Total Events
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-white">
              {totalTournamentsCount}
            </div>
            <span className="text-[10px] text-slate-500">In database</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Active Events
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-[#E5C378]">
              {activeTournamentsCount}
            </div>
            <span className="text-[10px] text-slate-500">Live or Ongoing</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Pending Apps
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-amber-400">
              {pendingRegistrationsCount}
            </div>
            <span className="text-[10px] text-slate-500">Needs review</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Approved
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-sky-300">
              {approvedParticipantsCount}
            </div>
            <span className="text-[10px] text-slate-500">Athletes / Squads</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Matches
            </span>
            <div className="font-['Barlow_Condensed'] text-3xl font-black text-purple-400">
              {myTournaments.reduce((acc, t) => acc + (t.fixtures?.length || 0), 0)}
            </div>
            <span className="text-[10px] text-slate-500">Scheduled / Done</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Fees (Demo)
            </span>
            <div className="font-['Barlow_Condensed'] text-2xl font-black text-emerald-400 truncate">
              ₹{totalRecordedRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500">Recorded entry fees</span>
          </div>
        </div>

        {/* My Tournaments Table */}
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                Managed Tournaments
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Review applications, draw knockout/round-robin fixtures, enter scores, and manage tournament states.
              </p>
            </div>

            <Link
              to="/tournaments/organiser/create"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm self-start sm:self-auto transition-all"
            >
              + Create Tournament
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1B2530] border-b border-[#293442] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  <th className="py-3 px-4">Tournament</th>
                  <th className="py-3 px-4">Sport</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Registrations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293442]/60">
                {myTournaments.map((t) => {
                  const regs = (sharedTournamentsState.registrations || []).filter(
                    (r) => r.tournamentId === t.id && (r.registrationStatus === 'Approved' || r.registrationStatus === 'Submitted')
                  );

                  return (
                    <tr key={t.id} className="hover:bg-[#1B2530]/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <Link
                          to={`/tournaments/organiser/${t.id}`}
                          className="hover:text-[#E5C378] transition-colors font-bold block"
                        >
                          {t.name}
                        </Link>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {t.venue}, {t.city}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{t.sport}</td>
                      <td className="py-3.5 px-4 text-slate-300">{formatDateDisplay(t.startDate)}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">
                          {regs.length} / {t.capacity}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {t.feeUnit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge type="tournament" status={t.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                          {/* Manage Link */}
                          <Link
                            to={`/tournaments/organiser/${t.id}`}
                            className="px-2.5 py-1 text-xs font-bold bg-[#1B2530] text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 rounded-lg transition-colors"
                          >
                            Manage
                          </Link>

                          {/* Status specific actions */}
                          {t.status === 'Draft' && (
                            <button
                              type="button"
                              onClick={() => handlePublishTournament(t)}
                              className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] rounded-lg hover:brightness-110 cursor-pointer shadow-sm"
                            >
                              Publish
                            </button>
                          )}

                          {t.status === 'Registration Open' && (
                            <button
                              type="button"
                              onClick={() => handleCloseRegistration(t)}
                              className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg cursor-pointer"
                            >
                              Close Reg
                            </button>
                          )}

                          {t.status !== 'Cancelled' && t.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => setTournamentToCancel(t)}
                              className="px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/30 cursor-pointer"
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

      {/* Cancellation Dialog */}
      {tournamentToCancel && (
        <ConfirmDialog
          isOpen={Boolean(tournamentToCancel)}
          title="Cancel Tournament Event"
          message={`Are you sure you want to cancel "${tournamentToCancel.name}"? This action cannot be undone.`}
          confirmLabel="Confirm Cancellation"
          isDestructive={true}
          onConfirm={handleConfirmCancelTournament}
          onCancel={() => setTournamentToCancel(null)}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Reason for Cancellation (Notified to Registrants) *
            </label>
            <input
              type="text"
              required
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Venue maintenance / severe weather warning"
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#293442] focus:border-red-500 rounded-xl text-xs text-white outline-none"
            />
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}
