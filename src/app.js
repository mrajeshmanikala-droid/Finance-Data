import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './features/auth/auth.routes.js';
import usersRoutes from './features/users/users.routes.js';
import recordsRoutes from './features/records/records.routes.js';
import dashboardRoutes from './features/dashboard/dashboard.routes.js';

const app = express();

// ─── Security ────────────────────────────────────────────
app.use(helmet());
app.use(cors());

// ─── Body Parsing ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ───────────────────────────────────────
app.use(generalLimiter);

// ─── API Documentation ──────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Finance Dashboard API Docs',
}));

// ─── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─── Global Error Handler ────────────────────────────────
app.use(errorHandler);

export default app;
