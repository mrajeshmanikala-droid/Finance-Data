import dotenv from 'dotenv';
dotenv.config();

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_dashboard',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  },
};

export default env;
