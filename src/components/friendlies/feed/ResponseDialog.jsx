/**
 * src/components/friendlies/feed/ResponseDialog.jsx
 *
 * Modal dialog for responding to a FriendlyPost.
 * Shows post terms at top, lets user choose eligible team,
 * write a message, optionally add a counter-proposal,
 * and confirms with: "Your response was sent. The match isn't
 * confirmed until the other team accepts."
 *
 * Focus trap: Escape closes, focus returns to trigger on close.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Swords,
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { containsContactDetails } from '../../../services/friendlyFeedService';

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-[#0B0F14] border border-[#293442] focus:border-[#B6FF3B] rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors';
const LABEL_CLASS = 'block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-1';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ResponseDialog({
  isOpen,
  post,
  postTeam,
  postCollege,
  eligibleTeam,
  currentActor,
  allEligibleTeams = [],
  onSend,
  onClose,
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(eligibleTeam?.id || '');
  const [message, setMessage] = useState('');
  const [hasCounterProposal, setHasCounterProposal] = useState(false);
  const [counterDate, setCounterDate] = useState(post?.preferredDates?.[0] || todayStr());
  const [counterTime, setCounterTime] = useState('16:00');
  const [counterVenue, setCounterVenue] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      firstFieldRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setMessage('');
      setHasCounterProposal(false);
      setCounterDate(post?.preferredDates?.[0] || todayStr());
      setCounterTime('16:00');
      setCounterVenue('');
      setErrors({});
      setSent(false);
      setSelectedTeamId(eligibleTeam?.id || allEligibleTeams[0]?.id || '');
    }
  }, [isOpen, post, eligibleTeam, allEligibleTeams]);

  if (!isOpen || !post) return null;

  const validate = () => {
    const errs = {};
    if (!selectedTeamId) errs.team = 'Please select a team to respond as.';
    if (!message.trim() || message.trim().length < 5)
      errs.message = 'Message must be at least 5 characters.';
    if (message.length > 500) errs.message = 'Message cannot exceed 500 characters.';
    if (containsContactDetails(message)) {
      errs.message =
        'Phone numbers and emails cannot be included in responses. They\'ll be shared after confirmation.';
    }
    if (hasCounterProposal) {
      if (!counterDate || counterDate < todayStr())
        errs.counterDate = 'Counter-proposal date cannot be in the past.';
    }
    return errs;
  };

  const handleSend = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Focus first invalid field
      const firstErrKey = Object.keys(errs)[0];
      document.getElementById(`resp-${firstErrKey}`)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSend?.({
        responderTeamId: selectedTeamId,
        message,
        proposedDateTime: hasCounterProposal ? { date: counterDate, time: counterTime } : null,
        proposedVenue: hasCounterProposal && counterVenue ? counterVenue : null
      });
      setSent(true);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to send response. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resp-dialog-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={dialogRef}
        className="bg-[#151B23] border border-[#293442] w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#293442] bg-[#0B0F14] shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#B6FF3B]/10 text-[#B6FF3B]">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h2 id="resp-dialog-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
              Respond to Match
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-[#1B2530] rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Post Summary at top */}
          <div className="m-4 p-4 bg-[#0B0F14] border border-[#293442] rounded-xl space-y-2">
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Post Details</p>
            <p className="text-sm font-bold text-white">{postTeam?.name} · {postCollege?.name || post.collegeId}</p>
            {post.title && <p className="text-sm text-[#B6FF3B] font-semibold">{post.title}</p>}
            <p className="text-xs text-slate-400 line-clamp-2">{post.message}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-1">
              {post.preferredDates?.length > 0 && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#B6FF3B]" />{post.preferredDates.join(', ')}
                </span>
              )}
              {post.venueName && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#00D9FF]" />{post.venueName}, {post.city}
                </span>
              )}
              {post.format && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-400" />{post.format}
                </span>
              )}
            </div>
          </div>

          {/* Success state */}
          {sent ? (
            <div className="mx-4 mb-4 p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-bold text-lg">Response Sent!</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your response was sent. The match isn't confirmed until the other team accepts.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-sm rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-5">
              {errors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Team selector */}
              {allEligibleTeams.length > 1 && (
                <div>
                  <label className={LABEL_CLASS} htmlFor="resp-team">Responding As <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select
                      id="resp-team"
                      ref={firstFieldRef}
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className={`${INPUT_CLASS} appearance-none pr-8`}
                    >
                      {allEligibleTeams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} · {t.collegeName}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                  {errors.team && <p className="mt-1 text-xs text-red-400">{errors.team}</p>}
                </div>
              )}

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={LABEL_CLASS} htmlFor="resp-message">Message <span className="text-red-400">*</span></label>
                  <span className={`text-xs ${message.length > 450 ? 'text-amber-400' : 'text-slate-600'}`}>{message.length}/500</span>
                </div>
                <textarea
                  id="resp-message"
                  ref={allEligibleTeams.length <= 1 ? firstFieldRef : null}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce your team and confirm you're interested. Don't include contact details."
                  rows={4}
                  className={`${INPUT_CLASS} resize-none`}
                  maxLength={500}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-400 flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{errors.message}
                  </p>
                )}
              </div>

              {/* Counter-Proposal Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setHasCounterProposal((v) => !v)}
                  className="flex items-center gap-2 text-xs text-[#00D9FF] hover:underline font-semibold"
                  aria-expanded={hasCounterProposal}
                >
                  <Swords className="w-3.5 h-3.5" />
                  {hasCounterProposal ? 'Remove counter-proposal' : '+ Add counter-proposal (different date, time, or venue)'}
                </button>

                {hasCounterProposal && (
                  <div className="mt-3 p-4 bg-[#0B0F14] border border-[#293442] rounded-xl space-y-3">
                    <p className="text-xs text-slate-400 italic">
                      Counter-proposals show as "Counter-proposal" to the post author. If accepted, the match is confirmed on your proposed terms.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL_CLASS} htmlFor="resp-counterDate">Proposed Date</label>
                        <input
                          id="resp-counterDate"
                          type="date"
                          value={counterDate}
                          min={todayStr()}
                          onChange={(e) => setCounterDate(e.target.value)}
                          className={INPUT_CLASS}
                        />
                        {errors.counterDate && <p className="mt-1 text-xs text-red-400">{errors.counterDate}</p>}
                      </div>
                      <div>
                        <label className={LABEL_CLASS} htmlFor="resp-counterTime">Proposed Time</label>
                        <input
                          id="resp-counterTime"
                          type="time"
                          value={counterTime}
                          onChange={(e) => setCounterTime(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL_CLASS} htmlFor="resp-counterVenue">Proposed Venue <span className="text-slate-600 font-normal">(optional)</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                          id="resp-counterVenue"
                          type="text"
                          value={counterVenue}
                          onChange={(e) => setCounterVenue(e.target.value)}
                          placeholder="Alternative ground or area"
                          className={`${INPUT_CLASS} pl-9`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy notice */}
              <p className="text-xs text-slate-500 italic">
                Contact details are not visible in responses. They are shared only between confirmed captains after a match is accepted.
              </p>
            </div>
          )}
        </div>

        {/* Footer send button */}
        {!sent && (
          <div className="px-5 py-4 border-t border-[#293442] bg-[#0B0F14] shrink-0">
            <button
              type="button"
              onClick={handleSend}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B6FF3B] hover:bg-[#a3ee28] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0F14] font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                <><Swords className="w-4 h-4" /> Send Response</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

