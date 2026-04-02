import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ email: 'admin@finance.com' }).select('+password');
  console.log('User found:', !!user);
  console.log('Name:', user?.name);
  console.log('Role:', user?.role);
  console.log('Has password field:', !!user?.password);
  console.log('Password length:', user?.password?.length);
  
  if (user?.password) {
    const isValid = await bcrypt.compare('password123', user.password);
    console.log('Password valid:', isValid);
  }
  
  await mongoose.disconnect();
}

check();
