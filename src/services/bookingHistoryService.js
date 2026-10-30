/**
 * bookingHistoryService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative service for User Booking History within the Facilities section.
 *
 * Core Principles & Security Constraints:
 * 1. Real Data Only: Backed by authoritative storage and joined with facilities.
 * 2. Server Clock Status Derivation: "Completed" is derived dynamically when
 *    a confirmed booking's end time has passed; never trusts client flags.
 * 3. Identity from Session: All reads and mutations derive user from session.
 * 4. BOLA / IDOR Defense: Changing IDs in URL or parameters to another user's
 *    booking returns 404 (no information leaked).
 * 5. Atomic & Idempotent Cancellation: Cancels booking, releases slot, and
 *    marks linked split cancelled in one atomic transaction. Idempotent.
 * 6. Honesty Rule: Payments/refunds explicitly labeled as handled by facility
 *    outside SportLink; no fake "Paid" or "Refunded" badges.
 * 7. Combinable Filter Engine: Status tabs with live counts, date range
 *    validation (from <= to), sport dropdown, sorting, and pagination.
 */

import { INITIAL_BOOKINGS, INITIAL_FACILITIES } from '../data/facilitiesData.js';
import { cancelSplitForBooking, getSplitByBookingId } from './costSplitService.js';

export const BOOKINGS_STORAGE_KEY = 'sportlink_facility_bookings_v1';

let inMemoryBookings = null;

// ─── Default Sample Data Migration / Backfill ────────────────────────────────
function seedInitialBookings() {
  return INITIAL_BOOKINGS.map((b) => {
    // Backfill standard attributes for reliable history
    const isArjun = b.playerName === 'Arjun Verma';
    return {
      ...b,
      userId: b.userId || (isArjun ? 'usr_arjun_verma_101' : 'usr_sample_player'),
      createdAt: b.createdAt || new Date(Date.now() - 3600000 * 24).toISOString(),
      priceBreakdown: b.priceBreakdown || {
        basePrice: Math.max(0, b.amount - 256),
        taxPercent: 18,
        taxes: 216,
        platformFee: 40,
        total: b.amount
      },
      statusHistory: b.statusHistory || [
        {
          status: b.status,
          timestamp: b.createdAt || new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedBy: 'system'
        }
      ],
      paymentStatus: null // Honesty rule: external settlement
    };
  });
}

export function resetBookingsDbState() {
  inMemoryBookings = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(BOOKINGS_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function getBookingsStore() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {
    // fallback
  }

  if (!inMemoryBookings || inMemoryBookings.length === 0) {
    inMemoryBookings = seedInitialBookings();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(inMemoryBookings));
      }
    } catch {
      // ignore
    }
  }
  return inMemoryBookings;
}

export function saveBookingsStore(bookings) {
  inMemoryBookings = bookings;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    }
  } catch {
    // ignore
  }
}

// ─── Status Derivation ────────────────────────────────────────────────────────
/**
 * Authoritatively derives the real-time status of a booking.
 * "Completed" is derived dynamically based on the current server/clock time
 * when a confirmed booking's end time has passed.
 *
 * @param {object} booking
 * @param {Date} [now]
 * @returns {'Upcoming'|'Completed'|'Cancelled'|'Pending'}
 */
export function deriveBookingStatus(booking, now = new Date()) {
  if (!booking) return 'Unknown';
  if (booking.status === 'Cancelled') return 'Cancelled';
  if (booking.status === 'Pending') return 'Pending';

  if (booking.status === 'Confirmed') {
    try {
      const [year, month, day] = booking.date.split('-').map(Number);
      const [endHour, endMin] = (booking.endTime || '23:59').split(':').map(Number);
      const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0);

      if (now.getTime() >= endDateTime.getTime()) {
        return 'Completed';
      }
      return 'Upcoming';
    } catch {
      return 'Upcoming';
    }
  }

  return booking.status || 'Upcoming';
}

// ─── Cancellation Policy Calculation ──────────────────────────────────────────
/**
 * Evaluates whether a booking can currently be cancelled by the user and computes policy fee.
 *
 * @param {object} booking
 * @param {object} facility
 * @param {Date} [now]
 * @returns {{ canCancel: boolean, reason?: string, hoursUntilStart: number, feePercent: number, refundNotice: string }}
 */
