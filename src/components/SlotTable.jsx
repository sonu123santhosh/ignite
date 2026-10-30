import React, { useState, useRef } from 'react';
import {
  Clock,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from './Button';
import {
  getLocalDateStr,
  addDaysLocal,
  formatDisplayDate,
  formatINR,
  formatTime12h
} from './facility/facilityAdapter';

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
  existingBookings = [],
  customSlotOverrides = {},
  onSimulateConflict,
  onReleaseSlot,
  holdRemainingSec,
  holdExpired
}) {
  const todayStr = getLocalDateStr();

  // Loading & error states on date change
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const requestCounterRef = useRef(0);
  const dateStripRef = useRef(null);

  // Generate 14-day strip starting from today local
  const next14Days = Array.from({ length: 14 }, (_, i) => {
    const dateStr = addDaysLocal(todayStr, i);
    const { weekday, dayNum, month } = formatDisplayDate(dateStr);
    return {
      dateStr,
      isToday: i === 0,
      weekday: i === 0 ? 'Today' : weekday,
      dayNum,
      month
    };
  });

  // Handle date change with loading skeleton & stale-response cancellation
  const handleDateChange = (newDate) => {
    if (newDate === selectedDate) return;
    onSelectDate(newDate);
    onSelectSlotTime(null);

    const requestId = ++requestCounterRef.current;
    setIsLoading(true);
    setHasError(false);

    // Brief simulation of slot fetch / refresh to display skeleton smoothly
    setTimeout(() => {
      if (requestId === requestCounterRef.current) {
        setIsLoading(false);
      }
    }, 150);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  // Scroll 14-day strip
  const scrollDateStrip = (direction) => {
    if (dateStripRef.current) {
      dateStripRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      });
    }
  };

  // Check if facility has opening hours configured
  const hasConfiguredHours = Boolean(facility?.openTime && facility?.closeTime);

  // Slot generation pure logic
  const slots = React.useMemo(() => {
    if (!hasConfiguredHours) return [];

    const generated = [];
    const openHour = parseInt(facility.openTime.split(':')[0], 10);
    const closeHour = parseInt(facility.closeTime.split(':')[0], 10);

    const isToday = selectedDate === todayStr;
    const now = new Date();
    const currentHour = now.getHours();

    const standardPrice = facility.pricing?.standardHourlyRate || facility.pricing?.offPeak || 1000;
    const peakPrice = facility.pricing?.peakHourlyRate || facility.pricing?.peak || 1200;
    const peakHours = facility.pricing?.peakHours || [];

    for (let hour = openHour; hour < closeHour; hour++) {
      const startStr = `${hour.toString().padStart(2, '0')}:00`;
      const nextHour = hour + 1;
      const endStr = `${nextHour.toString().padStart(2, '0')}:00`;
      const timeLabel = `${startStr} - ${endStr}`;
      const timeLabel12h = `${formatTime12h(startStr)} - ${formatTime12h(endStr)}`;
      const slotKey = `${facility.id}_${selectedGroundId}_${selectedDate}_${startStr}`;

      const isPeak = peakHours.includes(startStr);
      let slotPrice = isPeak ? peakPrice : standardPrice;
      let state = 'available';

      // Check owner custom overrides
      const override = customSlotOverrides[slotKey];
      if (override) {
        if (override.status === 'Block' || override.status === 'maintenance') state = 'maintenance';
        else if (override.status === 'Close') state = 'closed';
        else if (override.status === 'Open') state = 'available';

        if (override.price) slotPrice = override.price;
      }

      // Check existing active bookings
      if (state === 'available') {
        const isBooked = existingBookings.some((b) => {
          if (b.facilityId !== facility.id || b.groundId !== selectedGroundId || b.date !== selectedDate) return false;
          if (b.status !== 'Confirmed' && b.status !== 'Pending') return false;
          const bStart = parseInt(b.startTime.split(':')[0], 10);
          const bEnd = bStart + (b.durationHours || 1);
          return hour >= bStart && hour < bEnd;
        });

        if (isBooked) {
          state = 'booked';
        }
      }

      // Check if slot start time has already passed today
      if (isToday && hour <= currentHour && state === 'available') {
        state = 'past';
      }

      // Demo deterministic states for realistic preview
      if (state === 'available') {
        if (hour === 14 && (facility.id === 'fac-1' || facility.id === 'fac-3')) {
          state = 'maintenance';
        } else if (hour === 16 && facility.id === 'fac-2') {
          state = 'held';
        }
      }

      generated.push({
        startStr,
        endStr,
        timeLabel,
        timeLabel12h,
        isPeak,
        price: slotPrice,
        state, // 'available' | 'booked' | 'held' | 'maintenance' | 'past' | 'closed'
        slotKey
      });
    }

    return generated;
  }, [facility, selectedGroundId, selectedDate, todayStr, hasConfiguredHours, existingBookings, customSlotOverrides]);

  // Selected consecutive slots based on duration
  const selectedSlots = React.useMemo(() => {
    if (!selectedSlotTime) return [];
    const startIndex = slots.findIndex((s) => s.startStr === selectedSlotTime);
    if (startIndex === -1) return [];

    const result = [];
    for (let i = 0; i < durationHours; i++) {
      const current = slots[startIndex + i];
      if (current) result.push(current);
    }
    return result;
  }, [slots, selectedSlotTime, durationHours]);

  // Check if consecutive duration is available
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
    onSelectSlotTime(slot.startStr);
  };

  const formatHoldTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Available
          </span>
        );
      case 'booked':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Booked
          </span>
        );
      case 'held':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Held
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Maintenance
          </span>
        );
      case 'past':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            Past
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">
            Unavailable
          </span>
        );
    }
  };

  // If facility has no opening hours configured
  if (!hasConfiguredHours) {
    return (
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-[#0B0F14] border border-[#293442] flex items-center justify-center text-amber-400 mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#F5F7FA]">
            Online Slot Booking Unavailable
          </h3>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto mt-1">
            Online slot booking isn&apos;t available for this facility yet. Contact the venue directly to schedule playtime.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* 1. Ground / Pitch Selector & Custom Date Calendar Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-[#293442]">
        {/* Pitch / Court Selector */}
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

        {/* Extended Calendar Picker for Later Dates */}
        <div>
          <label htmlFor="slot-date-picker" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
            Specific or Later Date
          </label>
          <input
            id="slot-date-picker"
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] [color-scheme:dark] cursor-pointer"
          />
        </div>
      </div>

      {/* 2. 14-Day Quick Date Selection Strip */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
            Next 14 Days
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scrollDateStrip('left')}
              aria-label="Scroll dates left"
              className="p-1 rounded-lg bg-[#0B0F14] border border-[#293442] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollDateStrip('right')}
              aria-label="Scroll dates right"
              className="p-1 rounded-lg bg-[#0B0F14] border border-[#293442] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={dateStripRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
          role="tablist"
          aria-label="14-day schedule selector"
        >
          {next14Days.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleDateChange(d.dateStr)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#D4AF37] to-[#C59B27] text-[#0F141C] border-[#D4AF37] shadow-md font-bold'
                    : 'bg-[#0B0F14] border-[#293442] text-[#94A3B8] hover:border-[#D4AF37]/50 hover:text-white'
                }`}
              >
                <span className={`block text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-[#0F141C]' : 'text-slate-400'}`}>
                  {d.weekday}
                </span>
                <span className={`block text-sm font-black ${isSelected ? 'text-[#0F141C]' : 'text-[#F5F7FA]'}`}>
                  {d.dayNum} {d.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Duration Selector (Multi-hour combining) */}
      {selectedSlotTime && (
        <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div>
            <span className="text-xs font-bold text-[#F5F7FA] block">
              Match Duration
            </span>
            <span className="text-[11px] text-[#94A3B8]">
              Starting at {selectedSlotTime} ({formatTime12h(selectedSlotTime)})
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

      {/* 4. Temporary Hold Countdown Alert */}
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
                  : 'Slot is temporarily held while you review. Confirm checkout before timeout.'}
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

      {/* 5. Slot States Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-[#293442]/60">
        <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span className="text-slate-400">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-slate-400">Held</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="text-slate-400">Maintenance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <span className="text-slate-500">Past</span>
        </div>
      </div>

      {/* 6. Slot Table or Loading / Error State */}
      {isLoading ? (
        <div className="space-y-2 py-8 animate-pulse" aria-label="Loading available slots">
          <div className="h-10 bg-[#0B0F14] rounded-xl" />
          <div className="h-12 bg-[#0B0F14]/70 rounded-xl" />
          <div className="h-12 bg-[#0B0F14]/70 rounded-xl" />
          <div className="h-12 bg-[#0B0F14]/70 rounded-xl" />
        </div>
      ) : hasError ? (
        <div className="bg-[#0B0F14] border border-rose-500/30 rounded-xl p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <div className="text-xs text-rose-200">Failed to load schedule for this date.</div>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F5F7FA]">
            <caption className="sr-only">Available time slots for {facility.name} on {selectedDate}</caption>
            <thead className="bg-[#0B0F14] text-[11px] uppercase tracking-wider text-[#94A3B8] font-bold border-b border-[#293442]">
              <tr>
                <th scope="col" className="py-3 px-4">Time Window</th>
                <th scope="col" className="py-3 px-4">Duration</th>
                <th scope="col" className="py-3 px-4">Status</th>
                <th scope="col" className="py-3 px-4">Tariff</th>
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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                        <span>{slot.timeLabel}</span>
                        <span className="text-[10px] text-[#94A3B8] font-normal">
                          ({slot.timeLabel12h})
                        </span>
                        {slot.isPeak && (
                          <span className="text-[9px] font-bold uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30 w-fit">
                            Peak
                          </span>
                        )}
                      </div>
                    </th>

                    <td className="py-3.5 px-4 text-slate-400">
                      1 hr
                    </td>

                    <td className="py-3.5 px-4">
                      {getSlotStateBadge(slot.state, isSelected)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#E5C378]">
                      {formatINR(slot.price)}
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
      )}

      {/* 7. Conflict Simulator Tool */}
      <div className="bg-[#0B0F14] border border-amber-500/40 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Double-Booking Prevention Simulator</span>
          </div>
          <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            Conflict Testing
          </span>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Simulate a concurrent booking collision: another player books this slot right before your checkout confirmation.
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
            Simulate Rival Player Booking This Slot
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
