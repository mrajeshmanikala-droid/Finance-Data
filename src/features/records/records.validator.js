import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, 'Category is required').max(100),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    description: z.string().max(500).optional(),
  }),
});

export const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().min(1).max(100).optional(),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
      .optional(),
    description: z.string().max(500).optional().nullable(),
  }),
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid record ID'),
  }),
});

export const getRecordSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid record ID'),
  }),
});

export const listRecordsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().optional(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid start date')
      .optional(),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid end date')
      .optional(),
    sortBy: z.enum(['date', 'amount', 'createdAt']).default('date').optional(),
    order: z.enum(['asc', 'desc']).default('desc').optional(),
    search: z.string().optional(),
  }),
});