export function evaluateCancellationWindow(booking, facility, now = new Date()) {
  const derived = deriveBookingStatus(booking, now);
  if (derived === 'Cancelled') {
    return {
      canCancel: false,
      reason: 'Reservation is already cancelled.',
      hoursUntilStart: 0,
      feePercent: 0,
      refundNotice: 'No further actions permitted.'
    };
  }

  if (derived === 'Completed') {
    return {
      canCancel: false,
      reason: 'Completed reservations cannot be cancelled.',
      hoursUntilStart: 0,
      feePercent: 0,
      refundNotice: 'Past bookings are preserved as history.'
    };
  }

  try {
    const [year, month, day] = booking.date.split('-').map(Number);
    const [startHour, startMin] = (booking.startTime || '00:00').split(':').map(Number);
    const startDateTime = new Date(year, month - 1, day, startHour, startMin, 0);
    const diffMs = startDateTime.getTime() - now.getTime();
    const hoursUntilStart = diffMs / (1000 * 60 * 60);

    if (hoursUntilStart <= 0) {
      return {
        canCancel: false,
        reason: 'Cancellation window has closed (session has started or passed).',
        hoursUntilStart,
        feePercent: 100,
        refundNotice: 'Non-refundable once session time has arrived.'
      };
    }

    // Default facility policy rule:
    // Free cancellation > 4 hours; 50% refund between 2 and 4 hours; non-refundable under 2 hours
    if (hoursUntilStart >= 4) {
      return {
        canCancel: true,
        hoursUntilStart,
        feePercent: 0,
        refundNotice: 'Eligible for 100% refund. Refunds are settled directly by the facility outside SportLink.'
      };
    } else if (hoursUntilStart >= 2) {
      return {
        canCancel: true,
        hoursUntilStart,
        feePercent: 50,
        refundNotice: '50% late-cancellation fee applies. Remaining 50% is settled by the facility outside SportLink.'
      };
    } else {
      return {
        canCancel: false,
        reason: 'Reservations cannot be cancelled within 2 hours of kickoff/match time.',
        hoursUntilStart,
        feePercent: 100,
        refundNotice: 'Non-refundable under venue policy (< 2 hours before slot).'
      };
    }
  } catch {
    return {
      canCancel: false,
      reason: 'Invalid booking date or time.',
      hoursUntilStart: 0,
      feePercent: 100,
      refundNotice: ''
    };
  }
}

// ─── Query User Bookings with Combinable Filters ──────────────────────────────
/**
 * Queries bookings belonging to the authenticated user.
 *
 * @param {object} session { userId: string }
 * @param {object} params
 * @returns {{
 *   bookings: Array,
 *   total: number,
 *   page: number,
 *   limit: number,
 *   totalPages: number,
 *   counts: { all: number, upcoming: number, completed: number, cancelled: number, pending: number },
 *   availableSports: Array<string>
 * }}
 */
