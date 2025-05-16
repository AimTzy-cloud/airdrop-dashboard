import 'dotenv/config';
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/airdrop-tracker"

// Bikin tipe buat cache koneksi mongoose global
interface GlobalMongoose {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Tambahin mongoose ke tipe global
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: GlobalMongoose
}

// Inisialisasi cache koneksi mongoose global
if (!global.mongooseConnection) {
  global.mongooseConnection = {
    conn: null,
    promise: null,
  }
}

// Maksimal coba ulang koneksi ke database
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 detik

export async function connectToDatabase() {
  // Kalo udah ada koneksi, langsung balikin
  if (global.mongooseConnection.conn) {
    return global.mongooseConnection.conn
  }

  // Kalo belum ada promise koneksi, bikin baru
  if (!global.mongooseConnection.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maksimal koneksi di pool
      minPoolSize: 5, // Minimal koneksi di pool
      retryWrites: true,
      retryReads: true,
    }

    let retries = 0
    const connectWithRetry = async () => {
      try {
        const mongooseInstance = await mongoose.connect(MONGODB_URI, opts)
        console.log("Berhasil konek ke MongoDB")
        return mongooseInstance
      } catch (error) {
        if (retries < MAX_RETRIES) {
          retries++
          console.log(`Gagal konek ke MongoDB (percobaan ${retries}). Coba lagi dalam ${RETRY_DELAY}ms...`)
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
    console.error("Error konek ke MongoDB:", e)
    throw e
  }

  return global.mongooseConnection.conn
}