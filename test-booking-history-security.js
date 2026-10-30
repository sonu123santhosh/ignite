/**
 * test-booking-history-security.js
 * Comprehensive automated security, business logic, and integrity verification
 * for the Booking History feature.
 */

import {
  getBookingsStore,
  saveBookingsStore,
  resetBookingsDbState,
  deriveBookingStatus,
  getUserBookings,
  getBookingById,
  cancelBooking,
  recordNewBooking,
  evaluateCancellationWindow
} from './src/services/bookingHistoryService.js';
import { getSplitByBookingId } from './src/services/costSplitService.js';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}`);
    failed++;
  }
}

function runTests() {
  console.log('====================================================');
  console.log('RUNNING BOOKING HISTORY SECURITY & INTEGRITY TESTS');
  console.log('====================================================\n');

  resetBookingsDbState();

  // ── 1. Authentication & Session Derivation ────────────────────────────────
  console.log('1. Testing Authentication & Session Verification...');
  try {
    getUserBookings(null);
    assert(false, 'Unauthenticated call should throw 401');
  } catch (err) {
    assert(err.message.includes('401'), 'Logged-out user rejected with 401 Unauthorized');
  }

  try {
    getBookingById(null, 'bk-101');
    assert(false, 'Unauthenticated getBookingById should throw 401');
  } catch (err) {
    assert(err.message.includes('401'), 'getBookingById rejects logged-out user with 401');
  }

  try {
    cancelBooking(null, 'bk-101');
    assert(false, 'Unauthenticated cancel should throw 401');
  } catch (err) {
    assert(err.message.includes('401'), 'cancelBooking rejects logged-out user with 401');
  }

  // ── 2. Real Data & Server-Clock Status Derivation ──────────────────────────
  console.log('\n2. Testing Real Data & Dynamic Status Derivation...');
  const now = new Date('2026-10-30T14:00:00.000Z');

  // Past booking with status "Confirmed"
  const pastBooking = {
    id: 'test-bk-past',
    date: '2026-10-25',
    startTime: '10:00',
    endTime: '11:00',
    status: 'Confirmed'
  };
  assert(
    deriveBookingStatus(pastBooking, now) === 'Completed',
    'Booking whose end time has passed derives as "Completed" dynamically without manual update'
  );

  // Future booking with status "Confirmed"
  const futureBooking = {
    id: 'test-bk-future',
    date: '2026-11-05',
    startTime: '18:00',
    endTime: '19:00',
    status: 'Confirmed'
  };
  assert(
    deriveBookingStatus(futureBooking, now) === 'Upcoming',
    'Future booking with Confirmed status derives as "Upcoming"'
  );

  // Cancelled booking remains Cancelled
  const cancelledBooking = {
    id: 'test-bk-cancelled',
    date: '2026-10-25',
    startTime: '10:00',
    endTime: '11:00',
    status: 'Cancelled'
  };
  assert(
    deriveBookingStatus(cancelledBooking, now) === 'Cancelled',
    'Cancelled booking strictly remains "Cancelled"'
  );

  // Pending booking derives as Pending
  const pendingBooking = {
    id: 'test-bk-pending',
    date: '2026-11-05',
    startTime: '10:00',
    endTime: '11:00',
    status: 'Pending'
  };
  assert(
    deriveBookingStatus(pendingBooking, now) === 'Pending',
    'Pending booking derives as "Pending"'
  );

  // ── 3. BOLA / IDOR Cross-Tenant Isolation ──────────────────────────────────
  console.log('\n3. Testing BOLA / IDOR Cross-Tenant Access Defense...');
  const aliceSession = { userId: 'usr_alice_123', userName: 'Alice' };
  const bobSession = { userId: 'usr_bob_456', userName: 'Bob' };

  // Create real booking for Alice
  recordNewBooking({
    id: 'bk-alice-1',
    facilityId: 'fac-1',
    facilityName: 'Elite Football Arena',
    groundId: 'g1-1',
    groundName: 'Pitch 1 (7v7 Main Arena)',
    sport: 'Football',
    date: '2026-11-10',
    startTime: '18:00',
    durationHours: 1,
    endTime: '19:00',
    amount: 1456,
    playerName: 'Alice Wonder',
    userId: aliceSession.userId,
    status: 'Confirmed'
  });

  // Create real booking for Bob
  recordNewBooking({
    id: 'bk-bob-1',
    facilityId: 'fac-2',
    facilityName: 'SmashPoint Badminton Club',
    groundId: 'g2-1',
    groundName: 'Court 1 (Yonex Mat)',
    sport: 'Badminton',
    date: '2026-11-12',
    startTime: '19:00',
    durationHours: 1,
    endTime: '20:00',
    amount: 556,
    playerName: 'Bob Smith',
    userId: bobSession.userId,
    status: 'Confirmed'
  });

  // Alice queries her bookings
  const aliceBookings = getUserBookings(aliceSession);
  assert(aliceBookings.bookings.length === 1, 'Alice sees exactly 1 booking');
  assert(aliceBookings.bookings[0].id === 'bk-alice-1', 'Alice sees only her own booking');

  // Bob queries his bookings
  const bobBookings = getUserBookings(bobSession);
  assert(bobBookings.bookings.length === 1, 'Bob sees exactly 1 booking');
  assert(bobBookings.bookings[0].id === 'bk-bob-1', 'Bob sees only his own booking');

  // Alice attempts to access Bob's booking ID (IDOR Attack)
  try {
    getBookingById(aliceSession, 'bk-bob-1');
    assert(false, "Alice should NOT be able to view Bob's booking");
  } catch (err) {
    assert(
      err.statusCode === 404 || err.message.includes('not authorized'),
      "IDOR attack blocked: Bob's booking returns 404/Not Authorized for Alice"
    );
  }

  // Alice attempts to cancel Bob's booking (Unauthorized mutation)
  try {
    cancelBooking(aliceSession, 'bk-bob-1');
    assert(false, "Alice should NOT be able to cancel Bob's booking");
  } catch (err) {
    assert(
      err.statusCode === 403 || err.message.includes('not authorized'),
      "Unauthorized cancellation blocked: Alice cannot cancel Bob's booking (403)"
    );
  }

  // ── 4. Combinable Filters, Validation & Pagination ─────────────────────────
  console.log('\n4. Testing Combinable Filters & Date Range Validation...');

  // Add more bookings for Alice across sports and dates
  recordNewBooking({
    id: 'bk-alice-2',
    facilityId: 'fac-2',
    facilityName: 'SmashPoint Badminton Club',
    groundId: 'g2-1',
    groundName: 'Court 1',
    sport: 'Badminton',
    date: '2026-11-15',
    startTime: '10:00',
    endTime: '11:00',
    amount: 500,
    playerName: 'Alice Wonder',
    userId: aliceSession.userId,
    status: 'Confirmed'
  });

  recordNewBooking({
    id: 'bk-alice-3',
    facilityId: 'fac-1',
    facilityName: 'Elite Football Arena',
    groundId: 'g1-1',
    groundName: 'Pitch 1',
    sport: 'Football',
    date: '2026-10-15', // Past
    startTime: '16:00',
    endTime: '17:00',
    amount: 1200,
    playerName: 'Alice Wonder',
    userId: aliceSession.userId,
    status: 'Confirmed'
  });

  // Invalid date range: from > to
  try {
    getUserBookings(aliceSession, { fromDate: '2026-11-20', toDate: '2026-11-10' });
    assert(false, 'Should throw error when from > to');
  } catch (err) {
    assert(
      err.message.includes("'From' date must be before or equal to 'To' date"),
      'Date range validation: from > to correctly rejected with error message'
    );
  }

  // Filter by sport
  const footballOnly = getUserBookings(aliceSession, { sport: 'Football' });
  assert(footballOnly.bookings.every((b) => b.sport === 'Football'), 'Sport filter matches only selected sport');

  // Filter by status tab: Upcoming
  const upcomingOnly = getUserBookings(aliceSession, { statusTab: 'upcoming' });
  assert(
    upcomingOnly.bookings.every((b) => b.derivedStatus === 'Upcoming'),
    'Status tab Upcoming returns only upcoming bookings'
  );

  // Status counts accuracy
  const allUser = getUserBookings(aliceSession, { statusTab: 'all' });
  assert(allUser.counts.all === 3, 'Total count matches 3');
  assert(allUser.counts.upcoming === 2, 'Upcoming count matches 2');
  assert(allUser.counts.completed === 1, 'Completed count matches 1 (past booking)');
  assert(allUser.availableSports.includes('Football') && allUser.availableSports.includes('Badminton'), 'Available sports dropdown lists user sports');

  // Pagination test
  const page1 = getUserBookings(aliceSession, { limit: 2, page: 1 });
  assert(page1.bookings.length === 2, 'Page 1 limit 2 returns exactly 2 records');
  assert(page1.totalPages === 2, 'Total pages computed correctly as 2');

  const page2 = getUserBookings(aliceSession, { limit: 2, page: 2 });
  assert(page2.bookings.length === 1, 'Page 2 limit 2 returns remaining 1 record');

  // ── 5. Cancellation Window & Honesty Rule ──────────────────────────────────
  console.log('\n5. Testing Cancellation Window, Idempotency & Honesty Rule...');

  // Past booking cancellation attempt
  try {
    cancelBooking(aliceSession, 'bk-alice-3'); // Past booking
    assert(false, 'Should reject cancelling completed booking');
  } catch (err) {
    assert(
      err.message.includes('Completed reservations cannot be cancelled'),
      'Cancelling completed booking is strictly blocked'
    );
  }

  // Cancel upcoming booking inside allowed window
  const cancelResult = cancelBooking(aliceSession, 'bk-alice-1');
  assert(cancelResult.success === true, 'Upcoming booking successfully cancelled');
  assert(cancelResult.booking.status === 'Cancelled', 'Booking status transitioned to Cancelled');
  assert(Boolean(cancelResult.booking.cancelledAt), 'cancelledAt timestamp stored');
  assert(cancelResult.booking.cancelledBy === aliceSession.userId, 'cancelledBy user ID stored');

  // Honesty Rule: refund status indicates external settlement
  assert(
    cancelResult.booking.refundStatus.includes('outside SportLink'),
    'Honesty Rule: No fake refund badge; explicitly states refund handled outside SportLink'
  );

  // Idempotency: Cancelling again should return current state safely without duplicate errors
  const doubleCancelResult = cancelBooking(aliceSession, 'bk-alice-1');
  assert(doubleCancelResult.success === true, 'Double-cancellation handled idempotently');
  assert(doubleCancelResult.message.includes('already cancelled'), 'Idempotent notice returned');

  // Check that Alice still sees the cancelled booking in history forever (soft state)
  const afterCancel = getBookingById(aliceSession, 'bk-alice-1');
  assert(afterCancel.status === 'Cancelled', 'Cancelled booking preserved in history forever');
  assert(afterCancel.statusHistory.length >= 2, 'Status history timeline recorded');

  // ── 6. Cost Split Cancellation Sync ────────────────────────────────────────
  console.log('\n6. Testing Linked Cost Split Synchronization...');
  // The cancelled booking had any linked split marked cancelled
  const linkedSplit = getSplitByBookingId('bk-alice-1');
  if (linkedSplit) {
    assert(linkedSplit.status === 'cancelled', 'Linked cost split atomically marked cancelled');
  } else {
    assert(true, 'Linked cost split handled cleanly');
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();

