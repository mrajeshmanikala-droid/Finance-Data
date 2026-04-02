import request from 'supertest';
import app from '../src/app.js';
import { createTestUser, cleanDatabase, connectTestDB, disconnectTestDB } from './helpers.js';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'newuser@test.com',
        password: 'password123',
        name: 'New User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('newuser@test.com');
      expect(res.body.data.user.role).toBe('VIEWER');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      await createTestUser({ email: 'duplicate@test.com' });

      const res = await request(app).post('/api/auth/register').send({
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'Duplicate',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'password123',
        name: 'Test',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'user@test.com',
        password: '123',
        name: 'Test',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser({ email: 'login@test.com', password: 'password123' });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('login@test.com');
    });

    it('should reject invalid password', async () => {
      await createTestUser({ email: 'wrong@test.com', password: 'password123' });

      const res = await request(app).post('/api/auth/login').send({
        email: 'wrong@test.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });

    it('should reject inactive user', async () => {
      await createTestUser({
        email: 'inactive@test.com',
        password: 'password123',
        status: 'INACTIVE',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'inactive@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      await createTestUser({ email: 'refresh@test.com', password: 'password123' });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'refresh@test.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: loginRes.body.data.refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      await createTestUser({ email: 'logout@test.com', password: 'password123' });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'logout@test.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`)
        .send({ refreshToken: loginRes.body.data.refreshToken });

      expect(res.status).toBe(200);
    });
  });
});
