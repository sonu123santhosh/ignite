import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Ban, Radio } from 'lucide-react';

export default function MatchStatusBadge({ status, className = '' }) {
  if (!status) return null;

  switch (status) {
    case 'Open for Teams':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/40 shadow-sm ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#B6FF3B] animate-pulse" />
          <span>Open for Teams</span>
        </span>
      );
    case 'Confirmed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed Fixture</span>
        </span>
      );
    case 'Pending Confirmation':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/40 ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Confirmation</span>
        </span>
      );
    case 'Completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-700/50 text-slate-300 border border-slate-600 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
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