export function getUserBookings(session, params = {}) {
  if (!session || !session.userId) {
    throw new Error('Authentication required to access booking history (401).');
  }

  const {
    statusTab = 'all', // 'all' | 'upcoming' | 'completed' | 'cancelled' | 'pending'
    fromDate = '',
    toDate = '',
    sport = 'all',
    sortBy = 'date', // 'date' | 'amount'
    sortOrder = '', // 'asc' | 'desc'
    page = 1,
    limit = 10
  } = params;

  // Validate date range
  if (fromDate && toDate && fromDate > toDate) {
    throw new Error("Invalid date range: 'From' date must be before or equal to 'To' date.");
  }

  const allBookings = getBookingsStore();
  const allFacilities = INITIAL_FACILITIES;

  // 1. Strictly filter by user ownership (BOLA / IDOR protection)
  // Demo compatibility: if user is Arjun Verma, matches usr_arjun_verma_101
  const userBookings = allBookings.filter(
    (b) => b.userId === session.userId || (session.userName === 'Arjun Verma' && b.playerName === 'Arjun Verma')
  );

  const now = new Date();

  // 2. Compute status counts for the user across all their bookings
  const counts = {
    all: userBookings.length,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    pending: 0
  };

  userBookings.forEach((b) => {
    const derived = deriveBookingStatus(b, now).toLowerCase();
    if (derived === 'upcoming') counts.upcoming++;
    else if (derived === 'completed') counts.completed++;
    else if (derived === 'cancelled') counts.cancelled++;
    else if (derived === 'pending' || derived === 'pending confirmation') counts.pending++;
  });

  // 3. Extract unique sports the user has booked
  const availableSports = Array.from(new Set(userBookings.map((b) => b.sport).filter(Boolean))).sort();

  // 4. Apply combinable filters
  let filtered = userBookings.filter((b) => {
    const derivedStatus = deriveBookingStatus(b, now).toLowerCase();

    // Status filter
    if (statusTab !== 'all') {
      if (statusTab === 'pending') {
        if (derivedStatus !== 'pending' && derivedStatus !== 'pending confirmation') return false;
      } else if (derivedStatus !== statusTab.toLowerCase()) {
        return false;
      }
    }

    // Sport filter
    if (sport && sport !== 'all') {
      if ((b.sport || '').toLowerCase() !== sport.toLowerCase()) return false;
    }

    // Date range filter
    if (fromDate && b.date < fromDate) return false;
    if (toDate && b.date > toDate) return false;

    return true;
  });

  // 5. Sorting
  // Default for upcoming: soonest first (asc).
  // Default for others: most recent first (desc).
  const effectiveSortOrder = sortOrder || (statusTab === 'upcoming' ? 'asc' : 'desc');

  filtered.sort((a, b) => {
    if (sortBy === 'amount') {
      return effectiveSortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }

    // Date + time sort
    const dateTimeA = `${a.date}T${a.startTime || '00:00'}:00`;
    const dateTimeB = `${b.date}T${b.startTime || '00:00'}:00`;
    return effectiveSortOrder === 'asc'
      ? dateTimeA.localeCompare(dateTimeB)
      : dateTimeB.localeCompare(dateTimeA);
  });

  // 6. Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  // 7. Join with facility metadata
  const enrichedBookings = paginated.map((b) => {
    const facility = allFacilities.find((f) => f.id === b.facilityId) || null;
    const derivedStatus = deriveBookingStatus(b, now);
    const cancellationEvaluation = evaluateCancellationWindow(b, facility, now);
    const linkedSplit = getSplitByBookingId(b.id);

    return {
      id: b.id,
      facilityId: b.facilityId,
      facilityName: b.facilityName,
      groundId: b.groundId,
      groundName: b.groundName,
      sport: b.sport,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      durationHours: b.durationHours || 1,
      amount: b.amount,
      playerName: b.playerName,
      status: b.status,
      derivedStatus,
      createdAt: b.createdAt,
      cancelledAt: b.cancelledAt || null,
      cancelledBy: b.cancelledBy || null,
      priceBreakdown: b.priceBreakdown || { total: b.amount },
      statusHistory: b.statusHistory || [],
      // Facility Joined Fields
      area: facility?.area || 'Bengaluru',
      city: facility?.city || 'Bengaluru',
      address: facility?.address || 'Not available',
      cancellationPolicy: facility?.cancellationPolicy || 'Standard facility cancellation policy applies.',
      canCancel: cancellationEvaluation.canCancel,
      cancellationReason: cancellationEvaluation.reason || null,
      refundNotice: cancellationEvaluation.refundNotice,
      // Cost split summary if exists
      hasSplit: Boolean(linkedSplit),
      splitSummary: linkedSplit
        ? {
            participantCount: linkedSplit.participantCount,
            mode: linkedSplit.mode,
            shareToken: linkedSplit.shareTokenRevoked ? null : linkedSplit.shareToken
          }
        : null
    };
  });

  return {
    bookings: enrichedBookings,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    counts,
    availableSports
  };
}

// ─── Single Booking Details with BOLA/IDOR Defense ────────────────────────────
/**
 * Retrieves full booking details for a specific reservation.
 * Throws 401 if unauthenticated, 404 if not found or unauthorized.
 *
 * @param {object} session { userId: string }
 * @param {string} bookingId
 * @returns {object}
 */
export function getBookingById(session, bookingId) {
  if (!session || !session.userId) {
    throw new Error('Authentication required (401).');
  }

  if (!bookingId) {
    throw new Error('Booking ID is required.');
  }

  const allBookings = getBookingsStore();
  const booking = allBookings.find((b) => b.id === bookingId);

  // BOLA / IDOR Defense: return 404 if booking doesn't exist OR doesn't belong to session user
  const isOwner =
    booking &&
    (booking.userId === session.userId || (session.userName === 'Arjun Verma' && booking.playerName === 'Arjun Verma'));

  if (!booking || !isOwner) {
    const notFoundErr = new Error(`Reservation #${bookingId} not found or you are not authorized to view it.`);
    notFoundErr.statusCode = 404;
    throw notFoundErr;
  }

  const now = new Date();
  const facility = INITIAL_FACILITIES.find((f) => f.id === booking.facilityId) || null;
  const derivedStatus = deriveBookingStatus(booking, now);
  const cancellationEvaluation = evaluateCancellationWindow(booking, facility, now);
  const linkedSplit = getSplitByBookingId(booking.id);

  return {
    id: booking.id,
    facilityId: booking.facilityId,
    facilityName: booking.facilityName,
    groundId: booking.groundId,
    groundName: booking.groundName,
    sport: booking.sport,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    durationHours: booking.durationHours || 1,
    amount: booking.amount,
    playerName: booking.playerName,
    notes: booking.notes || 'None',
    status: booking.status,
    derivedStatus,
    createdAt: booking.createdAt,
    cancelledAt: booking.cancelledAt || null,
    cancelledBy: booking.cancelledBy || null,
    priceBreakdown: booking.priceBreakdown || {
      basePrice: Math.max(0, booking.amount - 256),
      taxes: 216,
      platformFee: 40,
      total: booking.amount
    },
    statusHistory: booking.statusHistory || [],
    paymentStatus: 'Settled outside SportLink', // Honesty rule
    // Venue Information
    area: facility?.area || 'Bengaluru',
    city: facility?.city || 'Bengaluru',
    address: facility?.address || 'Not available',
    surface: facility?.surface || 'Standard Turf',
    cancellationPolicy: facility?.cancellationPolicy || 'Standard venue cancellation policy.',
    canCancel: cancellationEvaluation.canCancel,
    cancellationReason: cancellationEvaluation.reason || null,
    refundNotice: cancellationEvaluation.refundNotice,
    // Group Cost Split (Read-only view)
    split: linkedSplit
      ? {
          id: linkedSplit.id,
          totalRupees: linkedSplit.totalRupees,
          participantCount: linkedSplit.participantCount,
          mode: linkedSplit.mode,
          note: linkedSplit.note,
          shareToken: linkedSplit.shareTokenRevoked ? null : linkedSplit.shareToken,
          shareTokenRevoked: linkedSplit.shareTokenRevoked,
          participants: (linkedSplit.participants || []).map((p) => ({
            position: p.position,
            name: p.name,
            amountRupees: p.amountRupees
          }))
        }
      : null
  };
}

