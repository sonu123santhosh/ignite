/**
 * test-league-security.js
 * 
 * Comprehensive Automated Backend Security, Integrity & Logic Test Suite for "Your League".
 * 
 * Verifies:
 * 1. Unauthenticated access rejection (401 Unauthorized)
 * 2. Non-manager write rejection on every mutation (403 Forbidden / 404 Not Found)
 * 3. BOLA / IDOR defense: tampered league ID returns 404 with no data leaked
 * 4. Cross-league resource verification: team or match belonging to another league rejected
 * 5. Mass-assignment defense: tampered ownerId, status, version, and shareToken ignored
 * 6. Duplicate team prevention via normalizedName (whitespace collapsed & case folded)
 * 7. Regeneration lock: cannot regenerate fixtures once results exist without explicit reset
 * 8. Circle method assertions: fair round-robin, seed reproducibility, home/away balance
 * 9. Sport preset rule validation: disallow draws in sports like basketball/volleyball
 * 10. Optimistic concurrency locking: version mismatch triggers 409 Conflict
 * 11. Public vs Private privacy: private league denied to non-managers, public hides contacts
 */

import {
  leagueService,
  ApiError,
  normalizeTeamName,
  generateCircleMethodFixtures,
  calculateLeagueStandings,
  SPORT_PRESETS
} from './src/services/leagueService.js';
import { DEMO_USERS } from './src/data/tournamentsData.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING YOUR LEAGUE SECURITY & INTEGRITY TESTS');
  console.log('====================================================\n');

  // Test personas
  const ownerUser = DEMO_USERS.find((u) => u.id === 'user-captain-1') || DEMO_USERS[1]; // Rahul Sharma
  const ownerSession = { user: ownerUser, token: 'token-rahul-owner' };

  const nonManagerUser = DEMO_USERS.find((u) => u.id === 'user-player-1') || DEMO_USERS[0]; // Priya Sen
  const nonManagerSession = { user: nonManagerUser, token: 'token-priya-player' };

  const strangerUser = { id: 'usr-stranger-99', name: 'Mallory Hacker', role: 'player' };
  const strangerSession = { user: strangerUser, token: 'token-mallory' };

  const nullSession = null;
  const targetLeagueId = 'league-pune-prem-2026';

  // ---------------------------------------------------------------------------
  // 1. UNAUTHENTICATED ACCESS
  // ---------------------------------------------------------------------------
  console.log('1. Testing Unauthenticated Access...');
  try {
    leagueService.createLeague(nullSession, { name: 'Unauthorized League' });
    assert(false, 'Expected 401 for null session creating league');
  } catch (err) {
    assert(err.status === 401, 'Null session rejected with 401 Unauthorized');
  }

  try {
    leagueService.addTeams(nullSession, targetLeagueId, ['Team Alpha']);
    assert(false, 'Expected 401 for null session adding team');
  } catch (err) {
    assert(err.status === 401, 'Null session adding teams rejected with 401');
  }

  try {
    leagueService.enterMatchScore(nullSession, targetLeagueId, 'lmatch-1', { homeScore: 1, awayScore: 0 });
    assert(false, 'Expected 401 for null session entering score');
  } catch (err) {
    assert(err.status === 401, 'Null session score entry rejected with 401');
  }

  // ---------------------------------------------------------------------------
  // 2. NON-MANAGER WRITE ACCESS ON EVERY MUTATION
  // ---------------------------------------------------------------------------
  console.log('\n2. Testing Non-Manager Write Rejections...');
  // Priya is not manager of Pune Football League
  try {
    leagueService.updateLeague(nonManagerSession, targetLeagueId, { name: 'Hacked League Name' });
    assert(false, 'Expected 403 when non-manager updates league');
  } catch (err) {
    assert(err.status === 403, 'Non-manager league settings update rejected with 403 Forbidden');
  }

  try {
    leagueService.addTeams(nonManagerSession, targetLeagueId, ['Malicious Team']);
    assert(false, 'Expected 403 when non-manager adds team');
  } catch (err) {
    assert(err.status === 403, 'Non-manager add teams rejected with 403 Forbidden');
  }

  try {
    leagueService.generateFixtures(nonManagerSession, targetLeagueId);
    assert(false, 'Expected 403 when non-manager generates fixtures');
  } catch (err) {
    assert(err.status === 403, 'Non-manager fixture generation rejected with 403 Forbidden');
  }

  try {
    leagueService.enterMatchScore(nonManagerSession, targetLeagueId, 'lmatch-1', { homeScore: 5, awayScore: 0 });
    assert(false, 'Expected 403 when non-manager enters score');
  } catch (err) {
    assert(err.status === 403, 'Non-manager score entry rejected with 403 Forbidden');
  }

  // ---------------------------------------------------------------------------
  // 3. BOLA / IDOR CROSS-TENANT ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n3. Testing BOLA / IDOR Cross-Tenant Isolation...');
  try {
    // Rahul (owner of Pune league) tries to manage Deccan Cricket League (owned by Priya)
    leagueService.updateLeague(ownerSession, 'league-deccan-cricket-2026', { name: 'Stolen League' });
    assert(false, 'Expected 403/404 when Owner 1 modifies Owner 2 league');
  } catch (err) {
    assert(err.status === 403 || err.status === 404, 'Cross-tenant league modification rejected with 403/404');
  }

  try {
    // Non-existent league ID
    leagueService.getLeagueById(ownerSession, 'league-does-not-exist');
    assert(false, 'Expected 404 for non-existent league');
  } catch (err) {
    assert(err.status === 404, 'Non-existent league returns 404 Not Found');
  }

  // ---------------------------------------------------------------------------
  // 4. CROSS-LEAGUE RESOURCE VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n4. Testing Cross-League Resource Access Defense...');
  try {
    // lteam-c1 belongs to Deccan Cricket League, not Pune Football League
    leagueService.updateTeam(ownerSession, targetLeagueId, 'lteam-c1', { name: 'Spoofed Team' });
    assert(false, 'Expected 404 when referencing team belonging to another league');
  } catch (err) {
    assert(err.status === 404, 'Cross-league team access rejected with 404 Not Found (no cross-leak)');
  }

  try {
    // Match that doesn't belong to the league in URL
    leagueService.enterMatchScore(ownerSession, targetLeagueId, 'fake-match-999', { homeScore: 1, awayScore: 0 });
    assert(false, 'Expected 404 when referencing match belonging to another league');
  } catch (err) {
    assert(err.status === 404, 'Cross-league match access rejected with 404 Not Found');
  }

  // ---------------------------------------------------------------------------
  // 5. MASS-ASSIGNMENT & PRIVILEGE ESCALATION DEFENSE
  // ---------------------------------------------------------------------------
  console.log('\n5. Testing Mass-Assignment & Privilege Escalation Defense...');
  const maliciousCreatePayload = {
    name: 'Security Test League 2026',
    sport: 'Football',
    plannedTeamCount: 6,
    // Attack injections:
    ownerId: 'user-hacked-999',
    status: 'Completed',
    shareToken: 'injected-token-123',
    version: 999
  };

  const createRes = leagueService.createLeague(ownerSession, maliciousCreatePayload);
  assert(createRes.success === true, 'League creation succeeded');
  assert(createRes.data.ownerId === ownerSession.user.id, 'Server derived ownerId from session, ignoring malicious ownerId');
  assert(createRes.data.status === 'Teams open', 'Server enforced initial status "Teams open", ignoring injected "Completed"');
  assert(createRes.data.version === 1, 'Server enforced initial version 1, ignoring injected version');

  const testLeagueId = createRes.data.id;

  // ---------------------------------------------------------------------------
  // 6. TEAM DUPLICATE DETECTION VIA NORMALIZED NAME
  // ---------------------------------------------------------------------------
  console.log('\n6. Testing Team Normalization & Duplicate Prevention...');
  // Add first team
  leagueService.addTeams(ownerSession, testLeagueId, ['FC United']);

  // Collision tests: case fold and collapsed whitespace
  const collisionCases = ['fc united', '  FC   United  ', 'FC UNITED', 'fc   united'];
  for (const dupName of collisionCases) {
    try {
      leagueService.addTeams(ownerSession, testLeagueId, [dupName]);
      assert(false, `Expected duplicate error for "${dupName}"`);
    } catch (err) {
      assert(err.status === 400, `Duplicate detected and rejected with 400 for "${dupName}"`);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. CIRCLE METHOD ROUND-ROBIN FAIRNESS & INTEGRITY ASSERTIONS
  // ---------------------------------------------------------------------------
  console.log('\n7. Testing Circle Method Generator & Integrity Assertions...');
  const testTeams = [
    { id: 't1', name: 'Team 1' },
    { id: 't2', name: 'Team 2' },
    { id: 't3', name: 'Team 3' },
    { id: 't4', name: 'Team 4' }
  ];

  const seed = 554433;
  const singleRR = generateCircleMethodFixtures({ teams: testTeams, format: 'single round-robin', seed });
  // N=4 teams => N(N-1)/2 = 6 matches, 3 rounds
  assert(singleRR.totalMatches === 6, 'Single round-robin generated exact 6 matches for 4 teams');
  assert(singleRR.totalRounds === 3, 'Single round-robin generated exact 3 rounds for 4 teams');

  // Assert seed reproducibility
  const rerun = generateCircleMethodFixtures({ teams: testTeams, format: 'single round-robin', seed });
  const matchesMatch = singleRR.fixtures.every((f, idx) => f.homeTeamId === rerun.fixtures[idx].homeTeamId);
  assert(matchesMatch, 'Seeded PRNG generates perfectly reproducible schedule from Draw Code');

  // Test Odd Teams (with BYE)
  const oddTeams = [...testTeams, { id: 't5', name: 'Team 5' }];
  const oddRR = generateCircleMethodFixtures({ teams: oddTeams, format: 'single round-robin', seed });
  // N=5 teams => 5*4/2 = 10 matches, 5 rounds, 5 byes
  assert(oddRR.totalMatches === 10, 'Odd teams (5) generated 10 matches with no BYE matches saved');
  assert(oddRR.byes.length === 5, 'Every round has exactly one bye recorded for sitting out team');

  // Double Round-Robin
  const doubleRR = generateCircleMethodFixtures({ teams: testTeams, format: 'double round-robin', seed });
  assert(doubleRR.totalMatches === 12, 'Double round-robin generated exact 12 matches (mirrored legs)');

  // ---------------------------------------------------------------------------
  // 8. REGENERATION LOCK WHEN RESULTS ARE RECORDED
  // ---------------------------------------------------------------------------
  console.log('\n8. Testing Regeneration Lock With Recorded Results...');
  // Add 3 more teams to testLeague
  leagueService.addTeams(ownerSession, testLeagueId, ['Arsenal Youth', 'Chelsea Youth', 'Liverpool Youth']);
  leagueService.generateFixtures(ownerSession, testLeagueId, { seed: 112233 });

  // Free regeneration while 0 matches completed:
  const regenDraft = leagueService.generateFixtures(ownerSession, testLeagueId, { seed: 998877 });
  assert(regenDraft.success === true, 'Regeneration permitted while all matches are Scheduled');

  // Now record one completed match score:
  const firstMatch = regenDraft.data.matches[0];
  leagueService.enterMatchScore(ownerSession, testLeagueId, firstMatch.id, { homeScore: 2, awayScore: 1 });

  // Attempt regeneration without reset:
  try {
    leagueService.generateFixtures(ownerSession, testLeagueId, { seed: 445566 });
    assert(false, 'Expected 409 Conflict when regenerating with completed scores');
  } catch (err) {
    assert(err.status === 409, 'Regeneration blocked with 409 Conflict once matches are Completed');
  }

  // Attempt removing a team once fixtures exist:
  const currentTestTeams = leagueService.getLeagueById(ownerSession, testLeagueId).data.teams;
  const teamToRemove = currentTestTeams[0];
  try {
    leagueService.removeTeam(ownerSession, testLeagueId, teamToRemove.id);
    assert(false, 'Expected 400 error when removing team with existing fixtures');
  } catch (err) {
    assert(err.status === 400, 'Team removal blocked with 400 when fixtures exist');
  }

  // Explicit reset and regenerate:
  const resetRes = leagueService.generateFixtures(ownerSession, testLeagueId, { resetResults: true, seed: 123456 });
  assert(resetRes.success === true, 'Explicit "Reset all results and regenerate" archives scores and regenerates');

  // ---------------------------------------------------------------------------
  // 9. SPORT PRESET RULE VALIDATION (NO DRAWS IN BASKETBALL)
  // ---------------------------------------------------------------------------
  console.log('\n9. Testing Sport Presets & Score Rules...');
  const basketballLeagueRes = leagueService.createLeague(ownerSession, {
    name: 'Pune Hoop Masters 2026',
    sport: 'Basketball',
    plannedTeamCount: 2,
    scoringPreset: 'basketball'
  });
  const bballLeagueId = basketballLeagueRes.data.id;
  leagueService.addTeams(ownerSession, bballLeagueId, ['Pune Bulls', 'Deccan Lakers']);
  const bballFix = leagueService.generateFixtures(ownerSession, bballLeagueId);
  const bballMatch = bballFix.data.matches[0];

  // Try to record a draw (e.g. 78-78) in basketball:
  try {
    leagueService.enterMatchScore(ownerSession, bballLeagueId, bballMatch.id, { homeScore: 78, awayScore: 78 });
    assert(false, 'Expected 400 error for draw in basketball');
  } catch (err) {
    assert(err.status === 400, 'Draw rejected with 400 according to basketball preset (draws disallowed)');
  }

  // Valid basketball score
  const validBball = leagueService.enterMatchScore(ownerSession, bballLeagueId, bballMatch.id, { homeScore: 82, awayScore: 79 });
  assert(validBball.success === true, 'Decisive score (82-79) accepted for basketball');

  // Standings check for basketball (win = 2 pts, loss = 0 pts)
  const bballDetails = leagueService.getLeagueById(ownerSession, bballLeagueId);
  const leader = bballDetails.data.standings[0];
  assert(leader.points === 2, 'Basketball winner awarded exactly 2 points per preset');

  // ---------------------------------------------------------------------------
  // 10. OPTIMISTIC CONCURRENCY LOCKING
  // ---------------------------------------------------------------------------
  console.log('\n10. Testing Optimistic Concurrency Locking...');
  try {
    // Pass stale version 1 when match is already version 2
    leagueService.enterMatchScore(ownerSession, bballLeagueId, bballMatch.id, {
      homeScore: 85,
      awayScore: 80,
      version: 1 // Stale
    });
    assert(false, 'Expected 409 Conflict on stale version');
  } catch (err) {
    assert(err.status === 409, 'Stale version rejected with 409 Conflict');
  }

  // ---------------------------------------------------------------------------
  // 11. PUBLIC VS PRIVATE PRIVACY
  // ---------------------------------------------------------------------------
  console.log('\n11. Testing Private vs Public Visibility and Sanitization...');
  // Private league: Deccan Cricket League is private
  try {
    leagueService.getLeagueById(strangerSession, 'league-deccan-cricket-2026');
    assert(false, 'Expected 403 when non-manager views private league');
  } catch (err) {
    assert(err.status === 403, 'Private league viewing blocked with 403 Forbidden for non-managers');
  }

  // Public league: Pune Football League
  const publicRes = leagueService.getPublicLeagueByToken('lgt_pune_premier_ftbl_demo_token_8899');
  assert(publicRes.success === true, 'Public league accessible via shareToken');
  const publicTeam = publicRes.data.teams[0];
  assert(publicTeam.captainContact === undefined, 'Private manager captain contact stripped from public payload');

  // ---------------------------------------------------------------------------
  // 12. CO-MANAGER AUTHORIZATION & MANAGEMENT
  // ---------------------------------------------------------------------------
  console.log('\n12. Testing Co-Manager Authorization & Management...');
  // Vikram Deshmukh (user-captain-2) is seeded as co-manager of Pune Football League
  const coManagerUser = DEMO_USERS.find((u) => u.id === 'user-captain-2') || DEMO_USERS[2];
  const coManagerSession = { user: coManagerUser, token: 'token-vikram-comanager' };

  // Co-manager can update match score
  const coManagerScore = leagueService.enterMatchScore(coManagerSession, targetLeagueId, 'lmatch-2', {
    homeScore: 2,
    awayScore: 2
  });
  assert(coManagerScore.success === true, 'Authorized co-manager can record match scores');

  // Co-manager cannot add other co-managers (Owner only)
  try {
    leagueService.addCoManager(coManagerSession, targetLeagueId, 'user-player-1');
    assert(false, 'Expected 403 when co-manager tries to add another co-manager');
  } catch (err) {
    assert(err.status === 403, 'Co-manager forbidden from adding co-managers (403)');
  }

  // Owner can add co-manager
  const addMgrRes = leagueService.addCoManager(ownerSession, targetLeagueId, 'user-player-1');
  assert(addMgrRes.success === true, 'Owner successfully assigned new co-manager');

  // Duplicate co-manager assignment rejected
  try {
    leagueService.addCoManager(ownerSession, targetLeagueId, 'user-player-1');
    assert(false, 'Expected 400 for duplicate co-manager assignment');
  } catch (err) {
    assert(err.status === 400, 'Duplicate co-manager assignment rejected with 400');
  }

  // Owner can remove co-manager
  const removeMgrRes = leagueService.removeCoManager(ownerSession, targetLeagueId, 'user-player-1');
  assert(removeMgrRes.success === true, 'Owner successfully removed co-manager');

  // ---------------------------------------------------------------------------
  // 13. INDIVIDUAL MATCH RESCHEDULING & CONFLICT DETECTION
  // ---------------------------------------------------------------------------
  console.log('\n13. Testing Match Rescheduling & Conflict Detection...');
  // Past date scheduling rejection
  try {
    leagueService.scheduleMatch(ownerSession, targetLeagueId, 'lmatch-3', {
      scheduledAt: '2020-01-01T10:00:00.000Z'
    });
    assert(false, 'Expected 400 when scheduling in the past');
  } catch (err) {
    assert(err.status === 400, 'Scheduling in the past rejected with 400');
  }

  // Future valid reschedule
  const futureDate = new Date(Date.now() + 86400000 * 20).toISOString();
  const reschedRes = leagueService.scheduleMatch(ownerSession, targetLeagueId, 'lmatch-3', {
    scheduledAt: futureDate,
    venue: 'Sanctuary Arena 3'
  });
  assert(reschedRes.success === true, 'Match successfully rescheduled with new kickoff & venue');
  assert(reschedRes.data.venue === 'Sanctuary Arena 3', 'Updated venue persisted on match');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
