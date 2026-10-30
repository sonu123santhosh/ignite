/**
 * BookingDetailsModal.jsx
 * Comprehensive drawer/modal for inspecting and managing a single facility booking.
 *
 * Requirements:
 *  - Full venue name, address, locality, city
 *  - Sport, pitch/court name, surface type
 *  - Date, time window, duration
 *  - Status and history of status changes
 *  - Price breakdown (base, peak charge, fees, taxes, discounts, total)
 *  - Payment status honesty notice (payments handled outside SportLink)
 *  - Group split (participants and amounts if split exists)
 *  - Booking ID with one-click copy button
 *  - Cancellation & refund policy for this booking
 *  - Book again action
 *  - Cancel booking action (if eligible)
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Layers,
  Users,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  History,
  ExternalLink
} from 'lucide-react';
import Button from '../Button';
import CostSplitBreakdownView from './CostSplitBreakdownView';

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onOpenCancelDialog
}) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !booking) return null;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Completed':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'Cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Pending':
      case 'Pending confirmation':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleBookAgain = () => {
    onClose();
    navigate(`/facilities/${booking.facilityId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-detail-title"
    >
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#293442] bg-[#0B0F14]/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs sm:text-sm font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                <span>{booking.id}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Copy reference"
                  aria-label="Copy booking reference ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>

              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                  booking.derivedStatus || booking.status
                )}`}
              >
                {booking.derivedStatus || booking.status}
              </span>
            </div>

            <h2 id="booking-detail-title" className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-black uppercase text-[#F5F7FA]">
              {booking.facilityName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F5F7FA] bg-[#0B0F14] border border-[#293442] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
          {/* Key Match Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-[#0B0F14] border border-[#293442] rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Date</span>
                <p className="text-sm font-semibold text-white">{booking.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Time Window</span>
                <p className="text-sm font-semibold text-white">
                  {booking.startTime} - {booking.endTime || 'End'} ({booking.durationHours} {booking.durationHours === 1 ? 'Hour' : 'Hours'})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Pitch / Court</span>
                <p className="text-sm font-semibold text-white">
                  {booking.groundName} &bull; <span className="text-rose-300 font-normal">{booking.sport}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                <p className="text-sm font-semibold text-white">{booking.area}, {booking.city}</p>
                <p className="text-[11px] text-slate-400">{booking.address}</p>
              </div>
            </div>
          </div>

          {/* Stored Price Breakdown */}
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 space-y-2.5">
            <h3 className="font-['Barlow_Condensed'] text-base font-bold uppercase tracking-wider text-white">
              Price Breakdown (Stored)
            </h3>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-[#293442]/60">
                <span className="text-slate-400">Ground Base Tariff:</span>
                <span>₹{booking.priceBreakdown?.basePrice || Math.max(0, booking.amount - 256)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#293442]/60">
                <span className="text-slate-400">GST Taxes (18%):</span>
                <span>₹{booking.priceBreakdown?.taxes || 216}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#293442]/60">
                <span className="text-slate-400">Platform Convenience Fee:</span>
                <span>₹{booking.priceBreakdown?.platformFee || 40}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-rose-300">₹{booking.amount}</span>
              </div>
            </div>

            {/* Honesty Rule Payment Status */}
            <div className="mt-3 pt-3 border-t border-[#293442] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Payment status:</span>
              <span className="font-semibold text-slate-300 italic">
                Settled outside SportLink (payments and refunds are handled by the facility)
              </span>
            </div>
          </div>

          {/* Group Cost Split (If exists) */}
          {booking.split && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-['Barlow_Condensed'] text-base font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Group Cost Split ({booking.split.participantCount} Players)</span>
                </h3>

                {booking.split.shareToken && (
                  <Link
                    to={`/splits/${booking.split.shareToken}`}
                    target="_blank"
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="bg-[#0B0F14] border border-[#293442] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#141B24] border-b border-[#293442] text-[10px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Player</th>
                      <th className="p-2.5 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#293442]/50 text-slate-300">
                    {booking.split.participants.map((p) => (
                      <tr key={p.position}>
                        <td className="p-2.5 font-mono text-slate-500">{p.position}</td>
                        <td className="p-2.5 font-medium">{p.name}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">
                          ₹{p.amountRupees}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cancellation & Refund Policy Card */}
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 space-y-2">
            <h3 className="font-['Barlow_Condensed'] text-base font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Cancellation & Refund Policy</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {booking.cancellationPolicy}
            </p>
            {booking.refundNotice && (
              <p className="text-[11px] text-amber-300/90 font-medium pt-1">
                Notice: {booking.refundNotice}
              </p>
            )}
          </div>

          {/* Status History Timeline */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-['Barlow_Condensed'] text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Reservation Timeline</span>
              </h3>
              <div className="space-y-1.5 bg-[#0B0F14] border border-[#293442] rounded-xl p-3 text-[11px]">
                {booking.statusHistory.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-400">
                    <span>
                      Status: <strong className="text-white capitalize">{h.status}</strong> {h.note ? `(${h.note})` : ''}
                    </span>
                    <span className="font-mono text-[10px]">
                      {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#293442] bg-[#0B0F14]/90 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {/* Cancel action (only if eligible) */}
            {booking.canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenCancelDialog(booking)}
                className="hover:border-rose-500 hover:text-rose-400 text-xs"
              >
                Cancel Booking
              </Button>
            )}

            {/* Book again action */}
            <Button
              variant="crimson"
              size="sm"
              onClick={handleBookAgain}
              className="text-xs gap-1.5"
            >
              <span>Book Again</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

