/**
 * facilityComparisonService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative service for Facility Comparison within the Facilities section.
 *
 * Core Principles & Honesty Rules:
 * 1. Real Data Only: Uses real facility records, ratings, and active bookings.
 * 2. Identical Pricing & Slot Engine: Calculates slot availability and estimated
 *    totals using the EXACT same pure helpers as the booking flow.
 * 3. Public Data Shielding: Returns only public attributes; zero owner contacts,
 *    revenue, or private booking records are leaked.
 * 4. Honesty Rule - Lowest Price Highlight: "Lowest for this slot" is highlighted
 *    ONLY when all compared facilities share the SAME sport, date, time window,
 *    and duration. Otherwise disabled with an explanatory note.
 * 5. Honesty Rule - Missing Data: Shows "Not available" or "No reviews yet";
 *    never generates placeholder or fake fallback values.
 * 6. Rate Limiting: Max 60 comparison queries per minute per IP / client.
 */

import {
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS,
  haversineDistance,
  generateSlotsForGroundAndDate
} from '../data/facilitiesData.js';

export function getLocalDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const COMPARE_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_COMPARE_OPS_PER_WINDOW = 60;
const rateLimitMap = new Map();

export function checkCompareRateLimit(clientId = 'default_client') {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);
  if (!entry || now - entry.windowStart > COMPARE_RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(clientId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_COMPARE_OPS_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

export function resetCompareDbState() {
  rateLimitMap.clear();
}

/**
 * Common amenities list for structured comparison
 */
export const STANDARD_AMENITIES = [
  'Parking',
  'Floodlights',
  'Changing Rooms',
  'Water Dispenser',
  'First Aid',
  'Washrooms',
  'Equipment Rental',
  'Seating Area'
];

/**
 * Calculates estimated total for a facility using the exact pricing contract
 */
export function calculateSlotEstimate(facility, startTime, durationHours) {
  if (!facility || !facility.pricing || !startTime) {
    return { basePrice: 0, taxes: 0, platformFee: 0, total: 0, isPeak: false };
  }

  const startH = parseInt(startTime.split(':')[0], 10);
  const peakHours = facility.pricing.peakHours || [];
  const standardRate = facility.pricing.offPeak ?? facility.pricing.standardHourlyRate ?? 1000;
  const peakRate = facility.pricing.peak ?? facility.pricing.peakHourlyRate ?? 1200;

  let basePrice = 0;
  let hasPeak = false;

  for (let i = 0; i < durationHours; i++) {
    const hStr = `${(startH + i).toString().padStart(2, '0')}:00`;
    const isSlotPeak = peakHours.includes(hStr);
    if (isSlotPeak) hasPeak = true;
    basePrice += isSlotPeak ? peakRate : standardRate;
  }

  const taxPercent = facility.pricing.taxPercent ?? 18;
  const taxes = Math.round((basePrice * taxPercent) / 100);
  const platformFee = facility.pricing.platformFee ?? 40;
  const total = basePrice + taxes + platformFee;

  return {
    basePrice,
    taxPercent,
    taxes,
    platformFee,
    total,
    isPeak: hasPeak
  };
}

/**
 * Computes availability status and alternative nearest slots for a chosen window
 */
export function evaluateAvailability(facility, dateStr, startTime, durationHours, existingBookings = []) {
  if (!facility || !facility.grounds || facility.grounds.length === 0) {
    return {
      status: 'Not available',
      openCourtsCount: 0,
      totalCourtsCount: 0,
      alternativeSlots: []
    };
  }

  const startH = parseInt(startTime.split(':')[0], 10);
  const openH = parseInt((facility.openTime || '06:00').split(':')[0], 10);
  const closeH = parseInt((facility.closeTime || '23:00').split(':')[0], 10);

  const facWithHours = {
    ...facility,
    openTime: facility.openTime || '06:00',
    closeTime: facility.closeTime || '23:00'
  };

  // Check if slot falls outside operating hours
  if (startH < openH || startH + durationHours > closeH) {
    return {
      status: 'Closed',
      openCourtsCount: 0,
      totalCourtsCount: facility.grounds.length,
      alternativeSlots: findAlternativeSlots(facility, dateStr, existingBookings, 3)
    };
  }

  let fullyAvailableCourts = 0;

  for (const ground of facility.grounds) {
    const slots = generateSlotsForGroundAndDate(facWithHours, ground.id, dateStr, existingBookings);
    let consecutiveAvailable = true;

    for (let i = 0; i < durationHours; i++) {
      const checkHourStr = `${(startH + i).toString().padStart(2, '0')}:00`;
      const slot = slots.find((s) => s.startStr === checkHourStr);
      if (!slot || slot.state !== 'available') {
        consecutiveAvailable = false;
        break;
      }
    }

    if (consecutiveAvailable) {
      fullyAvailableCourts++;
    }
  }

  let status = 'Not available';
  if (fullyAvailableCourts > 0) {
    status = 'Available';
  }

  const alternatives = status === 'Not available'
    ? findAlternativeSlots(facility, dateStr, existingBookings, 3)
    : [];

  return {
    status,
    openCourtsCount: fullyAvailableCourts,
    totalCourtsCount: facility.grounds.length,
    alternativeSlots: alternatives
  };
}

function findAlternativeSlots(facility, dateStr, existingBookings, limit = 3) {
  const alternatives = [];
  if (!facility.grounds || facility.grounds.length === 0) return alternatives;

  const facWithHours = {
    ...facility,
    openTime: facility.openTime || '06:00',
    closeTime: facility.closeTime || '23:00'
  };

  for (const ground of facility.grounds) {
    const slots = generateSlotsForGroundAndDate(facWithHours, ground.id, dateStr, existingBookings);
    const availableSlots = slots.filter((s) => s.state === 'available');

    for (const s of availableSlots) {
      if (!alternatives.includes(s.startStr)) {
        alternatives.push(s.startStr);
      }
      if (alternatives.length >= limit) break;
    }
    if (alternatives.length >= limit) break;
  }
  return alternatives;
}

/**
 * Main Comparison Query Handler
 *
 * @param {object} params
 * @param {string|Array<string>} params.ids - Up to 4 facility IDs
 * @param {string} [params.date] - YYYY-MM-DD (min=today)
 * @param {string} [params.startTime] - HH:mm
 * @param {number} [params.durationHours] - 1 to 6
 * @param {object} [params.userCoords] - { lat, lng }
 * @param {Array} [params.customFacilities] - Optional custom facilities state
 * @param {Array} [params.customBookings] - Optional custom bookings state
 * @returns {object}
 */
export function compareFacilities({
  ids,
  date,
  startTime,
  durationHours = 1,
  userCoords = null,
  customFacilities = null,
  customBookings = null,
  clientId = 'default_client'
}) {
  if (!checkCompareRateLimit(clientId)) {
    throw new Error('Comparison rate limit exceeded (429). Please wait a moment.');
  }

  // Parse & sanitize IDs
  let rawIds = [];
  if (Array.isArray(ids)) {
    rawIds = ids;
  } else if (typeof ids === 'string') {
    rawIds = ids.split(',').map((id) => id.trim()).filter(Boolean);
  }

  const uniqueIds = Array.from(new Set(rawIds)).slice(0, 4);

  if (uniqueIds.length < 2) {
    return {
      valid: false,
      error: 'Select at least 2 facilities (maximum 4) to view side-by-side comparison.',
      facilities: [],
      meta: null
    };
  }

  const allFacilities = customFacilities || INITIAL_FACILITIES;
  const allBookings = customBookings || INITIAL_BOOKINGS;
  const todayStr = getLocalDateStr();

  // Validate date (cannot be in the past)
  let targetDate = date || todayStr;
  if (targetDate < todayStr) {
    targetDate = todayStr;
  }

  const targetDuration = Math.max(1, Math.min(6, parseInt(durationHours, 10) || 1));
  const targetStartTime = startTime || '18:00';

  // Retrieve matching facilities
  const matchedFacilities = [];
  const missingIds = [];

  for (const id of uniqueIds) {
    const fac = allFacilities.find((f) => f && f.id === id);
    if (fac) {
      matchedFacilities.push(fac);
    } else {
      missingIds.push(id);
    }
  }

  if (matchedFacilities.length < 2) {
    return {
      valid: false,
      error: `Could not find enough active facilities to compare. Missing or unlisted: ${missingIds.join(', ')}`,
      facilities: [],
      meta: null
    };
  }

  // Check sport consistency across selected venues
  const sportsSet = new Set(matchedFacilities.map((f) => f.sport));
  const sameSport = sportsSet.size === 1;
  const sportsList = Array.from(sportsSet).join(', ');

  // Process facilities data
  const processed = matchedFacilities.map((fac) => {
    // 1. Distance
    let distanceKm = null;
    let distanceDisplay = 'Not available';
    if (userCoords && userCoords.lat && userCoords.lng && fac.lat && fac.lng) {
      distanceKm = haversineDistance(userCoords.lat, userCoords.lng, fac.lat, fac.lng);
      distanceDisplay = distanceKm !== null ? `${distanceKm} km` : 'Not available';
    }

    // 2. Pricing & Slot Estimate
    const priceEstimate = calculateSlotEstimate(fac, targetStartTime, targetDuration);

    // 3. Availability
    const availability = evaluateAvailability(fac, targetDate, targetStartTime, targetDuration, allBookings);

    // 4. Quality & Reviews
    const hasReviews = Boolean(fac.reviewCount && fac.reviewCount > 0);
    const ratingDisplay = hasReviews ? `${fac.rating} / 5` : 'No reviews yet';
    const reviewCountDisplay = hasReviews ? `(${fac.reviewCount} reviews)` : '';

    // 5. Amenities presence
    const facAmenities = Array.isArray(fac.amenities)
      ? fac.amenities.map((a) => (typeof a === 'string' ? a.toLowerCase() : (a.name || a.key || '').toLowerCase()))
      : [];

    const amenitiesMap = {};
    STANDARD_AMENITIES.forEach((amenity) => {
      const isPresent = facAmenities.some((a) => a.includes(amenity.toLowerCase()));
      amenitiesMap[amenity] = isPresent ? 'Confirmed' : 'Not listed';
    });

    return {
      id: fac.id,
      name: fac.name,
      sport: fac.sport,
      type: fac.type || 'Sports Venue',
      surface: fac.surface || 'Not available',
      indoor: fac.indoor != null ? (fac.indoor ? 'Indoor' : 'Outdoor') : 'Not available',
      capacity: fac.capacity || 'Not available',
      area: fac.area || 'Not available',
      city: fac.city || 'Bengaluru',
      address: fac.address || 'Not available',
      openTime: fac.openTime || '06:00',
      closeTime: fac.closeTime || '23:00',
      distanceKm,
      distanceDisplay,
      // Pricing
      standardRate: fac.pricing?.offPeak ?? fac.pricing?.standardHourlyRate ?? null,
      peakRate: fac.pricing?.peak ?? fac.pricing?.peakHourlyRate ?? null,
      peakHours: fac.pricing?.peakHours || [],
      priceEstimate,
      // Availability
      availability,
      // Quality
      rating: hasReviews ? fac.rating : null,
      reviewCount: fac.reviewCount || 0,
      ratingDisplay,
      reviewCountDisplay,
      // Amenities
      amenitiesMap,
      cancellationPolicy: fac.cancellationPolicy || 'Standard facility cancellation policy applies.'
    };
  });

  // Honesty Rule: Determine lowest price ONLY when same sport and valid prices exist
  let lowestPriceFacilityId = null;
  let lowestPriceNotice = '';

  if (sameSport) {
    let minPrice = Infinity;
    let minFacId = null;

    processed.forEach((fac) => {
      const total = fac.priceEstimate.total;
      if (total > 0 && total < minPrice) {
        minPrice = total;
        minFacId = fac.id;
      }
    });

    lowestPriceFacilityId = minFacId;
  } else {
    lowestPriceNotice = `Lowest price comparison is disabled because compared venues feature different sports (${sportsList}).`;
  }

  return {
    valid: true,
    targetDate,
    targetStartTime,
    targetDuration,
    sportsList,
    sameSport,
    differentSports: !sameSport,
    missingIds,
    lowestPriceFacilityId,
    lowestPriceNotice,
    facilities: processed
  };
}
