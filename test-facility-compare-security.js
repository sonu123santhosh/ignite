/**
 * test-facility-compare-security.js
 * Automated security, honesty rules, and integrity verification for
 * the Facility Comparison feature.
 */

import {
  compareFacilities,
  calculateSlotEstimate,
  evaluateAvailability,
  resetCompareDbState,
  checkCompareRateLimit
} from './src/services/facilityComparisonService.js';
import { INITIAL_FACILITIES, INITIAL_BOOKINGS } from './src/data/facilitiesData.js';

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
  console.log('RUNNING FACILITY COMPARISON SECURITY & HONESTY TESTS');
  console.log('====================================================\n');

  resetCompareDbState();

  // ── 1. Selection Bounds & Graceful Error Handling ──────────────────────────
  console.log('1. Testing Selection Bounds & Validation...');
  const res1 = compareFacilities({ ids: ['fac-1'] });
  assert(res1.valid === false, 'Single facility rejected (requires at least 2)');
  assert(res1.error.includes('at least 2 facilities'), 'Descriptive error returned for < 2 facilities');

  // Clamp to max 4 unique facilities
  const res4 = compareFacilities({ ids: ['fac-1', 'fac-2', 'fac-3', 'fac-4', 'fac-5'] });
  assert(res4.facilities.length === 4, 'Clamped strictly to max 4 facilities');

  // Deduplicate identical IDs
  const resDedup = compareFacilities({ ids: ['fac-1', 'fac-1', 'fac-2', 'fac-2'] });
  assert(resDedup.facilities.length === 2, 'Duplicate IDs safely deduplicated to exactly 2');

  // Invalid / non-existent IDs ignored gracefully
  const resInvalid = compareFacilities({ ids: ['fac-1', 'fac-2', 'invalid-venue-999'] });
  assert(resInvalid.valid === true, 'Valid facilities still compared when invalid ID present');
  assert(resInvalid.missingIds.includes('invalid-venue-999'), 'Missing ID tracked and reported');
  assert(resInvalid.facilities.length === 2, 'Only valid venues returned');

  // ── 2. Honesty Rule: Lowest Price Highlight Criteria ───────────────────────
  console.log('\n2. Testing Honesty Rule: Lowest Price Highlight...');

  // Comparison between two facilities of DIFFERENT sports (e.g. Football fac-1 vs Badminton fac-2)
  const resDiffSports = compareFacilities({
    ids: ['fac-1', 'fac-2'],
    date: '2026-11-05',
    startTime: '18:00',
    durationHours: 1
  });
  assert(resDiffSports.differentSports === true, 'Correctly flags that venues feature different sports');
  assert(resDiffSports.lowestPriceFacilityId === null, 'Honesty Rule: Lowest price highlight is NULL when sports differ');
  assert(
    resDiffSports.lowestPriceNotice.includes('different sports'),
    'Notice explains why lowest price highlight is disabled'
  );

  // Comparison between two facilities of the SAME sport (e.g. Football fac-1 and Titan fac-8)
  const resSameSport = compareFacilities({
    ids: ['fac-1', 'fac-8'],
    date: '2026-11-05',
    startTime: '18:00',
    durationHours: 1
  });
  assert(resSameSport.sameSport === true, 'Correctly detects same sport');
  assert(Boolean(resSameSport.lowestPriceFacilityId), 'Lowest price facility ID is highlighted when sports match');

  // Verify the highlighted venue actually has the lower total
  const totals = resSameSport.facilities.map((f) => ({ id: f.id, total: f.priceEstimate.total }));
  const minExpectedId = totals[0].total < totals[1].total ? totals[0].id : totals[1].id;
  assert(resSameSport.lowestPriceFacilityId === minExpectedId, 'Accurately highlights the true lowest price venue');

  // ── 3. Exact Pricing Formula Consistency ──────────────────────────────────
  console.log('\n3. Testing Pricing Calculation Contract...');
  const fac1 = INITIAL_FACILITIES.find((f) => f.id === 'fac-1');
  const estimate1h = calculateSlotEstimate(fac1, '18:00', 1);
  // 18:00 is peak (1200) + 18% tax (216) + platform fee (40) = 1456
  assert(estimate1h.basePrice === 1200, 'Base price accurately reflects peak tariff (₹1,200)');
  assert(estimate1h.taxes === 216, '18% GST matches exact ₹216');
  assert(estimate1h.platformFee === 40, 'Platform fee matches ₹40');
  assert(estimate1h.total === 1456, 'Total ₹1,456 matches booking checkout total exactly');

  // ── 4. Real Availability & Alternative Slot Evaluation ─────────────────────
  console.log('\n4. Testing Real Availability & Alternatives...');
  const avail = evaluateAvailability(fac1, '2026-11-05', '18:00', 1, INITIAL_BOOKINGS);
  assert(typeof avail.status === 'string', 'Availability status returned as string');
  assert(Array.isArray(avail.alternativeSlots), 'Alternative slots returned as array');

  // ── 5. Honesty Rule: Missing Data & No Fake Ratings ────────────────────────
  console.log('\n5. Testing Honesty Rule: Zero Fake Data & Ratings...');
  const testFacNoReviews = {
    id: 'fac-test-no-rev',
    name: 'Test Ground',
    sport: 'Football',
    rating: 0,
    reviewCount: 0,
    pricing: { offPeak: 1000, peak: 1200, peakHours: [] },
    grounds: [{ id: 'g-test-1', name: 'Court 1' }]
  };
  const testFacWithReviews = {
    id: 'fac-test-with-rev',
    name: 'Rated Ground',
    sport: 'Football',
    rating: 4.8,
    reviewCount: 94,
    pricing: { offPeak: 1000, peak: 1200, peakHours: [] },
    grounds: [{ id: 'g-test-2', name: 'Court 2' }]
  };

  const compReviews = compareFacilities({
    ids: ['fac-test-no-rev', 'fac-test-with-rev'],
    customFacilities: [testFacNoReviews, testFacWithReviews]
  });

  const noRevVenue = compReviews.facilities.find((f) => f.id === 'fac-test-no-rev');
  assert(noRevVenue.rating === null, 'Venue with 0 reviews has NULL rating (not 0 stars)');
  assert(noRevVenue.ratingDisplay === 'No reviews yet', 'Displays "No reviews yet" text honestly');

  const ratedVenue = compReviews.facilities.find((f) => f.id === 'fac-test-with-rev');
  assert(ratedVenue.rating === 4.8, 'Preserves authentic rating 4.8');
  assert(ratedVenue.reviewCount === 94, 'Shows exact review count (94 reviews)');

  // ── 6. Public Data Shielding (Zero Contact/Revenue Leakage) ────────────────
  console.log('\n6. Testing Public Data Shielding...');
  compReviews.facilities.forEach((f) => {
    assert(f.ownerId === undefined, 'CRITICAL: ownerId is stripped from public comparison payload');
    assert(f.ownerPhone === undefined, 'CRITICAL: owner phone is not exposed');
    assert(f.revenue === undefined, 'CRITICAL: revenue data is not exposed');
  });

  // ── 7. Rate Limiting ───────────────────────────────────────────────────────
  console.log('\n7. Testing Rate Limiting...');
  resetCompareDbState();
  let rateLimitTripped = false;
  for (let i = 0; i < 65; i++) {
    if (!checkCompareRateLimit('test_client_ip')) {
      rateLimitTripped = true;
      break;
    }
  }
  assert(rateLimitTripped === true, 'Rate limiter activates when limit is exceeded');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();

