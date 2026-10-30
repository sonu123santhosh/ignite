/**
 * SportLink - Server-Side Security, Storage & Authorization Service for Facility Owners
 *
 * Enforces:
 * 1. Server-side session extraction (never trusting client IDs/roles in body).
 * 2. Ownership authorization (BOLA / IDOR protection): 403/404 on mismatched ownerId.
 * 3. Mass-assignment protection: client cannot tamper ownerId, verified status, or approval flags.
 * 4. Input validation and sanitization.
 * 5. Single Source of Truth for facilities, slots, pricing, blocked dates, bookings, payments, and audit logs.
 * 6. Audit trail for sensitive operations.
 */

import {
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS
} from '../data/facilitiesData.js';
import { storageWrapper } from '../data/trialsData.js';

export const FACILITIES_STORAGE_KEY = 'sportlink_facilities_store_v2';
export const AUDIT_LOGS_STORAGE_KEY = 'sportlink_owner_audit_logs_v1';

// Seed demo owner personas
export const OWNER_PERSONAS = [
  {
    id: 'own-1',
    name: 'Vikram Malhotra',
    email: 'vikram.m@sportlink.in',
    phone: '+91 98450 12345',
    role: 'owner',
    company: 'Malhotra Sports & Arenas Ltd.',
    avatar: 'VM'
  },
  {
    id: 'own-2',
    name: 'Rajesh Patel',
    email: 'rajesh.p@sportlink.in',
    phone: '+91 98220 54321',
    role: 'owner',
    company: 'Apex Turf Ventures',
    avatar: 'RP'
  },
  {
    id: 'own-3',
    name: 'Anita Rao',
    email: 'anita.rao@sportlink.in',
    phone: '+91 98111 67890',
    role: 'owner',
    company: 'Metro Court Management',
    avatar: 'AR'
  }
];

// Initial Blocked Dates Seed
export const INITIAL_BLOCKED_DATES = [
  {
    id: 'blk-1',
    facilityId: 'fac-1',
    groundId: 'g1-1',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '14:00',
    reason: 'Quarterly turf grooming & infill leveling',
    createdAt: new Date().toISOString(),
    createdBy: 'own-1'
  },
  {
    id: 'blk-2',
    facilityId: 'fac-2',
    groundId: 'g2-1',
    startDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    startTime: '08:00',
    endTime: '12:00',
    reason: 'Yonex court mat deep cleaning and line repainting',
    createdAt: new Date().toISOString(),
    createdBy: 'own-1'
  }
];

// Initial Payment Records Seed (linked to confirmed sample bookings)
export const INITIAL_PAYMENTS = [
  {
    id: 'pay-101',
    bookingId: 'bk-101',
    facilityId: 'fac-1',
    amount: 1456, // ₹1,456
    currency: 'INR',
    status: 'captured', // 'captured' | 'pending' | 'refunded' | 'failed'
    paymentMethod: 'UPI / NetBanking',
    transactionRef: 'TXN-SPL-987123',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'pay-102',
    bookingId: 'bk-102',
    facilityId: 'fac-2',
    amount: 556,
    currency: 'INR',
    status: 'captured',
    paymentMethod: 'Credit Card',
    transactionRef: 'TXN-SPL-987124',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'pay-103',
    bookingId: 'bk-103',
    facilityId: 'fac-4',
    amount: 374,
    currency: 'INR',
    status: 'captured',
    paymentMethod: 'Debit Card',
    transactionRef: 'TXN-SPL-987125',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'pay-105',
    bookingId: 'bk-105',
    facilityId: 'fac-3',
    amount: 856,
    currency: 'INR',
    status: 'captured',
    paymentMethod: 'UPI',
    transactionRef: 'TXN-SPL-987127',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  },
  {
    id: 'pay-106',
    bookingId: 'bk-106',
    facilityId: 'fac-5',
    amount: 1215,
    currency: 'INR',
    status: 'refunded',
    paymentMethod: 'UPI',
    transactionRef: 'TXN-SPL-987128-REF',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  }
];

