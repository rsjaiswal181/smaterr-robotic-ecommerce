import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
    logger.info(`API base path: http://localhost:${env.port}/api`);
  });
};

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.stack || err.message}`);
  process.exit(1);
});

start();
