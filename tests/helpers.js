import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import env from '../src/config/env.js';
import User from '../src/models/User.js';
import FinancialRecord from '../src/models/FinancialRecord.js';
import RefreshToken from '../src/models/RefreshToken.js';

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_test';

/**
 * Connect to test database
 */
export async function connectTestDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
  }
}

/**
 * Disconnect from test database
 */
export async function disconnectTestDB() {
  await mongoose.disconnect();
}

/**
 * Create a test user directly in the database
 */
export async function createTestUser(overrides = {}) {
  const hashedPassword = await bcrypt.hash(overrides.password || 'password123', 4); // lower rounds for speed

  const user = await User.create({
    email: overrides.email || `test_${Date.now()}@test.com`,
    password: hashedPassword,
    name: overrides.name || 'Test User',
    role: overrides.role || 'VIEWER',
    status: overrides.status || 'ACTIVE',
  });

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

/**
 * Generate a valid access token for a user
 */
export function generateTestToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.jwt.accessSecret,
    { expiresIn: '1h' }
  );
}

/**
 * Clean up all test data from the database
 */
export async function cleanDatabase() {
  await RefreshToken.deleteMany({});
  await FinancialRecord.deleteMany({});
  await User.deleteMany({});
}

/**
 * Create a test financial record
 */
export async function createTestRecord(userId, overrides = {}) {
  const record = await FinancialRecord.create({
    amount: overrides.amount || 1000.0,
    type: overrides.type || 'INCOME',
    category: overrides.category || 'Salary',
    date: new Date(overrides.date || '2025-06-15'),
    description: overrides.description || 'Test record',
    userId: userId,
    isDeleted: overrides.isDeleted || false,
  });

  return {
    id: record._id.toString(),
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    description: record.description,
    userId: record.userId.toString(),
    isDeleted: record.isDeleted,
  };
}
