import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Ban,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Users
} from 'lucide-react';
import StatusBadge from '../components/tournaments/StatusBadge';
import ConfirmDialog from '../components/tournaments/ConfirmDialog';
import Toast from '../components/Toast';
import {
  formatDateDisplay,
  transitionRegistration
} from '../data/tournamentsData';

export default function TournamentMyRegistrations({
  sharedTournamentsState,
  setSharedTournamentsState,
  currentDemoUser,
  tournamentRole = 'player'
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'withdrawn'
  const [selectedRegForWithdraw, setSelectedRegForWithdraw] = useState(null);
  const [selectedRegForMissingInfo, setSelectedRegForMissingInfo] = useState(null);
  const [missingInfoInput, setMissingInfoInput] = useState('');
  const [toast, setToast] = useState(null);

  // Filter registrations relevant to current user (or show all sample registrations for demo preview)
  const allRegistrations = sharedTournamentsState.registrations || [];

  const filteredRegistrations = allRegistrations.filter((r) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'pending') return r.registrationStatus === 'Pending' || r.registrationStatus === 'Submitted';
    if (filterTab === 'approved') return r.registrationStatus === 'Approved';
    if (filterTab === 'withdrawn') return r.registrationStatus === 'Withdrawn' || r.registrationStatus === 'Rejected';
    return true;
  });

  // Handle Withdraw confirmation
  const handleConfirmWithdraw = () => {
    if (!selectedRegForWithdraw) return;

    const res = transitionRegistration(
      selectedRegForWithdraw,
      'Withdrawn',
      'Withdrawn voluntarily by registrant'
    );

    if (!res.success) {
      setToast({ title: 'Withdrawal Refused', message: res.error, type: 'error' });
      setSelectedRegForWithdraw(null);
      return;
    }

    setSharedTournamentsState((prev) => ({
      ...prev,
      registrations: prev.registrations.map((r) =>
        r.id === selectedRegForWithdraw.id ? res.registration : r
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Registration Withdrawn',
          message: `Your registration ${selectedRegForWithdraw.id} for ${selectedRegForWithdraw.tournamentName} has been withdrawn. Refund processing initiated per policy.`,
          tournamentId: selectedRegForWithdraw.tournamentId,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'warning',
          targetUserId: currentDemoUser?.id
        },
        ...prev.notifications
      ]
    }));

    setToast({
      title: 'Registration Withdrawn',
      message: 'Spot has been freed. Simulated refund status set to Refund Pending.',
      type: 'info'
    });
    setSelectedRegForWithdraw(null);
  };

  // Handle Submit Missing Info
  const handleConfirmSubmitMissingInfo = () => {
    if (!selectedRegForMissingInfo || !missingInfoInput.trim()) return;

    const res = transitionRegistration(selectedRegForMissingInfo, 'Submitted');
    if (!res.success) {
      setToast({ title: 'Error', message: res.error, type: 'error' });
      return;
    }

    setSharedTournamentsState((prev) => ({
      ...prev,
      registrations: prev.registrations.map((r) =>
        r.id === selectedRegForMissingInfo.id
          ? {
              ...res.registration,
              missingInfoReason: '',
              documents: [
                ...(r.documents || []),
                { name: `clarification_${Date.now()}.pdf`, verified: false, note: missingInfoInput }
              ]
            }
          : r
      )
    }));

    setToast({
      title: 'Information Submitted',
      message: 'Your updated details have been submitted to the tournament organiser for review.',
      type: 'success'
    });
    setSelectedRegForMissingInfo(null);
    setMissingInfoInput('');
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

      {/* Top Header */}
      <div className="bg-[#141B24] border-b border-[#293442] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/tournaments"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#E5C378]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tournaments</span>
          </Link>
          <span className="text-xs text-slate-400">
            Active persona: <strong className="text-white">{currentDemoUser?.name}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            My Tournament Registrations
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Track entry approval statuses, payment records, match schedules, and withdraw when necessary.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#293442] overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Entries (${allRegistrations.length})` },
            { id: 'approved', label: 'Approved' },
            { id: 'pending', label: 'Pending Review / Info' },
            { id: 'withdrawn', label: 'Withdrawn / Rejected' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-[#141B24] text-[#E5C378] border border-[#293442] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Registrations List (Desktop Table / Mobile Cards) */}
        {filteredRegistrations.length === 0 ? (
          <div className="py-16 text-center text-[#94A3B8] text-sm bg-[#141B24]/90 border border-[#293442] rounded-2xl backdrop-blur-sm">
            No registrations found in this category.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden lg:block bg-[#141B24]/90 border border-[#293442] rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#1B2530] border-b border-[#293442] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    <th className="py-3 px-4 w-32">Reg ID</th>
                    <th className="py-3 px-4">Tournament</th>
                    <th className="py-3 px-4">Entrant</th>
                    <th className="py-3 px-4">Entry Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293442]/60">
                  {filteredRegistrations.map((reg) => {
                    const isWithdrawable = ['Submitted', 'Pending', 'Waitlisted', 'Approved'].includes(
                      reg.registrationStatus
                    );

                    return (
                      <tr key={reg.id} className="hover:bg-[#1B2530]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#E5C378]">
                          {reg.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            to={`/tournaments/${reg.tournamentId}`}
                            className="font-bold text-white hover:text-[#E5C378] transition-colors line-clamp-1"
                          >
                            {reg.tournamentName}
                          </Link>
                          <span className="text-[11px] text-slate-500 block">
                            Submitted {formatDateDisplay(reg.submittedOn)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{reg.entrantName}</div>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {reg.participationType} &bull; {reg.playerCount} player{reg.playerCount === 1 ? '' : 's'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {reg.amountPaid === 0 ? 'FREE' : `₹${reg.amountPaid.toLocaleString('en-IN')}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge type="registration" status={reg.registrationStatus} />
                          {reg.missingInfoReason && (
                            <div className="text-[11px] text-amber-400 mt-1 max-w-[200px] truncate" title={reg.missingInfoReason}>
                              {reg.missingInfoReason}
                            </div>
                          )}
                          {reg.rejectionReason && (
                            <div className="text-[11px] text-red-400 mt-1 max-w-[200px] truncate" title={reg.rejectionReason}>
                              {reg.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge type="payment" status={reg.paymentStatus} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {reg.registrationStatus === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRegForMissingInfo(reg);
                                  setMissingInfoInput('');
                                }}
                                className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500 hover:text-black cursor-pointer"
                              >
                                Fix Info
                              </button>
                            )}

                            <Link
                              to={`/tournaments/${reg.tournamentId}`}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#1B2530] text-slate-300 hover:text-white border border-[#293442] rounded-lg"
                            >
                              Details
                            </Link>

                            {isWithdrawable && (
                              <button
                                type="button"
                                onClick={() => setSelectedRegForWithdraw(reg)}
                                className="px-2.5 py-1 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 rounded-lg cursor-pointer"
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

            {/* Mobile Stacked Cards */}
            <div className="lg:hidden space-y-4">
              {filteredRegistrations.map((reg) => {
                const isWithdrawable = ['Submitted', 'Pending', 'Waitlisted', 'Approved'].includes(
                  reg.registrationStatus
                );

                return (
                  <div key={reg.id} className="p-4 bg-[#141B24]/90 border border-[#293442] rounded-2xl space-y-3 shadow-md backdrop-blur-sm">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-[#293442]">
                      <span className="font-mono font-bold text-[#E5C378]">{reg.id}</span>
                      <StatusBadge type="registration" status={reg.registrationStatus} />
                    </div>

                    <div>
                      <Link
                        to={`/tournaments/${reg.tournamentId}`}
                        className="font-bold text-base text-white hover:text-[#E5C378] block leading-tight"
                      >
                        {reg.tournamentName}
                      </Link>
                      <div className="text-xs text-slate-400 mt-1">
                        Entrant: <strong className="text-white">{reg.entrantName}</strong> ({reg.participationType})
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#94A3B8]">Payment:</span>
                      <StatusBadge type="payment" status={reg.paymentStatus} />
                    </div>

                    {reg.missingInfoReason && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                        <strong>Requested Info:</strong> {reg.missingInfoReason}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#293442]">
                      {reg.registrationStatus === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRegForMissingInfo(reg);
                            setMissingInfoInput('');
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg cursor-pointer"
                        >
                          Provide Missing Info
                        </button>
                      )}
                      <Link
                        to={`/tournaments/${reg.tournamentId}`}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#1B2530] text-slate-300 border border-[#293442] rounded-lg"
                      >
                        View Tournament
                      </Link>
                      {isWithdrawable && (
                        <button
                          type="button"
                          onClick={() => setSelectedRegForWithdraw(reg)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Withdraw */}
      {selectedRegForWithdraw && (
        <ConfirmDialog
          isOpen={Boolean(selectedRegForWithdraw)}
          title="Confirm Registration Withdrawal"
          message={`Are you sure you want to withdraw ${selectedRegForWithdraw.entrantName} from ${selectedRegForWithdraw.tournamentName}?`}
          confirmLabel="Yes, Withdraw Entry"
          isDestructive={true}
          onConfirm={handleConfirmWithdraw}
          onCancel={() => setSelectedRegForWithdraw(null)}
        >
          <div className="p-3 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-400 block uppercase tracking-wider">
              Refund Schedule Note
            </span>
            <p>
              Refund calculations are simulated strictly per the tournament policy. Your spot will immediately be released to waitlisted squads.
            </p>
          </div>
        </ConfirmDialog>
      )}

      {/* Dialog for Providing Missing Info */}
      {selectedRegForMissingInfo && (
        <ConfirmDialog
          isOpen={Boolean(selectedRegForMissingInfo)}
          title="Submit Requested Information"
          message={`Organiser requested clarification: "${selectedRegForMissingInfo.missingInfoReason}"`}
          confirmLabel="Submit Details"
          onConfirm={handleConfirmSubmitMissingInfo}
          onCancel={() => setSelectedRegForMissingInfo(null)}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Response / Document Note
            </label>
            <textarea
              rows={3}
              value={missingInfoInput}
              onChange={(e) => setMissingInfoInput(e.target.value)}
              placeholder="e.g. Scanned official seal from College Principal attached; corrected jersey number list provided."
              className="w-full p-2.5 bg-[#0B0F14] border border-[#293442] focus:border-[#D4AF37] rounded-xl text-xs text-white outline-none"
            />
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}
