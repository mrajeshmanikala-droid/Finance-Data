import FinancialRecord from '../../models/FinancialRecord.js';

class DashboardService {
  async getSummary() {
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0] },
          },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { totalIncome: 0, totalExpenses: 0, netBalance: 0, totalRecords: 0 };
    }

    const { totalIncome, totalExpenses, totalRecords } = result[0];
    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalRecords,
    };
  }

  async getCategoryBreakdown() {
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          totalAmount: { $sum: '$amount' },
          recordCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    return result.map((row) => ({
      category: row._id.category,
      type: row._id.type,
      totalAmount: row.totalAmount,
      recordCount: row.recordCount,
    }));
  }

  async getMonthlyTrends() {
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0] },
          },
          expenses: {
            $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]);

    return result.map((row) => ({
      month: row._id,
      income: row.income,
      expenses: row.expenses,
      net: row.income - row.expenses,
    }));
  }

  async getRecentActivity() {
    const records = await FinancialRecord.find({ isDeleted: false })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return records;
  }
}

export default new DashboardService();
