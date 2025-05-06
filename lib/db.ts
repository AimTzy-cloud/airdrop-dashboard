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

export async function connectToDatabase() {
  if (global.mongooseConnection.conn) {
    return global.mongooseConnection.conn
  }

  if (!global.mongooseConnection.promise) {
    const opts = {
      bufferCommands: false,
    }

    global.mongooseConnection.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance: typeof mongoose) => {
        console.log("Connected to MongoDB")
        return mongooseInstance
      })
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