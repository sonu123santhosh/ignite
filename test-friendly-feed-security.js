/**
 * test-friendly-feed-security.js
 * 
 * Standalone Security, Integrity, and State-Machine Test Suite for SportLink Friendly Feed.
 * Run directly via: node test-friendly-feed-security.js
 */

import {
  friendlyFeedService,
  resetFeedDbState,
  computePostExpiry,
  containsContactDetails,
  PHONE_REGEX,
  EMAIL_REGEX,
  FeedApiError,
  MAX_OPEN_POSTS_PER_TEAM
} from './src/services/friendlyFeedService.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failedTests++;
  }
}

function expectThrow(fn, testName, expectedStatus = null) {
  try {
    fn();
    console.error(`  [FAIL] ${testName} (Expected exception but none thrown)`);
    failedTests++;
  } catch (err) {
    if (expectedStatus && err.status !== expectedStatus) {
      console.error(`  [FAIL] ${testName} (Expected status ${expectedStatus}, got ${err.status}: ${err.message})`);
      failedTests++;
    } else {
      console.log(`  [PASS] ${testName}`);
      passedTests++;
    }
  }
}

console.log('====================================================');
console.log('RUNNING FRIENDLY FEED SECURITY & INTEGRITY TESTS');
console.log('====================================================\n');

// Reset to clean test state
resetFeedDbState();

// Test Personas
const sessionCap1 = {
  id: 'user-cap-1',
  name: 'Rohan Deshmukh',
  role: 'captain',
  collegeId: 'col-1',
  teamId: 'team-f1'
};

const sessionCap2 = {
  id: 'user-cap-2',
  name: 'Aakash Shinde',
  role: 'captain',
  collegeId: 'col-2',
  teamId: 'team-f2'
};

const sessionCap3 = {
  id: 'user-cap-3',
  name: 'Same College Captain',
  role: 'captain',
  collegeId: 'col-1', // SAME COLLEGE AS CAP1
  teamId: 'team-f6'
};

const sessionMod = {
  id: 'user-org-1',
  name: 'Prof. Sandeep Joshi',
  role: 'organiser'
};

const cap1Teams = [{ id: 'team-f1', collegeId: 'col-1', sport: 'Football', name: 'PIT Strikers' }];
const cap2Teams = [{ id: 'team-f2', collegeId: 'col-2', sport: 'Football', name: 'DCE Tigers' }];
const cap3Teams = [{ id: 'team-f6', collegeId: 'col-1', sport: 'Football', name: 'PIT Dunkers' }];

// -------------------------------------------------------------
// 1. Unauthenticated Access Rejections
// -------------------------------------------------------------
console.log('1. Testing Unauthenticated Access Rejections...');

expectThrow(() => {
  friendlyFeedService.createPost({ teamId: 'team-f1', message: 'Valid test message text' }, null, cap1Teams);
}, 'Null session creating post rejected with 401', 401);

expectThrow(() => {
  friendlyFeedService.respondToPost('fpost-1', { responderTeamId: 'team-f2', message: 'Hello' }, null, cap2Teams);
}, 'Null session responding rejected with 401', 401);

expectThrow(() => {
  friendlyFeedService.acceptResponse('fpost-1', 'fresp-1', null);
}, 'Null session accepting response rejected with 401', 401);

expectThrow(() => {
  friendlyFeedService.toggleSavePost('fpost-1', null);
}, 'Null session saving post rejected with 401', 401);

expectThrow(() => {
  friendlyFeedService.submitReport({ targetType: 'post', targetId: 'fpost-1' }, null);
}, 'Null session reporting rejected with 401', 401);

// -------------------------------------------------------------
// 2. Unauthorized Team Acting Defense
// -------------------------------------------------------------
console.log('\n2. Testing Unauthorized Team Acting Defense...');

expectThrow(() => {
  // Cap 2 trying to post as team-f1 (Cap 1's team)
  friendlyFeedService.createPost(
    {
      teamId: 'team-f1',
      sport: 'Football',
      message: 'Malicious post pretending to be PIT Strikers',
      preferredDates: ['2026-11-20']
    },
    sessionCap2,
    cap2Teams // Cap 2 only manages team-f2
  );
}, 'User trying to post for a team they do not manage rejected with 403', 403);

expectThrow(() => {
  // Cap 1 trying to respond as team-f2
  friendlyFeedService.respondToPost(
    'fpost-2',
    {
      responderTeamId: 'team-f2',
      message: 'Impersonating another team'
    },
    sessionCap1,
    cap1Teams
  );
}, 'User trying to respond for a team they do not manage rejected with 403', 403);

// -------------------------------------------------------------
// 3. Inter-Collegiate Rules & Self-Response Defense
// -------------------------------------------------------------
console.log('\n3. Testing Inter-Collegiate Rules & Self-Response...');

expectThrow(() => {
  // Cap 1 responding to Cap 1's own post (fpost-1)
  friendlyFeedService.respondToPost(
    'fpost-1',
    {
      responderTeamId: 'team-f1',
      message: 'Responding to our own post'
    },
    sessionCap1,
    cap1Teams
  );
}, 'Self-response to own post rejected with 400', 400);