/**
 * Load full database state from storage or seed defaults
 */
export function getDatabaseState() {
  const defaultState = {
    facilities: INITIAL_FACILITIES,
    bookings: INITIAL_BOOKINGS.map((b) => ({
      ...b,
      priceSnapshot: b.priceSnapshot || {
        basePrice: b.amount ? Math.round(b.amount / 1.2) : 1000,
        taxPercent: 18,
        taxes: b.amount ? Math.round(b.amount - b.amount / 1.2) : 180,
        platformFee: 40,
        total: b.amount || 1220
      },
      paymentStatus: b.status === 'Cancelled' ? 'refunded' : 'captured'
    })),
    blockedDates: INITIAL_BLOCKED_DATES,
    payments: INITIAL_PAYMENTS,
    customSlotOverrides: {},
    activeSession: {
      user: OWNER_PERSONAS[0], // Vikram Malhotra (own-1)
      token: 'demo-token-own-1'
    }
  };

  return storageWrapper.get(FACILITIES_STORAGE_KEY, defaultState);
}

/**
 * Persist updated database state
 */
export function saveDatabaseState(state) {
  storageWrapper.set(FACILITIES_STORAGE_KEY, state);
}

/**
 * Record an audit log entry for sensitive owner mutations
 */
export function recordAuditLog({ userId, action, entityType, entityId, facilityId, before, after }) {
  const currentLogs = storageWrapper.get(AUDIT_LOGS_STORAGE_KEY, []);
  const entry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId,
    action,
    entityType,
    entityId,
    facilityId,
    before: before ? JSON.parse(JSON.stringify(before)) : null,
    after: after ? JSON.parse(JSON.stringify(after)) : null
  };
  const updated = [entry, ...currentLogs.slice(0, 199)]; // Keep latest 200 logs
  storageWrapper.set(AUDIT_LOGS_STORAGE_KEY, updated);
  return entry;
}

export function getAuditLogsForFacility(facilityId) {
  const logs = storageWrapper.get(AUDIT_LOGS_STORAGE_KEY, []);
  if (!facilityId) return logs;
  return logs.filter((l) => l.facilityId === facilityId);
}

// -----------------------------------------------------------------------------
// SERVER-SIDE SECURITY MIDDLEWARE & AUTHORIZATION
// -----------------------------------------------------------------------------

/**
 * Validates session and checks role === 'owner'
 */
function authenticateSession(session) {
  if (!session || !session.user || !session.user.id) {
    throw new ApiError(401, 'Unauthorized: Valid owner authentication session required.');
  }
  if (session.user.role !== 'owner') {
    throw new ApiError(403, 'Forbidden: Access denied. Facility Owner role required.');
  }
  return session.user;
}

/**
 * Authorize that a facility belongs to the authenticated owner
 */
function authorizeFacilityOwnership(db, facilityId, ownerId) {
  const facility = db.facilities.find((f) => f.id === facilityId);
  if (!facility) {
    throw new ApiError(404, `Facility with ID "${facilityId}" was not found.`);
  }
  if (facility.ownerId !== ownerId) {
    // Return 404 to avoid leaking existence of another owner's record
    throw new ApiError(404, `Facility with ID "${facilityId}" was not found.`);
  }
  return facility;
}

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// -----------------------------------------------------------------------------
// FACILITY OWNER API CONTROLLER ENDPOINTS
// -----------------------------------------------------------------------------

