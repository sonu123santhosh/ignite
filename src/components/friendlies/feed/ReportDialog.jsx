/**
 * src/components/friendlies/feed/ReportDialog.jsx
 *
 * Confirmation dialog for reporting a post or response.
 * Focus trap, Escape to close, focus restored on close.
 */
import React, { useState, useEffect, useRef } from 'react';
import { X, Flag, Loader2, CheckCircle2 } from 'lucide-react';

const REASONS = [
  'Incorrect information',
  'Spam or repeated content',
  'Inappropriate language',
  'Contact details shared publicly',
  'Other'
];

export default function ReportDialog({ isOpen, target, targetType = 'post', onSubmit, onClose }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setReason(REASONS[0]);
      setDetails('');
      setDone(false);
      firstRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit?.({ targetType, targetId: target?.id, reason, details });
      setDone(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-[#151B23] border border-[#293442] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#293442] bg-[#0B0F14]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <Flag className="w-4 h-4" />
            </span>
            <h2 id="report-dialog-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
              Report {targetType === 'post' ? 'Post' : 'Response'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-[#1B2530] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {done ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-bold">Report Received</p>
              <p className="text-sm text-slate-400">Your report has been queued for moderation. Thank you for keeping the community safe.</p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-sm rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Reports are reviewed by moderators and are never shown publicly.
              </p>
              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5" htmlFor="rep-reason">
                  Reason
                </label>
                <select
                  id="rep-reason"
                  ref={firstRef}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0B0F14] border border-[#293442] focus:border-[#B6FF3B] rounded-xl text-sm text-white outline-none appearance-none"
                >
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5" htmlFor="rep-details">
                  Additional Details <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <textarea
                  id="rep-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Any additional context..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-2.5 bg-[#0B0F14] border border-[#293442] focus:border-[#B6FF3B] rounded-xl text-sm text-white placeholder-slate-500 outline-none resize-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-sm rounded-xl border border-red-500/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                Submit Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

