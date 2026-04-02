import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.accessSecret);

    // Verify user still exists and is active
    const user = await User.findOne({ _id: decoded.userId, status: 'ACTIVE' })
      .select('email name role status');

    if (!user) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    req.user = { id: user._id.toString(), email: user.email, name: user.name, role: user.role, status: user.status };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(ApiError.unauthorized(error.message));
  }
};

export default authenticate;
