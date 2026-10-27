/**
 * SportLink - Facilities & Grounds Data & Pure Logic Helpers
 * Shaped like future REST / GraphQL API responses.
 * All data is mock demonstration content.
 */

export const SAMPLE_DISCLAIMER = "Demo only. In production the role comes from the signed-in account. Data is sample only.";

// Reference coordinates for Bengaluru localities
export const AREA_COORDINATES = {
  "koramangala": { lat: 12.9352, lng: 77.6245, name: "Koramangala, Bengaluru" },
  "indiranagar": { lat: 12.9784, lng: 77.6408, name: "Indiranagar, Bengaluru" },
  "hsr layout": { lat: 12.9121, lng: 77.6446, name: "HSR Layout, Bengaluru" },
  "whitefield": { lat: 12.9698, lng: 77.7499, name: "Whitefield, Bengaluru" },
  "jp nagar": { lat: 12.9063, lng: 77.5857, name: "JP Nagar, Bengaluru" },
  "bellandur": { lat: 12.9304, lng: 77.6784, name: "Bellandur, Bengaluru" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, name: "Bengaluru City Centre" }
};

export const DEFAULT_COORDS = AREA_COORDINATES["bengaluru"];

export const INITIAL_FACILITIES = [
  {
    id: "fac-1",
    name: "Elite Football Arena",
    sport: "Football",
    type: "Turf Arena",
    area: "Koramangala",
    city: "Bengaluru",
    lat: 12.9345,
    lng: 77.6212,
    address: "80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
    description: "Premier 7v7 and 5v5 artificial turf arena equipped with FIFA 2-star grade turf, professional LED floodlighting, and electronic scoreboard.",
    surface: "FIFA 2-Star AstroTurf",
    indoor: false,
    capacity: "Up to 16 players per turf",
    openTime: "06:00",
    closeTime: "23:00",
    grounds: [
      { id: "g1-1", name: "Pitch 1 (7v7 Main Arena)" },
      { id: "g1-2", name: "Pitch 2 (5v5 Fast Turf)" }
    ],
    amenities: ["Floodlights", "Changing Rooms", "Parking", "Water Dispenser", "First Aid", "Bibs & Footballs"],
    pricing: {
      offPeak: 1000,
      peak: 1200,
      peakHours: ["18:00", "19:00", "20:00", "21:00", "22:00"],
      taxPercent: 18,
      platformFee: 40
    },
    cancellationPolicy: "Free cancellation up to 4 hours before slot. 50% refund within 2 to 4 hours. No refund under 2 hours.",
    rating: 4.8,
    reviewCount: 94,
    reviews: [
      {
        id: "rev-1",
        user: "Arjun Verma",
        date: "2 days ago",
        rating: 5,
        categoryScores: { cleanliness: 4.9, groundQuality: 5.0, staff: 4.8, value: 4.7 },
        comment: "Outstanding turf bounce and excellent floodlighting for night matches. Changing rooms are very well maintained.",
        bookingId: "bk-101",
        verifiedBooking: true
      },
      {
        id: "rev-2",
        user: "Deepak Rao",
        date: "1 week ago",
        rating: 4.6,
        categoryScores: { cleanliness: 4.5, groundQuality: 4.8, staff: 4.6, value: 4.5 },
        comment: "Great spot for corporate weekend friendlies. Easy parking access.",
        bookingId: null,
        verifiedBooking: false
      }
    ],
    verified: true, // 1 of only 2 verified
    ownerId: "own-1",
    status: "Live",
    isSample: true
  },
  {
    id: "fac-2",
    name: "SmashPoint Badminton Club",
    sport: "Badminton",
    type: "Indoor Stadium",
    area: "Indiranagar",
    city: "Bengaluru",
    lat: 12.9789,
    lng: 77.6415,
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
    description: "Dedicated 6-court indoor badminton facility with BWF-standard wooden sprung flooring, anti-glare vertical LED bays, and racket stringing service.",
    surface: "BWF Wooden Sprung Flooring",
    indoor: true,
    capacity: "4 players per court",
    openTime: "05:00",
    closeTime: "23:00",
    grounds: [
      { id: "g2-1", name: "Court 1 (Yonex Mat)" },
      { id: "g2-2", name: "Court 2 (Yonex Mat)" },
      { id: "g2-3", name: "Court 3 (Wooden Sprung)" }
    ],
    amenities: ["Air Conditioned Lounge", "Changing Rooms", "Showers", "Racket Rental", "Parking", "Water Dispenser"],
    pricing: {
      offPeak: 400,
      peak: 450,
      peakHours: ["06:00", "07:00", "08:00", "18:00", "19:00", "20:00", "21:00"],
      taxPercent: 18,
      platformFee: 25
    },
    cancellationPolicy: "Free cancellation up to 6 hours before slot. No refund under 6 hours.",
    rating: 4.9,
    reviewCount: 118,
    reviews: [
      {
        id: "rev-3",
        user: "Pooja Hegde",
        date: "3 days ago",
        rating: 5,
        categoryScores: { cleanliness: 5.0, groundQuality: 5.0, staff: 4.9, value: 4.8 },
        comment: "BWF mats have zero slippage. Perfect lighting angle so shuttles aren't lost in overhead glare.",
        bookingId: "bk-102",
        verifiedBooking: true
      }
    ],
    verified: true, // 2 of only 2 verified
    ownerId: "own-1",
    status: "Live",
    isSample: true
  },
  {
    id: "fac-3",
    name: "CricketZone Practice Nets",
    sport: "Cricket",
    type: "Practice Nets",
    area: "HSR Layout",
    city: "Bengaluru",
    lat: 12.9118,
    lng: 77.6432,
    address: "19th Main Road, Sector 4, HSR Layout, Bengaluru, Karnataka 560102",
    description: "Professional turf and concrete practice wickets with RoboArm bowling machines, speed radar, and floodlight net sessions.",
    surface: "Turf & Concrete Wickets",
    indoor: false,
    capacity: "Up to 8 players per lane",
    openTime: "06:00",
    closeTime: "22:00",
    grounds: [
      { id: "g3-1", name: "Net A (Turf Pitch + Bowling Machine)" },
      { id: "g3-2", name: "Net B (Concrete Fast Track)" }
    ],
    amenities: ["Floodlights", "Bowling Machine", "Kit Rental", "Parking", "Water Dispenser"],
    pricing: {
      offPeak: 600,
      peak: 700,
      peakHours: ["06:00", "07:00", "17:00", "18:00", "19:00", "20:00"],
      taxPercent: 18,
      platformFee: 30
    },
    cancellationPolicy: "Full refund 12 hours prior. 50% refund between 6 and 12 hours.",
    rating: 4.5,
    reviewCount: 62,
    reviews: [
      {
        id: "rev-4",
        user: "Karthik Raja",
        date: "1 week ago",
        rating: 4.4,
        categoryScores: { cleanliness: 4.2, groundQuality: 4.7, staff: 4.3, value: 4.4 },
        comment: "Solid bounce on the turf wicket. Bowling machine was calibrated accurately.",
        bookingId: null,
        verifiedBooking: false
      }
    ],
    verified: false,
    ownerId: "own-2",
    status: "Live",
    isSample: true
  },
  {
    id: "fac-4",
    name: "AquaFit Swimming Centre",
    sport: "Swimming",
    type: "Olympic Pool",
    area: "Whitefield",
    city: "Bengaluru",
    lat: 12.9692,
    lng: 77.7512,
    address: "ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066",
    description: "Semi-Olympic heated indoor pool (25m, 6 lanes) maintained with UV filtration, dedicated lane ropes, and certified lifeguard supervision.",
    surface: "Anti-slip Ceramic & UV Water",
    indoor: true,
    capacity: "25 swimmers per session",
    openTime: "06:00",
    closeTime: "21:00",
    grounds: [
      { id: "g4-1", name: "Main 25m Heated Pool (6 Lanes)" }
    ],
    amenities: ["Heated Water", "Lockers", "Showers", "Lifeguard on Duty", "Parking"],
    pricing: {
      offPeak: 250,
      peak: 300,
      peakHours: ["06:00", "07:00", "08:00", "18:00", "19:00"],
      taxPercent: 18,
      platformFee: 20
    },
    cancellationPolicy: "Cancellations allowed up to 2 hours before session start.",
    rating: 4.7,
    reviewCount: 78,
    reviews: [
      {
        id: "rev-5",
        user: "Nalini Krishnan",
        date: "5 days ago",
        rating: 4.8,
        categoryScores: { cleanliness: 4.9, groundQuality: 4.8, staff: 4.7, value: 4.6 },
        comment: "Crystal clear water with no chlorine odor. Showers are exceptionally clean.",
        bookingId: "bk-103",
        verifiedBooking: true
      }
    ],
    verified: false,
    ownerId: "own-2",
    status: "Live",
    isSample: true
  },
  {
    id: "fac-5",
    name: "Metro Hoops Basketball Arena",
    sport: "Basketball",
    type: "Court Arena",
    area: "JP Nagar",
    city: "Bengaluru",
    lat: 12.9059,
    lng: 77.5841,
    address: "24th Main, JP Nagar 5th Phase, Bengaluru, Karnataka 560078",
    description: "FIBA-regulation polyurethane cushioned outdoor hardcourt with breakaway spring rims, glass backboards, and stadium bleachers.",
    surface: "Polyurethane Cushioned Hardcourt",
    indoor: false,
    capacity: "Up to 15 players per half/full court",
    openTime: "06:00",
    closeTime: "22:00",
    grounds: [
      { id: "g5-1", name: "Full Court A (FIBA Standard)" }
    ],
    amenities: ["Floodlights", "Bleacher Seating", "Changing Rooms", "Parking", "Water Dispenser"],
    pricing: {
      offPeak: 850,
      peak: 1000,
      peakHours: ["06:00", "07:00", "18:00", "19:00", "20:00"],
      taxPercent: 18,
      platformFee: 35
    },
    cancellationPolicy: "Free cancellation up to 6 hours before match. 50% refund afterwards.",
    rating: 4.6,
    reviewCount: 41,
    reviews: [
      {
        id: "rev-6",
        user: "Aditya S.",
        date: "2 weeks ago",
        rating: 4.5,
        categoryScores: { cleanliness: 4.4, groundQuality: 4.7, staff: 4.5, value: 4.3 },
        comment: "Rims are true, court grip is top-notch even when damp in the evenings.",
        bookingId: null,
        verifiedBooking: false
      }
    ],
    verified: false,
    ownerId: "own-3",
    status: "Live",
    isSample: true
  },
  {
    id: "fac-6",
    name: "Ace Tennis Academy Courts",
    sport: "Tennis",
    type: "Hard Court",
    area: "Koramangala",
    city: "Bengaluru",
    lat: 12.9368,
    lng: 77.6258,
    address: "Intermediate Ring Road, Koramangala 4th Block, Bengaluru, Karnataka 560034",
    description: "Two ITF-standard acrylic hardcourts with low glare LED night floodlights and ball boy support on request.",
    surface: "DecoTurf Acrylic Hardcourt",
    indoor: false,
    capacity: "4 players per court",
    openTime: "06:00",
    closeTime: "22:00",
    grounds: [
      { id: "g6-1", name: "Court 1 (Center Hardcourt)" },
      { id: "g6-2", name: "Court 2 (Training Court)" }
    ],
    amenities: ["Floodlights", "Ball Machine", "Pro Shop", "Showers", "Parking"],
    pricing: {
      offPeak: 700,
      peak: 800,
      peakHours: ["06:00", "07:00", "17:00", "18:00", "19:00"],
      taxPercent: 18,
      platformFee: 30
    },
    cancellationPolicy: "Free cancellation up to 8 hours prior. No refund within 8 hours.",
    rating: 4.7,
    reviewCount: 53,
    reviews: [],
    verified: false,
    ownerId: "own-3",
    status: "Live",
    isSample: true
  },
  {
    id: "fac-7",
    name: "SpikeZone Volleyball Arena",
    sport: "Volleyball",
    type: "Sand & Synthetic Court",
    area: "Bellandur",
    city: "Bengaluru",
    lat: 12.9298,
    lng: 77.6791,
    address: "Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103",
    description: "Dual setup featuring deep beach sand court and indoor shock-absorbing synthetic surface with antenna net systems.",
    surface: "Beach Sand & Synthetic",
    indoor: false,
    capacity: "12 players per court",
    openTime: "06:00",
    closeTime: "22:00",
    grounds: [
      { id: "g7-1", name: "Sand Volleyball Court" },
      { id: "g7-2", name: "Synthetic Hard Court" }
    ],
    amenities: ["Floodlights", "Showers", "Washrooms", "Parking", "Water Dispenser"],
    pricing: {
      offPeak: 500,
      peak: 600,
      peakHours: ["06:00", "07:00", "18:00", "19:00", "20:00"],
      taxPercent: 18,
      platformFee: 25
    },
    cancellationPolicy: "Free cancellation up to 4 hours prior.",
    rating: 4.4,
    reviewCount: 29,
    reviews: [],
    verified: false,
    ownerId: "own-1",
    status: "Live",
    isSample: true
  },
  {
    id: "fac-8",
    name: "Titan Multi-Sport Ground",
    sport: "Football",
    type: "Multi-Sport Complex",
    area: "Indiranagar",
    city: "Bengaluru",
    lat: 12.9772,
    lng: 77.6394,
    address: "Near Domlur Flyover, Indiranagar, Bengaluru, Karnataka 560071",
    description: "Expansive 9v9 football turf convertible to box cricket and frisbee field with covered dugout seating.",
    surface: "Hybrid AstroTurf",
    indoor: false,
    capacity: "Up to 24 players",
    openTime: "05:30",
    closeTime: "23:30",
    grounds: [
      { id: "g8-1", name: "Main Turf (Full 9v9)" },
      { id: "g8-2", name: "Split Turf North (5v5)" }
    ],
    amenities: ["Floodlights", "Dugout Seating", "Cafeteria", "Changing Rooms", "Parking"],
    pricing: {
      offPeak: 1300,
      peak: 1500,
      peakHours: ["18:00", "19:00", "20:00", "21:00", "22:00"],
      taxPercent: 18,
      platformFee: 50
    },
    cancellationPolicy: "Free cancellation up to 5 hours prior.",
    rating: 4.8,
    reviewCount: 88,
    reviews: [],
    verified: false,
    ownerId: "own-2",
    status: "Live",
    isSample: true
  }
];

