const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB Atlas connected');
  } catch (error) {
    console.error('MongoDB Atlas connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
