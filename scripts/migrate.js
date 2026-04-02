import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
  console.log('🔄 Running MongoDB setup...');

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_dashboard';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Import models to register schemas and create indexes
    const { default: User } = await import('../src/models/User.js');
    const { default: FinancialRecord } = await import('../src/models/FinancialRecord.js');
    const { default: RefreshToken } = await import('../src/models/RefreshToken.js');

    // Ensure indexes are created
    await User.createIndexes();
    console.log('✅ User indexes created');

    await FinancialRecord.createIndexes();
    console.log('✅ FinancialRecord indexes created');

    await RefreshToken.createIndexes();
    console.log('✅ RefreshToken indexes created');

    console.log('\n🎉 MongoDB setup completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrate();
