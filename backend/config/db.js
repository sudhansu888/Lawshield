const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lawshield';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local mongod is not running
    });
    isConnectedToMongo = true;
    console.log(`[LawShield Database] MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isConnectedToMongo = false;
    console.warn(`[LawShield Database] MongoDB connection failed (${error.message}). Operating in resilient local storage mode.`);
  }
};

const isMongoActive = () => isConnectedToMongo;

module.exports = { connectDB, isMongoActive };
