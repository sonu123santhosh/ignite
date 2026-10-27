import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  RotateCcw,
  Ban,
  ArrowRight,
  MessageSquare,
  History,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { formatDateDisplay, formatTimeDisplay } from '../../data/friendliesData';

export default function InvitationThread({
  invitation,
  currentActorId,
  isSender,
  onAccept,
  onDecline,
  onCounter,
  onWithdraw
}) {
  const [isCountering, setIsCountering] = useState(false);
  const [counterDate, setCounterDate] = useState(invitation.terms.date?.slice(0, 10) || '');
  const [counterTime, setCounterTime] = useState(invitation.terms.startTime || '17:00');
  const [counterVenue, setCounterVenue] = useState(invitation.terms.venueName || '');
  const [counterFormat, setCounterFormat] = useState(invitation.terms.format || '');
  const [counterMessage, setCounterMessage] = useState('');

  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  const isPending = invitation.status === 'Pending' || invitation.status === 'Counterproposal Received';
  const isConfirmed = invitation.status === 'Confirmed';
  const isFinal = ['Declined', 'Expired', 'Withdrawn', 'Confirmed'].includes(invitation.status);

  // Determine who must take action:
  // If status is 'Pending', recipient must act.
  // If status is 'Counterproposal Received', the other party must act.
  const lastHistoryActorRole = invitation.history?.[invitation.history.length - 1]?.actorRole;
  const canRespond = isPending && (
    (lastHistoryActorRole === 'sender' && !isSender) ||
    (lastHistoryActorRole === 'recipient' && isSender) ||
    (lastHistoryActorRole === 'counter' && ((invitation.history.length % 2 === 1 && !isSender) || (invitation.history.length % 2 === 0 && isSender)))
  );

  const handleSendCounter = (e) => {
    e.preventDefault();
    onCounter(invitation.id, {
      date: counterDate,
      startTime: counterTime,
      venueName: counterVenue,
      format: counterFormat,
      message: counterMessage
    });
    setIsCountering(false);
  };

  const handleSendDecline = (e) => {
    e.preventDefault();
    onDecline(invitation.id, { reason: declineReason });
    setIsDeclining(false);
  };

  return (
    <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-6 space-y-5 shadow-xl">
      {/* Thread Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#293442]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#B6FF3B]">{invitation.id}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isConfirmed
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : invitation.status === 'Declined'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : invitation.status === 'Counterproposal Received'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30'
              }`}
            >
              {invitation.status}
            </span>
          </div>
          <span className="text-xs text-[#9CA3AF] mt-1 block">
            Sport: <strong className="text-white">{invitation.sport}</strong> &bull; Created: {formatDateDisplay(invitation.createdAt)}
          </span>
        </div>

        {/* Link to Confirmed match */}
        {isConfirmed && invitation.matchId && (
          <Link
            to={`/friendlies/matches/${invitation.matchId}`}
            className="px-3 py-1.5 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs rounded-xl hover:bg-[#a3ee28] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Confirmed Match</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Current Proposed Terms */}
      <div className="bg-[#1B2530] border border-[#293442] rounded-xl p-4 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-[#00D9FF] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Active Proposed Terms</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#9CA3AF] block">Proposed Date &amp; Time</span>
            <span className="font-bold text-white">
              {formatDateDisplay(invitation.terms.date)} at {invitation.terms.startTime}
            </span>
          </div>

          <div>
            <span className="text-[#9CA3AF] block">Venue Ground</span>
            <span className="font-bold text-white">{invitation.terms.venueName}</span>
          </div>

          <div>
            <span className="text-[#9CA3AF] block">Match Format</span>
            <span className="font-semibold text-slate-300">{invitation.terms.format}</span>
          </div>

          <div>
            <span className="text-[#9CA3AF] block">Duration</span>
            <span className="font-semibold text-slate-300">{invitation.terms.durationMinutes || 90} minutes</span>
          </div>
        </div>

        {invitation.terms.message && (
          <div className="pt-2 border-t border-[#293442]/60 text-xs text-slate-300 italic">
            &ldquo;{invitation.terms.message}&rdquo;
          </div>
        )}
      </div>

      {/* Negotiation History Log */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          <History className="w-3.5 h-3.5" />
          <span>Negotiation Timeline</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {invitation.history?.map((step, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{step.action}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatDateDisplay(step.timestamp)} &bull; {formatTimeDisplay(step.timestamp)}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{step.details}</p>
              <span className="text-[10px] text-[#00D9FF] font-medium block">
                By: {step.actorName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Controls for Active Negotiator */}
      {canRespond && !isCountering && !isDeclining && (
        <div className="pt-3 border-t border-[#293442] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Your response is required to finalize this fixture.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDeclining(true)}
              className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl cursor-pointer"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={() => setIsCountering(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl cursor-pointer"
            >
              Counter-Propose Terms
            </button>

            <button
              type="button"
              onClick={() => onAccept(invitation.id)}
              className="px-4 py-1.5 text-xs font-bold text-[#0B0F14] bg-[#B6FF3B] hover:bg-[#a3ee28] rounded-xl cursor-pointer shadow-md flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Terms &amp; Confirm Match</span>
            </button>
          </div>
        </div>
      )}

      {/* Sender can withdraw pending */}
      {isPending && isSender && !canRespond && (
        <div className="pt-3 border-t border-[#293442] flex items-center justify-between">
          <span className="text-xs text-slate-400 italic">
            Waiting for opponent captain response...
          </span>
          <button
            type="button"
            onClick={() => onWithdraw(invitation.id)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 border border-[#293442] rounded-xl cursor-pointer"
          >
            Withdraw Invitation
          </button>
        </div>
      )}

      {/* Inline Counter-Proposal Form */}
      {isCountering && (
        <form onSubmit={handleSendCounter} className="p-4 bg-[#0B0F14] border border-amber-500/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#293442]">
            <h5 className="font-bold text-xs uppercase text-amber-400">
              Submit Counter-Proposed Terms
            </h5>
            <button
              type="button"
              onClick={() => setIsCountering(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[#9CA3AF] block mb-1">New Date</label>
              <input
                type="date"
                required
                value={counterDate}
                onChange={(e) => setCounterDate(e.target.value)}
                className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[#9CA3AF] block mb-1">New Time</label>
              <input
                type="time"
                required
                value={counterTime}
                onChange={(e) => setCounterTime(e.target.value)}
                className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] block mb-1">New Venue Ground</label>
            <input
              type="text"
              required
              value={counterVenue}
              onChange={(e) => setCounterVenue(e.target.value)}
              className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] block mb-1">Reason / Note to Opponent Captain</label>
            <textarea
              rows={2}
              required
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              placeholder="e.g. Can we shift to 5:00 PM due to our college laboratory practicals?"
              className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-xs text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCountering(false)}
              className="px-3 py-1.5 text-xs text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-400 text-[#0B0F14] font-bold text-xs rounded-lg hover:bg-amber-300 cursor-pointer"
            >
              Send Counter-Proposal
            </button>
          </div>
        </form>
      )}

      {/* Inline Decline Form */}
      {isDeclining && (
        <form onSubmit={handleSendDecline} className="p-4 bg-[#0B0F14] border border-red-500/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs uppercase text-red-400">
              Decline Match Invitation
            </h5>
            <button
              type="button"
              onClick={() => setIsDeclining(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] block mb-1">Reason for declining</label>
            <input
              type="text"
              required
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Schedule clash with terminal semester exams"
              className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-xs text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 cursor-pointer"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
