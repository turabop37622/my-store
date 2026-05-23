export const API_URL = "https://breezygo-admin-backend.turabop37622.workers.dev";

export async function fetchFromApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getDb() {
  const { MongoClient } = await import("mongodb");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(process.env.MONGODB_DB || "breezygo");
}