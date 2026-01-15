const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachpivot';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected:', mongoURI);
  } catch (error) {
    console.log('[info] Local MongoDB unavailable, using in-memory database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('[ok] MongoDB Memory Server connected');
    } catch (memError) {
      console.error('Connection error:', error);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
