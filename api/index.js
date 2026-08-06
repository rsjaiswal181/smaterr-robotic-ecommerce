module.exports = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    env: {
      MONGO_URI: process.env.MONGO_URI ? 'set' : 'NOT SET',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ? 'set' : 'NOT SET',
      CLIENT_URL: process.env.CLIENT_URL || 'NOT SET',
    }
  });
};
