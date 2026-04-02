import mongoose from 'mongoose';

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['INCOME', 'EXPENSE'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Compound indexes for common query patterns
financialRecordSchema.index({ isDeleted: 1, type: 1, date: -1 });
financialRecordSchema.index({ isDeleted: 1, category: 1 });
financialRecordSchema.index({ userId: 1, isDeleted: 1 });

const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);
export default FinancialRecord;
