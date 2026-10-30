/**
 * src/components/friendlies/feed/FeedStatusBadge.jsx
 * 
 * Displays feed post/response status badges consistent with SportLink design system.
 */
import React from 'react';
import { CheckCircle2, Clock, XCircle, Ban, Radio, Swords } from 'lucide-react';

export default function FeedStatusBadge({ status, className = '' }) {
  if (!status) return null;

  const base = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${className}`;

  switch (status) {
    case 'Open':
      return (
        <span className={`${base} bg-[#B6FF3B]/15 text-[#B6FF3B] border-[#B6FF3B]/40`}>
          <span className="w-2 h-2 rounded-full bg-[#B6FF3B] animate-pulse" />
          <span>Open</span>
        </span>
      );
    case 'Matched':
      return (
        <span className={`${base} bg-emerald-500/15 text-emerald-400 border-emerald-500/40`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Matched</span>
        </span>
      );
    case 'Expired':
      return (
        <span className={`${base} bg-amber-500/15 text-amber-400 border-amber-500/40`}>
          <Clock className="w-3.5 h-3.5" />
          <span>Expired</span>
        </span>
      );
    case 'Closed':
      return (
        <span className={`${base} bg-slate-500/15 text-slate-400 border-slate-500/40`}>
          <XCircle className="w-3.5 h-3.5" />
          <span>Closed</span>
        </span>
      );
    case 'Removed':
      return (
        <span className={`${base} bg-red-500/15 text-red-400 border-red-500/40`}>
          <Ban className="w-3.5 h-3.5" />
          <span>Removed</span>
        </span>
      );
    // Response statuses
    case 'Pending':
      return (
        <span className={`${base} bg-blue-500/15 text-blue-400 border-blue-500/40`}>
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Pending</span>
        </span>
      );
    case 'Accepted':
      return (
        <span className={`${base} bg-emerald-500/15 text-emerald-400 border-emerald-500/40`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Accepted</span>
        </span>
      );
    case 'Declined':
      return (
        <span className={`${base} bg-red-500/15 text-red-400 border-red-500/40`}>
          <XCircle className="w-3.5 h-3.5" />
          <span>Declined</span>
        </span>
      );
    case 'Withdrawn':
      return (
        <span className={`${base} bg-slate-500/15 text-slate-400 border-slate-500/40`}>
          <XCircle className="w-3.5 h-3.5" />
          <span>Withdrawn</span>
        </span>
      );
    case 'Counter-proposal':
      return (
        <span className={`${base} bg-purple-500/15 text-purple-400 border-purple-500/40`}>
          <Swords className="w-3.5 h-3.5" />
          <span>Counter-proposal</span>
        </span>
      );
    default:
      return (
        <span className={`${base} bg-slate-800 text-slate-400 border-slate-700`}>
          {status}
        </span>
      );
  }
}

