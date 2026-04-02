import mongoose from 'mongoose';
import env from './env.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

export default mongoose;
