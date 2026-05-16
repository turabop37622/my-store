import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db";

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
    const db = await getDb();
    const products = await db
      .collection("products")
      .find({ is_active: true })
      .sort({ sort_order: 1 })
      .toArray();

    return products.map((p) => {
      const { _id, ...rest } = p;
      return {
        ...rest,
        id: _id.toString(),
      };
    }) as unknown as Product[];
  } catch (err) {
    console.error("Error in listProducts server function:", err);
    return []; // Return empty array instead of throwing
  }
});


export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data }) => {
    const db = await getDb();
    const product = await db
      .collection("products")
      .findOne({ slug: data.slug, is_active: true });

    if (!product) return null;

    const { _id, ...rest } = product;
    return {
      ...rest,
      id: _id.toString(),
    } as unknown as Product;
  });


