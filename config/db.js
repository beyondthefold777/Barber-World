const mongoose = require('mongoose');
const { config } = require('./railway');

const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;