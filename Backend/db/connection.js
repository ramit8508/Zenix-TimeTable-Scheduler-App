const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECT, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.log('⚠️  Please check your MongoDB credentials in .env file');
    console.log('ℹ️  Server will continue but authentication will not work\n');
    
    // Prevent Mongoose from buffering operations
    mongoose.set('bufferCommands', false);
    
    return null;
  }
};

module.exports = connectDB;
