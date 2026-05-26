import { API_URL } from "./db";

export async function placeOrder(data: {
  customer_name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  postal_code?: string | null;
  notes?: string | null;
  discount_code?: string | null;
  items: Array<{
    product_id: string;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string | null;
  }>;
}) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not place order. Please try again.");
  return await res.json();
}

export async function trackOrder(query: string) {
  if (typeof window === "undefined") throw new Error("Client only");
  const res = await fetch(`${API_URL}/api/orders/track/${encodeURIComponent(query.trim())}`);
  if (res.status === 404) throw new Error("Order not found. Please check your Order ID, phone number, or email.");
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  if (data.orders) return data;
  return { type: 'single', orders: [data] };
}