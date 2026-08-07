import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${(error as Error).message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
