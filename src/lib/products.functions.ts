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
  images?: string[];
  stock?: number;
  is_active?: boolean;
  hero_image?: string;
  hero_image_mobile?: string;
  hero_text?: string;
  hero_subtitle?: string;
  watermark_image?: string;
  watermark_title?: string;
  watermark_text?: string;
  qty2_discount_percent?: number;
  qty3_discount_percent?: number;
  features?: any[];
  sound_tabs?: any[];
  specs?: any[];
  testimonials?: any[];
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

export async function getProductBySlug({ data }: { data: { slug: string } }): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/products/${data.slug}`);
    if (!res.ok) return null;
    return await res.json() as Product;
  } catch {
    return null;
  }
}