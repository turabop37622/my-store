import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await fetch(`${API_URL}/api/products`);
    if (!res.ok) return [];
    return await res.json() as Product[];
  } catch (err) {
    console.error("Error in listProducts:", err);
    return [];
  }
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${data.slug}`);
      if (!res.ok) return null;
      return await res.json() as Product;
    } catch {
      return null;
    }
  });