/**
 * src/services/friendlyFeedService.js
 * 
 * Production-ready backend service layer for SportLink Friendly Matches Feed.
 * Encapsulates:
 * - Data models: FriendlyPost, FriendlyResponse, FriendlyReport, SavedPost
 * - Status state machines (Post: Open, Matched, Expired, Closed, Removed; Response: Pending, Accepted, Declined, Withdrawn, Closed)
 * - Strict server-side authorization & BOLA/IDOR protection
 * - Anti-spam & rate-limits (max 3 open posts/team, 10 posts/day/user, 20 responses/day/user, duplicate post check)
 * - Contact privacy & self-harm prevention (regex scanning for phone numbers & emails)
 * - Atomic response acceptance transaction with optimistic concurrency locking (version check)
 * - Bridge to confirmed match generation
 * - Seed data for realistic collegiate testing across Pune and Mumbai
 */

// Inline storageWrapper (browser localStorage with in-memory Node.js fallback)
const FEED_STORAGE_KEY = 'sportlink_friendly_feed_v1';

const storageWrapper = {
  get: (key, defaultValue) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
      const val = window.localStorage.getItem(key);
      if (!val) return defaultValue;
      return JSON.parse(val);
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors, memory state continues normally
    }
  }
};

// In-memory fallback for test harnesses (Node.js where window.localStorage is undefined)
let inMemoryDbState = null;

// Configurable constants
export const MAX_OPEN_POSTS_PER_TEAM = 3;
export const MAX_POSTS_PER_USER_DAILY = 10;
export const MAX_RESPONSES_PER_USER_DAILY = 20;
export const DEFAULT_EXPIRY_DAYS = 14;

// Regular expressions to detect phone numbers and emails in user text
export const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{4,5}|\b\d{10}\b|\b\d{5}\s\d{5}\b/;
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/**
 * Custom Error class with HTTP-like status codes
 */
export class FeedApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'FeedApiError';
    this.status = status;
  }
}

/**
 * Escape HTML to prevent XSS injection
 */
export const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Check if text contains phone numbers or emails
 */
export const containsContactDetails = (text) => {
  if (!text || typeof text !== 'string') return false;
  return PHONE_REGEX.test(text) || EMAIL_REGEX.test(text);
};

/**
 * Calculate post expiry timestamp
 * Earliest of: 14 days from now OR 1 day prior to earliest preferred date
 */
