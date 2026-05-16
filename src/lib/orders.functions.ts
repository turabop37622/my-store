import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API_URL = "https://my-store-production-16a5.up.railway.app";

const ItemSchema = z.object({
  product_id: z.string().min(1),
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  price: z.number().min(0).max(1_000_000),
  quantity: z.number().int().min(1).max(50),
  image_url: z.string().max(200).nullable().optional(),
});

const OrderSchema = z.object({
  customer_name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20).regex(/^[0-9+\-\s()]+$/),
  email: z.string().email().max(200).optional().nullable(),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  postal_code: z.string().max(20).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  discount_code: z.string().max(50).optional().nullable(),
  items: z.array(ItemSchema).min(1).max(20),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => OrderSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Could not place order. Please try again.");
    return await res.json();
  });

export const trackOrder = createServerFn({ method: "GET" })
  .inputValidator((id: string) => z.string().min(24).max(24).parse(id))
  .handler(async ({ data: id }) => {
    const res = await fetch(`${API_URL}/api/orders/track/${id}`);

    if (res.status === 404) throw new Error("Order not found.");
    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    return await res.json();
  });