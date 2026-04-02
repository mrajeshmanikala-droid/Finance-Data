import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import {
  createTestUser,
  generateTestToken,
  createTestRecord,
  cleanDatabase,
  connectTestDB,
  disconnectTestDB,
} from './helpers.js';

describe('Records Endpoints', () => {
  let adminUser, adminToken, viewerUser, viewerToken;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanDatabase();

    adminUser = await createTestUser({ email: 'admin@test.com', role: 'ADMIN', password: 'password123' });
    adminToken = generateTestToken(adminUser);

    viewerUser = await createTestUser({ email: 'viewer@test.com', role: 'VIEWER', password: 'password123' });
    viewerToken = generateTestToken(viewerUser);
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDB();
  });

  describe('POST /api/records', () => {
    it('should allow admin to create a record', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: 'INCOME',
          category: 'Salary',
          date: '2025-06-15',
          description: 'Monthly salary',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.record.amount).toBe(5000);
      expect(res.body.data.record.type).toBe('INCOME');
    });

    it('should forbid viewer from creating records', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 5000,
          type: 'INCOME',
          category: 'Salary',
          date: '2025-06-15',
        });

      expect(res.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 5000 });

      expect(res.status).toBe(400);
    });

    it('should reject negative amount', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100,
          type: 'INCOME',
          category: 'Salary',
          date: '2025-06-15',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/records', () => {
    it('should list records with pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await createTestRecord(adminUser.id, {
          amount: (i + 1) * 1000,
          category: `Category${i}`,
        });
      }

      const res = await request(app)
        .get('/api/records?page=1&limit=3')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
      expect(res.body.meta.totalItems).toBe(5);
      expect(res.body.meta.totalPages).toBe(2);
    });

    it('should filter by type', async () => {
      await createTestRecord(adminUser.id, { type: 'INCOME' });
      await createTestRecord(adminUser.id, { type: 'EXPENSE' });

      const res = await request(app)
        .get('/api/records?type=INCOME')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((record) => {
        expect(record.type).toBe('INCOME');
      });
    });

    it('should filter by category', async () => {
      await createTestRecord(adminUser.id, { category: 'Salary' });
      await createTestRecord(adminUser.id, { category: 'Rent' });

      const res = await request(app)
        .get('/api/records?category=Salary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((record) => {
        expect(record.category).toBe('Salary');
      });
    });

    it('should filter by date range', async () => {
      await createTestRecord(adminUser.id, { date: '2025-01-15' });
      await createTestRecord(adminUser.id, { date: '2025-06-15' });
      await createTestRecord(adminUser.id, { date: '2025-12-15' });

      const res = await request(app)
        .get('/api/records?startDate=2025-01-01&endDate=2025-06-30')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('should not return soft-deleted records', async () => {
      await createTestRecord(adminUser.id, { isDeleted: true });
      await createTestRecord(adminUser.id, { isDeleted: false });

      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/records/:id', () => {
    it('should get a single record', async () => {
      const record = await createTestRecord(adminUser.id);

      const res = await request(app)
        .get(`/api/records/${record.id}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.record.id).toBe(record.id);
    });

    it('should return 404 for non-existent record', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/records/${fakeId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/records/:id', () => {
    it('should allow admin to update a record', async () => {
      const record = await createTestRecord(adminUser.id);

      const res = await request(app)
        .patch(`/api/records/${record.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 9999.99 });

      expect(res.status).toBe(200);
      expect(parseFloat(res.body.data.record.amount)).toBeCloseTo(9999.99);
    });
  });

  describe('DELETE /api/records/:id', () => {
    it('should soft-delete a record', async () => {
      const record = await createTestRecord(adminUser.id);

      const res = await request(app)
        .delete(`/api/records/${record.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);

      // Verify it's not returned in list
      const listRes = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.body.data.length).toBe(0);
    });
  });
});
