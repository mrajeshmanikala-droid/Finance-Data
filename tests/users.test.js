import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { createTestUser, generateTestToken, cleanDatabase, connectTestDB, disconnectTestDB } from './helpers.js';

describe('Users Endpoints', () => {
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
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDB();
  });

  describe('GET /api/users/me', () => {
    it('should return own profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('viewer@test.com');
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update own profile name', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
    });
  });

  describe('GET /api/users', () => {
    it('should allow admin to list users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.meta).toHaveProperty('totalItems');
      expect(res.body.meta).toHaveProperty('totalPages');
    });

    it('should forbid non-admin from listing users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/api/users?role=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((user) => {
        expect(user.role).toBe('ADMIN');
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow admin to get user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/${viewerUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe(viewerUser.id);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should allow admin to update user role', async () => {
      const res = await request(app)
        .patch(`/api/users/${viewerUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'ANALYST' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('ANALYST');
    });

    it('should forbid non-admin from updating users', async () => {
      const res = await request(app)
        .patch(`/api/users/${viewerUser.id}`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ role: 'ADMIN' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should deactivate user (soft delete)', async () => {
      const res = await request(app)
        .delete(`/api/users/${viewerUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.status).toBe('INACTIVE');
    });
  });
});
