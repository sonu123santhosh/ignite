import React from 'react';
import { X, UserCheck, ShieldAlert, Users, Clock, AlertCircle } from 'lucide-react';
import { DEMO_USERS } from '../../data/tournamentsData';

export default function DemoToolsModal({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  currentRole,
  onRoleChange,
  onSimulateAcceptInvite,
  onSimulateDeadlinePass,
  onSimulateFillCapacity,
  onShowToast
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-tools-title"
    >
      <div className="bg-[#141B24] border border-[#293442] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#293442] bg-[#0B0F14]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#B6FF3B]/10 text-[#B6FF3B]">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 id="demo-tools-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                Demo Testing &amp; Simulation Tools
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Switch active demo personas and simulate edge cases for permissions and rules.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close demo tools modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Persona Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2.5">
              Select Active Demo Persona (Tests Permission Matrix)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_USERS.map((user) => {
                const isSelected = currentUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      onSelectUser(user);
                      if (user.role === 'organiser') {
                        onRoleChange('organiser');
                      } else if (user.role === 'captain') {
                        onRoleChange('captain');
                      } else {
                        onRoleChange('player');
                      }
                      onShowToast?.({
                        title: 'Persona Switched',
                        message: `Now acting as ${user.name} (${user.role.toUpperCase()}).`,
                        type: 'info'
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-white shadow-[0_0_15px_rgba(182,255,59,0.15)]'
                        : 'bg-[#1B2530] border-[#293442] text-[#F5F7FA] hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-[#B6FF3B] text-[#0B0F14]'
                          : 'bg-[#0B0F14] text-[#B6FF3B] border border-[#293442]'
                      }`}
                    >
                      {user.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white truncate">{user.name}</span>
                        {user.verified && (
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1 rounded font-bold">
                            VERIFIED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] capitalize">{user.role} &bull; {user.college || user.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-[#94A3B8] italic">
              Try switching to an organiser to edit another organiser&apos;s tournament to see permission refusal messages.
            </p>
          </div>

          {/* Section 2: Quick Event Simulations */}
          <div className="pt-4 border-t border-[#293442]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2.5">
              Simulate Real-World Scenarios
            </label>
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#1B2530] border border-[#293442] rounded-xl">
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-[#B6FF3B] mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Simulate Player Accepting Invite</h4>
                    <p className="text-[11px] text-[#94A3B8]">
                      Converts a pending team member invitation (e.g., Tushar Mane) to &quot;Joined&quot;.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSimulateAcceptInvite?.();
                    onShowToast?.({
                      title: 'Invite Accepted',
                      message: 'Player invite simulated: Tushar Mane has joined Fergusson Strikers squad.',
                      type: 'success'
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-[#141B24] hover:bg-[#B6FF3B] hover:text-[#0B0F14] text-[#B6FF3B] border border-[#B6FF3B]/40 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Accept Invite
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#1B2530] border border-[#293442] rounded-xl">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Simulate Registration Deadline Passing</h4>
                    <p className="text-[11px] text-[#94A3B8]">
                      Sets the deadline for Pune Inter-College Football Cup to yesterday to verify deadline recheck blocking.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSimulateDeadlinePass?.();
                    onShowToast?.({
                      title: 'Deadline Expired',
                      message: 'Registration deadline for Pune Inter-College Football Cup simulated as passed.',
                      type: 'warning'
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-[#141B24] hover:bg-amber-400 hover:text-[#0B0F14] text-amber-400 border border-amber-400/40 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Expire Deadline
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#1B2530] border border-[#293442] rounded-xl">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#00D4FF] mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Simulate Capacity Filling (Waitlist Test)</h4>
                    <p className="text-[11px] text-[#94A3B8]">
                      Fills quota for Pune Inter-College Football Cup to test waitlist or direct capacity refusal.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSimulateFillCapacity?.();
                    onShowToast?.({
                      title: 'Capacity Filled',
                      message: 'Capacity has been reached. Subsequent registrations will enter waitlist or be rejected.',
                      type: 'info'
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-[#141B24] hover:bg-[#00D4FF] hover:text-[#0B0F14] text-[#00D4FF] border border-[#00D4FF]/40 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Fill Capacity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#293442] bg-[#0B0F14] flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8]">
            Current user: <strong className="text-white">{currentUser?.name}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs rounded-lg hover:bg-[#a3ee28] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
