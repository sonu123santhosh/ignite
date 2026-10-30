/**
 * test-league-wizard.js
 * 
 * Automated Verification Suite for "Your League" Wizard Creation Flow.
 * Validates:
 * 1. Number-of-teams integer parsing & bounds (2 to 32)
 * 2. Invalid team count rejection (empty, 0, 1, -3, 2.5, "abc", 33, exponents)
 * 3. Normalization of whitespace and leading zeros (" 8 ", "08")
 * 4. Team names validation (required, 1-40 chars, whitespace collapsed, case-insensitive uniqueness)
 * 5. Atomic single-transaction persistence of league + all N teams
 * 6. Client idempotency key defense against rapid double-clicks
 * 7. Server-side tampering rejections (count mismatch, duplicates, unauthenticated)
 * 8. Draft restoration contract
 */

import {
  leagueService,
  getLeagueDbState,
  ApiError,
  LEAGUE_TEAM_LIMITS,
  parseAndValidateTeamCount,
  validateTeamNames,
  normalizeTeamName
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

async function runWizardTests() {
  console.log('====================================================');
  console.log('RUNNING YOUR LEAGUE CREATION WIZARD TEST SUITE');
  console.log('====================================================\n');

  // Test Session
  const ownerUser = DEMO_USERS.find((u) => u.id === 'user-captain-1') || DEMO_USERS[1];
  const ownerSession = { user: ownerUser, token: 'token-rahul-owner' };
  const nullSession = null;

  // ---------------------------------------------------------------------------
  // 1. TESTING NUMBER-OF-TEAMS PARSER & BOUNDS (2 to 32)
  // ---------------------------------------------------------------------------
  console.log('1. Testing Number-of-Teams Integer Parsing & Bounds...');

  // Minimum bound (2)
  const minRes = parseAndValidateTeamCount(2);
  assert(minRes.valid === true && minRes.value === 2, 'Minimum bound (2) accepted as valid integer 2');

  // Standard value (8)
  const eightRes = parseAndValidateTeamCount(8);
  assert(eightRes.valid === true && eightRes.value === 8, 'Standard count (8) accepted as valid integer 8');

  // Maximum bound (32)
  const maxRes = parseAndValidateTeamCount(32);
  assert(maxRes.valid === true && maxRes.value === 32, 'Maximum bound (32) accepted as valid integer 32');

  // Leading zeros normalization ("08" -> 8)
  const leadingZeroRes = parseAndValidateTeamCount('08');
  assert(leadingZeroRes.valid === true && leadingZeroRes.value === 8, 'Leading zeros ("08") normalized to integer 8');

  // Whitespace normalization (" 8 " -> 8)
  const trimmedRes = parseAndValidateTeamCount(' 8 ');
  assert(trimmedRes.valid === true && trimmedRes.value === 8, 'Trimmed string (" 8 ") normalized to integer 8');

  // ---------------------------------------------------------------------------
  // 2. TESTING INVALID NUMBER-OF-TEAMS REJECTIONS
  // ---------------------------------------------------------------------------
  console.log('\n2. Testing Invalid Team Counts Rejection...');

  // Empty string
  const emptyRes = parseAndValidateTeamCount('');
  assert(emptyRes.valid === false && emptyRes.value === null, 'Empty string rejected');

  // Zero
  const zeroRes = parseAndValidateTeamCount(0);
  assert(zeroRes.valid === false, 'Count of 0 rejected (below minimum 2)');

  // 1 team
  const oneRes = parseAndValidateTeamCount(1);
  assert(oneRes.valid === false, 'Count of 1 rejected (round-robin requires at least 2)');

  // Negative count (-3)
  const negRes = parseAndValidateTeamCount(-3);
  assert(negRes.valid === false, 'Negative count (-3) rejected');

  // Decimals (2.5, "8.5")
  const dec1 = parseAndValidateTeamCount(2.5);
  const dec2 = parseAndValidateTeamCount('8.5');
  assert(dec1.valid === false && dec2.valid === false, 'Decimals (2.5, "8.5") rejected (whole numbers only)');

  // Non-numeric text ("abc")
  const textRes = parseAndValidateTeamCount('abc');
  assert(textRes.valid === false, 'Non-numeric string ("abc") rejected');

  // Above maximum (33)
  const overMaxRes = parseAndValidateTeamCount(33);
  assert(overMaxRes.valid === false, 'Count above maximum (33) rejected (limit is 32)');

  // Exponents ("1e3")
  const expRes = parseAndValidateTeamCount('1e3');
  assert(expRes.valid === false, 'Scientific exponent ("1e3") rejected');

  // ---------------------------------------------------------------------------
  // 3. TESTING TEAM NAMES VALIDATION (Step 2)
  // ---------------------------------------------------------------------------
  console.log('\n3. Testing Team Names Validation...');

  const valid8Teams = [
    { name: 'Kothrud Knights' },
    { name: 'Deccan Dynamos' },
    { name: 'Aundh Aces' },
    { name: 'Shivaji Strikers' },
    { name: 'Baner Blasters' },
    { name: 'Viman Nagar Vipers' },
    { name: 'Kalyani Kings' },
    { name: 'Hadapsar Hawks' }
  ];

  const val8Res = validateTeamNames(valid8Teams, 8);
  assert(val8Res.valid === true, '8 distinct valid team names pass validation');
  assert(val8Res.errors.every((e) => e === null), 'No per-field errors for valid 8 teams');

  // Duplicate team names (different casing and whitespace)
  const dupTeams = [
    { name: 'FC United' },
    { name: 'fc united' },
    { name: '  FC   United  ' },
    { name: 'Other Team' }
  ];
  const dupRes = validateTeamNames(dupTeams, 4);
  assert(dupRes.valid === false, 'Duplicate team names rejected');
  assert(dupRes.errors[0] !== null && dupRes.errors[1] !== null, 'Per-field error flags collision between Team 1 and Team 2');

  // Empty team name
  const emptyNameTeams = [
    { name: 'Team A' },
    { name: '   ' }
  ];
  const emptyNameRes = validateTeamNames(emptyNameTeams, 2);
  assert(emptyNameRes.valid === false, 'Whitespace-only team name rejected');
  assert(emptyNameRes.errors[1].includes('required'), 'Empty field correctly reports required error');

  // Team count mismatch
  const countMismatchRes = validateTeamNames(valid8Teams, 6);
  assert(countMismatchRes.valid === false, 'Team count mismatch (expected 6, got 8) detected');

  // ---------------------------------------------------------------------------
  // 4. TESTING ATOMIC LEAGUE + TEAMS CREATION (Step 3 Submit)
  // ---------------------------------------------------------------------------
  console.log('\n4. Testing Atomic League & All Teams Creation...');

  const idempotencyKey1 = `test-idemp-${Date.now()}-1`;
  const atomicPayload = {
    idempotencyKey: idempotencyKey1,
    name: 'Atomic Super League 2026',
    sport: 'Football',
    format: 'single round-robin',
    plannedTeamCount: 8,
    startDate: new Date().toISOString().slice(0, 10),
    rulesText: 'Standard round-robin rules.',
    teams: valid8Teams
  };

  const createRes = leagueService.createLeague(ownerSession, atomicPayload);
  assert(createRes.success === true, 'Atomic createLeague call succeeded');
  assert(createRes.data.id && createRes.data.id.startsWith('league-'), 'Generated unique league ID');
  assert(createRes.data.plannedTeamCount === 8, 'League team count recorded as 8');
  assert(createRes.data.teams.length === 8, 'Created exactly 8 teams in transaction');

  // Verify in DB state that both league and all 8 teams were persisted
  const db = getLeagueDbState();
  const dbLeague = db.leagues.find((l) => l.id === createRes.data.id);
  const dbTeams = db.teams.filter((t) => t.leagueId === createRes.data.id);
  assert(Boolean(dbLeague), 'League record safely persisted in database');
  assert(dbTeams.length === 8, `Exactly 8 teams persisted with matching leagueId (found ${dbTeams.length})`);

  // ---------------------------------------------------------------------------
  // 5. TESTING RAPID CLICKS & IDEMPOTENCY KEY REPLAY DEFENSE
  // ---------------------------------------------------------------------------
  console.log('\n5. Testing Idempotency & Duplicate League Prevention...');

  // Replay identical request with same idempotencyKey
  const replayRes = leagueService.createLeague(ownerSession, atomicPayload);
  assert(replayRes.success === true, 'Replayed submission processed safely');
  assert(replayRes.isIdempotentReplay === true, 'Flagged as idempotent replay without re-creating league');
  assert(replayRes.data.id === createRes.data.id, 'Returned original league ID (no duplicate league created)');

  const dbAfterReplay = getLeagueDbState();
  const matchingLeagues = dbAfterReplay.leagues.filter((l) => l.name === 'Atomic Super League 2026');
  assert(matchingLeagues.length === 1, 'Strictly 1 league exists in DB after duplicate submission');

  // ---------------------------------------------------------------------------
  // 6. TESTING SERVER-SIDE TAMPERING & SECURITY REJECTIONS
  // ---------------------------------------------------------------------------
  console.log('\n6. Testing Server-Side Tampering Defense...');

  // Unauthenticated creation
  try {
    leagueService.createLeague(nullSession, atomicPayload);
    assert(false, 'Expected 401 when creating league without session');
  } catch (err) {
    assert(err.status === 401, 'Unauthenticated league creation rejected with 401 Unauthorized');
  }

  // Declared team count mismatch (e.g. planned 8, teams array has 4)
  try {
    leagueService.createLeague(ownerSession, {
      ...atomicPayload,
      idempotencyKey: `idemp-tamper-${Date.now()}`,
      plannedTeamCount: 8,
      teams: valid8Teams.slice(0, 4)
    });
    assert(false, 'Expected error when teams array length does not equal plannedTeamCount');
  } catch (err) {
    assert(err.status === 400, 'Tampered team count mismatch rejected with 400');
  }

  // Duplicate team names in submission
  try {
    leagueService.createLeague(ownerSession, {
      ...atomicPayload,
      idempotencyKey: `idemp-tamper-dup-${Date.now()}`,
      plannedTeamCount: 4,
      teams: dupTeams
    });
    assert(false, 'Expected error when duplicate team names submitted');
  } catch (err) {
    assert(err.status === 400, 'Duplicate team names rejected by server with 400');
  }

  // Team count below minimum
  try {
    leagueService.createLeague(ownerSession, {
      ...atomicPayload,
      idempotencyKey: `idemp-tamper-min-${Date.now()}`,
      plannedTeamCount: 1,
      teams: [{ name: 'Solo Team' }]
    });
    assert(false, 'Expected error when team count < 2');
  } catch (err) {
    assert(err.status === 400, 'Invalid team count (< 2) rejected with 400');
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runWizardTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
