/**
 * PublicSplitView.jsx
 * Route: /splits/:shareToken
 *
 * Standalone read-only public view for a match cost split.
 * CRITICAL PRIVACY INVARIANT:
 *  - Exposes ZERO private data (no emails, phone numbers, or user IDs).
 *  - Shows only venue, date, time, total, and participant names/amounts.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import Button from '../../components/Button';
import {
  getPublicSplitByToken,
  formatINR,
  generateShareText,
  generateWhatsAppUrl
} from '../../services/costSplitService';

export default function PublicSplitView() {
  const { shareToken } = useParams();
  const [split, setSplit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = getPublicSplitByToken(shareToken);
    setSplit(data);
    setLoading(false);
    if (data?.facilityName) {
      document.title = `Match Split: ${data.facilityName} | SportLink`;
    }
  }, [shareToken]);

  const handleCopyText = async () => {
    if (!split) return;
    const text = generateShareText(split, window.location.href);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const whatsappUrl = split ? generateWhatsAppUrl(split, window.location.href) : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!split) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#141B24] border border-[#293442] flex items-center justify-center text-rose-400 mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="font-['Barlow_Condensed'] text-3xl font-black uppercase text-white">
            Split Breakdown Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            This match cost split link has either expired, been revoked by the organizer, or does not exist.
          </p>
        </div>
        <Link to="/facilities">
          <Button variant="crimson" size="md">
            Browse SportLink Facilities
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-xl mx-auto flex flex-col justify-center space-y-6">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c6ff3d] to-emerald-400 flex items-center justify-center text-[#0a1020] font-black shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-display text-lg font-black tracking-wider uppercase text-white leading-none">
            Sport<span className="text-[#c6ff3d]">Link</span>
          </span>
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/25">
          Match Cost Breakdown
        </span>
      </div>

      {/* Main Glass Card */}
      <div
        className="rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-[#F5F7FA]"
        style={{
          background: 'rgba(16, 24, 38, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.7)'
        }}
      >
        {/* Match Header */}
        <div className="space-y-2 border-b border-[#293442] pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
            <Users className="w-3 h-3" />
            <span>Group Split &bull; {split.participantCount} Players</span>
          </div>

          <h1 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
            {split.facilityName}
          </h1>

          <p className="text-xs text-rose-300 font-semibold">
            {split.groundName}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              {split.date}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              {split.time}
            </span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-semibold text-[#94A3B8] px-1">
            <span>Player / Participant</span>
            <span>Contribution (₹)</span>
          </div>

          <div className="divide-y divide-[#293442]/60 rounded-xl bg-[#0B0F14] border border-[#293442] overflow-hidden">
            {split.participants.map((p) => (
              <div
                key={p.position}
                className="flex items-center justify-between px-3.5 py-3 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-mono text-xs text-rose-400 font-bold">
                    #{p.position}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {p.name}
                  </span>
                  {p.position === 1 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 font-bold">
                      Organizer
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-white">
                  {formatINR(p.amountRupees)}
                </span>
              </div>
            ))}

            {/* Total Row */}
            <div className="flex items-center justify-between px-3.5 py-3.5 bg-[#101826] font-bold">
              <span className="text-xs text-rose-200">Total Booking Cost</span>
              <span className="font-mono text-sm text-rose-300">
                {formatINR(split.totalRupees)}
              </span>
            </div>
          </div>
        </div>

        {/* Organizer Note */}
        {split.note && (
          <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-xs text-slate-300">
            <strong className="text-white block mb-0.5">Organizer Note:</strong>
            {split.note}
          </div>
        )}

        {/* Honesty Settlement Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5 text-[11px] text-[#94A3B8]">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300 block mb-0.5">
              Cost breakdown (payments are settled outside SportLink)
            </strong>
            This is a transparent mathematical cost division. Please pay your share directly to the match organizer via cash or UPI.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handleCopyText}
            className="flex-1 gap-1.5 text-xs py-2.5 hover:border-rose-400 hover:text-rose-300"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Breakdown' : 'Copy Breakdown Text'}</span>
          </Button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#25D366] hover:bg-[#20ba5a] text-[#0B0F14] transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Share to WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Footer link back */}
      <div className="text-center">
        <Link
          to="/facilities"
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          ← Book a sports ground on SportLink
        </Link>
      </div>
    </div>
  );
}

