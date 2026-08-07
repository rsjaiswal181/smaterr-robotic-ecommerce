const app = require('./_app').default;
const mongoose = require('mongoose');

let isConnected = false;

async function connectToDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri);
  isConnected = true;
}

module.exports = async function handler(req, res) {
  try {
    await connectToDB();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
    return;
  }
  return app(req, res);
};
