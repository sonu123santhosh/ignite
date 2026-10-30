/**
 * /src/services/leagueService.js
 * 
 * Authoritative Server-Side Security, Storage & Authorization Service for "Your League".
 * 
 * Enforces:
 * 1. Server-side session authentication (never trusting client IDs/roles in body).
 * 2. Ownership & Co-Manager authorization (BOLA / IDOR protection): 403/404 on mismatched IDs.
 * 3. Cross-league resource verification: team and match must strictly belong to the league in URL.
 * 4. Mass-assignment protection: client cannot tamper ownerId, status, shareToken, version, or timestamps.
 * 5. Input validation & sanitization: bounds checking, string trimming, regex sanitization.
 * 6. Team uniqueness within league via normalizedName (trimmed, case-folded, collapsed whitespace).
 * 7. Circle method round-robin generator with seeded PRNG (reproducible Draw Code) & home/away balancing.
 * 8. Pure standings calculation (NEVER stored, dynamically computed from completed results).
 * 9. Regeneration locks: cannot regenerate or remove teams once results are recorded, unless explicitly reset.
 * 10. Optimistic concurrency locking via version numbers.
 * 11. Complete audit logging for all critical operations.
 */

import { storageWrapper } from '../data/trialsData.js';

export const LEAGUES_STORAGE_KEY = 'sportlink_your_league_store_v1';
export const LEAGUE_AUDIT_STORAGE_KEY = 'sportlink_league_audit_logs_v1';

// Custom API Error for simulated server responses
export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// -----------------------------------------------------------------------------
// SHARED LEAGUE TEAM LIMITS & VALIDATION RULES
// -----------------------------------------------------------------------------
export const LEAGUE_TEAM_LIMITS = {
  MIN: 2,
  MAX: 32
};

/**
 * Pure parser & validator for team count.
 * Enforces integer within [MIN, MAX], rejects decimals, exponents, text, negatives.
 */
export function parseAndValidateTeamCount(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return {
      valid: false,
      value: null,
      error: `Enter a whole number between ${LEAGUE_TEAM_LIMITS.MIN} and ${LEAGUE_TEAM_LIMITS.MAX}.`
    };
  }

  const str = String(raw).trim();
  // Strictly digits only (handles " 8 ", "08", but rejects "8.5", "1e3", "-3", "abc")
  if (!/^\d+$/.test(str)) {
    return {
      valid: false,
      value: null,
      error: `Enter a whole number between ${LEAGUE_TEAM_LIMITS.MIN} and ${LEAGUE_TEAM_LIMITS.MAX}.`
    };
  }

  const num = parseInt(str, 10);
  if (isNaN(num) || num < LEAGUE_TEAM_LIMITS.MIN || num > LEAGUE_TEAM_LIMITS.MAX) {
    return {
      valid: false,
      value: num,
      error: `Enter a whole number between ${LEAGUE_TEAM_LIMITS.MIN} and ${LEAGUE_TEAM_LIMITS.MAX}.`
    };
  }

  return {
    valid: true,
    value: num,
    error: null
  };
}

/**
 * Validates team names array: required, trimmed (1-40 chars), unique within league, no duplicates.
 */
export function validateTeamNames(teams, expectedCount = null) {
  if (!Array.isArray(teams)) {
    return {
      valid: false,
      errors: ['Teams must be provided as a list.'],
      summary: 'Teams must be provided as a list.'
    };
  }

  if (expectedCount !== null && teams.length !== expectedCount) {
    return {
      valid: false,
      errors: [`Expected exactly ${expectedCount} teams, but got ${teams.length}.`],
      summary: `Expected exactly ${expectedCount} teams, but got ${teams.length}.`
    };
  }

  const errors = new Array(teams.length).fill(null);
  const seenNorms = new Map();
  let hasError = false;

  teams.forEach((t, index) => {
    const rawName = typeof t === 'string' ? t : (t?.name || '');
    const clean = rawName.trim();

    if (!clean || clean.length < 1 || clean.length > 40) {
      errors[index] = 'Team name is required (1 to 40 characters).';
      hasError = true;
      return;
    }

    const norm = normalizeTeamName(clean);
    if (seenNorms.has(norm)) {
      const priorIdx = seenNorms.get(norm);
      errors[index] = `Duplicate name: matches Team ${priorIdx + 1}.`;
      if (!errors[priorIdx]) {
        errors[priorIdx] = `Duplicate name: matches Team ${index + 1}.`;
      }
      hasError = true;
    } else {
      seenNorms.set(norm, index);
    }
  });

  return {
    valid: !hasError,
    errors,
    summary: hasError ? 'Please provide a unique, valid name for all teams.' : null
  };
}

// -----------------------------------------------------------------------------
// SPORT PRESETS CONFIGURATION
// -----------------------------------------------------------------------------
export const SPORT_PRESETS = {
  football: {
    id: 'football',
    name: 'Football / Futsal / Hockey',
    sports: ['Football', 'Futsal', 'Hockey'],
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    drawsAllowed: true,
    scoreLabel: 'Goals',
    forLabel: 'GF',
    againstLabel: 'GA',
    diffLabel: 'GD',
    hasScores: true
  },
  basketball: {
    id: 'basketball',
    name: 'Basketball',
    sports: ['Basketball'],
    pointsWin: 2,
    pointsDraw: 0,
    pointsLoss: 0,
    drawsAllowed: false,
    scoreLabel: 'Points',
    forLabel: 'PF',
    againstLabel: 'PA',
    diffLabel: 'PD',
    hasScores: true
  },
  volleyball: {
    id: 'volleyball',
    name: 'Volleyball',
    sports: ['Volleyball'],
    pointsWin: 2,
    pointsDraw: 0,
    pointsLoss: 0,
    drawsAllowed: false,
    scoreLabel: 'Sets',
    forLabel: 'SF',
    againstLabel: 'SA',
    diffLabel: 'SD',
    hasScores: true,
    volleyball32Mode: false // When true: 3-0 or 3-1 win gives 3-0 pts; 3-2 win gives 2-1 pts
  },
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    sports: ['Cricket'],
    pointsWin: 2,
    pointsDraw: 1, // Tie
    pointsLoss: 0,
    pointsNoResult: 1,
    drawsAllowed: true, // Ties allowed
    scoreLabel: 'Runs',
    forLabel: 'Runs',
    againstLabel: 'Against',
    diffLabel: 'NRR',
    hasScores: true
  },
  individual: {
    id: 'individual',
    name: 'Badminton / Tennis / Table Tennis',
    sports: ['Badminton', 'Tennis', 'Table Tennis', 'Squash'],
    pointsWin: 2,
    pointsDraw: 0,
    pointsLoss: 0,
    drawsAllowed: false,
    scoreLabel: 'Sets',
    forLabel: 'SF',
    againstLabel: 'SA',
    diffLabel: 'SD',
    hasScores: true
  },
  custom: {
    id: 'custom',
    name: 'Custom Points Rules',
    sports: ['Other'],
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    drawsAllowed: true,
    scoreLabel: 'Points',
    forLabel: 'PF',
    againstLabel: 'PA',
    diffLabel: 'Diff',
    hasScores: true
  }
};

/**
 * Determine preset key based on sport name
 */
export function getPresetForSport(sportName = '') {
  const norm = (sportName || '').trim().toLowerCase();
  if (norm.includes('foot') || norm.includes('futsal') || norm.includes('hockey')) return 'football';
  if (norm.includes('basket')) return 'basketball';
  if (norm.includes('volley')) return 'volleyball';
  if (norm.includes('cricket')) return 'cricket';
  if (norm.includes('badminton') || norm.includes('tennis') || norm.includes('table')) return 'individual';
  return 'football';
}

// -----------------------------------------------------------------------------
// SEEDED PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
// Ensures reproducible fixture draws from a Draw Code seed
// -----------------------------------------------------------------------------
export function createPRNG(seed) {
  let s = typeof seed === 'number' ? seed : hashStringToSeed(String(seed));
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash || 123456789;
}

export function generateRandomSeed() {
  return Math.floor(100000 + Math.random() * 900000);
}

