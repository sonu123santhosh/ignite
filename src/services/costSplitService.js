/**
 * costSplitService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative mathematical calculation, validation, persistence, and sharing
 * for Group Cost Splitting inside SportLink Facility Bookings.
 *
 * Mathematical Invariants:
 *  - All calculations happen in integer PAISE (1 INR = 100 Paise).
 *  - In equal split:
 *      base = floor(total_paise / n)
 *      remainder = total_paise - (base * n)
 *      participants 1..remainder get base + 1
 *      participants (remainder+1)..n get base
 *      Sum(contributions) === total_paise (EXACT down to the single paisa).
 *  - In custom split:
 *      Sum(custom_paise) === total_paise is strictly required.
 *  - Participants count strictly clamped between 2 and 30 inclusive.
 *  - Honesty Rule: Payments are settled outside SportLink. No fake paid badges.
 */

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const SPLITS_STORAGE_KEY = 'sportlink_booking_splits_v1';

// In-memory fallback for test harnesses (Node.js environments)
let inMemorySplits = null;

// Rate-limiting map: { actorId -> { count, windowStart } }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const MAX_SPLIT_OPS_PER_WINDOW = 30;

export function resetSplitDbState() {
  inMemorySplits = null;
  rateLimitMap.clear();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SPLITS_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

function getSplitsStore() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(SPLITS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {
    // fallback
  }
  return inMemorySplits || [];
}

function saveSplitsStore(splits) {
  inMemorySplits = splits;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SPLITS_STORAGE_KEY, JSON.stringify(splits));
    }
  } catch {
    // ignore
  }
}

