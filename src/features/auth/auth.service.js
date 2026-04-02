import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';
import User from '../../models/User.js';
import RefreshToken from '../../models/RefreshToken.js';

class AuthService {
  async register({ email, password, name }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'VIEWER',
      status: 'ACTIVE',
    });

    return user.toJSON();
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.status === 'INACTIVE') {
      throw ApiError.unauthorized('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user._id);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshTokenStr) {
    const tokenRecord = await RefreshToken.findOne({
      token: refreshTokenStr,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findOne({ _id: tokenRecord.userId, status: 'ACTIVE' });

    if (!user) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    await RefreshToken.deleteOne({ _id: tokenRecord._id });

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user._id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenStr) {
    await RefreshToken.deleteOne({ token: refreshTokenStr });
  }

  generateAccessToken(user) {
    return jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      env.jwt.accessSecret,
      { expiresIn: env.jwt.accessExpiry }
    );
  }

  async generateRefreshToken(userId) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({ token, userId, expiresAt });

    return token;
  }
}

export default new AuthService();
