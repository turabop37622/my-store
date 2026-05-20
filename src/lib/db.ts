import { MongoClient } from "mongodb";

export const API_URL = "https://my-store-production-16a5.up.railway.app";

export async function fetchFromApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

let client: MongoClient | null = null;
let db: any = null;

export async function getDb() {
  if (!db) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || "breezygo");
  }
  return db;
}