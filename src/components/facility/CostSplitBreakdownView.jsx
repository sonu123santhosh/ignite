/**
 * CostSplitBreakdownView.jsx
 * Reusable breakdown display & sharing card for a confirmed or saved split.
 *
 * Requirements:
 *  - Breakdown table with total row matching booking total
 *  - Honesty Rule label: "Cost breakdown (payments are settled outside SportLink)"
 *  - No fake Paid/Unpaid badges
 *  - Copy Text action
 *  - Share via WhatsApp action
 *  - Web Share API support
 *  - Read-only public share link
 */

import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import Button from '../Button';
import {
  formatINR,
  generateShareText,
  generateWhatsAppUrl
} from '../../services/costSplitService';

export default function CostSplitBreakdownView({
  split,
  onShowToast,
  onRevokeShare,
  isCreator = true
}) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  if (!split) return null;

  const publicUrl = split.shareToken && !split.shareTokenRevoked
    ? `${window.location.origin}/splits/${split.shareToken}`
    : '';

  const shareText = generateShareText(split, publicUrl);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onShowToast) {
        onShowToast({
          title: 'Breakdown Copied',
          message: 'Formatted match cost breakdown copied to clipboard.',
          type: 'success'
        });
      }
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      if (onShowToast) {
        onShowToast({
          title: 'Share Link Copied',
          message: 'Read-only public link copied to clipboard.',
          type: 'success'
        });
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Match Split - ${split.facilityName}`,
          text: shareText,
          url: publicUrl || window.location.href
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopyText();
    }
  };

  const whatsappUrl = generateWhatsAppUrl(split, publicUrl);

  return (
    <div className="bg-[#0B0F14] border border-[#293442] rounded-2xl p-5 sm:p-6 space-y-5 text-left text-xs text-[#F5F7FA]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#293442] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Group Cost Split
            </span>
            <h3 className="font-['Barlow_Condensed'] text-xl font-black uppercase text-white">
              {split.participantCount} Players &bull; {split.mode === 'equal' ? 'Equal Split' : 'Custom Shares'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {split.status === 'Cancelled' ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Split Cancelled
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Active Breakdown
            </span>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-semibold text-[#94A3B8] px-2">
          <span>Participant</span>
          <span>Share</span>
        </div>

        <div className="divide-y divide-[#293442]/60 rounded-xl bg-[#141B24] border border-[#293442] overflow-hidden">
          {split.participants.map((p) => (
            <div
              key={p.position}
              className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 text-center font-mono text-[11px] text-rose-400 font-bold">
                  #{p.position}
                </span>
                <span className="text-xs font-semibold text-[#F5F7FA]">
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
          <div className="flex items-center justify-between px-3.5 py-3 bg-[#101826] font-bold">
            <span className="text-xs text-rose-200">Total Booking Cost</span>
            <span className="font-mono text-sm text-rose-300">
              {formatINR(split.totalRupees)}
            </span>
          </div>
        </div>
      </div>

      {/* Note if present */}
      {split.note && (
        <div className="p-3 rounded-xl bg-[#141B24] border border-[#293442] text-[11px] text-[#94A3B8]">
          <strong className="text-white block mb-0.5">Organizer Note:</strong>
          {split.note}
        </div>
      )}

      {/* Honesty Notice (No fake paid status) */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2 text-[11px] text-[#94A3B8]">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 block mb-0.5">
            Cost breakdown (payments are settled outside SportLink)
          </strong>
          Contributions are calculated exactly to the paise. Players settle their individual shares with the booking organizer via cash or UPI.
        </div>
      </div>

      {/* Share Actions */}
      <div className="pt-2 border-t border-[#293442] flex flex-wrap gap-2.5 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Copy Text */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="gap-1.5 text-xs py-2 px-3 hover:border-rose-400 hover:text-rose-300"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </Button>

          {/* WhatsApp Share */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 transition-colors shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>

          {/* Native Web Share */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              className="gap-1.5 text-xs py-2 px-3"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </Button>
          )}
        </div>

        {/* Public Share Link */}
        {publicUrl && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-xs text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
              title="Copy public link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{linkCopied ? 'Link copied!' : 'Shareable Link'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

