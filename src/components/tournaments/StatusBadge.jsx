import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck, Flame, Ban } from 'lucide-react';

/**
 * Reusable accessible StatusBadge for Tournament, Registration, and Payment statuses.
 * Every badge carries clear text, never color alone.
 */
export default function StatusBadge({ type = 'tournament', status, derived = false, className = '' }) {
  if (!status) return null;

  // Derived labels (e.g. Closing Soon, Filling Fast)
  if (derived || status === 'Closing Soon' || status === 'Filling Fast') {
    if (status === 'Closing Soon') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/40 ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Closing Soon</span>
        </span>
      );
    }
    if (status === 'Filling Fast') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/40 ${className}`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Filling Fast</span>
        </span>
      );
    }
  }

  // 1. Tournament Statuses
  if (type === 'tournament') {
    switch (status) {
      case 'Registration Open':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/40 ${className}`}
          >
            <span className="w-2 h-2 rounded-full bg-[#B6FF3B] animate-pulse" />
            <span>Registration Open</span>
          </span>
        );
      case 'Registration Closed':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-700/50 text-slate-300 border border-slate-600 ${className}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Registration Closed</span>
          </span>
        );
      case 'Ongoing':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/40 ${className}`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
            <span>Live / Ongoing</span>
          </span>
        );
      case 'Completed':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 ${className}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'Draft':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 ${className}`}
          >
            <span>Draft</span>
          </span>
        );
      case 'Pending Verification':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/40 ${className}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/40 ${className}`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
            {status}
          </span>
        );
    }
  }

  // 2. Registration Statuses
  if (type === 'registration') {
    switch (status) {
      case 'Approved':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 ${className}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'Submitted':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/40 ${className}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Submitted</span>
          </span>
        );
      case 'Pending':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/40 ${className}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Info Requested</span>
          </span>
        );
      case 'Waitlisted':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/40 ${className}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Waitlisted</span>
          </span>
        );
      case 'Rejected':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/40 ${className}`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'Withdrawn':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 ${className}`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Withdrawn</span>
          </span>
        );
      default:
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
            {status}
          </span>
        );
    }
  }

  // 3. Payment Statuses
  if (type === 'payment') {
    switch (status) {
      case 'Demo-paid':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Demo payment (no real charge)</span>
          </span>
        );
      case 'Not required':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 ${className}`}
          >
            <span>Free (No fee)</span>
          </span>
        );
      case 'Unpaid':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}
          >
            <span>Payment Pending (Demo)</span>
          </span>
        );
      case 'Refund pending':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 ${className}`}
          >
            <span>Refund Pending (Demo)</span>
          </span>
        );
      case 'Refunded':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700/60 text-slate-300 border border-slate-600 ${className}`}
          >
            <span>Refunded (Simulated)</span>
          </span>
        );
      default:
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 ${className}`}>
            {status}
          </span>
        );
    }
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
      {status}
    </span>
  );
}
