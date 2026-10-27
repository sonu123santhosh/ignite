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
      <div className="bg-[#151B23] border-b border-[#293442] py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link
            to="/friendlies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#B6FF3B]"
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
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Negotiate match dates, review counter-proposals, and confirm friendly exhibition fixtures.
          </p>
        </div>

        {/* Tab Controls: Received vs Sent */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#293442] pb-3">
          <div className="inline-flex p-1 bg-[#151B23] border border-[#293442] rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-[#00D9FF] text-[#0B0F14] shadow-sm'
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
                  ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Sent Challenges</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#9CA3AF]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#151B23] border border-[#293442] rounded-xl text-xs text-white outline-none cursor-pointer focus:border-[#B6FF3B]"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="counterproposal received">Counterproposal Received</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* List of Invitation Threads */}
        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-[#9CA3AF] text-sm bg-[#151B23] border border-[#293442] rounded-2xl space-y-3">
            <Swords className="w-8 h-8 text-slate-500 mx-auto" />
            <p>No invitations found in this tab.</p>
            <Link
              to="/friendlies/challenge"
              className="inline-block px-4 py-2 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs rounded-xl hover:bg-[#a3ee28]"
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
