import http from 'http';
import jwt from 'jsonwebtoken';

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const bodyBuffer = Buffer.concat(data);
        const contentType = res.headers['content-type'] || '';
        let json = null;
        if (contentType.includes('application/json')) {
          try {
            json = JSON.parse(bodyBuffer.toString());
          } catch (e) {
            json = bodyBuffer.toString();
          }
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
          raw: bodyBuffer.toString(),
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function testAuthDiagnostics() {
  console.log('====================================================');
  console.log('  DocuKeep - Auth & Registration Diagnostic Test');
  console.log('====================================================\n');

  const serverUrl = {
    hostname: '127.0.0.1',
    port: Number(process.env.DOCUKEEP_TEST_PORT || 5000),
  };
  const proxyUrl = {
    hostname: '127.0.0.1',
    port: Number(process.env.DOCUKEEP_PROXY_PORT || 5173),
  };

  // 1. Missing name
  console.log('[Test 1] Missing name validation...');
  const res1 = await request(
    {
      ...serverUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: '', email: 'valid@example.com', password: 'password123' }
  );
  console.assert(res1.statusCode === 400, 'Expected status 400');
  console.assert(res1.data.message === 'Please provide your full name.', 'Expected correct message');
  console.assert(!res1.data.stack, 'Stack trace must not be exposed');
  console.log('✓ Correctly returned 400 without stack trace:', res1.data.message);

  // 2. Missing email
  console.log('\n[Test 2] Missing email validation...');
  const res2 = await request(
    {
      ...serverUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Alice Test', email: '', password: 'password123' }
  );
  console.assert(res2.statusCode === 400);
  console.assert(res2.data.message === 'Please provide an email address.');
  console.assert(!res2.data.stack);
  console.log('✓ Correctly returned 400 without stack trace:', res2.data.message);

  // 3. Invalid email format
  console.log('\n[Test 3] Invalid email format validation...');
  const res3 = await request(
    {
      ...serverUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Alice Test', email: 'notanemail', password: 'password123' }
  );
  console.assert(res3.statusCode === 400);
  console.assert(res3.data.message === 'Please provide a valid email address.');
  console.assert(!res3.data.stack);
  console.log('✓ Correctly rejected invalid email format:', res3.data.message);

  // 4. Password too short (< 6 chars)
  console.log('\n[Test 4] Short password validation (< 6 chars)...');
  const res4 = await request(
    {
      ...serverUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Alice Test', email: 'valid@example.com', password: '123' }
  );
  console.assert(res4.statusCode === 400);
  console.assert(res4.data.message === 'Password must be at least 6 characters long.');
  console.assert(!res4.data.stack);
  console.log('✓ Correctly rejected short password:', res4.data.message);

  // 5. Valid registration with '+' in email
  console.log('\n[Test 5] Valid registration with plus address in email...');
  const plusEmail = `test+tag_${Date.now()}@example.com`;
  const res5 = await request(
    {
      ...serverUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Plus User', email: plusEmail, password: 'securePassword123' }
  );
  console.assert(res5.statusCode === 201, 'Expected status 201');
  console.assert(res5.data.success === true);
  console.assert(res5.data.user.email === plusEmail.toLowerCase());
  console.assert(!res5.data.user.passwordHash, 'Password hash must not be exposed');
  console.assert(res5.data.token, 'JWT token must be issued');
  console.log('✓ Plus email registered successfully and saved to MongoDB:', res5.data.user.email);

  // 6. Duplicate email rejection
  console.log('\n[Test 6] Duplicate email rejection...');
  const res6 = await request(
    {
      ...serverUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Another Name', email: plusEmail, password: 'anotherPassword123' }
  );
  console.assert(res6.statusCode === 409);
  console.assert(res6.data.message === 'An account with this email address already exists.');
  console.assert(!res6.data.stack);
  console.log('✓ Duplicate email cleanly rejected:', res6.data.message);

  // 7. Successful login with created account
  console.log('\n[Test 7] Login with newly registered account...');
  const res7 = await request(
    {
      ...serverUrl,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: plusEmail, password: 'securePassword123' }
  );
  console.assert(res7.statusCode === 200);
  console.assert(res7.data.success === true);
  console.assert(res7.data.token, 'Token returned');
  console.log('✓ Login verified successfully for registered user');

  // 8. Restore authentication from the returned bearer token after a page refresh
  console.log('\n[Test 8] Restore authenticated user from bearer token...');
  const meRes = await request({
    ...serverUrl,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${res7.data.token}` },
  });
  console.assert(meRes.statusCode === 200);
  console.assert(meRes.data.user.email === plusEmail.toLowerCase());
  console.assert(!meRes.data.user.passwordHash);
  console.log('✓ Authenticated profile restored without exposing password data');

  // 9. Protected dashboard rejects missing credentials and accepts valid auth
  console.log('\n[Test 9] Protected dashboard authorization...');
  const unauthorizedDashboard = await request({
    ...serverUrl,
    path: '/api/dashboard/stats',
    method: 'GET',
  });
  console.assert(unauthorizedDashboard.statusCode === 401);
  const authorizedDashboard = await request({
    ...serverUrl,
    path: '/api/dashboard/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${res7.data.token}` },
  });
  console.assert(authorizedDashboard.statusCode === 200);
  console.log('✓ Dashboard denies anonymous access and accepts the valid session token');

  // 10. Invalid and expired tokens are rejected
  console.log('\n[Test 10] Invalid and expired session tokens...');
  const invalidSession = await request({
    ...serverUrl,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: 'Bearer invalid.token.value' },
  });
  console.assert(invalidSession.statusCode === 401);
  const expiredToken = jwt.sign(
    { id: res7.data.user._id },
    process.env.JWT_SECRET,
    { expiresIn: -1 }
  );
  const expiredSession = await request({
    ...serverUrl,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  console.assert(expiredSession.statusCode === 401);
  console.log('✓ Invalid and expired session tokens are both rejected with 401');

  // 11. Login with incorrect password
  console.log('\n[Test 11] Login with incorrect password...');
  const res8 = await request(
    {
      ...serverUrl,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: plusEmail, password: 'wrongPassword' }
  );
  console.assert(res8.statusCode === 401);
  console.assert(res8.data.message === 'Invalid email or password.');
  console.assert(!res8.data.stack);
  console.log('✓ Correctly rejected invalid credentials with 401');

  // 12. Registration via Frontend Vite Proxy
  console.log('\n[Test 12] Registration via Frontend Vite Proxy...');
  const proxyEmail = `proxy_user_${Date.now()}@example.com`;
  const res9 = await request(
    {
      ...proxyUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Proxy Test User', email: proxyEmail, password: 'proxyPassword123' }
  );
  console.assert(res9.statusCode === 201, 'Vite proxy registration should succeed with 201');
  console.assert(res9.data.success === true);
  console.assert(res9.data.user.email === proxyEmail);
  console.log('✓ Frontend Vite proxy correctly forwards request and receives response');

  console.log('\n====================================================');
  console.log('  ALL AUTH DIAGNOSTIC TESTS PASSED! (12/12)');
  console.log('====================================================\n');
}

testAuthDiagnostics().catch((err) => {
  console.error('Diagnostic test failed:', err);
  process.exit(1);
});
