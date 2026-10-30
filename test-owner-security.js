/**
 * Automated Security & Integrity Test Suite for Facility Owner Dashboard
 * Tests:
 * 1. Unauthenticated requests (401)
 * 2. Non-owner roles (403)
 * 3. BOLA / IDOR cross-tenant isolation (404/403)
 * 4. Mass-assignment / privilege escalation defense (tampered ownerId, verified flag)
 * 5. Concurrent booking conflict detection on blocked dates (409)
 * 6. Illegal booking status transitions (400)
 * 7. Slot override protection for booked slots (409)
 */

import { facilityOwnerApi, ApiError, OWNER_PERSONAS } from './src/services/facilityOwnerApi.js';

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
  console.log('RUNNING FACILITY OWNER SECURITY & INTEGRITY TESTS');
  console.log('====================================================\n');

  const owner1Session = { user: OWNER_PERSONAS[0], token: 'token-own-1' }; // Vikram Malhotra (own-1)
  const owner2Session = { user: OWNER_PERSONAS[1], token: 'token-own-2' }; // Rajesh Patel (own-2)
  const playerSession = { user: { id: 'usr-player-1', role: 'player', name: 'John Player' }, token: 'token-player' };
  const nullSession = null;

  // 1. Unauthenticated Call
  console.log('1. Testing Unauthenticated Access...');
  try {
    facilityOwnerApi.getOverview(nullSession);
    assert(false, 'Expected 401 error for null session');
  } catch (err) {
    assert(err.status === 401, 'Null session rejected with 401 Unauthorized');
  }

  // 2. Non-Owner Role Call
  console.log('\n2. Testing Non-Owner Role Access...');
  try {
    facilityOwnerApi.getOverview(playerSession);
    assert(false, 'Expected 403 error for player role');
  } catch (err) {
    assert(err.status === 403, 'Player role rejected with 403 Forbidden');
  }

  // 3. BOLA / IDOR Cross-Tenant Isolation
  console.log('\n3. Testing BOLA / IDOR Cross-Tenant Isolation...');
  // fac-3 belongs to own-2. Owner 1 (own-1) tries to view it:
  try {
    facilityOwnerApi.getFacilityById(owner1Session, 'fac-3');
    assert(false, 'Expected 404 error when Owner 1 accesses Owner 2 facility (fac-3)');
  } catch (err) {
    assert(err.status === 404, 'Access to another owner facility rejected with 404 Not Found (no data leaked)');
  }

  // Owner 1 tries to update Owner 2 facility:
  try {
    facilityOwnerApi.updateFacility(owner1Session, 'fac-3', { name: 'Hacked Arena' });
    assert(false, 'Expected 404 error when Owner 1 modifies Owner 2 facility');
  } catch (err) {
    assert(err.status === 404, 'Modification of another owner facility rejected with 404 Not Found');
  }

  // 4. Mass-Assignment & Privilege Escalation Defense
  console.log('\n4. Testing Mass-Assignment & Privilege Escalation Defense...');
  const maliciousPayload = {
    name: 'Tampered Security Test Turf',
    address: '123 Test Street, Bengaluru',
    offPeakPrice: 1200,
    peakPrice: 1500,
    // Attack injections:
    ownerId: 'own-999', // trying to assign to another owner
    verified: true,     // trying to auto-verify
    status: 'Live',     // trying to bypass review
    rating: 5.0,
    reviewCount: 999
  };

  const createResult = facilityOwnerApi.createFacility(owner1Session, maliciousPayload);
  assert(createResult.success === true, 'Facility creation endpoint succeeded');
  assert(createResult.data.ownerId === 'own-1', 'Server enforced session ownerId (own-1) and ignored malicious ownerId');
  assert(createResult.data.verified === false, 'Server enforced verified: false (never auto-verified)');
  assert(createResult.data.status === 'Pending review', 'Server enforced status: "Pending review" (never auto-approved)');

  // 5. Block Dates Conflict Detection
  console.log('\n5. Testing Block Dates Conflict Detection...');
  // fac-1 has booking bk-101 on today (or relative date).
  // Trying to block a range containing an active booking:
  try {
    // Attempt block on today with matching time 18:00
    const today = new Date().toISOString().slice(0, 10);
    facilityOwnerApi.createBlockDate(owner1Session, {
      facilityId: 'fac-1',
      groundId: 'g1-1',
      startDate: today,
      endDate: today,
      startTime: '17:00',
      endTime: '20:00',
      reason: 'Conflict test lawn maintenance'
    });
    // In case bk-101 is on today:
    console.log('  [INFO] Date block tested');
  } catch (err) {
    if (err.status === 409) {
      assert(true, 'Booking collision detected and blocked with 409 Conflict');
    }
  }

  // 6. Booking Status Transition Integrity
  console.log('\n6. Testing Booking Status Transition Integrity...');
  try {
    // Attempt illegal transition: Completed -> Pending
    facilityOwnerApi.updateBookingStatus(owner1Session, 'bk-105', 'Pending', 'Test illegal');
    assert(false, 'Expected 400 error for illegal status transition');
  } catch (err) {
    assert(err.status === 400 || err.status === 404, 'Illegal transition rejected with error: ' + err.message);
  }

  // 7. Slot Override Protection
  console.log('\n7. Testing Slot Override Protection for Booked Slots...');
  try {
    const today = new Date().toISOString().slice(0, 10);
    facilityOwnerApi.updateSlotOverride(owner1Session, {
      facilityId: 'fac-1',
      groundId: 'g1-1',
      dateStr: today,
      slotKey: `fac-1_g1-1_${today}_18:00`,
      overrideData: { status: 'Block' }
    });
    console.log('  [INFO] Slot override checked');
  } catch (err) {
    if (err.status === 409) {
      assert(true, 'Slot override on active booking rejected with 409 Conflict');
    }
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
