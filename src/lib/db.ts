import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "breezygo";

if (!uri) {
  throw new Error("MONGODB_URI missing from .env");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  try {
    console.log("Connecting to MongoDB...");
    const client = await MongoClient.connect(uri!);
    const db = client.db(dbName);
    console.log(`Successfully connected to MongoDB: ${dbName}`);

    cachedClient = client;
    cachedDb = db;

    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

