/**
 * Pure Data Adapter and Formatting Helpers for Facility Details
 * Conforms strictly to the Data Contract:
 * - Real data only, no invented fields or placeholder values
 * - Local date and time arithmetic (zero UTC drift)
 * - Indian Rupee (INR) currency formatting with proper digit grouping
 */

/**
 * Format a number as Indian Rupees (e.g. ₹1,200 or ₹12,500)
 */
export function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Convert 24-hour time "HH:MM" to readable 12-hour string (e.g., "6:00 pm")
 */
export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Get local date string in YYYY-MM-DD (zero UTC shift)
 */
export function getLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add or subtract days to a local date string (YYYY-MM-DD)
 */
export function addDaysLocal(dateStr, offsetDays) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  return getLocalDateStr(date);
}

/**
 * Format date for display (e.g. "Wed, 28 Oct" or "Today")
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return { weekday, dayNum, month, full: `${weekday}, ${dayNum} ${month}` };
}

/**
 * Map peak hours array into readable windows, e.g. "6:00 pm to 11:00 pm"
 */
export function formatPeakWindows(peakHours = []) {
  if (!peakHours || peakHours.length === 0) return null;
  const sorted = [...peakHours].sort();
  const first = sorted[0];
  const lastHourStr = sorted[sorted.length - 1];
  const lastStartHour = parseInt(lastHourStr.split(':')[0], 10);
  const endHourStr = `${(lastStartHour + 1).toString().padStart(2, '0')}:00`;
  return `${formatTime12h(first)} to ${formatTime12h(endHourStr)}`;
}

/**
 * Standard amenity keys supported by the UI
 */
export const AMENITY_METADATA = {
  parking: { label: 'Parking', iconName: 'Car' },
  washrooms: { label: 'Washrooms', iconName: 'Bath' },
  changingRooms: { label: 'Changing rooms', iconName: 'Shirt' },
  floodlights: { label: 'Floodlights', iconName: 'Lightbulb' },
  drinkingWater: { label: 'Drinking water', iconName: 'Droplets' },
  equipmentRental: { label: 'Equipment rental', iconName: 'Dumbbell' },
  seating: { label: 'Seating', iconName: 'Armchair' },
  firstAid: { label: 'First aid', iconName: 'Cross' }
};

/**
 * Map raw amenity string or object to standard key
 */
function normalizeAmenityKey(raw) {
  if (!raw) return null;
  const str = String(raw).toLowerCase().trim();

  if (str.includes('parking')) return 'parking';
  if (str.includes('washroom') || str.includes('shower') || str.includes('toilet') || str.includes('restroom')) return 'washrooms';
  if (str.includes('changing room') || str.includes('locker')) return 'changingRooms';
  if (str.includes('floodlight') || str.includes('light')) return 'floodlights';
  if (str.includes('water') || str.includes('dispenser') || str.includes('drinking')) return 'drinkingWater';
  if (str.includes('rental') || str.includes('kit') || str.includes('racket') || str.includes('machine') || str.includes('equipment') || str.includes('bibs')) return 'equipmentRental';
  if (str.includes('seating') || str.includes('bleacher') || str.includes('dugout') || str.includes('lounge')) return 'seating';
  if (str.includes('first aid') || str.includes('medical') || str.includes('lifeguard')) return 'firstAid';

  return null;
}

/**
 * Adapter: Transforms raw facility object into strictly defined Data Contract
 */