// Helper to get formatted date string for today and future days (YYYY-MM-DD)
export function getRelativeDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

// 6 Sample Bookings for Player and Owner views
export const INITIAL_BOOKINGS = [
  {
    id: "bk-101",
    facilityId: "fac-1",
    facilityName: "Elite Football Arena",
    groundId: "g1-1",
    groundName: "Pitch 1 (7v7 Main Arena)",
    sport: "Football",
    date: getRelativeDateStr(0), // Today
    startTime: "18:00",
    durationHours: 1,
    endTime: "19:00",
    amount: 1456, // 1200 + 216 (18% tax) + 40
    playerName: "Arjun Verma",
    playerPhone: "+91 98765 43210",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isSample: true
  },
  {
    id: "bk-102",
    facilityId: "fac-2",
    facilityName: "SmashPoint Badminton Club",
    groundId: "g2-1",
    groundName: "Court 1 (Yonex Mat)",
    sport: "Badminton",
    date: getRelativeDateStr(0), // Today
    startTime: "19:00",
    durationHours: 1,
    endTime: "20:00",
    amount: 556,
    playerName: "Pooja Hegde",
    playerPhone: "+91 98111 22334",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    isSample: true
  },
  {
    id: "bk-103",
    facilityId: "fac-4",
    facilityName: "AquaFit Swimming Centre",
    groundId: "g4-1",
    groundName: "Main 25m Heated Pool (6 Lanes)",
    sport: "Swimming",
    date: getRelativeDateStr(1), // Tomorrow
    startTime: "07:00",
    durationHours: 1,
    endTime: "08:00",
    amount: 374,
    playerName: "Nalini Krishnan",
    playerPhone: "+91 97400 55667",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isSample: true
  },
  {
    id: "bk-104",
    facilityId: "fac-1",
    facilityName: "Elite Football Arena",
    groundId: "g1-2",
    groundName: "Pitch 2 (5v5 Fast Turf)",
    sport: "Football",
    date: getRelativeDateStr(1), // Tomorrow
    startTime: "20:00",
    durationHours: 2,
    endTime: "22:00",
    amount: 2872,
    playerName: "Kunal Ghosh",
    playerPhone: "+91 99000 88776",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    isSample: true
  },
  {
    id: "bk-105",
    facilityId: "fac-3",
    facilityName: "CricketZone Practice Nets",
    groundId: "g3-1",
    groundName: "Net A (Turf Pitch + Bowling Machine)",
    sport: "Cricket",
    date: getRelativeDateStr(-2), // Past
    startTime: "17:00",
    durationHours: 1,
    endTime: "18:00",
    amount: 856,
    playerName: "Karthik Raja",
    playerPhone: "+91 98450 11223",
    status: "Completed",
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    isSample: true
  },
  {
    id: "bk-106",
    facilityId: "fac-5",
    facilityName: "Metro Hoops Basketball Arena",
    groundId: "g5-1",
    groundName: "Full Court A (FIBA Standard)",
    sport: "Basketball",
    date: getRelativeDateStr(2),
    startTime: "18:00",
    durationHours: 1,
    endTime: "19:00",
    amount: 1215,
    playerName: "Vikram Das",
    playerPhone: "+91 98222 33445",
    status: "Cancelled",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isSample: true
  }
];