expectThrow(() => {
  // Cap 3 is col-1, trying to respond to fpost-1 which is also col-1
  friendlyFeedService.respondToPost(
    'fpost-1',
    {
      responderTeamId: 'team-f6',
      message: 'Same college intra-school match'
    },
    sessionCap3,
    cap3Teams
  );
}, 'Same-college intra-match rejected under inter-collegiate rules with 400', 400);

// -------------------------------------------------------------
// 4. Contact Privacy & Self-Harm Leaks Defense
// -------------------------------------------------------------
console.log('\n4. Testing Contact Privacy & Self-Harm Leaks Defense...');

assert(containsContactDetails('Call me at +91 98220 11223 for turf booking') === true, 'Phone number detected in text');
assert(containsContactDetails('Ping captain at captain@pit.edu.in') === true, 'Email address detected in text');
assert(containsContactDetails('Match cost shared 50/50 on weekend') === false, 'Clean text permitted');

expectThrow(() => {
  friendlyFeedService.createPost(
    {
      teamId: 'team-f1',
      sport: 'Football',
      message: 'Looking for a match, WhatsApp me at 9822011223 immediately',
      preferredDates: ['2026-11-25']
    },
    sessionCap1,
    cap1Teams
  );
}, 'Post containing direct phone number rejected with 400', 400);

expectThrow(() => {
  friendlyFeedService.createPost(
    {
      teamId: 'team-f1',
      sport: 'Football',
      message: 'Reach out to team at captain.rohan@pit.edu.in for confirmation',
      preferredDates: ['2026-11-25']
    },
    sessionCap1,
    cap1Teams
  );
}, 'Post containing direct email rejected with 400', 400);

// -------------------------------------------------------------
// 5. Mass-Assignment & Server Identity Enforcement
// -------------------------------------------------------------
console.log('\n5. Testing Mass-Assignment & Server Identity Enforcement...');

const createdPost = friendlyFeedService.createPost(
  {
    teamId: 'team-f1',
    sport: 'Football',
    title: 'Clean Match Request',
    message: 'Valid match request without any contact leakage.',
    preferredDates: ['2026-11-20'],
    // Attempting mass assignment injection:
    authorId: 'injected-fake-author',
    status: 'Matched',
    responseCount: 999,
    version: 42
  },
  sessionCap1,
  cap1Teams
);

assert(createdPost.authorId === sessionCap1.id, 'authorId derived strictly from session, ignoring malicious payload');
assert(createdPost.status === 'Open', 'Initial status enforced as "Open", ignoring injected status');
assert(createdPost.version === 1, 'Initial version enforced as 1, ignoring injected version');
assert(createdPost.responseCount === undefined, 'responseCount not stored as editable scalar');

// -------------------------------------------------------------
// 6. Anti-Spam: Duplicate Post & Rate Limits
// -------------------------------------------------------------
console.log('\n6. Testing Anti-Spam & Duplicate Post Prevention...');

expectThrow(() => {
  // Duplicate post for same team, sport, and date 2026-11-20
  friendlyFeedService.createPost(
    {
      teamId: 'team-f1',
      sport: 'Football',
      message: 'Another post for the exact same date and sport',
      preferredDates: ['2026-11-20']
    },
    sessionCap1,
    cap1Teams
  );
}, 'Duplicate post for same team, sport and overlapping date rejected with 400', 400);

// -------------------------------------------------------------
// 7. Duplicate Response Defense
// -------------------------------------------------------------
console.log('\n7. Testing Duplicate Response Defense...');

// fresp-1 already exists from team-f2 on fpost-1 in seed
expectThrow(() => {
  friendlyFeedService.respondToPost(
    'fpost-1',
    {
      responderTeamId: 'team-f2',
      message: 'Sending a second response from same team'
    },
    sessionCap2,
    cap2Teams
  );
}, 'Duplicate response from same team on same post rejected with 400', 400);

// -------------------------------------------------------------
// 8. Atomic Response Acceptance & Optimistic Concurrency
// -------------------------------------------------------------
console.log('\n8. Testing Atomic Response Acceptance & Optimistic Concurrency...');

// Create a new post and two distinct responses to test atomic acceptance
const postForAccept = friendlyFeedService.createPost(
  {
    teamId: 'team-f1',
    sport: 'Football',
    message: 'Testing atomic acceptance transaction.',
    preferredDates: ['2026-11-28']
  },
  sessionCap1,
  cap1Teams
);

// Response 1 from Cap 2 (team-f2)
const resp1 = friendlyFeedService.respondToPost(
  postForAccept.id,
  {
    responderTeamId: 'team-f2',
    message: 'Response 1 from DCE Tigers',
    proposedDateTime: { date: '2026-11-28', time: '17:00' }
  },
  sessionCap2,
  cap2Teams
);

// Cap 4 from col-5
const sessionCap4 = { id: 'user-cap-coep', collegeId: 'col-5', teamId: 'team-f3', role: 'captain' };
const cap4Teams = [{ id: 'team-f3', collegeId: 'col-5', sport: 'Football', name: 'COEP Football' }];

