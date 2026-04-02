import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.js';
import FinancialRecord from '../src/models/FinancialRecord.js';

const seed = async () => {
  console.log('🌱 Seeding database...');

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_dashboard';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // ─── Create Demo Users ──────────────────────────────
    const hashedPassword = await bcrypt.hash('password123', 12);

    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@finance.com' },
      { email: 'admin@finance.com', password: hashedPassword, name: 'Alice Admin', role: 'ADMIN', status: 'ACTIVE' },
      { upsert: true, new: true }
    );

    const analystUser = await User.findOneAndUpdate(
      { email: 'analyst@finance.com' },
      { email: 'analyst@finance.com', password: hashedPassword, name: 'Bob Analyst', role: 'ANALYST', status: 'ACTIVE' },
      { upsert: true, new: true }
    );

    const viewerUser = await User.findOneAndUpdate(
      { email: 'viewer@finance.com' },
      { email: 'viewer@finance.com', password: hashedPassword, name: 'Charlie Viewer', role: 'VIEWER', status: 'ACTIVE' },
      { upsert: true, new: true }
    );

    console.log('✅ Demo users created (password: password123)');
    console.log('   - admin@finance.com (ADMIN)');
    console.log('   - analyst@finance.com (ANALYST)');
    console.log('   - viewer@finance.com (VIEWER)');

    // ─── Create Sample Financial Records ─────────────────
    const categories = {
      INCOME: ['Salary', 'Freelancing', 'Investments', 'Rental Income', 'Bonus', 'Consulting'],
      EXPENSE: ['Rent', 'Utilities', 'Office Supplies', 'Marketing', 'Travel', 'Software', 'Insurance', 'Payroll', 'Maintenance', 'Food & Beverage'],
    };

    const descriptions = {
      Salary: ['Monthly salary payment', 'Base salary Q1', 'Salary with overtime'],
      Freelancing: ['Web development project', 'Design consultation', 'Content writing gig'],
      Investments: ['Stock dividend payout', 'Mutual fund returns', 'Bond interest'],
      'Rental Income': ['Office space rental', 'Equipment rental fee', 'Property rental'],
      Bonus: ['Annual performance bonus', 'Holiday bonus', 'Referral bonus'],
      Consulting: ['Strategy consulting fee', 'IT consulting project', 'Financial advisory'],
      Rent: ['Office rent payment', 'Warehouse rental', 'Co-working space'],
      Utilities: ['Electricity bill', 'Internet service', 'Water and gas bill'],
      'Office Supplies': ['Printer cartridges', 'Stationery order', 'Furniture purchase'],
      Marketing: ['Google Ads campaign', 'Social media campaign', 'Print advertising'],
      Travel: ['Business trip airfare', 'Hotel accommodation', 'Client meeting travel'],
      Software: ['SaaS subscription', 'License renewal', 'Cloud hosting fees'],
      Insurance: ['Business insurance premium', 'Health insurance', 'Equipment insurance'],
      Payroll: ['Employee salaries', 'Contractor payments', 'Payroll taxes'],
      Maintenance: ['Office maintenance', 'Equipment repair', 'System upgrade'],
      'Food & Beverage': ['Team lunch', 'Client dinner', 'Office coffee supplies'],
    };

    // Delete existing records to avoid duplicates on re-seed
    await FinancialRecord.deleteMany({});

    const records = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2025-12-31');

    for (let i = 0; i < 50; i++) {
      const type = Math.random() > 0.4 ? 'INCOME' : 'EXPENSE';
      const typeCats = categories[type];
      const category = typeCats[Math.floor(Math.random() * typeCats.length)];
      const catDescs = descriptions[category] || ['Transaction'];
      const description = catDescs[Math.floor(Math.random() * catDescs.length)];

      const amount =
        type === 'INCOME'
          ? parseFloat((Math.random() * 15000 + 1000).toFixed(2))
          : parseFloat((Math.random() * 5000 + 100).toFixed(2));

      const date = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );

      records.push({
        amount,
        type,
        category,
        date,
        description,
        userId: adminUser._id,
        isDeleted: false,
      });
    }

    await FinancialRecord.insertMany(records);
    console.log(`✅ ${records.length} sample financial records created`);

    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