export const computePostExpiry = (preferredDates = [], now = new Date()) => {
  const defaultExpiry = new Date(now.getTime() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  if (!Array.isArray(preferredDates) || preferredDates.length === 0) {
    return defaultExpiry.toISOString();
  }

  const validDates = preferredDates
    .map((d) => (typeof d === 'string' ? d : d?.date))
    .filter(Boolean)
    .map((dateStr) => new Date(`${dateStr}T00:00:00Z`).getTime())
    .filter((time) => !isNaN(time));

  if (validDates.length === 0) {
    return defaultExpiry.toISOString();
  }

  const earliestDate = Math.min(...validDates);
  const dayBeforeEarliest = new Date(earliestDate - 24 * 60 * 60 * 1000);

  // If day before earliest is in the future, take the minimum of defaultExpiry and dayBeforeEarliest
  if (dayBeforeEarliest.getTime() > now.getTime()) {
    const finalExpiry = Math.min(defaultExpiry.getTime(), dayBeforeEarliest.getTime());
    return new Date(finalExpiry).toISOString();
  }

  return defaultExpiry.toISOString();
};

/**
 * Initial Seed Data for the Social Feed
 */
const INITIAL_SEED_POSTS = [
  {
    id: 'fpost-1',
    teamId: 'team-f1',
    collegeId: 'col-1',
    authorId: 'user-cap-1',
    type: 'Looking for a match',
    sport: 'Football',
    title: 'Weekend 7-a-side Pre-Season Sparring',
    message: 'PIT Strikers are preparing for the upcoming inter-collegiate zonal cup. Looking for a competitive opponent for an intense 7-a-side sparring tie on turf. Turf fees split 50/50.',
    preferredDates: ['2026-11-05', '2026-11-06'],
    preferredTimeWindow: '16:00 - 18:30',
    venueName: 'Shivaji Park Turf / Elite Turf',
    city: 'Pune',
    hasHomeGround: false,
    format: '7-a-side (2 x 35 mins)',
    playersPerSide: 7,
    skillLevel: 'Competitive',
    costNote: 'Turf cost split equally (approx ₹300 per team)',
    status: 'Open',
    expiresAt: '2026-11-04T00:00:00.000Z',
    createdAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-10-28T10:00:00.000Z',
    version: 1
  },
  {
    id: 'fpost-2',
    teamId: 'team-f3',
    collegeId: 'col-5',
    authorId: 'user-cap-coep',
    type: 'Hosting, need an opponent',
    sport: 'Cricket',
    title: 'COEP Ground Available - T20 Leather Ball Friendly',
    message: 'COEP Engineers CC have our main ground reserved this Saturday morning. We have SG Club match balls and umpires arranged. Looking for a collegiate squad with proper white kits.',
    preferredDates: ['2026-11-07'],
    preferredTimeWindow: '08:30 - 12:30',
    venueName: 'COEP Sports Ground',
    city: 'Pune',
    hasHomeGround: true,
    format: 'T20 Leather Ball',
    playersPerSide: 11,
    skillLevel: 'Competitive',
    costNote: 'Host ground provided free; ₹400 ball & umpire share',
    status: 'Open',
    expiresAt: '2026-11-06T00:00:00.000Z',
    createdAt: '2026-10-27T14:30:00.000Z',
    updatedAt: '2026-10-27T14:30:00.000Z',
    version: 1
  },
  {
    id: 'fpost-3',
    teamId: 'team-f5',
    collegeId: 'col-4',
    authorId: 'user-cap-sis',
    type: 'Hosting, need an opponent',
    sport: 'Basketball',
    title: 'Indoor Court Friendly - 5v5 Full Court',
    message: 'Symbiosis Indoor Court A is open for a friendly clash this Friday evening. Student scorers and digital shot clock will be provided. Intermediate to competitive standard.',
    preferredDates: ['2026-11-06'],
    preferredTimeWindow: '17:30 - 19:30',
    venueName: 'Symbiosis Sports Complex Court A',
    city: 'Pune',
    hasHomeGround: true,
    format: 'Full Court 5v5 (4 x 10 mins)',
    playersPerSide: 5,
    skillLevel: 'Competitive',
    costNote: 'Free friendly match (Indoor campus court)',
    status: 'Open',
    expiresAt: '2026-11-05T00:00:00.000Z',
    createdAt: '2026-10-28T16:00:00.000Z',
    updatedAt: '2026-10-28T16:00:00.000Z',
    version: 1
  },
  {
    id: 'fpost-4',
    teamId: 'team-f7',
    collegeId: 'col-2',
    authorId: 'user-cap-dce-bad',
    type: 'Looking for a match',
    sport: 'Badminton',
    title: 'Sparring Tie Ahead of Collegiate Qualifiers',
    message: 'DCE Smashers looking for mixed singles and doubles match practice. Feather shuttles preferred. Happy to travel to any court in Deccan or Shivajinagar.',
    preferredDates: ['2026-11-08', '2026-11-09'],
    preferredTimeWindow: '15:00 - 17:00',
    venueName: 'SmashPoint Club or Deccan Gymkhana',
    city: 'Pune',
    hasHomeGround: false,
    format: 'Singles + Doubles Tie',
    playersPerSide: 2,
    skillLevel: 'Intermediate',
    costNote: 'Court hire and shuttles shared 50/50',
    status: 'Open',
    expiresAt: '2026-11-07T00:00:00.000Z',
    createdAt: '2026-10-29T09:15:00.000Z',
    updatedAt: '2026-10-29T09:15:00.000Z',
    version: 1
  },
  {
    id: 'fpost-5',
    teamId: 'team-f8',
    collegeId: 'col-6',
    authorId: 'user-cap-bmcc-vol',
    type: 'Looking for a match',
    sport: 'Volleyball',
    title: 'Weekend Exhibition - Best of 5 Sets',
    message: 'BMCC Spikers are in Pune this weekend and looking to play a friendly against any Pune college volleyball squad. Rally point rules, FIVB standard.',
    preferredDates: ['2026-11-08'],
    preferredTimeWindow: '10:00 - 12:00',
    venueName: 'Any regulation outdoor or indoor court',
    city: 'Pune',
    hasHomeGround: false,
    format: 'Best of 5 Sets (25-pt rally)',
    playersPerSide: 6,
    skillLevel: 'Competitive',
    costNote: 'No ground fee expected; happy to share equipment',
    status: 'Open',
    expiresAt: '2026-11-07T00:00:00.000Z',
    createdAt: '2026-10-29T11:00:00.000Z',
    updatedAt: '2026-10-29T11:00:00.000Z',
    version: 1
  }
];

const INITIAL_SEED_RESPONSES = [
  {
    id: 'fresp-1',
    postId: 'fpost-1',
    responderTeamId: 'team-f2',
    responderCollegeId: 'col-2',
    responderUserId: 'user-cap-2',
    message: 'DCE Tigers are up for the football friendly! Saturday evening at Elite Turf suits our lineup perfectly. We agree to split the turf cost.',
    proposedDateTime: {
      date: '2026-11-05',
      time: '16:30'
    },
    proposedVenue: 'Elite Football Arena Pitch 1',
    status: 'Pending',
    createdAt: '2026-10-28T12:00:00.000Z',
    updatedAt: '2026-10-28T12:00:00.000Z',
    version: 1
  }
];

/**
 * Load Database State
 */
export const getFeedDbState = () => {
  if (inMemoryDbState) return inMemoryDbState;

  const stored = storageWrapper.get(FEED_STORAGE_KEY, null);
  if (stored && Array.isArray(stored.posts)) {
    inMemoryDbState = stored;
    return stored;
  }

  const defaultState = {
    posts: INITIAL_SEED_POSTS,
    responses: INITIAL_SEED_RESPONSES,
    reports: [],
    savedPosts: [] // Array of { userId, postId }
  };

  inMemoryDbState = defaultState;
  storageWrapper.set(FEED_STORAGE_KEY, defaultState);
  return defaultState;
};

/**
 * Save Database State
 */
export const saveFeedDbState = (state) => {
  inMemoryDbState = state;
  storageWrapper.set(FEED_STORAGE_KEY, state);
  return state;
};

/**
 * Reset Feed Database State (for tests)
 */
export const resetFeedDbState = (customInitialState = null) => {
  const state = customInitialState || {
    posts: JSON.parse(JSON.stringify(INITIAL_SEED_POSTS)),
    responses: JSON.parse(JSON.stringify(INITIAL_SEED_RESPONSES)),
    reports: [],
    savedPosts: []
  };
  inMemoryDbState = state;
  storageWrapper.set(FEED_STORAGE_KEY, state);
  return state;
};

// -------------------------------------------------------------
// POST & RESPONSE STATE MACHINES
// -------------------------------------------------------------

export const POST_STATUS_TRANSITIONS = {
  Open: ['Matched', 'Expired', 'Closed', 'Removed'],
  Matched: [],
  Expired: [],
  Closed: [],
  Removed: []
};

export const RESPONSE_STATUS_TRANSITIONS = {
  Pending: ['Accepted', 'Declined', 'Withdrawn', 'Closed'],
  Accepted: [],
  Declined: [],
  Withdrawn: [],
  Closed: []
};

/**
 * Validate and transition Post Status
 */
export const transitionPostStatus = (post, newStatus) => {
  const allowed = POST_STATUS_TRANSITIONS[post.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new FeedApiError(`Invalid post transition from "${post.status}" to "${newStatus}".`, 400);
  }
  return {
    ...post,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    version: (post.version || 1) + 1
  };
};

/**
 * Validate and transition Response Status
 */
export const transitionResponseStatus = (response, newStatus) => {
  const allowed = RESPONSE_STATUS_TRANSITIONS[response.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new FeedApiError(`Invalid response transition from "${response.status}" to "${newStatus}".`, 400);
  }
  return {
    ...response,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    version: (response.version || 1) + 1
  };
};

// -------------------------------------------------------------
// REPUTATION & REAL METRICS COMPUTATION
// -------------------------------------------------------------

/**
 * Compute real reputation for a team based strictly on confirmed/completed matches
 */
export const computeTeamReputation = (teamId, allMatches = []) => {
  if (!teamId || !Array.isArray(allMatches)) return null;

  const completed = allMatches.filter(
    (m) =>
      (m.homeTeamId === teamId || m.awayTeamId === teamId) &&
      (m.status === 'Completed' || m.status === 'Confirmed')
  );

  const count = completed.length;
  if (count === 0) return null; // Never show fake reputation or 0

  return {
    completedMatchesCount: count,
    label: `${count} friendly match${count === 1 ? '' : 'es'} arranged`
  };
};

// -------------------------------------------------------------
// CORE SERVICE API
// -------------------------------------------------------------

export const friendlyFeedService = {
  /**
   * Get all posts with server-side filtering, searching, sorting, and cursor pagination
   */
  getPosts(filters = {}, sessionUser = null) {
    const db = getFeedDbState();
    const now = new Date();
    const nowIso = now.toISOString();

    // Lazy check: auto-expire any Open posts whose expiresAt has passed
    let dbUpdated = false;
    const posts = db.posts.map((p) => {
      if (p.status === 'Open' && p.expiresAt && p.expiresAt < nowIso) {
        dbUpdated = true;
        return {
          ...p,
          status: 'Expired',
          updatedAt: nowIso,
          version: (p.version || 1) + 1
        };
      }
      return p;
    });

    if (dbUpdated) {
      db.posts = posts;
      saveFeedDbState(db);
    }

    // Filter by view tab / ownership
    let visiblePosts = [];
    const activeTab = filters.tab || 'feed';

    if (activeTab === 'my_posts') {
      if (!sessionUser) throw new FeedApiError('Authentication required to view your posts.', 401);
      visiblePosts = posts.filter((p) => p.authorId === sessionUser.id && p.status !== 'Removed');
    } else if (activeTab === 'saved') {
      if (!sessionUser) throw new FeedApiError('Authentication required to view saved posts.', 401);
      const savedIds = new Set(
        db.savedPosts.filter((s) => s.userId === sessionUser.id).map((s) => s.postId)
      );
      visiblePosts = posts.filter((p) => savedIds.has(p.id) && p.status === 'Open');
    } else if (activeTab === 'my_responses') {
      if (!sessionUser) throw new FeedApiError('Authentication required to view your responses.', 401);
      const respondedPostIds = new Set(
        db.responses
          .filter((r) => r.responderUserId === sessionUser.id || r.responderTeamId === sessionUser.teamId)
          .map((r) => r.postId)
      );
      visiblePosts = posts.filter((p) => respondedPostIds.has(p.id) && p.status !== 'Removed');
    } else {
      // Public / General Feed: Show only 'Open' posts that are not removed or expired
      visiblePosts = posts.filter((p) => p.status === 'Open');
    }

    // Apply Filters
    if (filters.sport && filters.sport !== 'all') {
      visiblePosts = visiblePosts.filter(
        (p) => p.sport.toLowerCase() === filters.sport.toLowerCase()
      );
    }

    if (filters.city && filters.city !== 'all') {
      visiblePosts = visiblePosts.filter(
        (p) => p.city.toLowerCase() === filters.city.toLowerCase()
      );
    }

    if (filters.collegeId && filters.collegeId !== 'all') {
      visiblePosts = visiblePosts.filter((p) => p.collegeId === filters.collegeId);
    }

    if (filters.skillLevel && filters.skillLevel !== 'all') {
      visiblePosts = visiblePosts.filter(
        (p) => p.skillLevel.toLowerCase() === filters.skillLevel.toLowerCase()
      );
    }

    if (filters.format && filters.format !== 'all') {
      visiblePosts = visiblePosts.filter((p) =>
        p.format.toLowerCase().includes(filters.format.toLowerCase())
      );
    }

    if (filters.hasHomeGround !== undefined && filters.hasHomeGround !== 'all') {
      const boolVal = filters.hasHomeGround === true || filters.hasHomeGround === 'true';
      visiblePosts = visiblePosts.filter((p) => p.hasHomeGround === boolVal);
    }

    if (filters.type && filters.type !== 'all') {
      visiblePosts = visiblePosts.filter(
        (p) => p.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Date range filter
    if (filters.startDate) {
      visiblePosts = visiblePosts.filter((p) =>
        (p.preferredDates || []).some((d) => {
          const dateStr = typeof d === 'string' ? d : d.date;
          return dateStr >= filters.startDate;
        })
      );
    }

    if (filters.endDate) {
      visiblePosts = visiblePosts.filter((p) =>
        (p.preferredDates || []).some((d) => {
          const dateStr = typeof d === 'string' ? d : d.date;
          return dateStr <= filters.endDate;
        })
      );
    }

    // Search query keyword filter (message, title, sport, venue)
    if (filters.keyword && filters.keyword.trim()) {
      const q = filters.keyword.trim().toLowerCase();
      visiblePosts = visiblePosts.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          p.message.toLowerCase().includes(q) ||
          p.sport.toLowerCase().includes(q) ||
          (p.venueName && p.venueName.toLowerCase().includes(q)) ||
          p.city.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sort = filters.sort || 'newest';
    visiblePosts.sort((a, b) => {
      if (sort === 'soonest') {
        const aDate = (a.preferredDates?.[0] || '9999-12-31');
        const bDate = (b.preferredDates?.[0] || '9999-12-31');
        return aDate.localeCompare(bDate);
      }
      if (sort === 'active') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      // default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Compute dynamic responseCount for the author only; others see null/omitted
    const enriched = visiblePosts.map((p) => {
      const postResponses = db.responses.filter((r) => r.postId === p.id);
      const isAuthor = sessionUser && p.authorId === sessionUser.id;
      const isSaved = sessionUser
        ? db.savedPosts.some((s) => s.userId === sessionUser.id && s.postId === p.id)
        : false;

      return {
        ...p,
        responseCount: isAuthor ? postResponses.length : undefined,
        pendingResponseCount: isAuthor
          ? postResponses.filter((r) => r.status === 'Pending').length
          : undefined,
        isSaved
      };
    });

    // Pagination (cursor or page limit)
    const limit = parseInt(filters.limit, 10) || 10;
    const page = parseInt(filters.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = enriched.slice(startIndex, startIndex + limit);

    return {
      posts: paginated,
      totalCount: enriched.length,
      page,
      limit,
      hasMore: startIndex + limit < enriched.length
    };
  },

  /**
   * Get single post by ID with security verification
   */
  getPostById(postId, sessionUser = null) {
    if (!postId) throw new FeedApiError('Post ID is required.', 400);
    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);

    if (!post || post.status === 'Removed') {
      throw new FeedApiError(`Post "${postId}" not found.`, 404);
    }

    const isAuthor = sessionUser && post.authorId === sessionUser.id;
    const responses = isAuthor ? db.responses.filter((r) => r.postId === post.id) : [];

    return {
      ...post,
      responseCount: isAuthor ? responses.length : undefined,
      pendingResponseCount: isAuthor ? responses.filter((r) => r.status === 'Pending').length : undefined
    };
  },

  /**
   * Create a new FriendlyPost
   */
  createPost(payload, sessionUser, managedTeams = []) {
    if (!sessionUser) throw new FeedApiError('Authentication required to create a post.', 401);

    // Validate authorized team
    const teamId = payload.teamId;
    if (!teamId) throw new FeedApiError('Team ID is required.', 400);

    const userManagesTeam = managedTeams.some((t) => t.id === teamId) || sessionUser.teamId === teamId;
    if (!userManagesTeam) {
      throw new FeedApiError('Unauthorized: You can only create posts for teams you manage or captain.', 403);
    }

    const team = managedTeams.find((t) => t.id === teamId) || {
      id: teamId,
      collegeId: sessionUser.collegeId,
      sport: payload.sport
    };

    const collegeId = team.collegeId || sessionUser.collegeId;
    if (!collegeId) throw new FeedApiError('College ID could not be resolved.', 400);

    // Validate anti-spam: max 3 open posts per team
    const db = getFeedDbState();
    const openTeamPosts = db.posts.filter((p) => p.teamId === teamId && p.status === 'Open');
    if (openTeamPosts.length >= MAX_OPEN_POSTS_PER_TEAM) {
      throw new FeedApiError(
        `Team already has ${MAX_OPEN_POSTS_PER_TEAM} open posts. Please close or wait for existing posts before creating a new one.`,
        400
      );
    }

    // Validate anti-spam: max 10 posts per day per user
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const userDailyPosts = db.posts.filter(
      (p) => p.authorId === sessionUser.id && p.createdAt >= oneDayAgo
    );
    if (userDailyPosts.length >= MAX_POSTS_PER_USER_DAILY) {
      throw new FeedApiError(
        `Rate limit reached: Maximum ${MAX_POSTS_PER_USER_DAILY} posts per day allowed.`,
        429
      );
    }

    // Validate message
    const rawMessage = (payload.message || '').trim();
    if (!rawMessage || rawMessage.length < 10) {
      throw new FeedApiError('Post message must be at least 10 characters long.', 400);
    }
    if (rawMessage.length > 1000) {
      throw new FeedApiError('Post message cannot exceed 1000 characters.', 400);
    }

    // Self-Harm / Privacy detection: Refuse post if it contains phone number or email
    if (containsContactDetails(rawMessage) || containsContactDetails(payload.title)) {
      throw new FeedApiError(
        'For player safety and privacy, direct phone numbers and email addresses cannot be included in public post messages. Contact details are securely shared after a match is confirmed.',
        400
      );
    }

    // Validate sport
    const sport = payload.sport || team.sport;
    if (!sport) throw new FeedApiError('Sport is required.', 400);

    // Validate preferred dates (no past dates)
    const preferredDates = Array.isArray(payload.preferredDates)
      ? payload.preferredDates.filter(Boolean)
      : [];
    if (preferredDates.length === 0) {
      throw new FeedApiError('At least one preferred match date is required.', 400);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    for (const d of preferredDates) {
      const dStr = typeof d === 'string' ? d : d.date;
      if (dStr < todayStr) {
        throw new FeedApiError(`Preferred date "${dStr}" cannot be in the past.`, 400);
      }
    }

    // Anti-Spam: Duplicate post check (same team, sport, and overlapping preferred dates)
    const hasDuplicate = openTeamPosts.some((existing) => {
      if (existing.sport.toLowerCase() !== sport.toLowerCase()) return false;
      const existingDates = new Set(existing.preferredDates.map((d) => (typeof d === 'string' ? d : d.date)));
      return preferredDates.some((d) => existingDates.has(typeof d === 'string' ? d : d.date));
    });

    if (hasDuplicate) {
      throw new FeedApiError(
        'A post for this team, sport, and overlapping date already exists. Please edit your existing post or choose different dates.',
        400
      );
    }

    // Compute expiry
    const expiresAt = computePostExpiry(preferredDates);

    const newPost = {
      id: `fpost-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      teamId,
      collegeId,
      authorId: sessionUser.id, // Derived strictly from session, never payload
      type: payload.type === 'Hosting, need an opponent' ? 'Hosting, need an opponent' : 'Looking for a match',
      sport,
      title: payload.title ? escapeHtml(payload.title.trim().slice(0, 80)) : '',
      message: escapeHtml(rawMessage),
      preferredDates,
      preferredTimeWindow: payload.preferredTimeWindow ? escapeHtml(payload.preferredTimeWindow.trim()) : '',
      venueName: payload.venueName ? escapeHtml(payload.venueName.trim().slice(0, 120)) : '',
      city: payload.city ? escapeHtml(payload.city.trim()) : 'Pune',
      hasHomeGround: Boolean(payload.hasHomeGround),
      format: payload.format ? escapeHtml(payload.format.trim()) : 'Full Match',
      playersPerSide: payload.playersPerSide ? parseInt(payload.playersPerSide, 10) : undefined,
      skillLevel: ['Beginner', 'Intermediate', 'Competitive'].includes(payload.skillLevel)
        ? payload.skillLevel
        : 'Intermediate',
      costNote: payload.costNote ? escapeHtml(payload.costNote.trim().slice(0, 160)) : '',
      status: 'Open',
      expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    db.posts = [newPost, ...db.posts];
    saveFeedDbState(db);

    return newPost;
  },

  /**
   * Edit an Open Post (Author only)
   */
  updatePost(postId, updates, sessionUser) {
    if (!sessionUser) throw new FeedApiError('Authentication required.', 401);
    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);

    if (!post) throw new FeedApiError(`Post "${postId}" not found.`, 404);
    if (post.authorId !== sessionUser.id) {
      throw new FeedApiError('Forbidden: Only the post author can edit this post.', 403);
    }
    if (post.status !== 'Open') {
      throw new FeedApiError(`Cannot edit a post with status "${post.status}".`, 400);
    }

    // Changing sport or team is prohibited after posting
    if (updates.sport && updates.sport.toLowerCase() !== post.sport.toLowerCase()) {
      throw new FeedApiError('Sport cannot be changed after posting. Please close this post and create a new one.', 400);
    }
    if (updates.teamId && updates.teamId !== post.teamId) {
      throw new FeedApiError('Team cannot be changed after posting.', 400);
    }

    if (updates.message) {
      const rawMessage = updates.message.trim();
      if (rawMessage.length < 10 || rawMessage.length > 1000) {
        throw new FeedApiError('Message must be between 10 and 1000 characters.', 400);
      }
      if (containsContactDetails(rawMessage)) {
        throw new FeedApiError('Direct phone numbers or email addresses cannot be included in messages.', 400);
      }
      post.message = escapeHtml(rawMessage);
    }

    if (updates.title !== undefined) {
      post.title = escapeHtml(updates.title.trim().slice(0, 80));
    }
    if (updates.preferredDates) {
      post.preferredDates = updates.preferredDates;
      post.expiresAt = computePostExpiry(updates.preferredDates);
    }
    if (updates.venueName !== undefined) post.venueName = escapeHtml(updates.venueName.trim());
    if (updates.hasHomeGround !== undefined) post.hasHomeGround = Boolean(updates.hasHomeGround);
    if (updates.costNote !== undefined) post.costNote = escapeHtml(updates.costNote.trim());

    post.updatedAt = new Date().toISOString();
    post.version = (post.version || 1) + 1;

    saveFeedDbState(db);
    return post;
  },

  /**
   * Close an Open Post (Author only)
   */
  closePost(postId, sessionUser) {
    if (!sessionUser) throw new FeedApiError('Authentication required.', 401);
    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);

    if (!post) throw new FeedApiError(`Post "${postId}" not found.`, 404);
    if (post.authorId !== sessionUser.id) {
      throw new FeedApiError('Forbidden: Only the post author can close this post.', 403);
    }

    const updatedPost = transitionPostStatus(post, 'Closed');

    // Close all pending responses on this post
    const closedResponses = [];
    db.responses = db.responses.map((r) => {
      if (r.postId === postId && r.status === 'Pending') {
        const closed = transitionResponseStatus(r, 'Closed');
        closedResponses.push(closed);
        return closed;
      }
      return r;
    });

    db.posts = db.posts.map((p) => (p.id === postId ? updatedPost : p));
    saveFeedDbState(db);

    return {
      post: updatedPost,
      closedResponses
    };
  },

  /**
   * Respond to an Open FriendlyPost
   */
  respondToPost(postId, payload, sessionUser, managedTeams = []) {
    if (!sessionUser) throw new FeedApiError('Authentication required to respond.', 401);

    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);

    if (!post || post.status === 'Removed') {
      throw new FeedApiError(`Post "${postId}" not found.`, 404);
    }
    if (post.status !== 'Open') {
      throw new FeedApiError(`Cannot respond to a post in "${post.status}" status.`, 400);
    }

    const nowIso = new Date().toISOString();
    if (post.expiresAt && post.expiresAt < nowIso) {
      post.status = 'Expired';
      saveFeedDbState(db);
      throw new FeedApiError('This post has expired and cannot receive further responses.', 400);
    }

    // Team validation
    const responderTeamId = payload.responderTeamId;
    if (!responderTeamId) throw new FeedApiError('Responder team ID is required.', 400);

    const userManagesTeam = managedTeams.some((t) => t.id === responderTeamId) || sessionUser.teamId === responderTeamId;
    if (!userManagesTeam) {
      throw new FeedApiError('Unauthorized: You can only respond as a team you manage or captain.', 403);
    }

    const responderTeam = managedTeams.find((t) => t.id === responderTeamId) || {
      id: responderTeamId,
      collegeId: sessionUser.collegeId,
      sport: post.sport
    };

    // Sport must match
    if (responderTeam.sport && responderTeam.sport.toLowerCase() !== post.sport.toLowerCase()) {
      throw new FeedApiError(`Your team plays ${responderTeam.sport}, but this post is for ${post.sport}.`, 400);
    }

    // Self-response defense
    if (post.teamId === responderTeamId || post.authorId === sessionUser.id) {
      throw new FeedApiError('You cannot respond to your own team post.', 400);
    }

    // Inter-collegiate rule: Different colleges required
    const responderCollegeId = responderTeam.collegeId || sessionUser.collegeId;
    if (post.collegeId && responderCollegeId && post.collegeId === responderCollegeId) {
      throw new FeedApiError(
        'Inter-collegiate friendly matches must be between different colleges. Intra-college matches are not permitted here.',
        400
      );
    }

    // One response per team per post
    const existingTeamResponse = db.responses.find(
      (r) => r.postId === postId && r.responderTeamId === responderTeamId && ['Pending', 'Accepted'].includes(r.status)
    );
    if (existingTeamResponse) {
      throw new FeedApiError('Your team has already submitted an active response to this post.', 400);
    }

    // Rate-limit check: Max 20 responses per day per user
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const userDailyResponses = db.responses.filter(
      (r) => r.responderUserId === sessionUser.id && r.createdAt >= oneDayAgo
    );
    if (userDailyResponses.length >= MAX_RESPONSES_PER_USER_DAILY) {
      throw new FeedApiError(
        `Rate limit reached: Maximum ${MAX_RESPONSES_PER_USER_DAILY} responses per day allowed.`,
        429
      );
    }

    // Validate response message
    const rawMessage = (payload.message || '').trim();
    if (!rawMessage || rawMessage.length < 5) {
      throw new FeedApiError('Response message must be at least 5 characters long.', 400);
    }
    if (rawMessage.length > 500) {
      throw new FeedApiError('Response message cannot exceed 500 characters.', 400);
    }
    if (containsContactDetails(rawMessage)) {
      throw new FeedApiError('Direct contact details cannot be included in responses. They will be shared after confirmation.', 400);
    }

    const newResponse = {
      id: `fresp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      postId,
      responderTeamId,
      responderCollegeId,
      responderUserId: sessionUser.id,
      message: escapeHtml(rawMessage),
      proposedDateTime: payload.proposedDateTime
        ? {
            date: payload.proposedDateTime.date,
            time: payload.proposedDateTime.time || '16:00'
          }
        : null,
      proposedVenue: payload.proposedVenue ? escapeHtml(payload.proposedVenue.trim()) : null,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    db.responses = [newResponse, ...db.responses];
    saveFeedDbState(db);

    return newResponse;
  },

  /**
   * Author accepts a response: Atomic Transaction with Optimistic Locking
   */
  acceptResponse(postId, responseId, sessionUser, expectedPostVersion = null) {
    if (!sessionUser) throw new FeedApiError('Authentication required.', 401);

    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);

    if (!post || post.status === 'Removed') {
      throw new FeedApiError(`Post "${postId}" not found.`, 404);
    }
    if (post.authorId !== sessionUser.id) {
      throw new FeedApiError('Forbidden: Only the post author can accept responses.', 403);
    }

    // Optimistic Concurrency Check: If post is already Matched or version doesn't match
    if (post.status !== 'Open') {
      throw new FeedApiError(`This post already has a confirmed match or is no longer open (status: ${post.status}).`, 409);
    }
    if (expectedPostVersion !== null && post.version !== expectedPostVersion) {
      throw new FeedApiError('This post was modified concurrently. Please refresh before accepting.', 409);
    }

    const response = db.responses.find((r) => r.id === responseId && r.postId === postId);
    if (!response) {
      throw new FeedApiError(`Response "${responseId}" not found on this post.`, 404);
    }
    if (response.status !== 'Pending') {
      throw new FeedApiError(`Cannot accept response in status "${response.status}".`, 400);
    }

    // ATOMIC TRANSACTION:
    // 1. Mark accepted response
    const acceptedResponse = transitionResponseStatus(response, 'Accepted');

    // 2. Mark post as Matched
    const matchedPost = transitionPostStatus(post, 'Matched');

    // 3. Mark all other Pending responses on this post as Closed
    const closedResponses = [];
    db.responses = db.responses.map((r) => {
      if (r.id === responseId) return acceptedResponse;
      if (r.postId === postId && r.status === 'Pending') {
        const closed = transitionResponseStatus(r, 'Closed');
        closedResponses.push(closed);
        return closed;
      }
      return r;
    });

    // 4. Generate Confirmed Match (compatible with existing matches state)
    const matchDate = response.proposedDateTime?.date || post.preferredDates?.[0] || new Date().toISOString().slice(0, 10);
    const matchTime = response.proposedDateTime?.time || post.preferredTimeWindow?.slice(0, 5) || '16:00';
    const matchVenueName = response.proposedVenue || post.venueName || 'Host Ground';

    const confirmedMatch = {
      id: `match-${Date.now()}`,
      type: 'confirmed_fixture',
      source: 'community_proposal',
      sport: post.sport,
      homeTeamId: post.teamId,
      awayTeamId: response.responderTeamId,
      date: `${matchDate}T${matchTime}:00.000Z`,
      startTime: matchTime,
      durationMinutes: 90,
      format: post.format || 'Full Match',
      venue: {
        name: matchVenueName,
        address: `${matchVenueName}, ${post.city || 'Pune'}`,
        lat: 18.5204,
        lng: 73.8567,
        facilityId: null
      },
      skillLevel: post.skillLevel,
      fee: 0,
      feeUnit: 'Friendly Match',
      slots: { total: 2, registered: 2, open: 0 },
      registrationDeadline: matchDate,
      organiserId: sessionUser.id,
      organiserName: sessionUser.name,
      status: 'Confirmed',
      rules: [
        'Friendly fixture agreed via SportLink Friendly Feed.',
        'Official collegiate jerseys and equipment compulsory.'
      ],
      linkedPostId: post.id,
      linkedResponseId: response.id,
      createdAt: new Date().toISOString()
    };

    matchedPost.matchedMatchId = confirmedMatch.id;

    // Update post list
    db.posts = db.posts.map((p) => (p.id === postId ? matchedPost : p));
    saveFeedDbState(db);

    return {
      post: matchedPost,
      acceptedResponse,
      closedResponses,
      confirmedMatch
    };
  },

  /**
   * Author declines a response
   */
  declineResponse(postId, responseId, sessionUser, reason = '') {
    if (!sessionUser) throw new FeedApiError('Authentication required.', 401);
    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);

    if (!post) throw new FeedApiError(`Post "${postId}" not found.`, 404);
    if (post.authorId !== sessionUser.id) {
      throw new FeedApiError('Forbidden: Only the post author can decline responses.', 403);
    }

    const response = db.responses.find((r) => r.id === responseId && r.postId === postId);
    if (!response) throw new FeedApiError(`Response "${responseId}" not found.`, 404);
    if (response.status !== 'Pending') {
      throw new FeedApiError(`Cannot decline response in status "${response.status}".`, 400);
    }

    const declined = transitionResponseStatus(response, 'Declined');
    if (reason) declined.declineReason = escapeHtml(reason.trim());

    db.responses = db.responses.map((r) => (r.id === responseId ? declined : r));
    saveFeedDbState(db);

    return declined;
  },

  /**
   * Responder withdraws their pending response
   */
  withdrawResponse(responseId, sessionUser) {
    if (!sessionUser) throw new FeedApiError('Authentication required.', 401);
    const db = getFeedDbState();
    const response = db.responses.find((r) => r.id === responseId);

    if (!response) throw new FeedApiError(`Response "${responseId}" not found.`, 404);
    if (response.responderUserId !== sessionUser.id) {
      throw new FeedApiError('Forbidden: You can only withdraw your own response.', 403);
    }
    if (response.status !== 'Pending') {
      throw new FeedApiError(`Cannot withdraw response in status "${response.status}".`, 400);
    }

    const withdrawn = transitionResponseStatus(response, 'Withdrawn');
    db.responses = db.responses.map((r) => (r.id === responseId ? withdrawn : r));
    saveFeedDbState(db);

    return withdrawn;
  },

  /**
   * Get responses for a post (Author only)
   */
  getResponsesForPost(postId, sessionUser) {
    if (!sessionUser) throw new FeedApiError('Authentication required.', 401);
    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);

    if (!post) throw new FeedApiError(`Post "${postId}" not found.`, 404);
    if (post.authorId !== sessionUser.id) {
      throw new FeedApiError('Forbidden: Only the post author can view incoming responses.', 403);
    }

    return db.responses.filter((r) => r.postId === postId);
  },

  /**
   * Toggle Bookmark / Save Post
   */
  toggleSavePost(postId, sessionUser) {
    if (!sessionUser) throw new FeedApiError('Authentication required to save posts.', 401);
    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);
    if (!post || post.status === 'Removed') throw new FeedApiError('Post not found.', 404);

    const existsIndex = db.savedPosts.findIndex(
      (s) => s.userId === sessionUser.id && s.postId === postId
    );

    let isSaved = false;
    if (existsIndex >= 0) {
      db.savedPosts.splice(existsIndex, 1);
      isSaved = false;
    } else {
      db.savedPosts.push({ userId: sessionUser.id, postId });
      isSaved = true;
    }

    saveFeedDbState(db);
    return { isSaved };
  },

  /**
   * Submit Report for Post or Response
   */
  submitReport(payload, sessionUser) {
    if (!sessionUser) throw new FeedApiError('Authentication required to report.', 401);
    const db = getFeedDbState();

    const targetType = payload.targetType; // 'post' | 'response'
    const targetId = payload.targetId;
    if (!['post', 'response'].includes(targetType) || !targetId) {
      throw new FeedApiError('Invalid report target.', 400);
    }

    // Ignore duplicate reports from the same user on the same item
    const alreadyReported = db.reports.some(
      (rep) => rep.reporterId === sessionUser.id && rep.targetId === targetId
    );
    if (alreadyReported) {
      return { success: true, message: 'Report already received and queued for moderation.' };
    }

    const newReport = {
      id: `frep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetType,
      targetId,
      reporterId: sessionUser.id,
      reason: payload.reason || 'Inappropriate content',
      details: payload.details ? escapeHtml(payload.details.trim().slice(0, 300)) : '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    db.reports = [newReport, ...db.reports];
    saveFeedDbState(db);

    return { success: true, report: newReport };
  },

  /**
   * Moderator: Remove Post
   */
  removePost(postId, sessionUser) {
    if (!sessionUser || sessionUser.role !== 'organiser') {
      throw new FeedApiError('Forbidden: Moderator privileges required.', 403);
    }
    const db = getFeedDbState();
    const post = db.posts.find((p) => p.id === postId);
    if (!post) throw new FeedApiError('Post not found.', 404);

    post.status = 'Removed';
    post.updatedAt = new Date().toISOString();

    // Close pending responses
    db.responses = db.responses.map((r) => {
      if (r.postId === postId && r.status === 'Pending') {
        return transitionResponseStatus(r, 'Closed');
      }
      return r;
    });

    saveFeedDbState(db);
    return post;
  }
};

