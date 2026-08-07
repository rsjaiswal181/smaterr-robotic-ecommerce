import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import app from '../backend/src/app';

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase();
  return app(req, res);
}
