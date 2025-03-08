const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Drop both problematic indexes
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.dropIndex('username_1').catch(() => {});
      await collection.dropIndex('phoneNumber_1').catch(() => {});
    }
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;