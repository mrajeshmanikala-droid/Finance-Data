import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';
import logger from './utils/logger.js';

const startServer = async () => {
  // Connect to MongoDB
  const dbConnected = await connectDatabase();

  if (!dbConnected) {
    logger.error('Failed to connect to MongoDB. Exiting...');
    process.exit(1);
  }

  app.listen(env.port, () => {
    logger.info(`🚀 Server running on http://localhost:${env.port}`);
    logger.info(`📚 API Docs: http://localhost:${env.port}/api-docs`);
    logger.info(`🌍 Environment: ${env.nodeEnv}`);
  });
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
