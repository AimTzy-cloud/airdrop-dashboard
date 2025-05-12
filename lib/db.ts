import 'dotenv/config';
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/airdrop-tracker"

// Define the type for our global mongoose connection cache
interface GlobalMongoose {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Add mongoose to the global type
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: GlobalMongoose
}

// Initialize the global mongoose connection cache
if (!global.mongooseConnection) {
  global.mongooseConnection = {
    conn: null,
    promise: null,
  }
}

// Maximum number of retries for database connection
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

export async function connectToDatabase() {
  if (global.mongooseConnection.conn) {
    return global.mongooseConnection.conn
  }

  if (!global.mongooseConnection.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds timeout for operations
      connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 5, // Minimum number of connections in the pool
      retryWrites: true,
      retryReads: true,
    }

    let retries = 0
    const connectWithRetry = async () => {
      try {
        const mongooseInstance = await mongoose.connect(MONGODB_URI, opts)
        console.log("Connected to MongoDB")
        return mongooseInstance
      } catch (error) {
        if (retries < MAX_RETRIES) {
          retries++
          console.log(`MongoDB connection attempt ${retries} failed. Retrying in ${RETRY_DELAY}ms...`)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          return connectWithRetry()
        }
        throw error
      }
    }

    global.mongooseConnection.promise = connectWithRetry()
  }

  try {
    global.mongooseConnection.conn = await global.mongooseConnection.promise
  } catch (e) {
    global.mongooseConnection.promise = null
    console.error("Error connecting to MongoDB:", e)
    throw e
  }

  return global.mongooseConnection.conn
}