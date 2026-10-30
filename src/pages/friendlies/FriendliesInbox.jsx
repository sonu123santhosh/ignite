import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Inbox, Send, Swords, Filter } from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';
import InvitationThread from '../../components/friendlies/InvitationThread';
import Toast from '../../components/Toast';

export default function FriendliesInbox() {
  const {
    currentActor,
    invitations,
    respondInvitation
  } = useFriendlies();

  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Filter invitations for current captain
  const myInvitations = invitations.filter((i) => {
    if (activeTab === 'received') {
      return i.recipientTeamId === currentActor?.teamId || i.recipientCollegeId === currentActor?.collegeId;
    } else {
      return i.senderTeamId === currentActor?.teamId || i.senderCollegeId === currentActor?.collegeId;
    }
  });

  const filteredList = myInvitations.filter((i) => {
    if (statusFilter === 'all') return true;
    return i.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleAccept = (invId) => {
    const res = respondInvitation(invId, 'ACCEPT');
    if (res.success) {
      setToast({
        title: 'Match Confirmed!',
        message: 'You have accepted the terms. Match is confirmed on the schedule!',
        type: 'success'
      });
    } else {
      setToast({ title: 'Error', message: res.error, type: 'error' });
    }
  };

  const handleDecline = (invId, payload) => {
    const res = respondInvitation(invId, 'DECLINE', payload);
    if (res.success) {
      setToast({
        title: 'Invitation Declined',
        message: 'The rival captain has been notified.',
        type: 'info'
      });
    }
  };

  const handleCounter = (invId, payload) => {
    const res = respondInvitation(invId, 'COUNTER', payload);
    if (res.success) {
      setToast({
        title: 'Counter-Proposal Sent',
        message: 'Updated terms submitted to opponent captain.',
        type: 'warning'
      });
    }
  };

  const handleWithdraw = (invId) => {
    const res = respondInvitation(invId, 'WITHDRAW');
    if (res.success) {
      setToast({
        title: 'Invitation Withdrawn',
        message: 'Proposal withdrawn.',
        type: 'info'
      });
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFFFFF] pb-24">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Bar */}
      <div className="bg-[#0c1629]/90 border-b border-sky-500/20 py-4 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link
            to="/friendlies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Matches</span>
          </Link>
          <span className="text-xs text-slate-400">
            Inbox for: <strong className="text-white">{currentActor?.name}</strong> ({currentActor?.teamName})
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            Match Invitations Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Negotiate match dates, review counter-proposals, and confirm friendly exhibition fixtures.
          </p>
        </div>

        {/* Tab Controls: Received vs Sent */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-500/20 pb-3">
          <div className="inline-flex p-1 bg-[#0c1629]/80 border border-sky-500/20 rounded-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Received Challenges</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sent'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Sent Challenges</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white outline-none cursor-pointer focus:border-sky-400"
            >
              <option value="all" className="bg-[#0c1629] text-white">All</option>
              <option value="pending" className="bg-[#0c1629] text-white">Pending</option>
              <option value="counterproposal received" className="bg-[#0c1629] text-white">Counterproposal Received</option>
              <option value="confirmed" className="bg-[#0c1629] text-white">Confirmed</option>
              <option value="declined" className="bg-[#0c1629] text-white">Declined</option>
              <option value="expired" className="bg-[#0c1629] text-white">Expired</option>
              <option value="withdrawn" className="bg-[#0c1629] text-white">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* List of Invitation Threads */}
        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm bg-[#0c1629]/80 border border-sky-500/20 rounded-2xl space-y-3 backdrop-blur-xl">
            <Swords className="w-8 h-8 text-sky-400/50 mx-auto" />
            <p>No invitations found in this tab.</p>
            <Link
              to="/friendlies/challenge"
              className="inline-block px-4 py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/30 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all"
            >
              Issue a New Challenge
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredList.map((inv) => (
              <InvitationThread
                key={inv.id}
                invitation={inv}
                currentActorId={currentActor?.id}
                isSender={activeTab === 'sent'}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onCounter={handleCounter}
                onWithdraw={handleWithdraw}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
