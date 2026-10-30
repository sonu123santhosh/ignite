/**
 * test-auth-security.js
 *
 * Standalone Security, Integrity, and Auth Test Suite for SportLink Auth System.
 * Run directly via: node test-auth-security.js
 */

import {
  register,
  login,
  logout,
  restoreSession,
  resetAuthDbState,
  getUsers,
  getSession,
  saveSession,
  validateName,
  validateEmail,
  validatePassword,
  passwordStrength,
  SESSION_TTL_MS,
  RATE_LIMIT_MAX
} from './src/services/authService.js';

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

console.log('====================================================');
console.log('RUNNING SPORTLINK AUTH & SECURITY INTEGRITY TESTS');
console.log('====================================================\n');

async function runTests() {
  resetAuthDbState();

  // ─── 1. Client & Server Validation Helpers ─────────────────────────────────
  console.log('1. Testing Input Validation Rules...');

  assert(validateName('') !== null, 'Empty name rejected');
  assert(validateName('A') !== null, 'Name under 2 chars rejected');
  assert(validateName('A'.repeat(61)) !== null, 'Name over 60 chars rejected');
  assert(validateName('Arjun Mehta') === null, 'Valid name accepted');

  assert(validateEmail('') !== null, 'Empty email rejected');
  assert(validateEmail('not-an-email') !== null, 'Invalid email format rejected');
  assert(validateEmail('user@') !== null, 'Incomplete email rejected');
  assert(validateEmail('arjun@college.edu') === null, 'Valid email accepted');

  assert(validatePassword('') !== null, 'Empty password rejected');
  assert(validatePassword('short7') !== null, 'Password under 8 chars rejected');
  assert(validatePassword('nouppercase1') !== null, 'Password without uppercase rejected');
  assert(validatePassword('NOLOWERCASE1') !== null, 'Password without lowercase rejected');
  assert(validatePassword('NoDigitsHere') !== null, 'Password without number rejected');
  assert(validatePassword('A1' + 'a'.repeat(71)) !== null, 'Password exceeding 72 chars rejected');
  assert(validatePassword('SecurePass1') === null, 'Compliant password accepted');

  // Password strength calculations
  assert(passwordStrength('weak') <= 1, 'Weak password scored low');
  assert(passwordStrength('Medium1') >= 2, 'Medium password scored properly');
  assert(passwordStrength('SuperSecurePass1!') === 4, 'Strong password receives maximum score of 4');

  // ─── 2. Registration Security & Password Hashing ───────────────────────────
  console.log('\n2. Testing Registration & Password Hashing Security...');

  // Mismatched passwords
  const regMismatch = await register({
    name: 'Rohan Sharma',
    email: 'rohan@college.edu',
    password: 'Password123',
    confirmPassword: 'DifferentPassword123',
    role: 'captain'
  });
  assert(regMismatch.success === false && regMismatch.fieldErrors?.confirmPassword, 'Password mismatch rejected during registration');

  // Successful registration
  const regSuccess = await register({
    name: 'Rohan Sharma',
    email: 'rohan@college.edu',
    password: 'Password123',
    confirmPassword: 'Password123',
    role: 'captain'
  });
  assert(regSuccess.success === true, 'Valid registration succeeded');
  assert(regSuccess.user && regSuccess.user.email === 'rohan@college.edu', 'User object returned on registration');
  assert(regSuccess.user.hashedPassword === undefined, 'CRITICAL: Password hash NEVER returned in registration response');

  // Check stored database record
  const allUsers = getUsers();
  const dbUser = allUsers.find((u) => u.email === 'rohan@college.edu');
  assert(dbUser !== undefined, 'User record safely persisted in database');
  assert(dbUser.hashedPassword !== 'Password123', 'CRITICAL: Plaintext password is NEVER stored in database');
  assert(dbUser.hashedPassword.startsWith('$2a$') || dbUser.hashedPassword.startsWith('$2b$'), 'Password stored as genuine bcrypt hash');

  // ─── 3. Privilege Escalation Prevention ────────────────────────────────────
  console.log('\n3. Testing Privilege Escalation & Role Whitelist...');

  const regEscalated = await register({
    name: 'Hacker User',
    email: 'hacker@college.edu',
    password: 'Password123',
    confirmPassword: 'Password123',
    role: 'admin' // Attempting to self-assign unpermitted admin role
  });
  assert(regEscalated.success === true, 'Registration succeeded with safe fallback');
  assert(regEscalated.user.role === 'player', 'Privilege escalation blocked: illegal admin role fell back to player');

  // ─── 4. Duplicate Account Detection ────────────────────────────────────────
  console.log('\n4. Testing Duplicate Account Detection...');

  const regDuplicate = await register({
    name: 'Rohan Impersonator',
    email: 'ROHAN@college.edu', // Case insensitive test
    password: 'Password123',
    confirmPassword: 'Password123',
    role: 'player'
  });
  assert(regDuplicate.success === false, 'Duplicate email registration rejected');
  assert(
    regDuplicate.fieldErrors?.email === 'An account with this email already exists. Try logging in.',
    'Exact UX message for duplicate email returned'
  );

  // ─── 5. Authentication & Login Security ────────────────────────────────────
  console.log('\n5. Testing Login Authentication & Security...');

  // Wrong password
  const badLogin = await login({ email: 'rohan@college.edu', password: 'WrongPassword99' });
  assert(badLogin.success === false, 'Wrong password rejected');
  assert(badLogin.error === 'Invalid email or password.', 'Generic error message on wrong password (no oracle)');

  // Non-existent email
  const nonexistentLogin = await login({ email: 'ghost@college.edu', password: 'Password123' });
  assert(nonexistentLogin.success === false, 'Non-existent email rejected');
  assert(nonexistentLogin.error === 'Invalid email or password.', 'Generic error message for non-existent email (no oracle)');

  // Correct credentials (with case insensitivity)
  const goodLogin = await login({ email: '  ROHAN@COLLEGE.EDU  ', password: 'Password123' });
  assert(goodLogin.success === true, 'Valid login succeeded (handles trimming and case)');
  assert(goodLogin.user && goodLogin.user.id === dbUser.id, 'Logged in as the correct identity');
  assert(goodLogin.user.hashedPassword === undefined, 'CRITICAL: Password hash NEVER returned in login response');

  // ─── 6. Session Lifecycle & Expiration ─────────────────────────────────────
  console.log('\n6. Testing Session Management & Expiration...');

  const activeSession = getSession();
  assert(activeSession !== null && activeSession.userId === dbUser.id, 'Session created and valid');

  const restoredUser = restoreSession();
  assert(restoredUser !== null && restoredUser.email === 'rohan@college.edu', 'Session successfully restored user state');
  assert(restoredUser.hashedPassword === undefined, 'Restored user does not leak password hash');

  // Test session expiration (simulate 8 days elapsed)
  const expiredSession = {
    userId: dbUser.id,
    expiresAt: Date.now() - 1000 // Expired in the past
  };
  saveSession(dbUser.id);
  // Manually force session to expired
  const sessionObj = getSession();
  sessionObj.expiresAt = Date.now() - 1000;
  // Re-check
  assert(getSession() === null, 'Expired session is automatically purged');
  assert(restoreSession() === null, 'restoreSession returns null for expired session');

  // Re-login and test explicit logout
  await login({ email: 'rohan@college.edu', password: 'Password123' });
  assert(getSession() !== null, 'Session recreated on re-login');
  logout();
  assert(getSession() === null, 'Explicit logout purges session immediately');
  assert(restoreSession() === null, 'restoreSession returns null after logout');

  // ─── 7. Rate Limiting ──────────────────────────────────────────────────────
  console.log('\n7. Testing Rate Limiting Defense...');

  const rateTarget = 'victim@college.edu';
  await register({
    name: 'Victim User',
    email: rateTarget,
    password: 'Password123',
    confirmPassword: 'Password123',
    role: 'player'
  });

  // Attempt 5 bad logins
  for (let i = 1; i <= RATE_LIMIT_MAX; i++) {
    await login({ email: rateTarget, password: 'BadPassword' + i });
  }

  // 6th attempt should be blocked by rate limiter even if password were correct
  const rateBlocked = await login({ email: rateTarget, password: 'Password123' });
  assert(rateBlocked.success === false, 'Rate limit triggered on excessive failures');
  assert(
    rateBlocked.error && rateBlocked.error.includes('Too many failed attempts'),
    'Rate limit warning message returned'
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

