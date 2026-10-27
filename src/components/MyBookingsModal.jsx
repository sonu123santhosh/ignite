import React from 'react';
import { X, Calendar, Clock, MapPin, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function MyBookingsModal({
  isOpen,
  onClose,
  bookings = [],
  onCancelBooking
}) {
  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Completed':
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-bookings-title"
    >
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#293442]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B6FF3B]">
              Player Reservation History
            </span>
            <h2 id="my-bookings-title" className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
              My Bookings ({bookings.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F5F7FA] bg-[#0B0F14] border border-[#293442]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No bookings recorded yet.</p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#00D4FF]">
                      {b.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] bg-slate-800 px-1.5 py-0.5 rounded">
                      Demo record
                    </span>
                  </div>

                  <h3 className="font-['Barlow_Condensed'] text-xl font-bold text-[#F5F7FA] leading-tight truncate">
                    {b.facilityName}
                  </h3>

                  <p className="text-xs text-[#94A3B8]">
                    {b.groundName} &bull; {b.sport}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1 text-[#94A3B8]">
                      <Calendar className="w-3.5 h-3.5 text-[#B6FF3B]" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1 text-[#94A3B8]">
                      <Clock className="w-3.5 h-3.5 text-[#00D4FF]" />
                      {b.startTime} ({b.durationHours}h)
                    </span>
                    <span className="font-bold text-[#B6FF3B]">
                      ₹{b.amount}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  {b.status === 'Confirmed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancelBooking(b.id)}
                      className="hover:border-rose-400 hover:text-rose-400 text-xs py-1.5 px-3"
                    >
                      Cancel Booking
                    </Button>
                  )}
                  {b.status === 'Cancelled' && (
                    <span className="text-[11px] text-[#94A3B8] italic">
                      Slot freed to inventory
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#293442] bg-[#0B0F14] text-xs text-[#94A3B8] flex justify-between items-center">
          <span>Cancelling a booking frees the slot and triggers demo refund policy.</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
