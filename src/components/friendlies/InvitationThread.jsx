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
    <div className="bg-[#0c1629]/80 border border-sky-500/20 rounded-2xl p-6 space-y-5 shadow-xl backdrop-blur-xl">
      {/* Thread Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-sky-400">{invitation.id}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isConfirmed
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40'
                  : invitation.status === 'Declined'
                  ? 'bg-red-500/15 text-red-300 border border-red-400/40'
                  : invitation.status === 'Counterproposal Received'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-400/40'
                  : 'bg-sky-500/15 text-sky-300 border border-sky-400/40'
              }`}
            >
              {invitation.status}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Sport: <strong className="text-white">{invitation.sport}</strong> &bull; Created: {formatDateDisplay(invitation.createdAt)}
          </span>
        </div>

        {/* Link to Confirmed match */}
        {isConfirmed && invitation.matchId && (
          <Link
            to={`/friendlies/matches/${invitation.matchId}`}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] flex items-center gap-1 self-start sm:self-auto transition-all shadow-md"
          >
            <span>View Confirmed Match</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Current Proposed Terms */}
      <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-4 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Active Proposed Terms</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Proposed Date &amp; Time</span>
            <span className="font-bold text-white">
              {formatDateDisplay(invitation.terms.date)} at {invitation.terms.startTime}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Venue Ground</span>
            <span className="font-bold text-white">{invitation.terms.venueName}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Match Format</span>
            <span className="font-semibold text-slate-300">{invitation.terms.format}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Duration</span>
            <span className="font-semibold text-slate-300">{invitation.terms.durationMinutes || 90} minutes</span>
          </div>
        </div>

        {invitation.terms.message && (
          <div className="pt-2 border-t border-sky-500/20 text-xs text-slate-300 italic">
            &ldquo;{invitation.terms.message}&rdquo;
          </div>
        )}
      </div>

      {/* Negotiation History Log */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <History className="w-3.5 h-3.5 text-sky-400" />
          <span>Negotiation Timeline</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {invitation.history?.map((step, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#0c1629]/90 border border-sky-500/20 rounded-xl text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{step.action}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDateDisplay(step.timestamp)} &bull; {formatTimeDisplay(step.timestamp)}
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">{step.details}</p>
              <span className="text-[10px] text-sky-400 font-medium block">
                By: {step.actorName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Controls for Active Negotiator */}
      {canRespond && !isCountering && !isDeclining && (
        <div className="pt-3 border-t border-sky-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Your response is required to finalize this fixture.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDeclining(true)}
              className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl cursor-pointer transition-all"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={() => setIsCountering(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl cursor-pointer transition-all"
            >
              Counter-Propose Terms
            </button>

            <button
              type="button"
              onClick={() => onAccept(invitation.id)}
              className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] rounded-xl cursor-pointer shadow-md shadow-sky-600/30 flex items-center gap-1 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Terms &amp; Confirm Match</span>
            </button>
          </div>
        </div>
      )}

      {/* Sender can withdraw pending */}
      {isPending && isSender && !canRespond && (
        <div className="pt-3 border-t border-sky-500/20 flex items-center justify-between">
          <span className="text-xs text-slate-400 italic">
            Waiting for opponent captain response...
          </span>
          <button
            type="button"
            onClick={() => onWithdraw(invitation.id)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 border border-sky-500/20 hover:border-red-500/30 rounded-xl cursor-pointer transition-all"
          >
            Withdraw Invitation
          </button>
        </div>
      )}

      {/* Inline Counter-Proposal Form */}
      {isCountering && (
        <form onSubmit={handleSendCounter} className="p-4 bg-[#070d1a]/90 border border-amber-500/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
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
              <label className="text-slate-400 block mb-1">New Date</label>
              <input
                type="date"
                required
                value={counterDate}
                onChange={(e) => setCounterDate(e.target.value)}
                className="w-full p-2 bg-[#0c1629] border border-sky-500/30 rounded-lg text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">New Time</label>
              <input
                type="time"
                required
                value={counterTime}
                onChange={(e) => setCounterTime(e.target.value)}
                className="w-full p-2 bg-[#0c1629] border border-sky-500/30 rounded-lg text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">New Venue Ground</label>
            <input
              type="text"
              required
              value={counterVenue}
              onChange={(e) => setCounterVenue(e.target.value)}
              className="w-full p-2 bg-[#0c1629] border border-sky-500/30 rounded-lg text-xs text-white focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Reason / Note to Opponent Captain</label>
            <textarea
              rows={2}
              required
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              placeholder="e.g. Can we shift to 5:00 PM due to our college laboratory practicals?"
              className="w-full p-2 bg-[#0c1629] border border-sky-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCountering(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-400 text-[#0B0F14] font-bold text-xs rounded-lg hover:bg-amber-300 cursor-pointer shadow-md transition-all"
            >
              Send Counter-Proposal
            </button>
          </div>
        </form>
      )}

      {/* Inline Decline Form */}
      {isDeclining && (
        <form onSubmit={handleSendDecline} className="p-4 bg-[#070d1a]/90 border border-red-500/40 rounded-xl space-y-3">
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
            <label className="text-xs text-slate-400 block mb-1">Reason for declining</label>
            <input
              type="text"
              required
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Schedule clash with terminal semester exams"
              className="w-full p-2 bg-[#0c1629] border border-sky-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:border-red-400 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 cursor-pointer shadow-md transition-all"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
