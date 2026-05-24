import { API_URL } from "./db";

const ItemSchema = {
  validate: (item: any) => {
    if (!item.product_id || !item.name || !item.price || !item.quantity) {
      throw new Error("Invalid item");
    }
    return item;
  }
};

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

export async function trackOrder(id: string) {
  const res = await fetch(`${API_URL}/api/orders/track/${id}`);
  if (res.status === 404) throw new Error("Order not found.");
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return await res.json();
}