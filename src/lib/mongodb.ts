import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI as string;

console.log(MONGODB_URI)

if (!MONGODB_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Helper function to format timestamps
const time = () => new Date().toLocaleTimeString();

export async function connectDB() {
  if (cached.conn) {
    console.log(`🟢 [${time()}] [MongoDB] Using existing connection`);
    logConnectionStats();
    return cached.conn;
  }

  if (!cached.promise) {
    console.log(
      `🟡 [${time()}] [MongoDB] No cached connection found. Creating a new one...`
    );

    const opts = {
      bufferCommands: false,
      maxPoolSize: 5, // Recommended for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(
        `✅ [${time()}] [MongoDB] New connection established successfully`
      );
      logConnectionStats();
      return mongoose;
    });

    // --- Connection event listeners ---
    mongoose.connection.on("connecting", () => {
      console.log(`🕓 [${time()}] [MongoDB] Connecting...`);
    });

    mongoose.connection.on("connected", () => {
      console.log(`🔗 [${time()}] [MongoDB] Connection open`);
      logConnectionStats();
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(`⚠️ [${time()}] [MongoDB] Connection disconnected`);
      logConnectionStats();
    });

    mongoose.connection.on("reconnected", () => {
      console.log(`♻️ [${time()}] [MongoDB] Connection reestablished`);
      logConnectionStats();
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ [${time()}] [MongoDB] Connection error:`, err);
      logConnectionStats();
    });
  } else {
    console.log(
      `⏳ [${time()}] [MongoDB] Waiting for existing connection promise...`
    );
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Log connection stats (active, available, total created)
async function logConnectionStats() {
  try {
    if (!mongoose.connection.db) {
      console.warn(`⚙️ [${time()}] [MongoDB] Database not available for stats`);
      return;
    }
    
    const admin = mongoose.connection.db.admin();
    const { connections } = await admin.serverStatus();

    console.log(
      `🔢 [${time()}] [MongoDB Stats] Active: ${
        connections.current
      }, Available: ${connections.available}, Total Created: ${
        connections.totalCreated
      }`
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(
      `⚙️ [${time()}] [MongoDB] Could not fetch connection stats:`,
      errorMessage
    );
  }
}
