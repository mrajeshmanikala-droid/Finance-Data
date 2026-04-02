import request from 'supertest';
import app from '../src/app.js';
import {
  createTestUser,
  generateTestToken,
  createTestRecord,
  cleanDatabase,
  connectTestDB,
  disconnectTestDB,
} from './helpers.js';

describe('Dashboard Endpoints', () => {
  let adminUser, adminToken, analystUser, analystToken, viewerUser, viewerToken;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanDatabase();

    adminUser = await createTestUser({ email: 'admin@test.com', role: 'ADMIN', password: 'password123' });
    adminToken = generateTestToken(adminUser);

    analystUser = await createTestUser({ email: 'analyst@test.com', role: 'ANALYST', password: 'password123' });
    analystToken = generateTestToken(analystUser);

    viewerUser = await createTestUser({ email: 'viewer@test.com', role: 'VIEWER', password: 'password123' });
    viewerToken = generateTestToken(viewerUser);

    // Seed test data for dashboard analytics
    await createTestRecord(adminUser.id, { amount: 5000, type: 'INCOME', category: 'Salary', date: '2025-01-15' });
    await createTestRecord(adminUser.id, { amount: 3000, type: 'INCOME', category: 'Freelancing', date: '2025-02-10' });
    await createTestRecord(adminUser.id, { amount: 1200, type: 'EXPENSE', category: 'Rent', date: '2025-01-20' });
    await createTestRecord(adminUser.id, { amount: 800, type: 'EXPENSE', category: 'Utilities', date: '2025-02-05' });
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDB();
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return financial summary for analyst', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('totalExpenses');
      expect(res.body.data).toHaveProperty('netBalance');
      expect(res.body.data).toHaveProperty('totalRecords');
      expect(res.body.data.totalIncome).toBe(8000);
      expect(res.body.data.totalExpenses).toBe(2000);
      expect(res.body.data.netBalance).toBe(6000);
      expect(res.body.data.totalRecords).toBe(4);
    });

    it('should return summary for admin', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should forbid viewer from accessing summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/category-breakdown', () => {
    it('should return category breakdown for analyst', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      res.body.data.forEach((item) => {
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('totalAmount');
        expect(item).toHaveProperty('recordCount');
      });
    });

    it('should forbid viewer from accessing category breakdown', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/monthly-trends', () => {
    it('should return monthly trends for admin', async () => {
      const res = await request(app)
        .get('/api/dashboard/monthly-trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      res.body.data.forEach((item) => {
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('income');
        expect(item).toHaveProperty('expenses');
        expect(item).toHaveProperty('net');
      });
    });
  });

  describe('GET /api/dashboard/recent-activity', () => {
    it('should return recent activity for viewer', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should return recent activity for all roles', async () => {
      for (const token of [viewerToken, analystToken, adminToken]) {
        const res = await request(app)
          .get('/api/dashboard/recent-activity')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
      }
    });
  });
});
