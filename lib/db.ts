import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

// Define the type for our global mongoose connection cache
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add mongoose to the global type
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: GlobalMongoose;
}

// Initialize the global mongoose connection cache
if (!global.mongooseConnection) {
  global.mongooseConnection = {
    conn: null,
    promise: null,
  };
}

export async function connectToDatabase() {
  if (global.mongooseConnection.conn) {
    console.log('Using existing MongoDB connection');
    return global.mongooseConnection.conn;
  }

  if (!global.mongooseConnection.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 2, // Kurangi minPoolSize untuk tier gratis MongoDB Atlas
      retryWrites: true,
      retryReads: true,
      serverSelectionTimeoutMS: 5000, // Timeout kalau gagal pilih server
      socketTimeoutMS: 45000, // Timeout untuk operasi socket
      connectTimeoutMS: 10000, // Timeout untuk koneksi awal
      heartbeatFrequencyMS: 10000, // Cek koneksi setiap 10 detik
    };

    console.log('Attempting to connect to MongoDB...');
    global.mongooseConnection.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('Connected to MongoDB');
        // Handle connection errors after initial connection
        mongooseInstance.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
          global.mongooseConnection.promise = null; // Reset promise kalau error
        });
        mongooseInstance.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected');
          global.mongooseConnection.promise = null; // Reset untuk retry
        });
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('MongoDB connection failed:', error);
        global.mongooseConnection.promise = null;
        throw error;
      });
  }

  try {
    global.mongooseConnection.conn = await global.mongooseConnection.promise;
    return global.mongooseConnection.conn;
  } catch (error) {
    console.error('Failed to establish MongoDB connection:', error);
    throw error;
  }
}