/**
 * test-cost-split-security.js
 *
 * Standalone Security, Mathematical Integrity, and State-Machine Test Suite
 * for SportLink Group Cost Splitting.
 * Run directly via: node test-cost-split-security.js
 */

import {
  calculateEqualSplit,
  validateCustomSplit,
  validateParticipantCount,
  createBookingSplit,
  getSplitByBookingId,
  getPublicSplitByToken,
  updateBookingSplit,
  cancelSplitForBooking,
  revokeShareToken,
  generateShareText,
  generateWhatsAppUrl,
  resetSplitDbState,
  toPaise,
  toRupees
} from './src/services/costSplitService.js';

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

function expectThrow(fn, testName) {
  try {
    fn();
    console.error(`  [FAIL] ${testName} (Expected exception but none thrown)`);
    failedTests++;
  } catch {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  }
}

console.log('====================================================');
console.log('RUNNING GROUP COST SPLITTING INTEGRITY & SECURITY TESTS');
console.log('====================================================\n');

function runTests() {
  resetSplitDbState();

  // ─── 1. Mathematical Split Integrity & Exact Paise Sums ─────────────────────
  console.log('1. Testing Mathematical Integer-Paise Split Integrity...');

  // Test 1: ₹2,400 / 6 = ₹400 each
  const total1 = toPaise(2400); // 240000 paise
  const split1 = calculateEqualSplit(total1, 6);
  assert(split1.length === 6, 'Count of 6 returns exactly 6 participants');
  assert(split1.every((p) => p.amountRupees === 400), '₹2,400 / 6 equals exactly ₹400 for each player');
  const sum1 = split1.reduce((acc, p) => acc + p.amountPaise, 0);
  assert(sum1 === total1, 'Sum of shares equals exact total of ₹2,400.00');

  // Test 2: ₹1,000 / 3 = ₹333.34, ₹333.33, ₹333.33
  const total2 = toPaise(1000); // 100000 paise
  const split2 = calculateEqualSplit(total2, 3);
  assert(split2[0].amountRupees === 333.34, 'Participant 1 receives the extra 1 paisa (₹333.34)');
  assert(split2[1].amountRupees === 333.33, 'Participant 2 receives base share (₹333.33)');
  assert(split2[2].amountRupees === 333.33, 'Participant 3 receives base share (₹333.33)');
  const sum2 = split2.reduce((acc, p) => acc + p.amountPaise, 0);
  assert(sum2 === total2, '₹1,000 / 3 sum of paise equals exact 100000 (₹1,000.00)');

  // Test 3: ₹100.01 / 7
  const total3 = toPaise(100.01); // 10001 paise
  const split3 = calculateEqualSplit(total3, 7);
  const sum3 = split3.reduce((acc, p) => acc + p.amountPaise, 0);
  assert(sum3 === total3, '₹100.01 / 7 sum of paise equals exact 10001 paise (₹100.01)');
  assert(split3.length === 7, '7 participants generated');

  // ─── 2. Participant Count Clamping & Boundary Validation ───────────────────
  console.log('\n2. Testing Participant Count Validation & Bounds (2 to 30)...');

  assert(validateParticipantCount(2).valid === true, 'Count = 2 is accepted (min bound)');
  assert(validateParticipantCount(30).valid === true, 'Count = 30 is accepted (max bound)');
  assert(validateParticipantCount(15).valid === true, 'Count = 15 is accepted');

  assert(validateParticipantCount(1).valid === false, 'Count = 1 rejected (< 2)');
  assert(validateParticipantCount(0).valid === false, 'Count = 0 rejected');
  assert(validateParticipantCount(-5).valid === false, 'Negative count rejected');
  assert(validateParticipantCount(31).valid === false, 'Count = 31 rejected (> 30)');
  assert(validateParticipantCount(3.5).valid === false, 'Decimal count 3.5 rejected');
  assert(validateParticipantCount('invalid').valid === false, 'Non-numeric string rejected');

  // ─── 3. Custom Share Validation ───────────────────────────────────────────
  console.log('\n3. Testing Custom Shares Validation...');

  const customTotal = toPaise(1500); // 150000 paise

  // Valid custom split (1000 + 500 = 1500)
  const validCustom = [
    { position: 1, amountPaise: 100000, name: 'Captain' },
    { position: 2, amountPaise: 50000, name: 'Friend' }
  ];
  const resValid = validateCustomSplit(customTotal, validCustom);
  assert(resValid.valid === true, 'Custom shares summing exactly to total are valid');

  // Short custom split (900 + 500 = 1400, short by 100)
  const shortCustom = [
    { position: 1, amountPaise: 90000, name: 'Captain' },
    { position: 2, amountPaise: 50000, name: 'Friend' }
  ];
  const resShort = validateCustomSplit(customTotal, shortCustom);
  assert(resShort.valid === false && resShort.remainingPaise === 10000, 'Custom shares short of total are rejected with remaining amount');

  // Over custom split (1100 + 500 = 1600, over by 100)
  const overCustom = [
    { position: 1, amountPaise: 110000, name: 'Captain' },
    { position: 2, amountPaise: 50000, name: 'Friend' }
  ];
  const resOver = validateCustomSplit(customTotal, overCustom);
  assert(resOver.valid === false && resOver.overPaise === 10000, 'Custom shares exceeding total are rejected with over amount');

  // Negative amount in custom split
  const negCustom = [
    { position: 1, amountPaise: -5000, name: 'Captain' },
    { position: 2, amountPaise: 155000, name: 'Friend' }
  ];
  const resNeg = validateCustomSplit(customTotal, negCustom);
  assert(resNeg.valid === false, 'Negative amounts in custom shares are rejected');

  // ─── 4. Persistence Linked to Booking Record ──────────────────────────────
  console.log('\n4. Testing Split Creation & Association to Booking...');

  const bookingId = 'SPL-998877';
  const newSplit = createBookingSplit({
    bookingId,
    facilityId: 'fac-1',
    facilityName: 'Padukone-Dravid Centre',
    groundName: 'Main Turf',
    date: '2026-11-05',
    time: '18:00',
    totalRupees: 1456,
    participantCount: 4,
    mode: 'equal',
    note: 'Bring team jerseys',
    creatorUserId: 'user-cap-1',
    creatorName: 'Rohan Deshmukh'
  });

  assert(newSplit.id.startsWith('split-'), 'Split record created with unique id');
  assert(newSplit.bookingId === bookingId, 'Split associated strictly with bookingId');
  assert(newSplit.participants.length === 4, 'Split created with 4 participants');
  assert(newSplit.status === 'Active', 'Initial status is Active');

  // Read back
  const retrieved = getSplitByBookingId(bookingId, 'user-cap-1');
  assert(retrieved !== null && retrieved.id === newSplit.id, 'Creator can retrieve split by bookingId');

  // ─── 5. Honesty Rule: Payment Status & Integrity ──────────────────────────
  console.log('\n5. Testing Honesty Rule (External Payments)...');

  assert(
    newSplit.participants.every((p) => p.paymentStatus === null),
    'Honesty Rule: All participants have null paymentStatus (no fake paid badges)'
  );

  // ─── 6. BOLA / IDOR Cross-Tenant Access Defense ───────────────────────────
  console.log('\n6. Testing BOLA / IDOR Security & Permission Restrictions...');

  // Another user attempts to read Rohan's split
  const crossRead = getSplitByBookingId(bookingId, 'malicious-user-2');
  assert(crossRead === null, 'Non-creator cannot read private booking split (returns null/403)');

  // Another user attempts to update Rohan's split
  expectThrow(
    () => updateBookingSplit(bookingId, { note: 'Tampered note' }, 'malicious-user-2'),
    'Non-creator cannot update split (throws unauthorized)'
  );

  // Creator can update split
  const updated = updateBookingSplit(bookingId, { note: 'Updated note by creator' }, 'user-cap-1');
  assert(updated.note === 'Updated note by creator', 'Creator successfully updated split');
  assert(updated.version === 2, 'Version incremented on split update');

  // ─── 7. Booking Cancellation Lifecycle Hook ───────────────────────────────
  console.log('\n7. Testing Booking Cancellation Lifecycle Transition...');

  const cancelledSplit = cancelSplitForBooking(bookingId);
  assert(cancelledSplit.status === 'Cancelled', 'Cancelling booking marks split as Cancelled');

  // Attempting to edit a cancelled split must fail
  expectThrow(
    () => updateBookingSplit(bookingId, { note: 'Illegal edit on cancelled' }, 'user-cap-1'),
    'Editing a cancelled split is rejected'
  );

  // ─── 8. Public Share Link & Sensitive Data Shielding ──────────────────────
  console.log('\n8. Testing Public Share Link & Privacy Shielding...');

  const publicData = getPublicSplitByToken(newSplit.shareToken);
  assert(publicData !== null, 'Valid share token retrieves public breakdown');
  assert(publicData.creatorUserId === undefined, 'CRITICAL: creatorUserId is NOT exposed in public view');
  assert(publicData.phone === undefined && publicData.email === undefined, 'CRITICAL: No phone/email exposed');
  assert(publicData.participants.length === 4, 'Public view contains participant breakdown');

  // Revoke share token
  revokeShareToken(bookingId, 'user-cap-1');
  const revokedLookup = getPublicSplitByToken(newSplit.shareToken);
  assert(revokedLookup === null, 'Revoked share token returns null (no access)');

  // ─── 9. Formatted Share Text & WhatsApp Link ──────────────────────────────
  console.log('\n9. Testing Formatted Share Text & WhatsApp Link...');

  const shareText = generateShareText(updated, 'https://sportlink.app/splits/test123');
  assert(shareText.includes('Padukone-Dravid Centre'), 'Share text contains facility name');
  assert(shareText.includes('Total Booking Cost:'), 'Share text contains total cost');
  assert(shareText.includes('Cost breakdown only'), 'Share text emphasizes settlement notice');

  const waUrl = generateWhatsAppUrl(updated, 'https://sportlink.app/splits/test123');
  assert(waUrl.startsWith('https://wa.me/?text='), 'Valid WhatsApp share URL generated');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();

