import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid user ID'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).max(100).optional(),
  }).refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    { message: 'Current password is required to set a new password', path: ['currentPassword'] }
  ),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid user ID'),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional(),
    role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    search: z.string().optional(),
  }),
});