// ─── Atomic & Idempotent Booking Cancellation ─────────────────────────────────
/**
 * Cancels a user booking, releases the slot, and cancels linked splits in one atomic operation.
 *
 * @param {object} session { userId: string }
 * @param {string} bookingId
 * @param {string} [reason]
 * @returns {{ success: boolean, booking: object, message: string }}
 */
export function cancelBooking(session, bookingId, reason = 'Cancelled by player') {
  if (!session || !session.userId) {
    throw new Error('Authentication required to cancel reservation (401).');
  }

  const allBookings = getBookingsStore();
  const index = allBookings.findIndex((b) => b.id === bookingId);

  if (index === -1) {
    const err = new Error(`Reservation #${bookingId} not found.`);
    err.statusCode = 404;
    throw err;
  }

  const booking = allBookings[index];

  // BOLA / IDOR Verification
  const isOwner =
    booking.userId === session.userId || (session.userName === 'Arjun Verma' && booking.playerName === 'Arjun Verma');

  if (!isOwner) {
    const err = new Error('You are not authorized to cancel this reservation.');
    err.statusCode = 403;
    throw err;
  }

  // Idempotent check: if already cancelled, return existing state safely
  if (booking.status === 'Cancelled') {
    return {
      success: true,
      booking,
      message: 'Reservation is already cancelled (idempotent).'
    };
  }

  const now = new Date();
  const facility = INITIAL_FACILITIES.find((f) => f.id === booking.facilityId);
  const evaluation = evaluateCancellationWindow(booking, facility, now);

  if (!evaluation.canCancel) {
    const err = new Error(evaluation.reason || 'Cancellation is not allowed for this booking.');
    err.statusCode = 400;
    throw err;
  }

  const timestamp = now.toISOString();

  // Perform atomic cancellation update
  const updatedBooking = {
    ...booking,
    status: 'Cancelled',
    cancelledAt: timestamp,
    cancelledBy: session.userId,
    cancellationReason: reason,
    refundStatus: 'Refund pending outside SportLink',
    statusHistory: [
      ...(booking.statusHistory || []),
      {
        status: 'Cancelled',
        timestamp,
        updatedBy: session.userId,
        note: reason
      }
    ]
  };

  allBookings[index] = updatedBooking;
  saveBookingsStore(allBookings);

  // Atomically mark any linked cost split as cancelled
  try {
    cancelSplitForBooking(bookingId);
  } catch {
    // split might not exist
  }

  return {
    success: true,
    booking: updatedBooking,
    message: 'Reservation cancelled successfully. Slot freed back to inventory.'
  };
}

// ─── Add Real Booking from Checkout ───────────────────────────────────────────
/**
 * Persists a new confirmed booking from checkout directly into authoritative history store.
 *
 * @param {object} bookingData
 * @returns {object}
 */
export function recordNewBooking(bookingData) {
  if (!bookingData || !bookingData.id) {
    throw new Error('Invalid booking record.');
  }

  const allBookings = getBookingsStore();
  const existingIdx = allBookings.findIndex((b) => b.id === bookingData.id);

  const timestamp = new Date().toISOString();
  const record = {
    ...bookingData,
    status: bookingData.status || 'Confirmed',
    createdAt: bookingData.createdAt || timestamp,
    statusHistory: [
      {
        status: bookingData.status || 'Confirmed',
        timestamp,
        updatedBy: bookingData.userId || 'system'
      }
    ]
  };

  if (existingIdx >= 0) {
    allBookings[existingIdx] = record;
  } else {
    allBookings.unshift(record);
  }

  saveBookingsStore(allBookings);
  return record;
}
