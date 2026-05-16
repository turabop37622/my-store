export const API_URL = "https://my-store-production-ed96.up.railway.app";

export async function fetchFromApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}