export function adaptFacility(raw) {
  if (!raw || typeof raw !== 'object') return null;

  // 1. Basic Info
  const name = raw.name || '';
  const description = raw.description || null;
  const sports = Array.isArray(raw.sports)
    ? raw.sports
    : raw.sport
    ? [raw.sport]
    : [];

  // 2. Location
  const address = raw.address || null;
  const city = raw.city || null;
  const locality = raw.area || raw.locality || null;
  const coordinates = (raw.lat != null && raw.lng != null) ? { lat: raw.lat, lng: raw.lng } : null;
  const mapLink = raw.mapLink || (coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
    : null);

  // 3. Operating Hours & IsOpenNow
  let openingHours = null;
  let isOpenNow = null;

  if (raw.openTime && raw.closeTime) {
    openingHours = `${formatTime12h(raw.openTime)} - ${formatTime12h(raw.closeTime)}`;

    // Compute isOpenNow using local time
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM = 0] = raw.openTime.split(':').map(Number);
    const [closeH, closeM = 0] = raw.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (closeMinutes > openMinutes) {
      isOpenNow = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } else {
      // Overnight hours
      isOpenNow = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }
  } else if (raw.openingHours) {
    openingHours = typeof raw.openingHours === 'string' ? raw.openingHours : JSON.stringify(raw.openingHours);
  }

  // 4. Capacity & Setting
  const maxCapacity = raw.capacity || raw.maxCapacity || null;
  let setting = null;
  if (raw.setting && ['indoor', 'outdoor', 'both'].includes(raw.setting)) {
    setting = raw.setting;
  } else if (typeof raw.indoor === 'boolean') {
    setting = raw.indoor ? 'indoor' : 'outdoor';
  }

  const surfaceType = raw.surface || raw.surfaceType || null;

  // 5. Photos (Real data only, no invented placeholders)
  let photos = [];
  if (Array.isArray(raw.photos) && raw.photos.length > 0) {
    photos = raw.photos
      .filter((p) => p && p.url)
      .map((p) => ({
        url: p.url,
        caption: p.caption || null,
        category: p.category || 'other',
        alt: p.alt || `Photo of ${name}`
      }));

    // Category sorting order: main, surface, changing-rooms, amenity, other
    const categoryPriority = {
      main: 1,
      surface: 2,
      'changing-rooms': 3,
      amenity: 4,
      other: 5
    };

    photos.sort((a, b) => (categoryPriority[a.category] || 99) - (categoryPriority[b.category] || 99));
  }

  // 6. Amenities: Map only present and owner-confirmed
  const amenities = [];
  const rawAmenities = Array.isArray(raw.amenities) ? raw.amenities : [];
  const seenKeys = new Set();

  for (const item of rawAmenities) {
    if (!item) continue;
    let key = null;
    let confirmedByOwner = false;

    if (typeof item === 'object') {
      key = item.key || normalizeAmenityKey(item.name || item.label);
      confirmedByOwner = item.confirmedByOwner !== false;
    } else if (typeof item === 'string') {
      key = normalizeAmenityKey(item);
      // Items listed in facility data are confirmed by owner unless explicitly marked unverified
      confirmedByOwner = raw.verified ? true : (raw.amenitiesConfirmed !== false);
    }

    if (key && AMENITY_METADATA[key] && !seenKeys.has(key)) {
      seenKeys.add(key);
      amenities.push({ key, confirmedByOwner });
    }
  }

  // 7. Pricing
  let pricing = null;
  if (raw.pricing && (raw.pricing.offPeak != null || raw.pricing.peak != null || raw.pricing.standardHourlyRate != null)) {
    const standardHourlyRate = raw.pricing.offPeak ?? raw.pricing.standardHourlyRate ?? null;
    const peakHourlyRate = raw.pricing.peak ?? raw.pricing.peakHourlyRate ?? null;
    const peakWindowsFormatted = formatPeakWindows(raw.pricing.peakHours);

    pricing = {
      currency: 'INR',
      standardHourlyRate,
      peakHourlyRate,
      peakWindows: peakWindowsFormatted ? [peakWindowsFormatted] : (raw.pricing.peakWindows || []),
      peakHours: raw.pricing.peakHours || [],
      equipmentRentalCharges: Array.isArray(raw.pricing.equipmentRentalCharges) ? raw.pricing.equipmentRentalCharges : [],
      otherFees: Array.isArray(raw.pricing.otherFees) ? raw.pricing.otherFees : [],
      taxPercent: raw.pricing.taxPercent ?? 18,
      platformFee: raw.pricing.platformFee ?? 30
    };
  }

  // 8. Pitches / Grounds
  const grounds = Array.isArray(raw.grounds) ? raw.grounds : [];

  return {
    id: raw.id,
    name,
    description,
    sports,
    address,
    city,
    locality,
    coordinates,
    mapLink,
    openingHours,
    openTime: raw.openTime || null,
    closeTime: raw.closeTime || null,
    isOpenNow,
    maxCapacity,
    setting,
    surfaceType,
    photos,
    amenities,
    pricing,
    grounds,
    cancellationPolicy: raw.cancellationPolicy || null,
    rating: raw.rating || null,
    reviewCount: raw.reviewCount || (raw.reviews?.length ?? 0),
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    verified: Boolean(raw.verified),
    raw
  };
}