export const facilityOwnerApi = {
  /**
   * 1. GET /api/owner/overview
   */
  getOverview(session) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const myFacilities = db.facilities.filter((f) => f.ownerId === user.id);
    const myFacilityIds = new Set(myFacilities.map((f) => f.id));

    const myBookings = db.bookings.filter((b) => myFacilityIds.has(b.facilityId));
    const upcomingBookings = myBookings.filter((b) => b.status === 'Confirmed' || b.status === 'Pending');
    const completedBookings = myBookings.filter((b) => b.status === 'Completed');
    const pendingRequests = myBookings.filter((b) => b.status === 'Pending');

    // Revenue only from captured payments
    const myPayments = db.payments.filter((p) => myFacilityIds.has(p.facilityId));
    const totalEarnings = myPayments
      .filter((p) => p.status === 'captured')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Performance snapshot per facility
    const facilitySnapshots = myFacilities.map((fac) => {
      const facBookings = myBookings.filter((b) => b.facilityId === fac.id);
      const activeBookingsCount = facBookings.filter((b) => b.status === 'Confirmed' || b.status === 'Completed').length;
      return {
        id: fac.id,
        name: fac.name,
        sport: fac.sport,
        status: fac.status || 'Live',
        verified: Boolean(fac.verified),
        totalBookings: facBookings.length,
        activeBookingsCount,
        rating: fac.rating || 0,
        reviewCount: fac.reviewCount || 0
      };
    });

    return {
      success: true,
      data: {
        totalFacilities: myFacilities.length,
        upcomingBookingsCount: upcomingBookings.length,
        completedBookingsCount: completedBookings.length,
        pendingRequestsCount: pendingRequests.length,
        totalEarnings,
        hasPaymentData: myPayments.length > 0,
        recentBookings: myBookings.slice(0, 8),
        facilitySnapshots
      }
    };
  },

  /**
   * 2. GET /api/owner/facilities
   */
  getMyFacilities(session, filters = {}) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    let list = db.facilities.filter((f) => f.ownerId === user.id);

    if (filters.sport && filters.sport !== 'All') {
      list = list.filter((f) => f.sport.toLowerCase() === filters.sport.toLowerCase());
    }
    if (filters.status && filters.status !== 'All') {
      list = list.filter((f) => (f.status || 'Live').toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.area.toLowerCase().includes(q));
    }

    return {
      success: true,
      data: list
    };
  },

  /**
   * 3. GET /api/owner/facilities/:id
   */
  getFacilityById(session, facilityId) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const facility = authorizeFacilityOwnership(db, facilityId, user.id);
    return {
      success: true,
      data: facility
    };
  },

  /**
   * 4. POST /api/owner/facilities (Create Facility)
   * Mass assignment protection: ownerId forced from session, status='Pending review', verified=false
   */
  createFacility(session, inputData) {
    const user = authenticateSession(session);

    // Validation
    if (!inputData.name || inputData.name.trim().length < 3) {
      throw new ApiError(400, 'Facility name must be at least 3 characters.');
    }
    if (!inputData.address || inputData.address.trim().length < 5) {
      throw new ApiError(400, 'Full address is required.');
    }
    const offPeak = Number(inputData.offPeakPrice || inputData.pricing?.offPeak);
    const peak = Number(inputData.peakPrice || inputData.pricing?.peak);
    if (isNaN(offPeak) || offPeak <= 0) {
      throw new ApiError(400, 'Standard hourly price must be greater than zero.');
    }
    if (isNaN(peak) || peak < offPeak) {
      throw new ApiError(400, 'Peak price must be greater than or equal to standard rate.');
    }

    const db = getDatabaseState();
    const newId = `fac-${Date.now()}`;

    // Grounds configuration
    const groundsCount = Math.max(1, parseInt(inputData.groundsCount || 1, 10));
    const grounds = [];
    for (let i = 1; i <= groundsCount; i++) {
      grounds.push({
        id: `g-${newId}-${i}`,
        name: groundsCount === 1 ? 'Main Court / Pitch' : `Pitch ${i}`
      });
    }

    // SANITIZED RECORD with mass-assignment defense
    const newFacility = {
      id: newId,
      name: inputData.name.trim(),
      sport: inputData.sport || 'Football',
      type: inputData.type || 'Sports Turf',
      area: inputData.area || 'Bengaluru',
      city: inputData.city || 'Bengaluru',
      lat: inputData.lat || 12.9352,
      lng: inputData.lng || 77.6245,
      address: inputData.address.trim(),
      description: (inputData.description || '').trim(),
      surface: inputData.surface || 'Standard Turf',
      indoor: Boolean(inputData.indoor),
      capacity: inputData.capacity ? `Up to ${parseInt(inputData.capacity, 10)} players` : 'Up to 16 players',
      openTime: inputData.openTime || '06:00',
      closeTime: inputData.closeTime || '23:00',
      grounds,
      amenities: Array.isArray(inputData.amenities) ? inputData.amenities : [],
      pricing: {
        offPeak,
        peak,
        peakHours: inputData.peakHours || ['18:00', '19:00', '20:00', '21:00'],
        taxPercent: 18,
        platformFee: 40
      },
      photos: Array.isArray(inputData.photos) ? inputData.photos : [],
      cancellationPolicy: inputData.cancellationPolicy || 'Free cancellation up to 4 hours prior.',
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      // STRICT OWNER ENFORCEMENT:
      ownerId: user.id, // derived from session, NOT client input
      status: 'Pending review', // never auto-approved
      verified: false, // never auto-verified
      createdAt: new Date().toISOString()
    };

    db.facilities = [newFacility, ...db.facilities];
    saveDatabaseState(db);

    recordAuditLog({
      userId: user.id,
      action: 'FACILITY_CREATE',
      entityType: 'facility',
      entityId: newId,
      facilityId: newId,
      before: null,
      after: newFacility
    });

    return {
      success: true,
      message: 'Facility submitted successfully. Listing is in "Pending review" status.',
      data: newFacility
    };
  },

  /**
   * 5. PUT /api/owner/facilities/:id (Edit Facility)
   */
  updateFacility(session, facilityId, updates) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const existing = authorizeFacilityOwnership(db, facilityId, user.id);

    // Defense: forbid client from modifying ownerId, verified, rating, reviews
    const sanitized = {
      ...existing,
      name: updates.name !== undefined ? updates.name.trim() : existing.name,
      sport: updates.sport || existing.sport,
      type: updates.type || existing.type,
      area: updates.area || existing.area,
      address: updates.address !== undefined ? updates.address.trim() : existing.address,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      surface: updates.surface || existing.surface,
      indoor: updates.indoor !== undefined ? Boolean(updates.indoor) : existing.indoor,
      capacity: updates.capacity || existing.capacity,
      openTime: updates.openTime || existing.openTime,
      closeTime: updates.closeTime || existing.closeTime,
      cancellationPolicy: updates.cancellationPolicy || existing.cancellationPolicy,
      amenities: Array.isArray(updates.amenities) ? updates.amenities : existing.amenities,
      photos: Array.isArray(updates.photos) ? updates.photos : existing.photos,
      updatedAt: new Date().toISOString()
    };

    // If pricing updated
    if (updates.pricing || updates.offPeakPrice || updates.peakPrice) {
      const offPeak = Number(updates.offPeakPrice || updates.pricing?.offPeak || existing.pricing.offPeak);
      const peak = Number(updates.peakPrice || updates.pricing?.peak || existing.pricing.peak);
      if (offPeak <= 0 || peak < offPeak) {
        throw new ApiError(400, 'Invalid pricing values.');
      }
      sanitized.pricing = {
        ...existing.pricing,
        offPeak,
        peak,
        peakHours: updates.peakHours || existing.pricing.peakHours || ['18:00', '19:00', '20:00']
      };
    }

    db.facilities = db.facilities.map((f) => (f.id === facilityId ? sanitized : f));
    saveDatabaseState(db);

    recordAuditLog({
      userId: user.id,
      action: 'FACILITY_UPDATE',
      entityType: 'facility',
      entityId: facilityId,
      facilityId,
      before: existing,
      after: sanitized
    });

    return {
      success: true,
      message: 'Facility updated successfully.',
      data: sanitized
    };
  },

  /**
   * 6. POST /api/owner/facilities/:id/toggle-status (Pause / Resume)
   */
  toggleFacilityStatus(session, facilityId, targetStatus) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const facility = authorizeFacilityOwnership(db, facilityId, user.id);

    const validStatuses = ['Live', 'Paused', 'Draft'];
    if (!validStatuses.includes(targetStatus)) {
      throw new ApiError(400, `Invalid target status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const beforeStatus = facility.status;
    facility.status = targetStatus;
    saveDatabaseState(db);

    recordAuditLog({
      userId: user.id,
      action: 'FACILITY_STATUS_CHANGE',
      entityType: 'facility',
      entityId: facilityId,
      facilityId,
      before: { status: beforeStatus },
      after: { status: targetStatus }
    });

    return {
      success: true,
      message: `Facility is now ${targetStatus}.`,
      data: facility
    };
  },

  /**
   * 7. POST /api/owner/slots/override (Manage individual slot status/price)
   */
  updateSlotOverride(session, { facilityId, groundId, dateStr, slotKey, overrideData }) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    authorizeFacilityOwnership(db, facilityId, user.id);

    // Rule: Cannot block or close a slot that has an active Confirmed or Pending booking!
    if (overrideData.status === 'Block' || overrideData.status === 'Close') {
      const startStr = slotKey.split('_').pop();
      const hasBooking = db.bookings.some(
        (b) =>
          b.facilityId === facilityId &&
          b.groundId === groundId &&
          b.date === dateStr &&
          b.startTime === startStr &&
          (b.status === 'Confirmed' || b.status === 'Pending')
      );
      if (hasBooking) {
        throw new ApiError(
          409,
          `Cannot block slot at ${startStr}: An active booking already exists. Please resolve or reschedule the booking first.`
        );
      }
    }

    db.customSlotOverrides = {
      ...(db.customSlotOverrides || {}),
      [slotKey]: {
        ...(db.customSlotOverrides?.[slotKey] || {}),
        ...overrideData,
        updatedAt: new Date().toISOString()
      }
    };
    saveDatabaseState(db);

    recordAuditLog({
      userId: user.id,
      action: 'SLOT_OVERRIDE_UPDATE',
      entityType: 'slot',
      entityId: slotKey,
      facilityId,
      before: null,
      after: overrideData
    });

    return {
      success: true,
      message: 'Slot override updated successfully.',
      data: db.customSlotOverrides[slotKey]
    };
  },

  /**
   * 8. PUT /api/owner/facilities/:id/pricing (Manage Pricing)
   * Enforces that existing bookings preserve their price snapshot.
   */
  updateFacilityPricing(session, facilityId, pricingInput) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const facility = authorizeFacilityOwnership(db, facilityId, user.id);

    const standardRate = Number(pricingInput.standardHourlyRate || pricingInput.offPeak);
    const peakRate = Number(pricingInput.peakHourlyRate || pricingInput.peak);

    if (isNaN(standardRate) || standardRate <= 0) {
      throw new ApiError(400, 'Standard rate must be greater than zero.');
    }
    if (isNaN(peakRate) || peakRate < standardRate) {
      throw new ApiError(400, 'Peak rate cannot be lower than standard rate.');
    }

    const beforePricing = { ...facility.pricing };
    facility.pricing = {
      ...facility.pricing,
      offPeak: standardRate,
      peak: peakRate,
      peakHours: pricingInput.peakHours || facility.pricing.peakHours || [],
      equipmentRentalCharges: pricingInput.equipmentRentalCharges || [],
      otherFees: pricingInput.otherFees || []
    };

    saveDatabaseState(db);

    recordAuditLog({
      userId: user.id,
      action: 'PRICING_UPDATE',
      entityType: 'pricing',
      entityId: facilityId,
      facilityId,
      before: beforePricing,
      after: facility.pricing
    });

    return {
      success: true,
      message: 'Pricing updated successfully. Applied to future bookings only.',
      data: facility.pricing
    };
  },

  /**
   * 9. GET /api/owner/bookings
   */
  getOwnerBookings(session, filters = {}) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const myFacilities = db.facilities.filter((f) => f.ownerId === user.id);
    const myFacilityIds = new Set(myFacilities.map((f) => f.id));

    let bookings = db.bookings.filter((b) => myFacilityIds.has(b.facilityId));

    if (filters.facilityId && filters.facilityId !== 'All') {
      bookings = bookings.filter((b) => b.facilityId === filters.facilityId);
    }
    if (filters.status && filters.status !== 'All') {
      bookings = bookings.filter((b) => b.status === filters.status);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      bookings = bookings.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.playerName.toLowerCase().includes(q) ||
          b.facilityName.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: bookings
    };
  },

  /**
   * 10. POST /api/owner/bookings/:id/status (Accept / Reject / Cancel)
   * Enforces status transition table:
   * Pending -> Confirmed | Rejected
   * Confirmed -> Completed | Cancelled
   */
  updateBookingStatus(session, bookingId, newStatus, reason = '') {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const booking = db.bookings.find((b) => b.id === bookingId);

    if (!booking) {
      throw new ApiError(404, `Booking #${bookingId} not found.`);
    }

    // Ownership check on booking's facility
    authorizeFacilityOwnership(db, booking.facilityId, user.id);

    const currentStatus = booking.status;
    const allowedTransitions = {
      Pending: ['Confirmed', 'Rejected'],
      Confirmed: ['Cancelled', 'Completed'],
      Completed: [],
      Cancelled: [],
      Rejected: []
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new ApiError(
        400,
        `Illegal status transition: Cannot change booking status from "${currentStatus}" to "${newStatus}".`
      );
    }

    if ((newStatus === 'Rejected' || newStatus === 'Cancelled') && !reason.trim()) {
      throw new ApiError(400, 'A reason is required when rejecting or cancelling a booking.');
    }

    const beforeBooking = { ...booking };
    booking.status = newStatus;
    booking.reason = reason.trim() || undefined;
    booking.updatedAt = new Date().toISOString();

    // If cancelled or rejected, release payment status to refunded
    if (newStatus === 'Cancelled' || newStatus === 'Rejected') {
      const payment = db.payments.find((p) => p.bookingId === bookingId);
      if (payment) {
        payment.status = 'refunded';
      }
    }

    saveDatabaseState(db);

    recordAuditLog({
      userId: user.id,
      action: `BOOKING_${newStatus.toUpperCase()}`,
      entityType: 'booking',
      entityId: bookingId,
      facilityId: booking.facilityId,
      before: beforeBooking,
      after: booking
    });

    return {
      success: true,
      message: `Booking #${bookingId} is now ${newStatus}.`,
      data: booking
    };
  },

  /**
   * 11. POST /api/owner/blocks (Block Dates with Conflict Detection)
   */
  createBlockDate(session, blockInput) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const facilityId = blockInput.facilityId;
    authorizeFacilityOwnership(db, facilityId, user.id);

    const { groundId, startDate, endDate, startTime, endTime, reason } = blockInput;
    if (!startDate || !endDate) {
      throw new ApiError(400, 'Start date and end date are required.');
    }
    if (!reason || reason.trim().length < 3) {
      throw new ApiError(400, 'Reason for blocking is required (min 3 chars).');
    }

    // CONFLICT DETECTION: Check if any confirmed or pending bookings exist in the block range!
    const conflictingBookings = db.bookings.filter((b) => {
      if (b.facilityId !== facilityId) return false;
      if (groundId && groundId !== 'all' && b.groundId !== groundId) return false;
      if (b.status !== 'Confirmed' && b.status !== 'Pending') return false;

      // Date check
      if (b.date < startDate || b.date > endDate) return false;

      // Time check if block specifies time
      if (startTime && endTime) {
        const bStart = parseInt(b.startTime.split(':')[0], 10);
        const bEnd = bStart + (b.durationHours || 1);
        const blockStart = parseInt(startTime.split(':')[0], 10);
        const blockEnd = parseInt(endTime.split(':')[0], 10);
        return blockStart < bEnd && blockEnd > bStart;
      }
      return true;
    });

    if (conflictingBookings.length > 0) {
      throw new ApiError(
        409,
        `Cannot block dates: ${conflictingBookings.length} active booking(s) exist in this range. Resolve them first.`,
        conflictingBookings
      );
    }

    const newBlock = {
      id: `blk-${Date.now()}`,
      facilityId,
      groundId: groundId || 'all',
      startDate,
      endDate,
      startTime: startTime || '00:00',
      endTime: endTime || '23:59',
      reason: reason.trim(),
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    db.blockedDates = [newBlock, ...(db.blockedDates || [])];
    saveDatabaseState(db);

    recordAuditLog({
      userId: user.id,
      action: 'BLOCK_DATE_CREATE',
      entityType: 'blocked_date',
      entityId: newBlock.id,
      facilityId,
      before: null,
      after: newBlock
    });

    return {
      success: true,
      message: 'Blocked date range created successfully.',
      data: newBlock
    };
  },

  /**
   * 12. DELETE /api/owner/blocks/:id
   */
  deleteBlockDate(session, blockId) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const block = (db.blockedDates || []).find((b) => b.id === blockId);

    if (!block) {
      throw new ApiError(404, 'Blocked date record not found.');
    }

    authorizeFacilityOwnership(db, block.facilityId, user.id);

    db.blockedDates = db.blockedDates.filter((b) => b.id !== blockId);
    saveDatabaseState(db);

    recordAuditLog({
      userId: user.id,
      action: 'BLOCK_DATE_REMOVE',
      entityType: 'blocked_date',
      entityId: blockId,
      facilityId: block.facilityId,
      before: block,
      after: null
    });

    return {
      success: true,
      message: 'Blocked date removed. Slots restored where unbooked.'
    };
  },

  /**
   * 13. GET /api/owner/earnings
   */
  getOwnerEarnings(session, filters = {}) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const myFacilities = db.facilities.filter((f) => f.ownerId === user.id);
    const myFacilityIds = new Set(myFacilities.map((f) => f.id));

    let payments = db.payments.filter((p) => myFacilityIds.has(p.facilityId));

    if (filters.facilityId && filters.facilityId !== 'All') {
      payments = payments.filter((p) => p.facilityId === filters.facilityId);
    }

    const capturedPayments = payments.filter((p) => p.status === 'captured');
    const refundedPayments = payments.filter((p) => p.status === 'refunded');

    const confirmedRevenue = capturedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const refundedAmount = refundedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const grossBookingValue = confirmedRevenue + refundedAmount;

    return {
      success: true,
      data: {
        hasPaymentRecords: payments.length > 0,
        confirmedRevenue,
        grossBookingValue,
        refundedAmount,
        payments
      }
    };
  },

  /**
   * 14. GET /api/owner/analytics
   */
  getOwnerAnalytics(session, daysRange = 30) {
    const user = authenticateSession(session);
    const db = getDatabaseState();
    const myFacilities = db.facilities.filter((f) => f.ownerId === user.id);
    const myFacilityIds = new Set(myFacilities.map((f) => f.id));

    const bookings = db.bookings.filter((b) => myFacilityIds.has(b.facilityId));
    const payments = db.payments.filter((p) => myFacilityIds.has(p.facilityId) && p.status === 'captured');

    // Status breakdown
    const statusCounts = {
      Confirmed: 0,
      Completed: 0,
      Pending: 0,
      Cancelled: 0,
      Rejected: 0
    };
    bookings.forEach((b) => {
      if (statusCounts[b.status] !== undefined) {
        statusCounts[b.status]++;
      }
    });

    // Facility bookings comparison
    const facilityComparison = myFacilities.map((fac) => {
      const facBookings = bookings.filter((b) => b.facilityId === fac.id);
      const facRevenue = payments
        .filter((p) => p.facilityId === fac.id)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      return {
        facilityId: fac.id,
        facilityName: fac.name,
        sport: fac.sport,
        totalBookings: facBookings.length,
        revenue: facRevenue,
        rating: fac.rating || 0
      };
    });

    return {
      success: true,
      data: {
        totalBookings: bookings.length,
        statusCounts,
        facilityComparison,
        hasData: bookings.length > 0
      }
    };
  }
};
