import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import app from '../backend/src/app';

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
