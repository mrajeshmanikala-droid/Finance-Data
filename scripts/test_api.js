const BASE = 'http://localhost:3000';

async function test() {
  const results = [];
  const log = (name, pass) => {
    results.push({ name, pass });
    console.log(pass ? `  PASS: ${name}` : `  FAIL: ${name}`);
  };

  try {
    // ─── HEALTH CHECK ───
    console.log('\n--- HEALTH CHECK ---');
    let res = await fetch(`${BASE}/health`);
    let data = await res.json();
    log('Health endpoint', data.success === true);

    // ─── AUTH ───
    console.log('\n--- AUTH ---');
    res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test_${Date.now()}@test.com`, password: 'testpass123', name: 'Test User' }),
    });
    data = await res.json();
    log('Register new user', res.status === 201 && data.success);

    res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@finance.com', password: 'password123' }),
    });
    data = await res.json();
    const adminToken = data.data?.accessToken;
    const adminRefresh = data.data?.refreshToken;
    log('Login as Admin', res.status === 200 && !!adminToken);

    res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@finance.com', password: 'password123' }),
    });
    data = await res.json();
    let viewerToken = data.data?.accessToken;
    log('Login as Viewer', res.status === 200 && !!viewerToken);

    res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'analyst@finance.com', password: 'password123' }),
    });
    data = await res.json();
    const analystToken = data.data?.accessToken;
    log('Login as Analyst', res.status === 200 && !!analystToken);

    res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: adminRefresh }),
    });
    data = await res.json();
    log('Refresh token', res.status === 200 && !!data.data?.accessToken);

    const ah = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };
    let vh = { Authorization: `Bearer ${viewerToken}`, 'Content-Type': 'application/json' };
    const anh = { Authorization: `Bearer ${analystToken}`, 'Content-Type': 'application/json' };

    // ─── USERS ───
    console.log('\n--- USER MANAGEMENT ---');
    res = await fetch(`${BASE}/api/users/me`, { headers: ah });
    data = await res.json();
    log('Get profile (Admin)', data.success && data.data?.user?.role === 'ADMIN');

    res = await fetch(`${BASE}/api/users/me`, { headers: vh });
    data = await res.json();
    log('Get profile (Viewer)', data.success && data.data?.user?.role === 'VIEWER');
    const viewerId = data.data?.user?.id;

    res = await fetch(`${BASE}/api/users`, { headers: ah });
    data = await res.json();
    log('List users (Admin)', data.success && (data.meta?.totalItems || data.data?.length) >= 3);

    res = await fetch(`${BASE}/api/users`, { headers: vh });
    log('List users (Viewer) = FORBIDDEN', res.status === 403);

    res = await fetch(`${BASE}/api/users/${viewerId}`, {
      method: 'PATCH', headers: ah,
      body: JSON.stringify({ role: 'ANALYST' }),
    });
    data = await res.json();
    log('Admin assigns role to user', data.success && data.data?.user?.role === 'ANALYST');

    // Revert role
    await fetch(`${BASE}/api/users/${viewerId}`, { method: 'PATCH', headers: ah, body: JSON.stringify({ role: 'VIEWER' }) });

    res = await fetch(`${BASE}/api/users/${viewerId}`, { method: 'DELETE', headers: ah });
    data = await res.json();
    log('Deactivate user (set INACTIVE)', data.success && data.data?.user?.status === 'INACTIVE');

    // Reactivate and re-login
    await fetch(`${BASE}/api/users/${viewerId}`, { method: 'PATCH', headers: ah, body: JSON.stringify({ status: 'ACTIVE' }) });
    res = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'viewer@finance.com', password: 'password123' }) });
    data = await res.json();
    viewerToken = data.data?.accessToken;
    vh = { Authorization: `Bearer ${viewerToken}`, 'Content-Type': 'application/json' };
    log('Reactivate user and re-login', !!viewerToken);

    // ─── FINANCIAL RECORDS ───
    console.log('\n--- FINANCIAL RECORDS ---');
    res = await fetch(`${BASE}/api/records`, {
      method: 'POST', headers: ah,
      body: JSON.stringify({ amount: 9500, type: 'INCOME', category: 'Consulting', date: '2025-07-01', description: 'API test record' }),
    });
    data = await res.json();
    const newId = data.data?.record?.id;
    log('Create record (Admin)', res.status === 201 && !!newId);

    res = await fetch(`${BASE}/api/records`, { method: 'POST', headers: vh, body: JSON.stringify({ amount: 100, type: 'EXPENSE', category: 'Test', date: '2025-07-01' }) });
    log('Create record (Viewer) = FORBIDDEN', res.status === 403);

    res = await fetch(`${BASE}/api/records?page=1&limit=5`, { headers: vh });
    data = await res.json();
    log('View records (paginated)', data.success && data.data?.length <= 5);
    console.log(`      Total: ${data.meta?.totalItems || 'N/A'}, Page: ${data.meta?.page || 'N/A'}/${data.meta?.totalPages || 'N/A'}`);

    res = await fetch(`${BASE}/api/records?type=INCOME`, { headers: ah });
    data = await res.json();
    log('Filter by type=INCOME', data.success && data.data?.every(r => r.type === 'INCOME'));

    res = await fetch(`${BASE}/api/records?category=Consulting`, { headers: ah });
    data = await res.json();
    log('Filter by category', data.success && data.data?.every(r => r.category === 'Consulting'));

    res = await fetch(`${BASE}/api/records?startDate=2025-01-01&endDate=2025-12-31`, { headers: ah });
    data = await res.json();
    log('Filter by date range', data.success && data.data?.length > 0);

    if (newId) {
      res = await fetch(`${BASE}/api/records/${newId}`, { headers: vh });
      data = await res.json();
      log('Get single record', data.success && data.data?.record?.amount === 9500);

      res = await fetch(`${BASE}/api/records/${newId}`, { method: 'PATCH', headers: ah, body: JSON.stringify({ amount: 12000, description: 'Updated' }) });
      data = await res.json();
      log('Update record (Admin)', data.success && data.data?.record?.amount === 12000);

      res = await fetch(`${BASE}/api/records/${newId}`, { method: 'DELETE', headers: ah });
      data = await res.json();
      log('Delete record (soft)', data.success);

      res = await fetch(`${BASE}/api/records/${newId}`, { headers: ah });
      log('Deleted record = 404', res.status === 404);
    }

    // ─── DASHBOARD ───
    console.log('\n--- DASHBOARD ANALYTICS ---');
    res = await fetch(`${BASE}/api/dashboard/summary`, { headers: anh });
    data = await res.json();
    log('Summary (Analyst)', data.success && data.data?.totalRecords > 0);
    console.log(`      Income: ${data.data?.totalIncome} | Expenses: ${data.data?.totalExpenses} | Net: ${data.data?.netBalance}`);

    res = await fetch(`${BASE}/api/dashboard/category-breakdown`, { headers: anh });
    data = await res.json();
    log('Category breakdown', data.success && data.data?.length > 0);

    res = await fetch(`${BASE}/api/dashboard/monthly-trends`, { headers: ah });
    data = await res.json();
    log('Monthly trends', data.success && data.data?.length > 0);

    res = await fetch(`${BASE}/api/dashboard/recent-activity`, { headers: vh });
    data = await res.json();
    log('Recent activity (Viewer)', data.success && data.data?.length > 0);

    res = await fetch(`${BASE}/api/dashboard/summary`, { headers: vh });
    log('Summary (Viewer) = FORBIDDEN', res.status === 403);

    // ─── RBAC ───
    console.log('\n--- RBAC VERIFICATION ---');
    res = await fetch(`${BASE}/api/records`, { method: 'POST', headers: vh, body: JSON.stringify({ amount: 1, type: 'INCOME', category: 'X', date: '2025-01-01' }) });
    log('Viewer cannot create records', res.status === 403);

    res = await fetch(`${BASE}/api/users`, { headers: anh });
    log('Analyst cannot list users', res.status === 403);

    res = await fetch(`${BASE}/api/dashboard/summary`, { headers: ah });
    log('Admin can access dashboard', (await res.json()).success);

    // ─── RESULTS ───
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    console.log(`\n==================================================`);
    console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${results.length} total`);
    console.log(`==================================================`);
    if (failed > 0) {
      console.log('\n  Failed tests:');
      results.filter(r => !r.pass).forEach(r => console.log(`    FAIL: ${r.name}`));
    }
  } catch (error) {
    console.error('Test error:', error.message);
    console.error('Stack:', error.stack?.split('\n')[1]);
  }
}
test();
