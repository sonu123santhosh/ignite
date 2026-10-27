import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import Button from './Button';
import {
  generateSlotsForGroundAndDate,
  calculateBookingPrice,
  checkSlotOverlap,
  getRelativeDateStr
} from '../data/facilitiesData';

export default function SlotTable({
  facility,
  selectedGroundId,
  onSelectGround,
  selectedDate,
  onSelectDate,
  selectedSlotTime,
  onSelectSlotTime,
  durationHours,
  onChangeDuration,
  existingBookings,
  customSlotOverrides,
  onSimulateConflict,
  onReleaseSlot,
  holdRemainingSec,
  holdExpired,
  onShowToast
}) {
  const todayStr = getRelativeDateStr(0);

  // Generate slots for currently selected ground & date
  const slots = generateSlotsForGroundAndDate(
    facility,
    selectedGroundId,
    selectedDate,
    existingBookings,
    customSlotOverrides
  );

  // Find consecutive slots if duration > 1 is requested
  const getSelectedSlots = () => {
    if (!selectedSlotTime) return [];
    const startIndex = slots.findIndex((s) => s.startStr === selectedSlotTime);
    if (startIndex === -1) return [];

    const result = [];
    for (let i = 0; i < durationHours; i++) {
      const current = slots[startIndex + i];
      if (current) result.push(current);
    }
    return result;
  };

  const selectedSlots = getSelectedSlots();

  // Check if consecutive durations are available from this slot
  const isDurationAvailable = (dur) => {
    if (!selectedSlotTime) return false;
    const startIndex = slots.findIndex((s) => s.startStr === selectedSlotTime);
    if (startIndex === -1) return false;

    for (let i = 0; i < dur; i++) {
      const slot = slots[startIndex + i];
      if (!slot || slot.state !== 'available') return false;
    }
    return true;
  };

  const handleSlotClick = (slot) => {
    if (slot.state !== 'available') return;

    // Reset duration to 1 if previously higher and not consecutive
    onSelectSlotTime(slot.startStr);
  };

  const getSlotStateBadge = (state, isSelected) => {
    if (isSelected) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F141C] bg-gradient-to-r from-[#D4AF37] to-[#C59B27] px-2.5 py-1 rounded-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F141C]" />
          Selected
        </span>
      );
    }

    switch (state) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E5C378] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378]" />
            Available
          </span>
        );
      case 'booked':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Booked
          </span>
        );
      case 'held':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Held in Checkout
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Maintenance
          </span>
        );
      case 'closed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">
            Closed
          </span>
        );
    }
  };

  // Format hold countdown (mm:ss)
  const formatHoldTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* 1. Date & Ground Selection Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-[#293442]">
        {/* Date Selector */}
        <div>
          <label htmlFor="slot-date-picker" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
            Select Date
          </label>
          <input
            id="slot-date-picker"
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => {
              onSelectDate(e.target.value);
              onSelectSlotTime(null);
            }}
            className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] [color-scheme:dark] cursor-pointer"
          />
        </div>

        {/* Ground / Court Selector */}
        <div>
          <label htmlFor="slot-ground-selector" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
            Select Pitch / Court
          </label>
          <select
            id="slot-ground-selector"
            value={selectedGroundId}
            onChange={(e) => {
              onSelectGround(e.target.value);
              onSelectSlotTime(null);
            }}
            className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
          >
            {facility.grounds.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Duration Selector (1, 2, or 3 hours) */}
      {selectedSlotTime && (
        <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div>
            <span className="text-xs font-bold text-[#F5F7FA] block">
              Match Duration
            </span>
            <span className="text-[11px] text-[#94A3B8]">
              Starting at {selectedSlotTime} on {facility.grounds.find((g) => g.id === selectedGroundId)?.name}
            </span>
          </div>

          <div className="flex gap-2" role="group" aria-label="Slot Duration">
            {[1, 2, 3].map((dur) => {
              const available = isDurationAvailable(dur);
              return (
                <button
                  key={dur}
                  type="button"
                  disabled={!available}
                  onClick={() => onChangeDuration(dur)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    durationHours === dur
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] shadow-sm'
                      : 'bg-[#141B24] border border-[#293442] text-[#94A3B8] hover:text-[#F5F7FA]'
                  }`}
                >
                  {dur} {dur === 1 ? 'Hour' : 'Hours'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Temporary Hold Countdown Alert */}
      {selectedSlotTime && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
            holdExpired
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-[#1B2530]/80 border-[#D4AF37]/40 text-[#F5F7FA]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className={`w-5 h-5 shrink-0 ${holdExpired ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-xs font-bold">
                {holdExpired ? 'Hold Expired' : 'Temporary 5-Minute Hold Active'}
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                {holdExpired
                  ? 'Your reservation hold has expired. Please pick your slot again.'
                  : 'Slot is reserved while you complete checkout. Countdown will release it if unconfirmed.'}
              </div>
            </div>
          </div>

          {!holdExpired && (
            <div className="text-right">
              <span className="text-lg font-mono font-black text-[#E5C378]">
                {formatHoldTime(holdRemainingSec)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. Slot Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#F5F7FA]">
          <caption className="sr-only">Available time slots for {facility.name} on {selectedDate}</caption>
          <thead className="bg-[#0B0F14] text-[11px] uppercase tracking-wider text-[#94A3B8] font-bold border-b border-[#293442]">
            <tr>
              <th scope="col" className="py-3 px-4">Time Window</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4">Rate</th>
              <th scope="col" className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#293442]/60 font-medium">
            {slots.map((slot) => {
              const isSelected = selectedSlots.some((s) => s.startStr === slot.startStr);
              const isDisabled = slot.state !== 'available';

              return (
                <tr
                  key={slot.startStr}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-[#D4AF37]/10 border-l-4 border-l-[#D4AF37]'
                      : isDisabled
                      ? 'bg-[#0B0F14]/40 opacity-70'
                      : 'hover:bg-[#1B2530]/60'
                  }`}
                >
                  <th scope="row" className="py-3.5 px-4 font-semibold text-[#F5F7FA]">
                    <div className="flex items-center gap-2">
                      <span>{slot.timeLabel}</span>
                      {slot.isPeak && (
                        <span className="text-[9px] font-bold uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                          Peak
                        </span>
                      )}
                    </div>
                  </th>

                  <td className="py-3.5 px-4">
                    {getSlotStateBadge(slot.state, isSelected)}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#E5C378]">
                    ₹{slot.price}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSlotClick(slot)}
                      aria-pressed={isSelected}
                      aria-disabled={isDisabled}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] shadow-sm'
                          : isDisabled
                          ? 'bg-[#141B24] text-slate-600 border border-slate-800'
                          : 'bg-[#141B24] border border-[#D4AF37]/40 text-[#E5C378] hover:border-[#D4AF37] hover:bg-[#D4AF37]/15'
                      }`}
                    >
                      {isSelected ? 'Selected' : isDisabled ? 'Unavailable' : 'Select'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. Demo Simulator Tools (Clearly Marked Test Panel) */}
      <div className="bg-[#0B0F14] border border-amber-500/40 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Demo Testing Simulator</span>
          </div>
          <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            Test Overlap Conflict
          </span>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Test real-time collision prevention: click below to simulate another player booking this exact slot right before your checkout confirmation.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedSlotTime}
            onClick={() => {
              if (selectedSlotTime) {
                onSimulateConflict(facility.id, selectedGroundId, selectedDate, selectedSlotTime);
              }
            }}
            className="hover:border-amber-400 hover:text-amber-400 text-xs py-1.5 px-3"
          >
            Simulate Another Player Booking This Slot
          </Button>

          {selectedSlotTime && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReleaseSlot}
              className="text-xs py-1.5 px-3"
            >
              Release Selection
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
