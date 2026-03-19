const mongoose = require('mongoose');

const connectDB = async (uri) => {
  const conn = await mongoose.connect(uri || process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
