import { Router } from 'express';
import recordsController from './records.controller.js';
import authenticate from '../../middlewares/auth.js';
import authorize from '../../middlewares/rbac.js';
import validate from '../../middlewares/validate.js';
import {
  createRecordSchema,
  updateRecordSchema,
  getRecordSchema,
  listRecordsSchema,
} from './records.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   post:
 *     tags: [Records]
 *     summary: Create a financial record (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created
 *       403:
 *         description: Admin access required
 */
router.post(
  '/',
  authorize('ADMIN'),
  validate(createRecordSchema),
  recordsController.createRecord
);

/**
 * @swagger
 * /api/records:
 *   get:
 *     tags: [Records]
 *     summary: List financial records (all authenticated users)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, created_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated records list
 */
router.get(
  '/',
  authorize('VIEWER', 'ANALYST', 'ADMIN'),
  recordsController.listRecords
);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     tags: [Records]
 *     summary: Get a single record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record details
 *       404:
 *         description: Record not found
 */
router.get(
  '/:id',
  authorize('VIEWER', 'ANALYST', 'ADMIN'),
  validate(getRecordSchema),
  recordsController.getRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     tags: [Records]
 *     summary: Update a record (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 */
router.patch(
  '/:id',
  authorize('ADMIN'),
  validate(updateRecordSchema),
  recordsController.updateRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     tags: [Records]
 *     summary: Soft-delete a record (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record deleted
 */
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(getRecordSchema),
  recordsController.deleteRecord
);

export default router;
