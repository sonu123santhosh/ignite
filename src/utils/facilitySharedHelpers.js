/**
 * SportLink - Single Source of Truth Shared Helpers
 * Used by both Player-Facing pages (FacilityDetails, Checkout, Browse)
 * and the Facility Owner Dashboard (Manage Slots, Block Dates, Bookings).
 */

import { getLocalDateStr, formatTime12h } from '../components/facility/facilityAdapter';

/**
 * Check if a time slot or range falls within an active owner Blocked Date
 */
export function isSlotBlocked(facilityId, groundId, dateStr, startStr, durationHours = 1, blockedDates = []) {
  if (!blockedDates || blockedDates.length === 0) return false;

  const slotStartHour = parseInt(startStr.split(':')[0], 10);
  const slotEndHour = slotStartHour + durationHours;

  return blockedDates.some((b) => {
    if (b.facilityId !== facilityId) return false;
    if (b.groundId && b.groundId !== 'all' && b.groundId !== groundId) return false;

    // Date range check (inclusive)
    if (dateStr < b.startDate || dateStr > b.endDate) return false;

    // If time is specified on the block
    if (b.startTime && b.endTime) {
      const blockStartH = parseInt(b.startTime.split(':')[0], 10);
      const blockEndH = parseInt(b.endTime.split(':')[0], 10);
      // Interval overlap: slotStart < blockEnd && slotEnd > blockStart
      return slotStartHour < blockEndH && slotEndHour > blockStartH;
    }

    // Full day block
    return true;
  });
}

/**
 * Unified Slot Generator used by both Player and Owner views
 */
export function generateSlotsUnified(
  facility,
  groundId,
  dateStr,
  existingBookings = [],
  customSlotOverrides = {},
  blockedDates = []
) {
  if (!facility || !facility.openTime || !facility.closeTime) return [];

  const slots = [];
  const openHour = parseInt(facility.openTime.split(':')[0], 10);
  const closeHour = parseInt(facility.closeTime.split(':')[0], 10);

  const todayStr = getLocalDateStr(new Date());
  const isToday = dateStr === todayStr;
  const currentHour = new Date().getHours();

  const standardPrice = facility.pricing?.offPeak ?? facility.pricing?.standardHourlyRate ?? 1000;
  const peakPrice = facility.pricing?.peak ?? facility.pricing?.peakHourlyRate ?? 1200;
  const peakHours = facility.pricing?.peakHours || [];

  for (let hour = openHour; hour < closeHour; hour++) {
    const startStr = `${hour.toString().padStart(2, '0')}:00`;
    const nextHour = hour + 1;
    const endStr = `${nextHour.toString().padStart(2, '0')}:00`;
    const timeLabel = `${startStr} - ${endStr}`;
    const timeLabel12h = `${formatTime12h(startStr)} - ${formatTime12h(endStr)}`;
    const slotKey = `${facility.id}_${groundId}_${dateStr}_${startStr}`;

    const isPeak = peakHours.includes(startStr);
    let slotPrice = isPeak ? peakPrice : standardPrice;
    let state = 'available';

    // 1. Check Owner Blocked Dates first
    if (isSlotBlocked(facility.id, groundId, dateStr, startStr, 1, blockedDates)) {
      state = 'maintenance';
    }

    // 2. Check Custom Owner Overrides
    if (state === 'available') {
      const override = customSlotOverrides[slotKey];
      if (override) {
        if (override.status === 'Block' || override.status === 'maintenance') state = 'maintenance';
        else if (override.status === 'Close') state = 'closed';
        else if (override.status === 'Open') state = 'available';

        if (override.price) slotPrice = override.price;
      }
    }

    // 3. Check Existing Active Bookings
    if (state === 'available') {
      const isBooked = existingBookings.some((b) => {
        if (b.facilityId !== facility.id || b.groundId !== groundId || b.date !== dateStr) return false;
        if (b.status !== 'Confirmed' && b.status !== 'Pending') return false;
        const bStart = parseInt(b.startTime.split(':')[0], 10);
        const bEnd = bStart + (b.durationHours || 1);
        return hour >= bStart && hour < bEnd;
      });

      if (isBooked) {
        state = 'booked';
      }
    }

    // 4. Check if slot start time has already passed today
    if (isToday && hour <= currentHour && state === 'available') {
      state = 'past';
    }

    slots.push({
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

  return slots;
}

/**
 * Unified Double-Booking & Overlap Check:
 * Checks against BOTH active bookings AND active blocked date ranges!
 */
export function checkSlotOverlapUnified(
  facilityId,
  groundId,
  dateStr,
  startTime,
  durationHours = 1,
  existingBookings = [],
  blockedDates = []
) {
  // 1. Check Blocked Dates
  if (isSlotBlocked(facilityId, groundId, dateStr, startTime, durationHours, blockedDates)) {
    return true; // Overlaps with an owner block
  }

  // 2. Check Active Bookings
  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = startHour + durationHours;

  const bookingOverlap = existingBookings.some((b) => {
    if (b.facilityId !== facilityId || b.groundId !== groundId || b.date !== dateStr) return false;
    if (b.status !== 'Confirmed' && b.status !== 'Pending') return false;
    const bStart = parseInt(b.startTime.split(':')[0], 10);
    const bEnd = bStart + (b.durationHours || 1);
    // Standard interval overlap: startHour < bEnd && endHour > bStart
    return startHour < bEnd && endHour > bStart;
  });

  return bookingOverlap;
}

/**
 * Pure price calculation helper with paise/integer precision
 */
export function calculateBookingPriceUnified(facility, durationHours, selectedSlots = []) {
  if (!selectedSlots || selectedSlots.length === 0) {
    return { basePrice: 0, taxPercent: 18, taxes: 0, platformFee: 0, total: 0 };
  }

  const basePrice = selectedSlots.reduce((sum, s) => sum + (s.price || 0), 0);
  const taxPercent = facility?.pricing?.taxPercent ?? 18;
  const taxes = Math.round((basePrice * taxPercent) / 100);
  const platformFee = facility?.pricing?.platformFee ?? 40;
  const total = basePrice + taxes + platformFee;

  return {
    basePrice,
    taxPercent,
    taxes,
    platformFee,
    total
  };
}