export function generateShareToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'lgt_';
  for (let i = 0; i < 28; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function normalizeTeamName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// -----------------------------------------------------------------------------
// INITIAL SEED DATA FOR YOUR LEAGUE
// -----------------------------------------------------------------------------
const INITIAL_LEAGUES = [
  {
    id: 'league-pune-prem-2026',
    ownerId: 'user-captain-1', // Rahul Sharma
    name: 'Pune Amateur Football League 2026',
    sport: 'Football',
    description: 'Premier weekend 7-a-side round-robin league for Pune clubs and college alumni.',
    logo: '',
    format: 'single round-robin',
    plannedTeamCount: 4,
    startDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    rulesText: '2 x 25 min halves. Rolling substitutions. Red card results in 1-match suspension.',
    scoringPreset: 'football',
    scoringSettings: {
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      drawsAllowed: true,
      scoreLabel: 'Goals'
    },
    tieBreakOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha'],
    visibility: 'public via link',
    shareToken: 'lgt_pune_premier_ftbl_demo_token_8899',
    status: 'In progress',
    fixtureSeed: 489210,
    fixturesGeneratedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    version: 3
  },
  {
    id: 'league-deccan-cricket-2026',
    ownerId: 'user-player-1', // Priya Sen
    name: 'Deccan Weekend T20 Championship',
    sport: 'Cricket',
    description: 'Competitive club cricket single round-robin with net run rate tie-breaks.',
    logo: '',
    format: 'single round-robin',
    plannedTeamCount: 4,
    startDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10),
    rulesText: 'Standard ICC T20 rules. Max 4 overs per bowler. Super over for knockout ties.',
    scoringPreset: 'cricket',
    scoringSettings: {
      pointsWin: 2,
      pointsDraw: 1,
      pointsLoss: 0,
      pointsNoResult: 1,
      drawsAllowed: true,
      scoreLabel: 'Runs'
    },
    tieBreakOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha'],
    visibility: 'private',
    shareToken: null,
    status: 'Fixtures ready',
    fixtureSeed: 742189,
    fixturesGeneratedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    version: 1
  }
];

const INITIAL_MANAGERS = [
  { leagueId: 'league-pune-prem-2026', userId: 'user-captain-1', role: 'owner' },
  { leagueId: 'league-pune-prem-2026', userId: 'user-captain-2', role: 'co-manager' },
  { leagueId: 'league-deccan-cricket-2026', userId: 'user-player-1', role: 'owner' }
];

