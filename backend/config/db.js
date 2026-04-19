/**
 * Database Configuration
 * Connects to MongoDB Atlas using Mongoose
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB with recommended options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options prevent deprecation warnings
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
