const serverless = require('serverless-http');
const { default: app } = require('../backend/dist/app');
const { connectDB } = require('./db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  
  return serverless(app)(req, res);
};