// Pure Helper: Haversine distance formula between two lat/lng coordinates in km
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

// Pure Helper: Generate all hourly slots from openTime to closeTime for a ground & date
export function generateSlotsForGroundAndDate(facility, groundId, dateStr, existingBookings = [], customSlotOverrides = {}) {
  const slots = [];
  const openHour = parseInt(facility.openTime.split(":")[0], 10);
  const closeHour = parseInt(facility.closeTime.split(":")[0], 10);

  // Check today vs selected date to disable past time slots for today
  const todayStr = getRelativeDateStr(0);
  const isToday = dateStr === todayStr;
  const currentHour = new Date().getHours();

  for (let hour = openHour; hour < closeHour; hour++) {
    const startStr = `${hour.toString().padStart(2, "0")}:00`;
    const nextHour = hour + 1;
    const endStr = `${nextHour.toString().padStart(2, "0")}:00`;
    const timeLabel = `${startStr} - ${endStr}`;
    const slotKey = `${facility.id}_${groundId}_${dateStr}_${startStr}`;

    const isPeak = facility.pricing.peakHours.includes(startStr);
    const basePrice = isPeak ? facility.pricing.peak : facility.pricing.offPeak;

    // Check custom owner overrides first (Open, Block, Close, Custom Price)
    const override = customSlotOverrides[slotKey];
    let state = "available";
    let slotPrice = basePrice;

    if (override) {
      if (override.status === "Block" || override.status === "maintenance") state = "maintenance";
      else if (override.status === "Close") state = "closed";
      else if (override.status === "Open") state = "available";

      if (override.price) slotPrice = override.price;
    }

    // If still available, check existing active bookings
    if (state === "available") {
      const isBooked = existingBookings.some((b) => {
        if (b.facilityId !== facility.id || b.groundId !== groundId || b.date !== dateStr) return false;
        if (b.status !== "Confirmed" && b.status !== "Pending") return false;
        const bStart = parseInt(b.startTime.split(":")[0], 10);
        const bEnd = bStart + (b.durationHours || 1);
        return hour >= bStart && hour < bEnd;
      });

      if (isBooked) {
        state = "booked";
      }
    }

    // If today and time has already passed
    if (isToday && hour <= currentHour && state === "available") {
      state = "closed";
    }

    // Deterministic sample states for realistic variety on demo future slots:
    // Some slots hold or maintenance for demo visibility
    if (state === "available") {
      if (hour === 14 && (facility.id === "fac-1" || facility.id === "fac-3")) {
        state = "maintenance"; // routine lawn maintenance
      } else if (hour === 16 && facility.id === "fac-2") {
        state = "held"; // held by another player simulator
      }
    }

    slots.push({
      startStr,
      endStr,
      timeLabel,
      isPeak,
      price: slotPrice,
      state, // 'available' | 'booked' | 'held' | 'maintenance' | 'closed'
      slotKey
    });
  }

  return slots;
}

