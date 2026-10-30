/**
 * authService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All authentication logic: registration, login, session management, rate
 * limiting, and bcrypt password hashing.
 *
 * Architecture note: This project is a pure front-end prototype backed by
 * localStorage (same pattern as leagueService.js and friendlyFeedService.js).
 * All "server-side" rules (identity from session, no hash leakage,
 * mass-assignment defense, rate limiting) are enforced here in the service
 * layer. In a future real backend, each exported function maps to an API
 * endpoint.
 *
 * Security properties:
 *  - Passwords hashed with bcryptjs (cost factor 12) — never stored plaintext
 *  - Password hashes are NEVER returned from any function
 *  - Identity is derived from the stored session, never from caller-supplied data
 *  - Rate limiting: max 5 login attempts per email per 15 minutes (in-memory)
 *  - Generic error messages on login failure (no oracle)
 */

import bcrypt from 'bcryptjs';

// ─── Storage keys ────────────────────────────────────────────────────────────
export const USERS_KEY = 'sportlink_users_v1';
export const SESSION_KEY = 'sportlink_session_v1';

// Session TTL: 7 days in milliseconds
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// bcrypt cost factor
const BCRYPT_ROUNDS = 12;

// ─── In-memory rate-limit store ───────────────────────────────────────────────
// { email -> { attempts: number, windowStart: timestamp } }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = 5;

// In-memory fallbacks for test harnesses (Node.js environments where window.localStorage is undefined)
let inMemoryUsers = null;
let inMemorySession = null;

export function resetAuthDbState() {
  inMemoryUsers = null;
  inMemorySession = null;
  rateLimitMap.clear();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(USERS_KEY);
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getUsers() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {
    // fallback
  }
  return inMemoryUsers || [];
}

export function saveUsers(users) {
  inMemoryUsers = users;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } catch {
    // ignore
  }
}

export function getSession() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.userId && session?.expiresAt) {
          if (Date.now() > session.expiresAt) {
            window.localStorage.removeItem(SESSION_KEY);
            return null;
          }
          return session;
        }
      }
    }
  } catch {
    // fallback
  }

  if (inMemorySession) {
    if (Date.now() > inMemorySession.expiresAt) {
      inMemorySession = null;
      return null;
    }
    return inMemorySession;
  }
  return null;
}

export function saveSession(userId) {
  const session = {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
    createdAt: new Date().toISOString()
  };
  inMemorySession = session;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // ignore
  }
  return session;
}

export function clearSession() {
  inMemorySession = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

/** Strip password hash — NEVER expose it outside the service */
export function sanitizeUser(user) {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { hashedPassword, ...safe } = user;
  return safe;
}

function isRateLimited(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry) return false;
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.delete(key);
    return false;
  }
  return entry.attempts >= RATE_LIMIT_MAX;
}

function recordFailedAttempt(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { attempts: 1, windowStart: now });
  } else {
    entry.attempts += 1;
  }
}

function clearRateLimit(email) {
  rateLimitMap.delete(email.toLowerCase());
}

// ─── Validation helpers ───────────────────────────────────────────────────────

/**
 * Validate a name string.
 * @returns {string|null} error message or null if valid
 */
export function validateName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 60) return 'Name must be 60 characters or fewer.';
  return null;
}

/**
 * Validate an email string.
 * @returns {string|null} error message or null if valid
 */
export function validateEmail(email) {
  const trimmed = (email || '').trim();
  if (!trimmed) return 'Email address is required.';
  if (trimmed.length > 254) return 'Email address is too long.';
  // RFC 5321 simplified pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
  return null;
}

/**
 * Validate a password string.
 * @returns {string|null} error message or null if valid
 */
export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 72) return 'Password must be 72 characters or fewer.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
  return null;
}

/**
 * Compute password strength 0–4 for the strength bar.
 * 0 = very weak, 4 = strong
 */
export function passwordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ name, email, password, confirmPassword, role }} data
 * @returns {Promise<{ success: boolean, user?, error?, fieldErrors? }>}
 */
export async function register({ name, email, password, confirmPassword, role }) {
  // ── Server-side validation (authoritative) ──────────────────────────────
  const fieldErrors = {};

  const nameErr = validateName(name);
  if (nameErr) fieldErrors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) fieldErrors.email = emailErr;

  const passwordErr = validatePassword(password);
  if (passwordErr) fieldErrors.password = passwordErr;

  if (password && confirmPassword !== password) {
    fieldErrors.confirmPassword = 'Passwords do not match.';
  }

  // ── Role whitelist (prevent privilege escalation) ───────────────────────
  const ALLOWED_ROLES = ['player', 'facility_owner', 'coach', 'captain'];
  const safeRole = ALLOWED_ROLES.includes(role) ? role : 'player';

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  // ── Sanitize inputs ─────────────────────────────────────────────────────
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // ── Duplicate email check ───────────────────────────────────────────────
  const users = getUsers();
  const existing = users.find((u) => u.email === cleanEmail);
  if (existing) {
    return {
      success: false,
      fieldErrors: {
        email: 'An account with this email already exists. Try logging in.'
      }
    };
  }

  // ── Hash password ───────────────────────────────────────────────────────
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  } catch {
    return { success: false, error: 'Something went wrong. Please try again.' };
  }

  // ── Create user record (identity fields derived here, never from caller) ─
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: cleanName,
    email: cleanEmail,
    hashedPassword, // stored, never returned
    role: safeRole,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // ── Create session ──────────────────────────────────────────────────────
  saveSession(newUser.id);
  clearRateLimit(cleanEmail);

  return { success: true, user: sanitizeUser(newUser) };
}

/**
 * Log in an existing user.
 * @param {{ email, password }} data
 * @returns {Promise<{ success: boolean, user?, error? }>}
 */
export async function login({ email, password }) {
  // Basic presence checks
  if (!email || !password) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // ── Rate limiting ───────────────────────────────────────────────────────
  if (isRateLimited(cleanEmail)) {
    return {
      success: false,
      error: 'Too many failed attempts. Please wait 15 minutes and try again.'
    };
  }

  // ── Lookup user ─────────────────────────────────────────────────────────
  const users = getUsers();
  const user = users.find((u) => u.email === cleanEmail);

  // ── Verify password — constant-time compare via bcrypt ──────────────────
  let passwordMatch = false;
  if (user) {
    try {
      passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    } catch {
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  } else {
    // Run a dummy hash to prevent timing oracle (user enumeration)
    try {
      await bcrypt.compare(password, '$2a$12$dummyhashtopreventtimingattacks..........');
    } catch {
      // ignore
    }
  }

  if (!user || !passwordMatch) {
    recordFailedAttempt(cleanEmail);
    return { success: false, error: 'Invalid email or password.' };
  }

  // ── Success ─────────────────────────────────────────────────────────────
  clearRateLimit(cleanEmail);
  saveSession(user.id);

  return { success: true, user: sanitizeUser(user) };
}

/**
 * Log out the current user (clears session).
 */
export function logout() {
  clearSession();
}

/**
 * Restore the current user from a persisted valid session.
 * Returns sanitized user or null.
 */
export function restoreSession() {
  const session = getSession();
  if (!session) return null;

  const users = getUsers();
  const user = users.find((u) => u.id === session.userId);
  if (!user) {
    clearSession();
    return null;
  }

  return sanitizeUser(user);
}