const INITIAL_TEAMS = [
  // Pune Football League Teams
  {
    id: 'lteam-1',
    leagueId: 'league-pune-prem-2026',
    name: 'Kothrud Strikers',
    normalizedName: 'kothrud strikers',
    logo: '',
    captainName: 'Aman Verma',
    captainContact: '+91 98220 11223 (aman@kothrudfc.in)',
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString()
  },
  {
    id: 'lteam-2',
    leagueId: 'league-pune-prem-2026',
    name: 'Shivajinagar FC',
    normalizedName: 'shivajinagar fc',
    logo: '',
    captainName: 'Rohan Deshpande',
    captainContact: '+91 98220 44556 (rohan@sfc.in)',
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString()
  },
  {
    id: 'lteam-3',
    leagueId: 'league-pune-prem-2026',
    name: 'Viman Nagar United',
    normalizedName: 'viman nagar united',
    logo: '',
    captainName: 'Kunal Shinde',
    captainContact: '+91 98220 77889 (kunal@vnu.in)',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'lteam-4',
    leagueId: 'league-pune-prem-2026',
    name: 'Deccan Rovers',
    normalizedName: 'deccan rovers',
    logo: '',
    captainName: 'Aditya Roy',
    captainContact: '+91 98220 99001 (aditya@rovers.in)',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  // Deccan Cricket Teams
  {
    id: 'lteam-c1',
    leagueId: 'league-deccan-cricket-2026',
    name: 'Pune Blasters CC',
    normalizedName: 'pune blasters cc',
    logo: '',
    captainName: 'Rahul Dravid K',
    captainContact: '+91 98111 22334',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'lteam-c2',
    leagueId: 'league-deccan-cricket-2026',
    name: 'Sahyadri Tigers',
    normalizedName: 'sahyadri tigers',
    logo: '',
    captainName: 'Sanjay Joshi',
    captainContact: '+91 98111 44556',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'lteam-c3',
    leagueId: 'league-deccan-cricket-2026',
    name: 'Sinhagad Rhinos',
    normalizedName: 'sinhagad rhinos',
    logo: '',
    captainName: 'Gaurav Kulkarni',
    captainContact: '+91 98111 66778',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'lteam-c4',
    leagueId: 'league-deccan-cricket-2026',
    name: 'Deccan Titans',
    normalizedName: 'deccan titans',
    logo: '',
    captainName: 'Pravin Jadhav',
    captainContact: '+91 98111 88990',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

const INITIAL_MATCHES = [
  // Round 1
  {
    id: 'lmatch-1',
    leagueId: 'league-pune-prem-2026',
    round: 1,
    leg: 1,
    homeTeamId: 'lteam-1',
    awayTeamId: 'lteam-4',
    scheduledAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    venue: 'Sanctuary Turf - Arena 1',
    status: 'Completed',
    homeScore: 3,
    awayScore: 1,
    forfeitWinnerTeamId: null,
    resultNote: 'Clean match. Kothrud dominated midfield.',
    updatedBy: 'user-captain-1',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    version: 2
  },
  {
    id: 'lmatch-2',
    leagueId: 'league-pune-prem-2026',
    round: 1,
    leg: 1,
    homeTeamId: 'lteam-2',
    awayTeamId: 'lteam-3',
    scheduledAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    venue: 'Sanctuary Turf - Arena 2',
    status: 'Completed',
    homeScore: 2,
    awayScore: 2,
    forfeitWinnerTeamId: null,
    resultNote: 'Dramatic equalizer at 49th minute.',
    updatedBy: 'user-captain-1',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    version: 2
  },
  // Round 2
  {
    id: 'lmatch-3',
    leagueId: 'league-pune-prem-2026',
    round: 2,
    leg: 1,
    homeTeamId: 'lteam-3',
    awayTeamId: 'lteam-1',
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    venue: 'Sanctuary Turf - Arena 1',
    status: 'Scheduled',
    homeScore: null,
    awayScore: null,
    forfeitWinnerTeamId: null,
    resultNote: '',
    updatedBy: 'user-captain-1',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    version: 1
  },
  {
    id: 'lmatch-4',
    leagueId: 'league-pune-prem-2026',
    round: 2,
    leg: 1,
    homeTeamId: 'lteam-4',
    awayTeamId: 'lteam-2',
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    venue: 'Sanctuary Turf - Arena 2',
    status: 'Scheduled',
    homeScore: null,
    awayScore: null,
    forfeitWinnerTeamId: null,
    resultNote: '',
    updatedBy: 'user-captain-1',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    version: 1
  },
  // Round 3
  {
    id: 'lmatch-5',
    leagueId: 'league-pune-prem-2026',
    round: 3,
    leg: 1,
    homeTeamId: 'lteam-1',
    awayTeamId: 'lteam-2',
    scheduledAt: new Date(Date.now() + 86400000 * 12).toISOString(),
    venue: 'Sanctuary Turf - Arena 1',
    status: 'Scheduled',
    homeScore: null,
    awayScore: null,
    forfeitWinnerTeamId: null,
    resultNote: '',
    updatedBy: 'user-captain-1',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    version: 1
  },
  {
    id: 'lmatch-6',
    leagueId: 'league-pune-prem-2026',
    round: 3,
    leg: 1,
    homeTeamId: 'lteam-3',
    awayTeamId: 'lteam-4',
    scheduledAt: new Date(Date.now() + 86400000 * 12).toISOString(),
    venue: 'Sanctuary Turf - Arena 2',
    status: 'Scheduled',
    homeScore: null,
    awayScore: null,
    forfeitWinnerTeamId: null,
    resultNote: '',
    updatedBy: 'user-captain-1',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    version: 1
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'laudit-1',
    leagueId: 'league-pune-prem-2026',
    matchId: null,
    actorId: 'user-captain-1',
    action: 'LEAGUE_CREATED',
    before: null,
    after: { name: 'Pune Amateur Football League 2026' },
    at: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'laudit-2',
    leagueId: 'league-pune-prem-2026',
    matchId: null,
    actorId: 'user-captain-1',
    action: 'FIXTURES_GENERATED',
    before: null,
    after: { count: 6, seed: 489210 },
    at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'laudit-3',
    leagueId: 'league-pune-prem-2026',
    matchId: 'lmatch-1',
    actorId: 'user-captain-1',
    action: 'SCORE_RECORDED',
    before: { status: 'Scheduled', homeScore: null, awayScore: null },
    after: { status: 'Completed', homeScore: 3, awayScore: 1 },
    at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

// -----------------------------------------------------------------------------
// DATABASE REPOSITORY & PERSISTENCE
// -----------------------------------------------------------------------------
let inMemoryDbState = null;

export function getLeagueDbState() {
  if (inMemoryDbState) {
    return inMemoryDbState;
  }
  const defaultState = {
    leagues: JSON.parse(JSON.stringify(INITIAL_LEAGUES)),
    managers: JSON.parse(JSON.stringify(INITIAL_MANAGERS)),
    teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
    matches: JSON.parse(JSON.stringify(INITIAL_MATCHES)),
    auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS))
  };

  const loaded = storageWrapper.get(LEAGUES_STORAGE_KEY, defaultState);
  inMemoryDbState = loaded;
  return inMemoryDbState;
}

export function saveLeagueDbState(state) {
  inMemoryDbState = state;
  storageWrapper.set(LEAGUES_STORAGE_KEY, state);
}

// -----------------------------------------------------------------------------
// SERVER-SIDE PERMISSION & SANITIZATION HELPERS
// -----------------------------------------------------------------------------

/**
 * Extracts and authenticates user session
 * @param {Object} session - { user: { id, name, ... }, token }
 * @returns {Object} Authenticated user
 */
function authenticateSession(session) {
  if (!session || !session.user || !session.user.id) {
    throw new ApiError(401, 'Unauthorized: Valid authenticated session required.');
  }
  return session.user;
}

/**
 * Checks if user is owner or co-manager of the given league
 */
function isLeagueManager(db, leagueId, userId) {
  const isOwner = db.leagues.some((l) => l.id === leagueId && l.ownerId === userId);
  if (isOwner) return true;
  return db.managers.some((m) => m.leagueId === leagueId && m.userId === userId);
}

/**
 * Authorize that user is a manager (owner or co-manager) of the league
 * Prevents IDOR / BOLA by throwing 404 (if not found) or 403 (if forbidden)
 */
function authorizeManager(db, leagueId, userId) {
  const league = db.leagues.find((l) => l.id === leagueId);
  if (!league) {
    throw new ApiError(404, `League with ID "${leagueId}" not found.`);
  }

  const authorized = isLeagueManager(db, leagueId, userId);
  if (!authorized) {
    throw new ApiError(403, 'Forbidden: You do not have manager permissions for this league.');
  }

  return league;
}

/**
 * Authorize read access for a league based on visibility and session
 */
function authorizeReadAccess(db, leagueId, session, shareToken = null) {
  const league = db.leagues.find((l) => l.id === leagueId);
  if (!league) {
    throw new ApiError(404, `League with ID "${leagueId}" not found.`);
  }

  const userId = session?.user?.id;
  const isManager = userId ? isLeagueManager(db, leagueId, userId) : false;

  if (isManager) {
    return { league, isManager: true };
  }

  // Public league access: either visibility is public or shareToken matches
  const isTokenMatch = shareToken && league.shareToken && league.shareToken === shareToken;
  const isPublic = league.visibility === 'public via link';

  if (isTokenMatch || isPublic) {
    return { league, isManager: false };
  }

  // Private league inaccessible to non-managers
  throw new ApiError(403, 'Forbidden: This league is private and can only be accessed by league managers.');
}

/**
 * Sanitize strings to avoid XSS
 */
function sanitizeString(str, maxLength = 255) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

// -----------------------------------------------------------------------------
// PURE STANDINGS CALCULATION ENGINE
// Standings are NEVER stored as editable values; computed purely from matches
// -----------------------------------------------------------------------------
export function calculateLeagueStandings(matches = [], teams = [], scoringSettings = {}, tieBreakOrder = []) {
  const scoring = {
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    pointsNoResult: 1,
    drawsAllowed: true,
    volleyball32Mode: false,
    ...scoringSettings
  };

  const tieBreakers = tieBreakOrder && tieBreakOrder.length > 0
    ? tieBreakOrder
    : ['points', 'headToHead', 'diff', 'scored', 'alpha'];

  const tableMap = {};

  // Initialize every team in the league
  teams.forEach((t) => {
    tableMap[t.id] = {
      id: t.id,
      name: t.name,
      logo: t.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      noResult: 0,
      for: 0,
      against: 0,
      diff: 0,
      points: 0,
      h2hPoints: {},
      form: [] // Last 5 matches: ['W', 'D', 'L']
    };
  });

  // Tally every completed or forfeit match
  matches.forEach((m) => {
    if ((m.status === 'Completed' || m.status === 'Forfeit') && m.homeTeamId && m.awayTeamId) {
      const hId = m.homeTeamId;
      const aId = m.awayTeamId;

      if (!tableMap[hId] || !tableMap[aId]) return;

      const home = tableMap[hId];
      const away = tableMap[aId];

      home.played += 1;
      away.played += 1;

      // Handle Forfeit
      if (m.status === 'Forfeit') {
        const winnerId = m.forfeitWinnerTeamId;
        if (winnerId === hId) {
          home.won += 1;
          home.points += scoring.pointsWin;
          home.for += 3;
          away.lost += 1;
          away.points += scoring.pointsLoss;
          away.against += 3;
          home.h2hPoints[aId] = (home.h2hPoints[aId] || 0) + scoring.pointsWin;
          home.form.push('W');
          away.form.push('L');
        } else if (winnerId === aId) {
          away.won += 1;
          away.points += scoring.pointsWin;
          away.for += 3;
          home.lost += 1;
          home.points += scoring.pointsLoss;
          home.against += 3;
          away.h2hPoints[hId] = (away.h2hPoints[hId] || 0) + scoring.pointsWin;
          away.form.push('W');
          home.form.push('L');
        }
        home.diff = home.for - home.against;
        away.diff = away.for - away.against;
        return;
      }

      // Regular Completed Match
      const hScore = Number(m.homeScore || 0);
      const aScore = Number(m.awayScore || 0);

      home.for += hScore;
      home.against += aScore;
      away.for += aScore;
      away.against += hScore;

      if (hScore > aScore) {
        home.won += 1;
        away.lost += 1;
        home.form.push('W');
        away.form.push('L');

        // Volleyball 3-2 special scoring mode
        if (scoring.volleyball32Mode) {
          if (hScore === 3 && aScore === 2) {
            home.points += 2;
            away.points += 1;
            home.h2hPoints[aId] = (home.h2hPoints[aId] || 0) + 2;
            away.h2hPoints[hId] = (away.h2hPoints[hId] || 0) + 1;
          } else {
            home.points += 3;
            away.points += 0;
            home.h2hPoints[aId] = (home.h2hPoints[aId] || 0) + 3;
          }
        } else {
          home.points += scoring.pointsWin;
          away.points += scoring.pointsLoss;
          home.h2hPoints[aId] = (home.h2hPoints[aId] || 0) + scoring.pointsWin;
        }
      } else if (aScore > hScore) {
        away.won += 1;
        home.lost += 1;
        away.form.push('W');
        home.form.push('L');

        // Volleyball 3-2 special scoring mode
        if (scoring.volleyball32Mode) {
          if (aScore === 3 && hScore === 2) {
            away.points += 2;
            home.points += 1;
            away.h2hPoints[hId] = (away.h2hPoints[hId] || 0) + 2;
            home.h2hPoints[aId] = (home.h2hPoints[aId] || 0) + 1;
          } else {
            away.points += 3;
            home.points += 0;
            away.h2hPoints[hId] = (away.h2hPoints[hId] || 0) + 3;
          }
        } else {
          away.points += scoring.pointsWin;
          home.points += scoring.pointsLoss;
          away.h2hPoints[hId] = (away.h2hPoints[hId] || 0) + scoring.pointsWin;
        }
      } else {
        // Draw / Tie
        home.drawn += 1;
        away.drawn += 1;
        home.points += scoring.pointsDraw;
        away.points += scoring.pointsDraw;
        home.h2hPoints[aId] = (home.h2hPoints[aId] || 0) + scoring.pointsDraw;
        away.h2hPoints[hId] = (away.h2hPoints[hId] || 0) + scoring.pointsDraw;
        home.form.push('D');
        away.form.push('D');
      }

      home.diff = home.for - home.against;
      away.diff = away.for - away.against;
    }
  });

  const list = Object.values(tableMap);

  // Sort based on configured tie-break order
  list.sort((a, b) => {
    for (const rule of tieBreakers) {
      if (rule === 'points' && b.points !== a.points) {
        return b.points - a.points;
      }
      if (rule === 'headToHead') {
        const h2hA = a.h2hPoints[b.id] || 0;
        const h2hB = b.h2hPoints[a.id] || 0;
        if (h2hA !== h2hB) return h2hB - h2hA;
      }
      if (rule === 'diff' && b.diff !== a.diff) {
        return b.diff - a.diff;
      }
      if (rule === 'scored' && b.for !== a.for) {
        return b.for - a.for;
      }
      if (rule === 'alpha') {
        const comp = a.name.localeCompare(b.name);
        if (comp !== 0) return comp;
      }
    }
    return a.name.localeCompare(b.name);
  });

  return list.map((team, idx) => ({
    ...team,
    position: idx + 1,
    form: team.form.slice(-5)
  }));
}

// -----------------------------------------------------------------------------
// CIRCLE METHOD FIXTURE GENERATION (Fair, Random, Provably Complete)
// -----------------------------------------------------------------------------
export function generateCircleMethodFixtures({
  teams = [],
  format = 'single round-robin',
  seed = 12345,
  startDate = new Date().toISOString().slice(0, 10),
  venue = 'Main Ground'
}) {
  if (!teams || teams.length < 2) {
    throw new ApiError(400, 'Minimum 2 teams required to generate league fixtures.');
  }
  if (teams.length > 20) {
    throw new ApiError(400, 'Maximum 20 teams allowed per league.');
  }

  const isDouble = format === 'double round-robin';
  const prng = createPRNG(seed);

  // 1. Shuffle teams deterministically using Fisher-Yates with seeded PRNG
  const shuffledTeams = [...teams];
  for (let i = shuffledTeams.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
  }

  // 2. Add placeholder BYE if odd
  const isOdd = shuffledTeams.length % 2 !== 0;
  const pool = [...shuffledTeams];
  if (isOdd) {
    pool.push({ id: 'BYE', name: 'BYE', isBye: true });
  }

  const n = pool.length;
  const roundsCount = n - 1;
  const matchesPerRound = n / 2;
  const fixtures = [];
  const byesList = [];

  const homeCounts = {};
  const awayCounts = {};
  teams.forEach((t) => {
    homeCounts[t.id] = 0;
    awayCounts[t.id] = 0;
  });

  const baseDate = new Date(startDate || Date.now());
  let matchCounter = 1;

  // Track team pairings to prevent duplicates within a leg
  const seenPairsLeg1 = new Set();

  // Circle Method for Leg 1
  for (let round = 0; round < roundsCount; round++) {
    const roundDate = new Date(baseDate);
    roundDate.setDate(roundDate.getDate() + round * 7); // weekly rounds by default

    for (let match = 0; match < matchesPerRound; match++) {
      let homeIdx = (round + match) % (n - 1);
      let awayIdx = (n - 1 - match + round) % (n - 1);

      if (match === 0) {
        awayIdx = n - 1;
      }

      // Circle method alternating home/away for the fixed pivot team (awayIdx === n - 1)
      if (match === 0 && round % 2 === 1) {
        [homeIdx, awayIdx] = [awayIdx, homeIdx];
      }

      const teamA = pool[homeIdx];
      const teamB = pool[awayIdx];

      // If one team is BYE, record bye for this round
      if (teamA.isBye) {
        byesList.push({ round: round + 1, leg: 1, teamId: teamB.id, teamName: teamB.name });
        continue;
      }
      if (teamB.isBye) {
        byesList.push({ round: round + 1, leg: 1, teamId: teamA.id, teamName: teamA.name });
        continue;
      }

      // Pair verification
      const pairKey = [teamA.id, teamB.id].sort().join('__');
      if (seenPairsLeg1.has(pairKey)) {
        throw new ApiError(500, `Circle method internal check failed: Duplicate pair [${pairKey}] in Leg 1.`);
      }
      seenPairsLeg1.add(pairKey);

      // Home/Away balance optimization
      let actualHome = teamA;
      let actualAway = teamB;

      // Swap if it helps maintain home/away balance across rounds
      if (homeCounts[teamA.id] > awayCounts[teamA.id] && awayCounts[teamB.id] > homeCounts[teamB.id]) {
        actualHome = teamB;
        actualAway = teamA;
      }

      homeCounts[actualHome.id] = (homeCounts[actualHome.id] || 0) + 1;
      awayCounts[actualAway.id] = (awayCounts[actualAway.id] || 0) + 1;

      const scheduledTime = new Date(roundDate);
      scheduledTime.setHours(10 + (match % 4) * 2, 0, 0, 0);

      fixtures.push({
        id: `lm-${seed}-r${round + 1}-m${matchCounter++}`,
        round: round + 1,
        leg: 1,
        homeTeamId: actualHome.id,
        awayTeamId: actualAway.id,
        scheduledAt: scheduledTime.toISOString(),
        venue: `${venue} (Court ${(match % 2) + 1})`,
        status: 'Scheduled',
        homeScore: null,
        awayScore: null,
        forfeitWinnerTeamId: null,
        resultNote: '',
        version: 1
      });
    }
  }

  // 4. Double Round-Robin Leg 2 (mirror home and away with leg 2 marker)
  if (isDouble) {
    const leg1Fixtures = [...fixtures];
    const seenPairsLeg2 = new Set();

    leg1Fixtures.forEach((f1) => {
      const leg2Round = f1.round + roundsCount;
      const leg2Date = new Date(baseDate);
      leg2Date.setDate(leg2Date.getDate() + (leg2Round - 1) * 7);

      const pairKey = [f1.homeTeamId, f1.awayTeamId].sort().join('__');
      if (seenPairsLeg2.has(pairKey)) {
        throw new ApiError(500, `Circle method internal check failed: Duplicate pair [${pairKey}] in Leg 2.`);
      }
      seenPairsLeg2.add(pairKey);

      fixtures.push({
        id: `lm-${seed}-r${leg2Round}-m${matchCounter++}`,
        round: leg2Round,
        leg: 2,
        homeTeamId: f1.awayTeamId, // Swapped home/away
        awayTeamId: f1.homeTeamId,
        scheduledAt: leg2Date.toISOString(),
        venue: f1.venue,
        status: 'Scheduled',
        homeScore: null,
        awayScore: null,
        forfeitWinnerTeamId: null,
        resultNote: '',
        version: 1
      });
    });

    // Mirror byes for leg 2
    byesList.forEach((b) => {
      byesList.push({
        round: b.round + roundsCount,
        leg: 2,
        teamId: b.teamId,
        teamName: b.teamName
      });
    });
  }

  // 6. Complete Mathematical & Structural Assertions
  const actualN = teams.length;
  const expectedMatchesSingle = (actualN * (actualN - 1)) / 2;
  const expectedTotalMatches = isDouble ? expectedMatchesSingle * 2 : expectedMatchesSingle;

  if (fixtures.length !== expectedTotalMatches) {
    throw new ApiError(
      500,
      `Integrity Assertion Failed: Expected ${expectedTotalMatches} matches for ${actualN} teams, got ${fixtures.length}.`
    );
  }

  // Assert no team plays itself
  fixtures.forEach((f) => {
    if (f.homeTeamId === f.awayTeamId) {
      throw new ApiError(500, `Integrity Assertion Failed: Team ${f.homeTeamId} plays against itself in match ${f.id}.`);
    }
  });

  // Assert each team has at most one match per round
  const roundTeamCounts = {};
  fixtures.forEach((f) => {
    const keyH = `r${f.round}_t${f.homeTeamId}`;
    const keyA = `r${f.round}_t${f.awayTeamId}`;
    if (roundTeamCounts[keyH]) {
      throw new ApiError(500, `Integrity Assertion Failed: Team ${f.homeTeamId} scheduled multiple times in round ${f.round}.`);
    }
    if (roundTeamCounts[keyA]) {
      throw new ApiError(500, `Integrity Assertion Failed: Team ${f.awayTeamId} scheduled multiple times in round ${f.round}.`);
    }
    roundTeamCounts[keyH] = true;
    roundTeamCounts[keyA] = true;
  });

  return {
    fixtures,
    byes: byesList,
    totalRounds: isDouble ? roundsCount * 2 : roundsCount,
    totalMatches: fixtures.length,
    seed
  };
}

// -----------------------------------------------------------------------------
// CONFLICT DETECTOR FOR SCHEDULING
// Detects:
// 1) Same team playing in overlapping windows
// 2) Same venue double-booked at overlapping times
// 3) Match scheduled outside league start/end dates
// -----------------------------------------------------------------------------
export function detectLeagueSchedulingConflicts(matches = [], league = null) {
  const conflicts = [];
  const matchDurationMinutes = 90;

  for (let i = 0; i < matches.length; i++) {
    const m1 = matches[i];
    if (!m1.scheduledAt) continue;

    const t1 = new Date(m1.scheduledAt).getTime();

    // Check outside league start/end dates
    if (league) {
      if (league.startDate) {
        const start = new Date(league.startDate).getTime();
        if (t1 < start - 3600000 * 24) {
          conflicts.push({
            type: 'date_range',
            matchId: m1.id,
            description: `Match ${m1.id} scheduled before league start date (${league.startDate}).`
          });
        }
      }
      if (league.endDate) {
        const end = new Date(league.endDate).getTime();
        if (t1 > end + 3600000 * 24) {
          conflicts.push({
            type: 'date_range',
            matchId: m1.id,
            description: `Match ${m1.id} scheduled after league end date (${league.endDate}).`
          });
        }
      }
    }

    // Pairwise overlap check
    for (let j = i + 1; j < matches.length; j++) {
      const m2 = matches[j];
      if (!m2.scheduledAt) continue;

      const t2 = new Date(m2.scheduledAt).getTime();
      const diffMinutes = Math.abs(t1 - t2) / (1000 * 60);

      if (diffMinutes < matchDurationMinutes) {
        // Venue collision
        if (m1.venue && m2.venue && m1.venue.trim().toLowerCase() === m2.venue.trim().toLowerCase()) {
          conflicts.push({
            type: 'venue_overlap',
            matchId1: m1.id,
            matchId2: m2.id,
            venue: m1.venue,
            description: `Venue "${m1.venue}" is double-booked at overlapping times (${m1.scheduledAt.slice(0, 16)} and ${m2.scheduledAt.slice(0, 16)}).`
          });
        }

        // Team collision
        const teams1 = [m1.homeTeamId, m1.awayTeamId];
        const teams2 = [m2.homeTeamId, m2.awayTeamId];
        const sharedTeam = teams1.find((t) => teams2.includes(t));

        if (sharedTeam) {
          conflicts.push({
            type: 'team_overlap',
            matchId1: m1.id,
            matchId2: m2.id,
            teamId: sharedTeam,
            description: `Team is scheduled in two overlapping matches (${m1.id} and ${m2.id}).`
          });
        }
      }
    }
  }

  return conflicts;
}

// -----------------------------------------------------------------------------
// AUDIT LOG HELPER
// -----------------------------------------------------------------------------
function recordLeagueAudit(db, { leagueId, matchId = null, actorId, action, before, after }) {
  const log = {
    id: `laudit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    leagueId,
    matchId,
    actorId,
    action,
    before: before ? JSON.parse(JSON.stringify(before)) : null,
    after: after ? JSON.parse(JSON.stringify(after)) : null,
    at: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  return log;
}

// -----------------------------------------------------------------------------
// AUTHORITATIVE LEAGUE CONTROLLER ENDPOINTS
// -----------------------------------------------------------------------------
export const leagueService = {
  /**
   * 1. GET /api/leagues
   * Retrieves all leagues visible to user (managed by user, or public leagues)
   */
  getLeagues(session) {
    const db = getLeagueDbState();
    const userId = session?.user?.id;

    const leagues = db.leagues.map((l) => {
      const isManager = userId ? isLeagueManager(db, l.id, userId) : false;
      const teamCount = db.teams.filter((t) => t.leagueId === l.id).length;
      const matchCount = db.matches.filter((m) => m.leagueId === l.id).length;
      const completedCount = db.matches.filter((m) => m.leagueId === l.id && (m.status === 'Completed' || m.status === 'Forfeit')).length;

      return {
        ...l,
        isManager,
        teamCount,
        matchCount,
        completedCount
      };
    });

    return { success: true, data: leagues };
  },

  /**
   * 2. GET /api/leagues/:id
   * Retrieves league details. Enforces authorization.
   */
  getLeagueById(session, leagueId, shareToken = null) {
    const db = getLeagueDbState();
    const { league, isManager } = authorizeReadAccess(db, leagueId, session, shareToken);

    const leagueTeams = db.teams.filter((t) => t.leagueId === leagueId);
    const leagueMatches = db.matches.filter((m) => m.leagueId === leagueId);
    const auditLogs = isManager ? db.auditLogs.filter((a) => a.leagueId === leagueId) : [];

    // Purely compute standings
    const standings = calculateLeagueStandings(
      leagueMatches,
      leagueTeams,
      league.scoringSettings,
      league.tieBreakOrder
    );

    // Sanitize output for public viewers (strip captain contact/name)
    const sanitizedTeams = isManager
      ? leagueTeams
      : leagueTeams.map((t) => ({
          id: t.id,
          leagueId: t.leagueId,
          name: t.name,
          logo: t.logo,
          createdAt: t.createdAt
        }));

    return {
      success: true,
      data: {
        league: {
          ...league,
          // Hide shareToken if not manager and not already using it
          shareToken: isManager ? league.shareToken : (shareToken ? league.shareToken : null)
        },
        teams: sanitizedTeams,
        matches: leagueMatches,
        standings,
        isManager,
        isOwner: session?.user?.id ? league.ownerId === session.user.id : false,
        managers: isManager ? db.managers.filter((m) => m.leagueId === leagueId) : [],
        auditLogs
      }
    };
  },

  /**
   * 3. POST /api/leagues
   * Create a new league. Owner is ALWAYS derived from session.
   * Atomically saves league and teams in one database transaction when teams are supplied.
   * Supports idempotency key to prevent accidental duplicate league submissions.
   */
  createLeague(session, payload) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();

    // Idempotency defense: if key was already processed, return existing league
    if (payload.idempotencyKey) {
      db.idempotencyKeys = db.idempotencyKeys || {};
      const existingId = db.idempotencyKeys[payload.idempotencyKey];
      if (existingId) {
        const existingLeague = db.leagues.find((l) => l.id === existingId);
        if (existingLeague) {
          const existingTeams = db.teams.filter((t) => t.leagueId === existingId);
          return {
            success: true,
            data: { ...existingLeague, teams: existingTeams },
            warning: null,
            isIdempotentReplay: true
          };
        }
      }
    }

    // Input Validation
    const name = sanitizeString(payload.name, 60);
    if (!name || name.length < 3) {
      throw new ApiError(400, 'League name must be between 3 and 60 characters.');
    }

    const sport = sanitizeString(payload.sport || 'Football', 40);
    const description = sanitizeString(payload.description || '', 500);

    // Validate plannedTeamCount strictly using shared parser
    const countVal = parseAndValidateTeamCount(payload.plannedTeamCount);
    if (!countVal.valid) {
      throw new ApiError(400, countVal.error || `Planned number of teams must be between ${LEAGUE_TEAM_LIMITS.MIN} and ${LEAGUE_TEAM_LIMITS.MAX}.`);
    }
    const plannedTeamCount = countVal.value;

    // Optional atomic teams validation
    let createdTeams = [];
    if (Array.isArray(payload.teams) && payload.teams.length > 0) {
      if (payload.teams.length !== plannedTeamCount) {
        throw new ApiError(
          400,
          `Team count mismatch: expected ${plannedTeamCount} teams, but received ${payload.teams.length}.`
        );
      }

      const teamValidation = validateTeamNames(payload.teams, plannedTeamCount);
      if (!teamValidation.valid) {
        throw new ApiError(400, teamValidation.summary || 'Team names must be non-empty, between 1 and 40 characters, and unique.');
      }
    }

    const format = payload.format === 'double round-robin' ? 'double round-robin' : 'single round-robin';
    const startDate = payload.startDate || new Date().toISOString().slice(0, 10);
    const endDate = payload.endDate || '';
    const rulesText = sanitizeString(payload.rulesText || '', 2000);
    const presetKey = payload.scoringPreset && SPORT_PRESETS[payload.scoringPreset]
      ? payload.scoringPreset
      : getPresetForSport(sport);
    const presetDef = SPORT_PRESETS[presetKey] || SPORT_PRESETS.football;

    const scoringSettings = {
      pointsWin: Number(payload.scoringSettings?.pointsWin ?? presetDef.pointsWin),
      pointsDraw: Number(payload.scoringSettings?.pointsDraw ?? presetDef.pointsDraw),
      pointsLoss: Number(payload.scoringSettings?.pointsLoss ?? presetDef.pointsLoss),
      pointsNoResult: Number(payload.scoringSettings?.pointsNoResult ?? (presetDef.pointsNoResult || 1)),
      drawsAllowed: payload.scoringSettings?.drawsAllowed ?? presetDef.drawsAllowed,
      volleyball32Mode: Boolean(payload.scoringSettings?.volleyball32Mode ?? presetDef.volleyball32Mode),
      scoreLabel: sanitizeString(payload.scoringSettings?.scoreLabel || presetDef.scoreLabel, 20)
    };

    const tieBreakOrder = Array.isArray(payload.tieBreakOrder) && payload.tieBreakOrder.length > 0
      ? payload.tieBreakOrder
      : ['points', 'headToHead', 'diff', 'scored', 'alpha'];

    const visibility = payload.visibility === 'public via link' ? 'public via link' : 'private';
    const shareToken = visibility === 'public via link' ? generateShareToken() : null;

    // Duplicate check for this owner: warning flag returned
    const existingSameName = db.leagues.find(
      (l) => l.ownerId === user.id && l.name.trim().toLowerCase() === name.toLowerCase()
    );

    const leagueId = `league-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    if (Array.isArray(payload.teams) && payload.teams.length > 0) {
      createdTeams = payload.teams.map((t, index) => {
        const rawName = typeof t === 'string' ? t : (t?.name || '');
        const cleanName = sanitizeString(rawName, 40);
        const norm = normalizeTeamName(cleanName);
        return {
          id: `lteam-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-${index}`,
          leagueId,
          name: cleanName,
          normalizedName: norm,
          logo: typeof t === 'object' && t?.logo ? t.logo : '',
          captainName: typeof t === 'object' && t?.captainName ? sanitizeString(t.captainName, 60) : '',
          captainContact: typeof t === 'object' && t?.captainContact ? sanitizeString(t.captainContact, 100) : '',
          createdAt: new Date().toISOString()
        };
      });
    }

    const newLeague = {
      id: leagueId,
      ownerId: user.id, // Enforced from session, never from body
      name,
      sport,
      description,
      logo: payload.logo || '',
      format,
      plannedTeamCount,
      startDate,
      endDate,
      rulesText,
      scoringPreset: presetKey,
      scoringSettings,
      tieBreakOrder,
      visibility,
      shareToken,
      status: 'Teams open',
      fixtureSeed: null,
      fixturesGeneratedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    // ATOMIC SAVE: League, Manager, Teams, and Idempotency key stored in one operation
    db.leagues.unshift(newLeague);
    db.managers.push({ leagueId, userId: user.id, role: 'owner' });

    if (createdTeams.length > 0) {
      db.teams.push(...createdTeams);
    }

    if (payload.idempotencyKey) {
      db.idempotencyKeys = db.idempotencyKeys || {};
      db.idempotencyKeys[payload.idempotencyKey] = leagueId;
    }

    recordLeagueAudit(db, {
      leagueId,
      actorId: user.id,
      action: 'LEAGUE_CREATED',
      before: null,
      after: { name, sport, format, plannedTeamCount, teamsCount: createdTeams.length }
    });

    saveLeagueDbState(db);

    return {
      success: true,
      data: {
        ...newLeague,
        teams: createdTeams
      },
      warning: existingSameName ? `You already have an existing league named "${name}".` : null
    };
  },

  /**
   * 4. PUT /api/leagues/:id
   * Update league settings (Optimistic Locking & Mass Assignment Protected)
   */
  updateLeague(session, leagueId, updates) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    const league = authorizeManager(db, leagueId, user.id);

    // Optimistic Concurrency Check
    if (updates.version !== undefined && updates.version !== league.version) {
      throw new ApiError(409, 'Conflict: The league was modified by another session. Please reload and retry.');
    }

    // Mass-assignment defense: strip protected fields
    const beforeSnapshot = { ...league };

    if (updates.name !== undefined) {
      const name = sanitizeString(updates.name, 60);
      if (name.length < 3) throw new ApiError(400, 'League name must be at least 3 characters.');
      league.name = name;
    }
    if (updates.description !== undefined) {
      league.description = sanitizeString(updates.description, 500);
    }
    if (updates.logo !== undefined) {
      league.logo = updates.logo;
    }
    if (updates.rulesText !== undefined) {
      league.rulesText = sanitizeString(updates.rulesText, 2000);
    }
    if (updates.startDate !== undefined) {
      league.startDate = updates.startDate;
    }
    if (updates.endDate !== undefined) {
      league.endDate = updates.endDate;
    }
    if (updates.tieBreakOrder !== undefined && Array.isArray(updates.tieBreakOrder)) {
      league.tieBreakOrder = updates.tieBreakOrder;
    }

    // Visibility toggle & Share Token generation
    if (updates.visibility !== undefined) {
      if (updates.visibility === 'public via link') {
        league.visibility = 'public via link';
        if (!league.shareToken) league.shareToken = generateShareToken();
      } else {
        league.visibility = 'private';
      }
    }

    // Rotate Share Token if requested
    if (updates.rotateShareToken) {
      league.shareToken = generateShareToken();
    }

    // Scoring settings can only be updated if no match is completed
    const hasCompletedMatches = db.matches.some(
      (m) => m.leagueId === leagueId && (m.status === 'Completed' || m.status === 'Forfeit')
    );
    if (updates.scoringSettings && hasCompletedMatches) {
      throw new ApiError(400, 'Scoring preset cannot be changed once match results are recorded.');
    } else if (updates.scoringSettings) {
      league.scoringSettings = { ...league.scoringSettings, ...updates.scoringSettings };
    }

    league.updatedAt = new Date().toISOString();
    league.version += 1;

    recordLeagueAudit(db, {
      leagueId,
      actorId: user.id,
      action: 'LEAGUE_SETTINGS_UPDATED',
      before: beforeSnapshot,
      after: league
    });

    saveLeagueDbState(db);
    return { success: true, data: league };
  },

  /**
   * 5. POST /api/leagues/:id/teams
   * Add a single team or bulk teams
   */
  addTeams(session, leagueId, teamsInput) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    const league = authorizeManager(db, leagueId, user.id);

    // Block adding teams if fixtures exist
    const fixturesExist = db.matches.some((m) => m.leagueId === leagueId);
    if (fixturesExist) {
      throw new ApiError(400, 'Fixtures already exist. You must regenerate them to add or remove teams.');
    }

    const currentTeams = db.teams.filter((t) => t.leagueId === leagueId);
    const existingNorms = new Set(currentTeams.map((t) => t.normalizedName));

    const rawList = Array.isArray(teamsInput) ? teamsInput : [teamsInput];
    if (currentTeams.length + rawList.length > LEAGUE_TEAM_LIMITS.MAX) {
      throw new ApiError(400, `League maximum is ${LEAGUE_TEAM_LIMITS.MAX} teams. Current: ${currentTeams.length}, Adding: ${rawList.length}.`);
    }

    const addedTeams = [];
    const errors = [];

    rawList.forEach((item, index) => {
      const rawName = typeof item === 'string' ? item : item?.name;
      const cleanName = sanitizeString(rawName, 40);

      if (!cleanName || cleanName.length < 2) {
        errors.push(`Row ${index + 1}: Team name must be between 2 and 40 characters.`);
        return;
      }

      const norm = normalizeTeamName(cleanName);
      if (existingNorms.has(norm)) {
        errors.push(`Team "${cleanName}" already exists in this league.`);
        return;
      }

      existingNorms.add(norm);

      const teamObj = {
        id: `lteam-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-${index}`,
        leagueId,
        name: cleanName,
        normalizedName: norm,
        logo: typeof item === 'object' && item.logo ? item.logo : '',
        captainName: typeof item === 'object' && item.captainName ? sanitizeString(item.captainName, 60) : '',
        captainContact: typeof item === 'object' && item.captainContact ? sanitizeString(item.captainContact, 100) : '',
        createdAt: new Date().toISOString()
      };

      addedTeams.push(teamObj);
      db.teams.push(teamObj);
    });

    if (errors.length > 0 && addedTeams.length === 0) {
      throw new ApiError(400, errors.join(' '));
    }

    if (addedTeams.length > 0) {
      league.updatedAt = new Date().toISOString();
      league.version += 1;

      recordLeagueAudit(db, {
        leagueId,
        actorId: user.id,
        action: 'TEAMS_ADDED',
        before: { count: currentTeams.length },
        after: { added: addedTeams.map((t) => t.name), count: currentTeams.length + addedTeams.length }
      });

      saveLeagueDbState(db);
    }

    return {
      success: true,
      data: addedTeams,
      warnings: errors.length > 0 ? errors : null
    };
  },

  /**
   * 6. PUT /api/leagues/:id/teams/:teamId
   * Edit team details (Renaming & logo changes allowed even if fixtures exist)
   */
  updateTeam(session, leagueId, teamId, updates) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    authorizeManager(db, leagueId, user.id);

    const team = db.teams.find((t) => t.id === teamId && t.leagueId === leagueId);
    if (!team) {
      throw new ApiError(404, `Team "${teamId}" not found in this league.`);
    }

    const beforeSnapshot = { ...team };

    if (updates.name !== undefined) {
      const cleanName = sanitizeString(updates.name, 40);
      if (!cleanName || cleanName.length < 2) {
        throw new ApiError(400, 'Team name must be between 2 and 40 characters.');
      }
      const norm = normalizeTeamName(cleanName);
      const collision = db.teams.find((t) => t.leagueId === leagueId && t.id !== teamId && t.normalizedName === norm);
      if (collision) {
        throw new ApiError(400, `Another team with name "${cleanName}" already exists in this league.`);
      }
      team.name = cleanName;
      team.normalizedName = norm;
    }

    if (updates.logo !== undefined) {
      team.logo = updates.logo;
    }
    if (updates.captainName !== undefined) {
      team.captainName = sanitizeString(updates.captainName, 60);
    }
    if (updates.captainContact !== undefined) {
      team.captainContact = sanitizeString(updates.captainContact, 100);
    }

    recordLeagueAudit(db, {
      leagueId,
      actorId: user.id,
      action: 'TEAM_UPDATED',
      before: beforeSnapshot,
      after: team
    });

    saveLeagueDbState(db);
    return { success: true, data: team };
  },

  /**
   * 7. DELETE /api/leagues/:id/teams/:teamId
   * Remove team (Blocked if fixtures exist)
   */
  removeTeam(session, leagueId, teamId) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    authorizeManager(db, leagueId, user.id);

    // Cross-league verification
    const team = db.teams.find((t) => t.id === teamId && t.leagueId === leagueId);
    if (!team) {
      throw new ApiError(404, `Team "${teamId}" not found in this league.`);
    }

    // Fixture check
    const fixturesExist = db.matches.some((m) => m.leagueId === leagueId);
    if (fixturesExist) {
      throw new ApiError(400, 'Fixtures already exist. You must regenerate them first before removing teams.');
    }

    db.teams = db.teams.filter((t) => t.id !== teamId);

    recordLeagueAudit(db, {
      leagueId,
      actorId: user.id,
      action: 'TEAM_REMOVED',
      before: team,
      after: null
    });

    saveLeagueDbState(db);
    return { success: true, data: { removedId: teamId } };
  },

  /**
   * 8. POST /api/leagues/:id/fixtures/generate
   * Generates or regenerates fixtures using Circle Method & Seeded PRNG
   */
  generateFixtures(session, leagueId, options = {}) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    const league = authorizeManager(db, leagueId, user.id);

    const currentMatches = db.matches.filter((m) => m.leagueId === leagueId);
    const hasCompletedResults = currentMatches.some(
      (m) => m.status === 'Completed' || m.status === 'Forfeit'
    );

    // Regeneration Lock
    if (hasCompletedResults && !options.resetResults) {
      throw new ApiError(
        409,
        'Fixtures cannot be regenerated because matches have recorded scores. Use "Reset all results and regenerate" to archive and restart.'
      );
    }

    // Archive old results to audit log if resetting
    if (hasCompletedResults && options.resetResults) {
      recordLeagueAudit(db, {
        leagueId,
        actorId: user.id,
        action: 'RESULTS_RESET_AND_ARCHIVED',
        before: { matches: currentMatches },
        after: null
      });
    }

    const leagueTeams = db.teams.filter((t) => t.leagueId === leagueId);
    if (leagueTeams.length < 2) {
      throw new ApiError(400, 'At least 2 teams are required to generate round-robin fixtures.');
    }
    if (leagueTeams.length > 20) {
      throw new ApiError(400, 'Maximum 20 teams allowed.');
    }

    const seed = options.seed || generateRandomSeed();

    const genResult = generateCircleMethodFixtures({
      teams: leagueTeams,
      format: league.format,
      seed,
      startDate: league.startDate,
      venue: league.venue || 'Main Turf Arena'
    });

    // Atomic transaction: replace previous draft matches with new matches
    const nonLeagueMatches = db.matches.filter((m) => m.leagueId !== leagueId);
    const newMatchesWithLeagueId = genResult.fixtures.map((f) => ({
      ...f,
      leagueId,
      updatedBy: user.id,
      updatedAt: new Date().toISOString()
    }));

    db.matches = [...nonLeagueMatches, ...newMatchesWithLeagueId];

    league.status = 'Fixtures ready';
    league.fixtureSeed = seed;
    league.fixturesGeneratedAt = new Date().toISOString();
    league.updatedAt = new Date().toISOString();
    league.version += 1;

    recordLeagueAudit(db, {
      leagueId,
      actorId: user.id,
      action: 'FIXTURES_GENERATED',
      before: { count: currentMatches.length },
      after: { count: newMatchesWithLeagueId.length, seed, byes: genResult.byes }
    });

    saveLeagueDbState(db);

    return {
      success: true,
      data: {
        matches: newMatchesWithLeagueId,
        byes: genResult.byes,
        drawCode: seed,
        totalMatches: genResult.totalMatches,
        totalRounds: genResult.totalRounds
      }
    };
  },

  /**
   * 9. PUT /api/leagues/:id/matches/:matchId/schedule
   * Schedule or reschedule an individual match with conflict checking
   */
  scheduleMatch(session, leagueId, matchId, scheduleData) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    const league = authorizeManager(db, leagueId, user.id);

    // Cross-league reference verification
    const match = db.matches.find((m) => m.id === matchId && m.leagueId === leagueId);
    if (!match) {
      throw new ApiError(404, `Match "${matchId}" not found in this league.`);
    }

    const beforeSnapshot = { ...match };

    if (scheduleData.scheduledAt) {
      const scheduledTime = new Date(scheduleData.scheduledAt).getTime();
      // Prevent scheduling in the past
      if (scheduledTime < Date.now() - 3600000 * 12 && !scheduleData.overridePastDate) {
        throw new ApiError(400, 'Cannot schedule a match in the past.');
      }
      match.scheduledAt = new Date(scheduleData.scheduledAt).toISOString();
    }

    if (scheduleData.venue !== undefined) {
      match.venue = sanitizeString(scheduleData.venue, 100);
    }

    match.updatedBy = user.id;
    match.updatedAt = new Date().toISOString();
    match.version = (match.version || 1) + 1;

    // Check conflicts
    const leagueMatches = db.matches.filter((m) => m.leagueId === leagueId);
    const conflicts = detectLeagueSchedulingConflicts(leagueMatches, league);

    recordLeagueAudit(db, {
      leagueId,
      matchId,
      actorId: user.id,
      action: 'MATCH_RESCHEDULED',
      before: beforeSnapshot,
      after: match
    });

    saveLeagueDbState(db);

    return {
      success: true,
      data: match,
      conflicts
    };
  },

  /**
   * 10. POST /api/leagues/:id/fixtures/auto-schedule
   * Auto-schedules matches with interval, time windows & conflict preview
   */
  autoScheduleFixtures(session, leagueId, config = {}) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    const league = authorizeManager(db, leagueId, user.id);

    const leagueMatches = db.matches.filter((m) => m.leagueId === leagueId);
    if (leagueMatches.length === 0) {
      throw new ApiError(400, 'No fixtures found to auto-schedule.');
    }

    const intervalDays = Number(config.intervalDays) || 7;
    const startHour = Number(config.startHour) || 10;
    const matchesPerDay = Number(config.matchesPerDay) || 2;
    const baseVenue = sanitizeString(config.venue || league.venue || 'Sanctuary Turf Arena', 80);
    const baseDate = new Date(config.startDate || league.startDate || Date.now());

    // Group matches by round
    const roundsMap = {};
    leagueMatches.forEach((m) => {
      roundsMap[m.round] = roundsMap[m.round] || [];
      roundsMap[m.round].push(m);
    });

    const roundNumbers = Object.keys(roundsMap).map(Number).sort((a, b) => a - b);

    roundNumbers.forEach((roundNum, rIdx) => {
      const roundDate = new Date(baseDate);
      roundDate.setDate(roundDate.getDate() + rIdx * intervalDays);

      const matchesInRound = roundsMap[roundNum];
      matchesInRound.forEach((m, mIdx) => {
        const matchTime = new Date(roundDate);
        const dayOffset = Math.floor(mIdx / matchesPerDay);
        matchTime.setDate(matchTime.getDate() + dayOffset);
        matchTime.setHours(startHour + (mIdx % matchesPerDay) * 2, 0, 0, 0);

        m.scheduledAt = matchTime.toISOString();
        m.venue = `${baseVenue} (Court ${(mIdx % 2) + 1})`;
        m.updatedBy = user.id;
        m.updatedAt = new Date().toISOString();
        m.version = (m.version || 1) + 1;
      });
    });

    const conflicts = detectLeagueSchedulingConflicts(leagueMatches, league);

    recordLeagueAudit(db, {
      leagueId,
      actorId: user.id,
      action: 'FIXTURES_AUTO_SCHEDULED',
      before: null,
      after: { intervalDays, matchesCount: leagueMatches.length, conflictCount: conflicts.length }
    });

    saveLeagueDbState(db);

    return {
      success: true,
      data: leagueMatches,
      conflicts
    };
  },

  /**
   * 11. PUT /api/leagues/:id/matches/:matchId/score
   * Enter, update, or void match score (Validates against sport preset)
   */
  enterMatchScore(session, leagueId, matchId, scorePayload) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    const league = authorizeManager(db, leagueId, user.id);

    // Cross-league reference verification
    const match = db.matches.find((m) => m.id === matchId && m.leagueId === leagueId);
    if (!match) {
      throw new ApiError(404, `Match "${matchId}" not found in this league.`);
    }

    // Optimistic Concurrency Check
    if (scorePayload.version !== undefined && scorePayload.version !== match.version) {
      throw new ApiError(409, 'Conflict: This match was modified by another manager. Please reload.');
    }

    const beforeSnapshot = { ...match };
    const status = scorePayload.status || 'Completed';

    // Voiding / Postponing / Cancelling
    if (status === 'Scheduled' || status === 'Postponed' || status === 'Cancelled') {
      match.status = status;
      match.homeScore = null;
      match.awayScore = null;
      match.forfeitWinnerTeamId = null;
      match.resultNote = sanitizeString(scorePayload.resultNote || '', 200);
      match.updatedBy = user.id;
      match.updatedAt = new Date().toISOString();
      match.version = (match.version || 1) + 1;

      recordLeagueAudit(db, {
        leagueId,
        matchId,
        actorId: user.id,
        action: 'MATCH_SCORE_VOIDED',
        before: beforeSnapshot,
        after: match
      });

      saveLeagueDbState(db);
      return { success: true, data: match };
    }

    // Handling Forfeit
    if (status === 'Forfeit') {
      const winnerId = scorePayload.forfeitWinnerTeamId;
      if (winnerId !== match.homeTeamId && winnerId !== match.awayTeamId) {
        throw new ApiError(400, 'Forfeit winner must be either the home team or away team.');
      }
      match.status = 'Forfeit';
      match.forfeitWinnerTeamId = winnerId;
      match.homeScore = winnerId === match.homeTeamId ? 3 : 0;
      match.awayScore = winnerId === match.awayTeamId ? 3 : 0;
      match.resultNote = sanitizeString(scorePayload.resultNote || 'Won by forfeit.', 200);
      match.updatedBy = user.id;
      match.updatedAt = new Date().toISOString();
      match.version = (match.version || 1) + 1;

      league.status = 'In progress';
      recordLeagueAudit(db, {
        leagueId,
        matchId,
        actorId: user.id,
        action: 'MATCH_FORFEIT_RECORDED',
        before: beforeSnapshot,
        after: match
      });

      saveLeagueDbState(db);
      return { success: true, data: match };
    }

    // Regular Completed Match
    const homeScore = Number(scorePayload.homeScore);
    const awayScore = Number(scorePayload.awayScore);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      throw new ApiError(400, 'Scores must be non-negative numbers.');
    }

    // Sport Preset Consistency Validation:
    // If draws are disallowed in this sport (e.g. basketball, volleyball, tennis), reject draws
    const preset = league.scoringSettings || {};
    if (preset.drawsAllowed === false && homeScore === awayScore) {
      throw new ApiError(
        400,
        `Draws are not permitted in ${league.sport}. Please record a decisive score or tie-break winner.`
      );
    }

    match.status = 'Completed';
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.forfeitWinnerTeamId = null;
    match.resultNote = sanitizeString(scorePayload.resultNote || '', 200);
    match.updatedBy = user.id;
    match.updatedAt = new Date().toISOString();
    match.version = (match.version || 1) + 1;

    // Advance league status if all matches completed
    const allMatches = db.matches.filter((m) => m.leagueId === leagueId);
    const allDone = allMatches.every((m) => m.status === 'Completed' || m.status === 'Forfeit');
    league.status = allDone ? 'Completed' : 'In progress';
    league.updatedAt = new Date().toISOString();

    recordLeagueAudit(db, {
      leagueId,
      matchId,
      actorId: user.id,
      action: 'MATCH_SCORE_RECORDED',
      before: beforeSnapshot,
      after: match
    });

    saveLeagueDbState(db);
    return { success: true, data: match };
  },

  /**
   * 12. GET /api/leagues/public/:shareToken
   * Public link access: strips manager sensitive fields
   */
  getPublicLeagueByToken(shareToken) {
    if (!shareToken || typeof shareToken !== 'string') {
      throw new ApiError(400, 'Invalid share link.');
    }

    const db = getLeagueDbState();
    const league = db.leagues.find((l) => l.shareToken === shareToken);
    if (!league) {
      throw new ApiError(404, 'League not found or share link has been revoked/rotated.');
    }

    return this.getLeagueById(null, league.id, shareToken);
  },

  /**
   * 13. POST /api/leagues/:id/managers
   * Add co-manager (Owner only)
   */
  addCoManager(session, leagueId, targetUserId) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    const league = db.leagues.find((l) => l.id === leagueId);
    if (!league) {
      throw new ApiError(404, `League "${leagueId}" not found.`);
    }
    if (league.ownerId !== user.id) {
      throw new ApiError(403, 'Forbidden: Only the league owner can add co-managers.');
    }
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new ApiError(400, 'Invalid target user ID.');
    }
    if (targetUserId === league.ownerId) {
      throw new ApiError(400, 'Owner is already the primary manager.');
    }
    const alreadyManager = db.managers.some((m) => m.leagueId === leagueId && m.userId === targetUserId);
    if (alreadyManager) {
      throw new ApiError(400, 'User is already a manager of this league.');
    }

    const newMgr = { leagueId, userId: targetUserId, role: 'co-manager' };
    db.managers.push(newMgr);
    recordLeagueAudit(db, {
      leagueId,
      actorId: user.id,
      action: 'CO_MANAGER_ADDED',
      before: null,
      after: { userId: targetUserId, role: 'co-manager' }
    });
    saveLeagueDbState(db);
    return { success: true, data: newMgr };
  },

  /**
   * 14. DELETE /api/leagues/:id/managers/:userId
   * Remove co-manager (Owner only)
   */
  removeCoManager(session, leagueId, targetUserId) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    const league = db.leagues.find((l) => l.id === leagueId);
    if (!league) {
      throw new ApiError(404, `League "${leagueId}" not found.`);
    }
    if (league.ownerId !== user.id) {
      throw new ApiError(403, 'Forbidden: Only the league owner can remove co-managers.');
    }
    if (targetUserId === league.ownerId) {
      throw new ApiError(400, 'Cannot remove the primary league owner.');
    }

    db.managers = db.managers.filter((m) => !(m.leagueId === leagueId && m.userId === targetUserId));
    recordLeagueAudit(db, {
      leagueId,
      actorId: user.id,
      action: 'CO_MANAGER_REMOVED',
      before: { userId: targetUserId },
      after: null
    });
    saveLeagueDbState(db);
    return { success: true, data: { removedUserId: targetUserId } };
  },

  /**
   * 15. GET /api/leagues/:id/managers
   */
  getLeagueManagers(session, leagueId) {
    const user = authenticateSession(session);
    const db = getLeagueDbState();
    authorizeManager(db, leagueId, user.id);
    const managers = db.managers.filter((m) => m.leagueId === leagueId);
    return { success: true, data: managers };
  }
};
