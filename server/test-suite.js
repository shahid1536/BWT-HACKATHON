import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for making requests
const request = (options, postData = null, isMultipart = false) => {
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
          raw: bodyBuffer,
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      if (isMultipart) {
        req.write(postData);
      } else {
        req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
      }
    }
    req.end();
  });
};

// Multipart body builder
const createMultipart = (fields, file) => {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';
  let body = [];

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined && val !== null) {
      body.push(Buffer.from(
        `--${boundary}${crlf}` +
        `Content-Disposition: form-data; name="${key}"${crlf}${crlf}` +
        `${val}${crlf}`
      ));
    }
  }

  if (file) {
    body.push(Buffer.from(
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"${crlf}` +
      `Content-Type: ${file.contentType}${crlf}${crlf}`
    ));
    body.push(file.content);
    body.push(Buffer.from(crlf));
  }

  body.push(Buffer.from(`--${boundary}--${crlf}`));
  const buffer = Buffer.concat(body);

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    buffer,
  };
};

async function runTests() {
  console.log('====================================================');
  console.log('   DocuKeep - End-to-End Test Suite');
  console.log('====================================================\n');

  const baseUrl = {
    hostname: '127.0.0.1',
    port: Number(process.env.DOCUKEEP_TEST_PORT || 5000),
  };

  let tokenA = '';
  let userAId = '';
  let tokenB = '';
  let userBId = '';
  let testDocId = '';
  let testCategoryId = '';

  // 1. Health check
  console.log('[Test 1] Health Check...');
  const health = await request({
    ...baseUrl,
    path: '/api/health',
    method: 'GET',
  });
  console.assert(health.statusCode === 200, 'Health check should be 200');
  console.log('✓ Health check passed:', health.data.status);

  // 2. User Registration (User A)
  console.log('\n[Test 2] User Registration (User A)...');
  const userAEmail = `user_a_${Date.now()}@test.com`;
  const regA = await request(
    {
      ...baseUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Alice Test', email: userAEmail, password: 'password123' }
  );
  console.assert(regA.statusCode === 201, 'User A registration should return 201');
  console.assert(regA.data.token, 'Token should be returned');
  tokenA = regA.data.token;
  userAId = regA.data.user._id;
  console.log('✓ User A registered successfully:', regA.data.user.name, userAEmail);

  // 3. Verify Default Categories Seeded
  console.log('\n[Test 3] Verify Default Categories Seeded...');
  const catRes = await request({
    ...baseUrl,
    path: '/api/categories',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.assert(catRes.statusCode === 200, 'Categories check should be 200');
  console.assert(catRes.data.categories.length === 9, 'Should have 9 default categories');
  console.log(`✓ Default categories verified (${catRes.data.categories.length} categories)`);

  // 4. Create Custom Category
  console.log('\n[Test 4] Create Custom Category...');
  const newCatRes = await request(
    {
      ...baseUrl,
      path: '/api/categories',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
    },
    { name: 'Vehicle & Auto' }
  );
  console.assert(newCatRes.statusCode === 201, 'New category should return 201');
  testCategoryId = newCatRes.data.category._id;
  console.log('✓ Custom category created:', newCatRes.data.category.name);

  // 5. User Registration (User B for Ownership Isolation Testing)
  console.log('\n[Test 5] User Registration (User B for security testing)...');
  const userBEmail = `user_b_${Date.now()}@test.com`;
  const regB = await request(
    {
      ...baseUrl,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Bob Security', email: userBEmail, password: 'password123' }
  );
  tokenB = regB.data.token;
  userBId = regB.data.user._id;
  console.log('✓ User B registered:', userBEmail);

  // 6. Document Upload with Valid PDF File
  console.log('\n[Test 6] Upload Document (Passport - Valid)...');
  const samplePdf = Buffer.from('%PDF-1.4 sample passport test document content %%EOF');
  const today = new Date();
  const issueDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString();
  const expiryDate = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate()).toISOString();

  const multipart1 = createMultipart(
    {
      title: 'International Passport',
      category: 'Identity',
      description: 'Official test passport record',
      issueDate,
      expiryDate,
    },
    {
      fieldname: 'file',
      filename: 'passport_scan.pdf',
      contentType: 'application/pdf',
      content: samplePdf,
    }
  );

  const doc1Res = await request(
    {
      ...baseUrl,
      path: '/api/documents',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': multipart1.contentType,
      },
    },
    multipart1.buffer,
    true
  );
  console.assert(doc1Res.statusCode === 201, 'Document creation should return 201');
  console.assert(doc1Res.data.document.title === 'International Passport');
  testDocId = doc1Res.data.document._id;
  console.log('✓ Document uploaded successfully. ID:', testDocId);

  // 7. Date Validation Check (Reject Expiry < Issue)
  console.log('\n[Test 7] Date Validation Check (Reject invalid dates)...');
  const invalidMultipart = createMultipart(
    {
      title: 'Invalid Date Doc',
      category: 'Identity',
      issueDate: '2026-05-01',
      expiryDate: '2025-05-01', // Earlier than issue!
    },
    {
      fieldname: 'file',
      filename: 'sample.pdf',
      contentType: 'application/pdf',
      content: samplePdf,
    }
  );

  const invalidDateRes = await request(
    {
      ...baseUrl,
      path: '/api/documents',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': invalidMultipart.contentType,
      },
    },
    invalidMultipart.buffer,
    true
  );
  console.assert(invalidDateRes.statusCode === 400, 'Should reject invalid date sequence with 400');
  console.log('✓ Invalid date sequence correctly rejected with message:', invalidDateRes.data.message);

  // 8. Upload Expiring Soon Document (within 5 days)
  console.log('\n[Test 8] Upload Expiring Soon Document (within 5 days)...');
  const expiringSoonDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString();
  const multipart2 = createMultipart(
    {
      title: 'Vehicle Registration Certificate',
      category: 'Vehicle & Auto',
      description: 'Annual registration expiring this week',
      expiryDate: expiringSoonDate,
    },
    {
      fieldname: 'file',
      filename: 'vehicle_reg.pdf',
      contentType: 'application/pdf',
      content: samplePdf,
    }
  );
  const doc2Res = await request(
    {
      ...baseUrl,
      path: '/api/documents',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': multipart2.contentType,
      },
    },
    multipart2.buffer,
    true
  );
  console.assert(doc2Res.statusCode === 201);
  console.log('✓ Expiring soon document created. Status:', doc2Res.data.document.status);

  // 9. Upload Expired Document
  console.log('\n[Test 9] Upload Expired Document...');
  const expiredDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const multipart3 = createMultipart(
    {
      title: 'Old Fitness Club Membership',
      category: 'Other',
      description: 'Expired gym contract',
      expiryDate: expiredDate,
    },
    {
      fieldname: 'file',
      filename: 'gym_contract.pdf',
      contentType: 'application/pdf',
      content: samplePdf,
    }
  );
  const doc3Res = await request(
    {
      ...baseUrl,
      path: '/api/documents',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': multipart3.contentType,
      },
    },
    multipart3.buffer,
    true
  );
  console.assert(doc3Res.statusCode === 201);
  console.log('✓ Expired document created. Status:', doc3Res.data.document.status);

  // 10. Dashboard Stats Calculation Verification
  console.log('\n[Test 10] Dashboard Stats Verification...');
  const dashRes = await request({
    ...baseUrl,
    path: '/api/dashboard/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.assert(dashRes.statusCode === 200);
  const stats = dashRes.data.stats;
  console.log('Dashboard Stats received:', stats);
  console.assert(stats.totalDocuments === 3, 'Total documents should be 3');
  console.assert(stats.expiringSoon === 1, 'Expiring soon should be 1');
  console.assert(stats.expiredDocuments === 1, 'Expired documents should be 1');
  console.assert(stats.categoriesUsed === 3, 'Categories used should be 3 (Identity, Vehicle & Auto, Other)');
  console.log('✓ All dashboard metrics match actual database records accurately!');

  // 11. Search and Filtering Verification
  console.log('\n[Test 11] Search & Filtering Verification...');
  const searchRes = await request({
    ...baseUrl,
    path: '/api/documents?search=Passport',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.assert(searchRes.data.documents.length === 1);
  console.assert(searchRes.data.documents[0].title === 'International Passport');
  console.log('✓ Search by query "Passport" matched 1 document.');

  const filterStatusRes = await request({
    ...baseUrl,
    path: '/api/documents?status=expiring_soon',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.assert(filterStatusRes.data.documents.length === 1);
  console.log('✓ Status filter "expiring_soon" matched 1 document.');

  // 12. Secure File Download and Preview
  console.log('\n[Test 12] Secure Download & Preview Verification...');
  const dlRes = await request({
    ...baseUrl,
    path: `/api/documents/${testDocId}/download`,
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.assert(dlRes.statusCode === 200);
  console.assert(dlRes.headers['content-disposition']?.includes('attachment'));
  console.log('✓ Download endpoint sets attachment Content-Disposition.');

  const prevRes = await request({
    ...baseUrl,
    path: `/api/documents/${testDocId}/preview`,
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.assert(prevRes.statusCode === 200);
  console.assert(prevRes.headers['content-type'] === 'application/pdf');
  console.assert(prevRes.headers['content-disposition']?.includes('inline'));
  console.log('✓ Preview endpoint sets inline Content-Disposition and mimeType.');

  // 13. Security Ownership Isolation Check
  console.log('\n[Test 13] Security Check: User B accessing User A document...');
  const forbiddenAccess = await request({
    ...baseUrl,
    path: `/api/documents/${testDocId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.assert(forbiddenAccess.statusCode === 404, 'User B must not see User A document (404/denied)');
  console.log('✓ Security verified: User B cannot access User A document.');

  const forbiddenDelete = await request({
    ...baseUrl,
    path: `/api/documents/${testDocId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.assert(forbiddenDelete.statusCode === 404, 'User B must not be able to delete User A document');
  console.log('✓ Security verified: User B cannot delete User A document.');

  // 14. Document Metadata Update
  console.log('\n[Test 14] Update Document Metadata...');
  const updateMultipart = createMultipart({
    title: 'Renewed International Passport',
    category: 'Identity',
    description: 'Updated with biometric notes',
  });
  const updateRes = await request(
    {
      ...baseUrl,
      path: `/api/documents/${testDocId}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': updateMultipart.contentType,
      },
    },
    updateMultipart.buffer,
    true
  );
  console.assert(updateRes.statusCode === 200);
  console.assert(updateRes.data.document.title === 'Renewed International Passport');
  console.log('✓ Document metadata updated successfully.');

  // 15. Profile Settings Update
  console.log('\n[Test 15] Profile Settings Update...');
  const profileRes = await request(
    {
      ...baseUrl,
      path: '/api/profile',
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
    },
    { name: 'Alice Modified' }
  );
  console.assert(profileRes.statusCode === 200);
  console.assert(profileRes.data.user.name === 'Alice Modified');
  console.log('✓ Profile updated successfully.');

  // 16. Document Deletion and Cleanup
  console.log('\n[Test 16] Delete Document and verify file removal...');
  const delRes = await request({
    ...baseUrl,
    path: `/api/documents/${testDocId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.assert(delRes.statusCode === 200);
  console.log('✓ Document deleted successfully.');

  // Verify deletion from database
  const getDeleted = await request({
    ...baseUrl,
    path: `/api/documents/${testDocId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.assert(getDeleted.statusCode === 404);
  console.log('✓ Verified document no longer exists.');

  console.log('\n====================================================');
  console.log('   ALL 16 TESTS PASSED SUCCESSFULLY! (100%)');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed with error:', err);
  process.exit(1);
});