// Pure Helper: Get the next available slot string for a facility
export function getNextAvailableSlot(facility, dateStr, existingBookings = []) {
  if (!facility.grounds || facility.grounds.length === 0) return "Check slots";
  for (const ground of facility.grounds) {
    const slots = generateSlotsForGroundAndDate(facility, ground.id, dateStr, existingBookings);
    const available = slots.find((s) => s.state === "available");
    if (available) {
      return `${available.startStr} on ${ground.name.split(" ")[0]}`;
    }
  }
  return "No slots today";
}

// Pure Helper: Calculate exact price, taxes, and platform fee
export function calculateBookingPrice(facility, durationHours, selectedSlots = []) {
  if (!selectedSlots || selectedSlots.length === 0) {
    return { basePrice: 0, taxes: 0, platformFee: 0, total: 0 };
  }

  const basePrice = selectedSlots.reduce((sum, s) => sum + s.price, 0);
  const taxPercent = facility.pricing.taxPercent || 18;
  const taxes = Math.round((basePrice * taxPercent) / 100);
  const platformFee = facility.pricing.platformFee || 30;
  const total = basePrice + taxes + platformFee;

  return {
    basePrice,
    taxPercent,
    taxes,
    platformFee,
    total
  };
}

// Pure Helper: Check if slot range overlaps with any confirmed or pending bookings
export function checkSlotOverlap(facilityId, groundId, dateStr, startTime, durationHours, existingBookings = []) {
  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHour = startHour + durationHours;

  const overlap = existingBookings.some((b) => {
    if (b.facilityId !== facilityId || b.groundId !== groundId || b.date !== dateStr) return false;
    if (b.status !== "Confirmed" && b.status !== "Pending") return false;
    const bStart = parseInt(b.startTime.split(":")[0], 10);
    const bEnd = bStart + (b.durationHours || 1);
    // Standard interval overlap: startHour < bEnd && endHour > bStart
    return startHour < bEnd && endHour > bStart;
  });

  return overlap;
}