function checkRateLimit(actorId) {
  if (!actorId) return true;
  const now = Date.now();
  const entry = rateLimitMap.get(actorId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(actorId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_SPLIT_OPS_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

// ─── Input Sanitization ───────────────────────────────────────────────────────
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatINR(rupees) {
  const num = Number(rupees) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

export function toRupees(paise) {
  return Number((paise / 100).toFixed(2));
}

// ─── Mathematical Split Algorithms ───────────────────────────────────────────

/**
 * Validates participant count (must be integer between 2 and 30).
 * @param {number|string} count
 * @returns {{ valid: boolean, error?: string, count: number }}
 */
export function validateParticipantCount(count) {
  const num = Number(count);
  if (isNaN(num) || !Number.isInteger(num)) {
    return { valid: false, error: 'Participant count must be a whole integer.', count: 2 };
  }
  if (num < 2) {
    return { valid: false, error: 'Group split requires at least 2 participants.', count: 2 };
  }
  if (num > 30) {
    return { valid: false, error: 'Group split supports a maximum of 30 participants.', count: 30 };
  }
  return { valid: true, count: num };
}

/**
 * Calculates equal split down to exact integer paise.
 * Surplus paise from division remainder are distributed 1 paisa each to the
 * first `remainder` participants in order.
 *
 * @param {number} totalPaise Total amount in integer paise
 * @param {number} count Number of participants (2 to 30)
 * @param {Array<{ name?: string, userId?: string }>} [existingParticipants] Optional names
 * @returns {Array<{ position: number, name: string, amountPaise: number, amountRupees: number, isExtraPaisa: boolean }>}
 */
export function calculateEqualSplit(totalPaise, count, existingParticipants = []) {
  const countValidation = validateParticipantCount(count);
  const n = countValidation.valid ? countValidation.count : 2;
  const total = Math.max(0, Math.round(totalPaise));

  const base = Math.floor(total / n);
  const remainder = total - (base * n);

  const result = [];
  for (let i = 1; i <= n; i++) {
    const isExtra = i <= remainder;
    const amountPaise = base + (isExtra ? 1 : 0);
    const existing = existingParticipants[i - 1];

    let defaultName = i === 1 ? 'Booker (You)' : `Player ${i}`;
    let name = existing?.name?.trim() ? escapeHtml(existing.name.trim().slice(0, 50)) : defaultName;

    result.push({
      position: i,
      name,
      userId: existing?.userId || (i === 1 ? existing?.userId : null),
      amountPaise,
      amountRupees: toRupees(amountPaise),
      isExtraPaisa: isExtra
    });
  }

  return result;
}

/**
 * Validates custom participant shares against the total.
 * @param {number} totalPaise
 * @param {Array<{ position: number, amountPaise: number }>} participants
 * @returns {{ valid: boolean, sumPaise: number, remainingPaise: number, overPaise: number, error?: string }}
 */
export function validateCustomSplit(totalPaise, participants) {
  const total = Math.max(0, Math.round(totalPaise));
  if (!Array.isArray(participants) || participants.length < 2 || participants.length > 30) {
    return {
      valid: false,
      sumPaise: 0,
      remainingPaise: total,
      overPaise: 0,
      error: 'Custom split must have between 2 and 30 participants.'
    };
  }

  let sum = 0;
  for (const p of participants) {
    const amt = Number(p.amountPaise);
    if (isNaN(amt) || !Number.isInteger(amt) || amt < 0) {
      return {
        valid: false,
        sumPaise: sum,
        remainingPaise: Math.max(0, total - sum),
        overPaise: Math.max(0, sum - total),
        error: `Invalid contribution amount for ${p.name || `Player ${p.position}`}. Must be positive paise.`
      };
    }
    sum += amt;
  }

  const diff = total - sum;
  if (diff !== 0) {
    return {
      valid: false,
      sumPaise: sum,
      remainingPaise: diff > 0 ? diff : 0,
      overPaise: diff < 0 ? Math.abs(diff) : 0,
      error: diff > 0
        ? `Shares are short by ${formatINR(diff / 100)}. Please allocate the remaining amount.`
        : `Shares exceed total by ${formatINR(Math.abs(diff) / 100)}. Please reduce shares to match.`
    };
  }

  return {
    valid: true,
    sumPaise: sum,
    remainingPaise: 0,
    overPaise: 0
  };
}

// ─── Persistence & Split Operations ──────────────────────────────────────────

/**
 * Generates an unguessable public share token (alphanumeric, 24 chars).
 */
export function generateShareToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'spl_';
  for (let i = 0; i < 20; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Creates and persists a new BookingSplit linked to an existing booking.
 * @param {object} params
 */
export function createBookingSplit({
  bookingId,
  facilityId,
  facilityName,
  groundName,
  date,
  time,
  totalRupees,
  participantCount = 2,
  mode = 'equal',
  participants = [],
  note = '',
  creatorUserId,
  creatorName
}) {
  if (!bookingId) {
    throw new Error('A valid bookingId is required to associate a cost split.');
  }

  if (!checkRateLimit(creatorUserId)) {
    throw new Error('Rate limit exceeded. Please wait a few minutes before updating splits.');
  }

  const totalPaise = toPaise(totalRupees);
  if (totalPaise <= 0) {
    throw new Error('Booking total must be greater than zero to split.');
  }

  const countValidation = validateParticipantCount(participantCount);
  if (!countValidation.valid) {
    throw new Error(countValidation.error);
  }
  const count = countValidation.count;

  let validatedParticipants = [];

  if (mode === 'custom') {
    const customVal = validateCustomSplit(totalPaise, participants);
    if (!customVal.valid) {
      throw new Error(customVal.error);
    }
    validatedParticipants = participants.map((p, idx) => ({
      position: idx + 1,
      name: escapeHtml((p.name || (idx === 0 ? creatorName || 'Booker' : `Player ${idx + 1}`)).trim().slice(0, 50)),
      userId: p.userId || (idx === 0 ? creatorUserId : null),
      amountPaise: Math.round(Number(p.amountPaise)),
      amountRupees: toRupees(Math.round(Number(p.amountPaise))),
      paymentStatus: null // Honesty rule: external settlement
    }));
  } else {
    // Equal split
    validatedParticipants = calculateEqualSplit(totalPaise, count, participants).map((p) => ({
      position: p.position,
      name: escapeHtml(p.name.slice(0, 50)),
      userId: p.userId || null,
      amountPaise: p.amountPaise,
      amountRupees: p.amountRupees,
      paymentStatus: null // Honesty rule: external settlement
    }));
  }

  const cleanNote = escapeHtml((note || '').trim().slice(0, 200));

  const newSplit = {
    id: `split-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bookingId,
    facilityId: facilityId || '',
    facilityName: escapeHtml(facilityName || 'Facility'),
    groundName: escapeHtml(groundName || 'Pitch'),
    date: date || '',
    time: time || '',
    creatorUserId: creatorUserId || 'guest',
    creatorName: escapeHtml((creatorName || 'Booker').trim().slice(0, 50)),
    totalPaise,
    totalRupees: toRupees(totalPaise),
    participantCount: count,
    mode: mode === 'custom' ? 'custom' : 'equal',
    note: cleanNote,
    shareToken: generateShareToken(),
    shareTokenRevoked: false,
    status: 'Active', // Active | Cancelled | Completed
    participants: validatedParticipants,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };

  const store = getSplitsStore();
  // Remove existing split for this booking if any
  const filtered = store.filter((s) => s.bookingId !== bookingId);
  filtered.unshift(newSplit);
  saveSplitsStore(filtered);

  return newSplit;
}

/**
 * Retrieves a split by its booking ID.
 * @param {string} bookingId
 * @param {string} [actorUserId]
 */
export function getSplitByBookingId(bookingId, actorUserId = null) {
  const store = getSplitsStore();
  const split = store.find((s) => s.bookingId === bookingId);
  if (!split) return null;

  // Authorization check: if an actorUserId is specified, they must be the creator (or a privileged actor)
  if (actorUserId && split.creatorUserId !== 'guest' && split.creatorUserId !== actorUserId) {
    // Cross-tenant access defense
    return null;
  }

  return split;
}

/**
 * Retrieves public breakdown details using an unguessable share token.
 * Exposes ZERO private data (no emails, phone numbers, or user IDs).
 * @param {string} shareToken
 */
export function getPublicSplitByToken(shareToken) {
  if (!shareToken) return null;
  const store = getSplitsStore();
  const split = store.find((s) => s.shareToken === shareToken);

  if (!split || split.shareTokenRevoked) {
    return null;
  }

  // Sanitize completely for public consumption
  return {
    facilityName: split.facilityName,
    groundName: split.groundName,
    date: split.date,
    time: split.time,
    totalRupees: split.totalRupees,
    participantCount: split.participantCount,
    mode: split.mode,
    note: split.note,
    status: split.status,
    createdAt: split.createdAt,
    participants: split.participants.map((p) => ({
      position: p.position,
      name: p.name,
      amountRupees: p.amountRupees
    }))
  };
}

/**
 * Updates an existing split (creator only, while not cancelled or completed).
 */
export function updateBookingSplit(bookingId, updateData, actorUserId) {
  const store = getSplitsStore();
  const index = store.findIndex((s) => s.bookingId === bookingId);
  if (index === -1) {
    throw new Error('Split record not found.');
  }

  const split = store[index];

  // Authorization check
  if (actorUserId && split.creatorUserId !== 'guest' && split.creatorUserId !== actorUserId) {
    throw new Error('Unauthorized: only the booking creator can update this split.');
  }

  if (split.status === 'Cancelled' || split.status === 'Completed') {
    throw new Error(`Cannot modify a split for a ${split.status.toLowerCase()} booking.`);
  }

  if (!checkRateLimit(actorUserId)) {
    throw new Error('Rate limit exceeded. Please wait a few minutes.');
  }

  const nextMode = updateData.mode || split.mode;
  const nextCount = updateData.participantCount || split.participantCount;
  const nextTotalPaise = updateData.totalRupees ? toPaise(updateData.totalRupees) : split.totalPaise;

  const countValidation = validateParticipantCount(nextCount);
  if (!countValidation.valid) {
    throw new Error(countValidation.error);
  }

  let nextParticipants = [];
  if (nextMode === 'custom') {
    const customVal = validateCustomSplit(nextTotalPaise, updateData.participants || split.participants);
    if (!customVal.valid) {
      throw new Error(customVal.error);
    }
    nextParticipants = (updateData.participants || split.participants).map((p, idx) => ({
      position: idx + 1,
      name: escapeHtml((p.name || `Player ${idx + 1}`).trim().slice(0, 50)),
      userId: p.userId || null,
      amountPaise: Math.round(Number(p.amountPaise)),
      amountRupees: toRupees(Math.round(Number(p.amountPaise))),
      paymentStatus: null
    }));
  } else {
    nextParticipants = calculateEqualSplit(
      nextTotalPaise,
      nextCount,
      updateData.participants || split.participants
    ).map((p) => ({
      position: p.position,
      name: escapeHtml(p.name.slice(0, 50)),
      userId: p.userId || null,
      amountPaise: p.amountPaise,
      amountRupees: p.amountRupees,
      paymentStatus: null
    }));
  }

  const updatedSplit = {
    ...split,
    participantCount: nextCount,
    mode: nextMode,
    totalPaise: nextTotalPaise,
    totalRupees: toRupees(nextTotalPaise),
    note: updateData.note !== undefined ? escapeHtml(updateData.note.trim().slice(0, 200)) : split.note,
    participants: nextParticipants,
    updatedAt: new Date().toISOString(),
    version: (split.version || 1) + 1
  };

  store[index] = updatedSplit;
  saveSplitsStore(store);

  return updatedSplit;
}

/**
 * Cancels a split when the corresponding booking is cancelled.
 * Split remains viewable in history with status 'Cancelled'.
 */
export function cancelSplitForBooking(bookingId) {
  const store = getSplitsStore();
  const split = store.find((s) => s.bookingId === bookingId);
  if (!split) return null;

  split.status = 'Cancelled';
  split.updatedAt = new Date().toISOString();
  saveSplitsStore(store);
  return split;
}

/**
 * Revokes a public share token.
 */
export function revokeShareToken(bookingId, actorUserId) {
  const store = getSplitsStore();
  const split = store.find((s) => s.bookingId === bookingId);
  if (!split) throw new Error('Split not found.');

  if (actorUserId && split.creatorUserId !== 'guest' && split.creatorUserId !== actorUserId) {
    throw new Error('Unauthorized: only the booking creator can revoke share links.');
  }

  split.shareTokenRevoked = true;
  split.updatedAt = new Date().toISOString();
  saveSplitsStore(store);
  return split;
}

// ─── Sharing Text & Formatter ────────────────────────────────────────────────

/**
 * Generates formatted text for clipboard copying or WhatsApp sharing.
 */
export function generateShareText(split, shareUrl = '') {
  if (!split) return '';

  const lines = [
    `⚽ SportLink Match Cost Split`,
    `Venue: ${split.facilityName} (${split.groundName})`,
    `Scheduled: ${split.date} at ${split.time}`,
    `Total Booking Cost: ${formatINR(split.totalRupees)} (Split among ${split.participantCount} players)`,
    ``,
    `Individual Breakdown:`
  ];

  split.participants.forEach((p) => {
    lines.push(`• ${p.name}: ${formatINR(p.amountRupees)}`);
  });

  if (split.note) {
    lines.push(``);
    lines.push(`Note: ${split.note}`);
  }

  lines.push(``);
  lines.push(`Cost breakdown only • Please settle your share with the match organizer.`);

  if (shareUrl) {
    lines.push(`View breakdown online: ${shareUrl}`);
  }

  return lines.join('\n');
}

/**
 * Generates WhatsApp share URL with prefilled text.
 */
export function generateWhatsAppUrl(split, shareUrl = '') {
  const text = generateShareText(split, shareUrl);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
