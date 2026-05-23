import { API_URL } from "./db";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string;
  color: string | null;
  badge: string | null;
  rating: number | null;
  is_featured: boolean;
};

export async function listProducts(): Promise<Product[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(`${API_URL}/api/products`);
    if (!res.ok) return [];
    return await res.json() as Product[];
  } catch (err) {
    console.error("Error in listProducts:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`);
    if (!res.ok) return null;
    return await res.json() as Product;
  } catch {
    return null;
  }
}