// Response 2 from Cap 4 (team-f3)
const resp2 = friendlyFeedService.respondToPost(
  postForAccept.id,
  {
    responderTeamId: 'team-f3',
    message: 'Response 2 from COEP'
  },
  sessionCap4,
  cap4Teams
);

// Author accepts Response 1
const acceptResult = friendlyFeedService.acceptResponse(postForAccept.id, resp1.id, sessionCap1);

assert(acceptResult.post.status === 'Matched', 'Post transitioned to "Matched"');
assert(acceptResult.acceptedResponse.status === 'Accepted', 'Selected response transitioned to "Accepted"');
assert(acceptResult.closedResponses.length === 1, 'Exactly 1 other pending response was closed');
assert(acceptResult.closedResponses[0].id === resp2.id, 'Other response (resp2) transitioned to "Closed"');
assert(acceptResult.confirmedMatch !== null, 'Confirmed match record generated');
assert(acceptResult.confirmedMatch.homeTeamId === 'team-f1', 'Confirmed match home team matches post team');
assert(acceptResult.confirmedMatch.awayTeamId === 'team-f2', 'Confirmed match away team matches accepted responder');
assert(acceptResult.confirmedMatch.status === 'Confirmed', 'Confirmed match status is "Confirmed"');

// Concurrent Attempt: Try to accept Response 2 now that post is Matched
expectThrow(() => {
  friendlyFeedService.acceptResponse(postForAccept.id, resp2.id, sessionCap1);
}, 'Double-accept blocked: cannot accept another response once post is Matched (409 Conflict)', 409);

// -------------------------------------------------------------
// 9. Responding to Expired, Closed or Matched Posts
// -------------------------------------------------------------
console.log('\n9. Testing Responding to Expired, Closed, or Matched Posts...');

expectThrow(() => {
  friendlyFeedService.respondToPost(
    postForAccept.id,
    {
      responderTeamId: 'team-f2',
      message: 'Trying to respond to matched post'
    },
    sessionCap2,
    cap2Teams
  );
}, 'Responding to Matched post rejected with 400', 400);

// Close fpost-2
const closeResult = friendlyFeedService.closePost('fpost-2', { id: 'user-cap-coep' });
assert(closeResult.post.status === 'Closed', 'Author successfully closed post fpost-2');

expectThrow(() => {
  friendlyFeedService.respondToPost(
    'fpost-2',
    {
      responderTeamId: 'team-f1',
      message: 'Trying to respond to closed post'
    },
    sessionCap1,
    cap1Teams
  );
}, 'Responding to Closed post rejected with 400', 400);

// -------------------------------------------------------------
// 10. Saved Posts & Bookmarking
// -------------------------------------------------------------
console.log('\n10. Testing Saved Posts Bookmarking...');

const save1 = friendlyFeedService.toggleSavePost('fpost-3', sessionCap1);
assert(save1.isSaved === true, 'Post successfully saved/bookmarked');

const savedList = friendlyFeedService.getPosts({ tab: 'saved' }, sessionCap1);
assert(savedList.posts.some((p) => p.id === 'fpost-3'), 'Saved post appears in "saved" tab query');

const save2 = friendlyFeedService.toggleSavePost('fpost-3', sessionCap1);
assert(save2.isSaved === false, 'Post successfully toggled off/un-saved');

// -------------------------------------------------------------
// 11. Content Reporting & Moderation
// -------------------------------------------------------------
console.log('\n11. Testing Content Reporting & Moderation...');

const repResult = friendlyFeedService.submitReport(
  {
    targetType: 'post',
    targetId: 'fpost-3',
    reason: 'Incorrect details',
    details: 'Ground is under maintenance'
  },
  sessionCap1
);
assert(repResult.success === true, 'Report successfully submitted');

// Duplicate report from same user should be acknowledged without duplicate spam
const dupRep = friendlyFeedService.submitReport(
  {
    targetType: 'post',
    targetId: 'fpost-3',
    reason: 'Incorrect details'
  },
  sessionCap1
);
assert(dupRep.success === true, 'Duplicate report gracefully handled');

// Moderator removes post
const removed = friendlyFeedService.removePost('fpost-3', sessionMod);
assert(removed.status === 'Removed', 'Moderator successfully removed post');

// Removed post must not appear in public feed
const feedAfterRemoval = friendlyFeedService.getPosts({ tab: 'feed' }, null);
assert(!feedAfterRemoval.posts.some((p) => p.id === 'fpost-3'), 'Removed post excluded from public feed');

// -------------------------------------------------------------
// 12. Expiry Calculation
// -------------------------------------------------------------
console.log('\n12. Testing Expiry Calculation...');

const now = new Date('2026-11-01T00:00:00Z');
const expiry1 = computePostExpiry(['2026-11-10'], now);
assert(expiry1 === '2026-11-09T00:00:00.000Z', 'Expiry correctly calculated as 1 day before preferred date');

const expiryDefault = computePostExpiry(['2026-12-01'], now);
assert(
  expiryDefault === '2026-11-15T00:00:00.000Z',
  'Expiry capped at 14 days when preferred date is far in future'
);

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

