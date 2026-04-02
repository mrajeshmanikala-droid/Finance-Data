import { Router } from 'express';
import dashboardController from './dashboard.controller.js';
import authenticate from '../../middlewares/auth.js';
import authorize from '../../middlewares/rbac.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get financial summary (Analyst and Admin)
 *     description: Returns total income, total expenses, net balance, and total record count
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 netBalance:
 *                   type: number
 *                 totalRecords:
 *                   type: integer
 */
router.get('/summary', authorize('ANALYST', 'ADMIN'), dashboardController.getSummary);

/**
 * @swagger
 * /api/dashboard/category-breakdown:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get category breakdown (Analyst and Admin)
 *     description: Returns totals grouped by category and type
 *     responses:
 *       200:
 *         description: Category breakdown
 */
router.get(
  '/category-breakdown',
  authorize('ANALYST', 'ADMIN'),
  dashboardController.getCategoryBreakdown
);

/**
 * @swagger
 * /api/dashboard/monthly-trends:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get monthly income/expense trends (Analyst and Admin)
 *     description: Returns monthly income, expenses, and net for the last 12 months
 *     responses:
 *       200:
 *         description: Monthly trends
 */
router.get(
  '/monthly-trends',
  authorize('ANALYST', 'ADMIN'),
  dashboardController.getMonthlyTrends
);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent activity (all authenticated users)
 *     description: Returns the latest 10 financial records
 *     responses:
 *       200:
 *         description: Recent activity
 */
router.get(
  '/recent-activity',
  authorize('VIEWER', 'ANALYST', 'ADMIN'),
  dashboardController.getRecentActivity
);

export default router;
