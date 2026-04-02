import ApiError from '../../utils/ApiError.js';
import FinancialRecord from '../../models/FinancialRecord.js';

class RecordsService {
  async createRecord(data, userId) {
    const record = await FinancialRecord.create({
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: new Date(data.date),
      description: data.description || null,
      userId,
    });

    return record.toJSON();
  }

  async listRecords({
    page = 1,
    limit = 20,
    type,
    category,
    startDate,
    endDate,
    sortBy = 'date',
    order = 'desc',
    search,
  }) {
    const filter = { isDeleted: false };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const allowedSortFields = ['date', 'amount', 'createdAt'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;

    const totalItems = await FinancialRecord.countDocuments(filter);
    const records = await FinancialRecord.find(filter)
      .populate('userId', 'name email')
      .sort({ [safeSort]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    return { records, totalItems, page, limit };
  }

  async getRecordById(id) {
    const record = await FinancialRecord.findOne({ _id: id, isDeleted: false })
      .populate('userId', 'name email');

    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

    return record;
  }

  async updateRecord(id, updateData) {
    const record = await FinancialRecord.findOne({ _id: id, isDeleted: false });
    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

    if (updateData.amount !== undefined) record.amount = updateData.amount;
    if (updateData.type !== undefined) record.type = updateData.type;
    if (updateData.category !== undefined) record.category = updateData.category;
    if (updateData.date !== undefined) record.date = new Date(updateData.date);
    if (updateData.description !== undefined) record.description = updateData.description;

    await record.save();
    return FinancialRecord.findById(id).populate('userId', 'name email');
  }

  async deleteRecord(id) {
    const record = await FinancialRecord.findOne({ _id: id, isDeleted: false });
    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

    record.isDeleted = true;
    await record.save();

    return { id, deleted: true };
  }
}

export default new RecordsService();
