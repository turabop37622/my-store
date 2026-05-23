export const API_URL = "https://breezygo-admin-backend.turabop37622.workers.dev";

export async function fetchFromApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

let db: any = null;

export async function getDb() {
  if (!db) {
    const { MongoClient } = await import("mongodb");
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined");
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || "breezygo");
  }
  return db;
}