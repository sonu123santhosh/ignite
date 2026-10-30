/**
 * src/components/friendlies/feed/ResponsesPanel.jsx
 *
 * Shows responses for a post (Author's view only).
 * Each response: responder team/college, message, counter-proposal, time,
 * and Accept / Decline actions with confirmation dialogs.
 * Accepting shows final terms; declining asks for optional reason.
 */
import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Swords,
  Loader2,
  AlertTriangle,
  MessageSquare,
  Clock
} from 'lucide-react';
import FeedStatusBadge from './FeedStatusBadge';

function relativeTime(isoStr) {
  if (!isoStr) return '';
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

function ResponseCard({ response, responderTeam, responderCollege, post, onAccept, onDecline }) {
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const hasCounter = response.proposedDateTime || response.proposedVenue;
  const matchDate = response.proposedDateTime?.date || post?.preferredDates?.[0];
  const matchTime = response.proposedDateTime?.time || post?.preferredTimeWindow?.slice(0, 5);
  const matchVenue = response.proposedVenue || post?.venueName;

  const handleAccept = async () => {
    setIsActing(true);
    try {
      await onAccept?.(response);
    } finally {
      setIsActing(false);
      setConfirmAccept(false);
    }
  };

  const handleDecline = async () => {
    setIsActing(true);
    try {
      await onDecline?.(response, declineReason);
    } finally {
      setIsActing(false);
      setShowDecline(false);
    }
  };

  const isPending = response.status === 'Pending';

  return (
    <div className={`bg-[#0B0F14] border rounded-xl p-4 space-y-3 ${isPending ? 'border-[#293442]' : 'border-[#293442]/40 opacity-70'}`}>
      {/* Responder header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-['Barlow_Condensed'] font-black text-sm text-white border border-white/10"
            style={{ backgroundColor: responderTeam?.primaryColor || '#00D9FF' }}
          >
            {responderTeam?.logoInitials || 'TM'}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{responderTeam?.name || 'Unknown Team'}</p>
            <p className="text-xs text-slate-400">{responderCollege?.name || response.responderCollegeId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FeedStatusBadge status={hasCounter && isPending ? 'Counter-proposal' : response.status} />
          <time className="text-xs text-slate-500">{relativeTime(response.createdAt)}</time>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
        {response.message}
      </p>

      {/* Counter-proposal details */}
      {hasCounter && (
        <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg space-y-1">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Swords className="w-3 h-3" /> Counter-proposal
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-300">
            {matchDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#B6FF3B]" />{matchDate}
                {matchTime && ` at ${matchTime}`}
              </span>
            )}
            {response.proposedVenue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00D9FF]" />{response.proposedVenue}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Accept / Decline (Pending only) */}
      {isPending && (
        <div className="flex items-center gap-2 pt-1">
          {!confirmAccept && !showDecline && (
            <>
              <button
                type="button"
                onClick={() => setConfirmAccept(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Accept
              </button>
              <button
                type="button"
                onClick={() => setShowDecline(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2530] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#293442] font-semibold text-xs rounded-xl transition-all"
              >
                <XCircle className="w-3.5 h-3.5" /> Decline
              </button>
            </>
          )}

          {/* Accept confirmation */}
          {confirmAccept && (
            <div className="w-full p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
              <p className="text-xs font-bold text-emerald-400">Confirm Match</p>
              <p className="text-xs text-slate-300">
                Confirming: <strong>{matchDate}</strong> at <strong>{matchTime}</strong> · <strong>{matchVenue}</strong>
              </p>
              <p className="text-xs text-slate-400">All other pending responses will be closed automatically.</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isActing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Yes, Confirm Match
                </button>
                <button type="button" onClick={() => setConfirmAccept(false)} className="text-xs text-slate-400 hover:text-white px-2 py-2">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Decline with reason */}
          {showDecline && (
            <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
              <p className="text-xs font-bold text-red-400">Decline Response</p>
              <input
                type="text"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Optional reason (not shown publicly)"
                className="w-full px-3 py-2 bg-[#0B0F14] border border-[#293442] rounded-lg text-xs text-white placeholder-slate-500 outline-none"
                maxLength={200}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={isActing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-all border border-red-500/30"
                >
                  {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Decline
                </button>
                <button type="button" onClick={() => setShowDecline(false)} className="text-xs text-slate-400 hover:text-white px-2 py-2">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResponsesPanel({ isOpen, post, responses, teams, colleges, onAccept, onDecline, onClose }) {
  if (!isOpen || !post) return null;

  const pending = responses.filter((r) => r.status === 'Pending');
  const others = responses.filter((r) => r.status !== 'Pending');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resp-panel-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-[#151B23] border border-[#293442] w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#293442] bg-[#0B0F14] shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#B6FF3B]/10 text-[#B6FF3B]">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h2 id="resp-panel-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
              Responses ({responses.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-[#1B2530] rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post summary */}
        <div className="px-5 py-3 bg-[#0B0F14] border-b border-[#293442] shrink-0">
          <p className="text-xs text-slate-400">
            Post: <span className="text-white font-semibold">{post.title || post.sport + ' match request'}</span>
            {pending.length > 0 && (
              <span className="ml-2 text-amber-400 font-bold">· {pending.length} pending</span>
            )}
          </p>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {responses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">No responses yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B6FF3B] animate-pulse" /> Pending ({pending.length})
                  </p>
                  {pending.map((r) => {
                    const respTeam = teams.find((t) => t.id === r.responderTeamId);
                    const respCollege = colleges.find((c) => c.id === r.responderCollegeId);
                    return (
                      <ResponseCard
                        key={r.id}
                        response={r}
                        responderTeam={respTeam}
                        responderCollege={respCollege}
                        post={post}
                        onAccept={onAccept}
                        onDecline={onDecline}
                      />
                    );
                  })}
                </div>
              )}

              {others.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">History ({others.length})</p>
                  {others.map((r) => {
                    const respTeam = teams.find((t) => t.id === r.responderTeamId);
                    const respCollege = colleges.find((c) => c.id === r.responderCollegeId);
                    return (
                      <ResponseCard
                        key={r.id}
                        response={r}
                        responderTeam={respTeam}
                        responderCollege={respCollege}
                        post={post}
                        onAccept={onAccept}
                        onDecline={onDecline}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