// Pure Helper: Filter and Sort facilities
export function filterAndSortFacilities(facilities, filters, referenceCoords = null) {
  const {
    sport = "All",
    locality = "All",
    maxDistance = 20,
    searchQuery = "",
    priceRange = 2000,
    minRating = 0,
    indoorOutdoor = "all", // 'all' | 'indoor' | 'outdoor'
    selectedSurface = "all",
    selectedAmenities = [],
    availableSlotsOnly = false,
    selectedDate = getRelativeDateStr(0),
    preferredTime = "all", // 'all' | 'morning' | 'afternoon' | 'evening' | 'night'
    sortBy = "popular" // 'nearest' | 'price_low' | 'rating_high' | 'available_soon' | 'popular'
  } = filters;

  const query = searchQuery.trim().toLowerCase();

  const filtered = facilities.filter((fac) => {
    // 1. Sport
    if (sport !== "All" && fac.sport.toLowerCase() !== sport.toLowerCase()) {
      return false;
    }

    // 2. Locality
    if (locality !== "All" && fac.area.toLowerCase() !== locality.toLowerCase()) {
      return false;
    }

    // 3. Search query (matches name, area, sport, or address)
    if (query) {
      const match =
        fac.name.toLowerCase().includes(query) ||
        fac.area.toLowerCase().includes(query) ||
        fac.sport.toLowerCase().includes(query) ||
        fac.address.toLowerCase().includes(query);
      if (!match) return false;
    }

    // 4. Distance filter (only if referenceCoords exists)
    if (referenceCoords) {
      const dist = haversineDistance(referenceCoords.lat, referenceCoords.lng, fac.lat, fac.lng);
      if (dist !== null && dist > maxDistance) {
        return false;
      }
    }

    // 5. Price range (off-peak rate <= priceRange)
    if (fac.pricing.offPeak > priceRange) {
      return false;
    }

    // 6. Minimum rating
    if (minRating > 0 && fac.rating < minRating) {
      return false;
    }

    // 7. Indoor / Outdoor
    if (indoorOutdoor === "indoor" && !fac.indoor) return false;
    if (indoorOutdoor === "outdoor" && fac.indoor) return false;

    // 8. Surface
    if (selectedSurface !== "all" && !fac.surface.toLowerCase().includes(selectedSurface.toLowerCase())) {
      return false;
    }

    // 9. Amenities (must have ALL selected amenities)
    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every((a) => fac.amenities.includes(a));
      if (!hasAll) return false;
    }

    // 10. Preferred time or Available slots only
    if (availableSlotsOnly || preferredTime !== "all") {
      let hasMatchingSlot = false;
      for (const ground of fac.grounds) {
        const slots = generateSlotsForGroundAndDate(fac, ground.id, selectedDate);
        const match = slots.some((s) => {
          if (s.state !== "available") return false;
          if (preferredTime === "all") return true;

          const hour = parseInt(s.startStr.split(":")[0], 10);
          if (preferredTime === "morning" && hour >= 6 && hour < 12) return true;
          if (preferredTime === "afternoon" && hour >= 12 && hour < 17) return true;
          if (preferredTime === "evening" && hour >= 17 && hour < 21) return true;
          if (preferredTime === "night" && hour >= 21) return true;
          return false;
        });

        if (match) {
          hasMatchingSlot = true;
          break;
        }
      }
      if (!hasMatchingSlot) return false;
    }

    return true;
  });

  // Sort
  return filtered.sort((a, b) => {
    if (sortBy === "nearest" && referenceCoords) {
      const distA = haversineDistance(referenceCoords.lat, referenceCoords.lng, a.lat, a.lng) || 999;
      const distB = haversineDistance(referenceCoords.lat, referenceCoords.lng, b.lat, b.lng) || 999;
      return distA - distB;
    }
    if (sortBy === "price_low") {
      return a.pricing.offPeak - b.pricing.offPeak;
    }
    if (sortBy === "rating_high") {
      return b.rating - a.rating;
    }
    if (sortBy === "popular") {
      return b.reviewCount - a.reviewCount;
    }
    return 0;
  });
}
