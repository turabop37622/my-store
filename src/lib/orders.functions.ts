import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "./db";

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

const SHIPPING_FEE = 0; // free shipping
const VALID_DISCOUNT_CODES: Record<string, number> = {
  "BREEZY10": 0.10,   // 10% off
  "WELCOME10": 0.10,  // 10% off
  "BREEZY20": 0.20,   // 20% off
};

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => OrderSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await getDb();
    
    // Re-price items server-side from DB to prevent tampering
    const objectIds = data.items.map((i) => new ObjectId(i.product_id));
    const dbProducts = await db
      .collection("products")
      .find({ _id: { $in: objectIds }, is_active: true })
      .project({ _id: 1, slug: 1, name: 1, price: 1, image_url: 1 })
      .toArray();

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));
    const trustedItems = data.items.map((i) => {
      const p = productMap.get(i.product_id);
      if (!p) throw new Error(`Product not available: ${i.name}`);
      return {
        product_id: p._id.toString(),
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        quantity: i.quantity,
        image_url: p.image_url,
        line_total: Number(p.price) * i.quantity,
      };
    });

    const subtotal = trustedItems.reduce((s, i) => s + i.line_total, 0);
    
    // Server-side discount code validation
    let discount_amount = 0;
    let verified_discount_code: string | null = null;
    if (data.discount_code) {
      const code = data.discount_code.toUpperCase().trim();
      const discountRate = VALID_DISCOUNT_CODES[code];
      if (discountRate) {
        discount_amount = Math.round(subtotal * discountRate);
        verified_discount_code = code;
      }
    }

    const total_amount = subtotal - discount_amount + SHIPPING_FEE;

    const result = await db.collection("orders").insertOne({
      customer_name: data.customer_name,
      phone: data.phone,
      email: data.email ?? null,
      address: data.address,
      city: data.city,
      postal_code: data.postal_code ?? null,
      notes: data.notes ?? null,
      discount_code: verified_discount_code,
      discount_amount,
      items: trustedItems,
      subtotal,
      shipping_fee: SHIPPING_FEE,
      total_amount,
      status: "pending",
      created_at: new Date(),
    });

    if (!result.acknowledged) {
      throw new Error("Could not place order. Please try again.");
    }
    
    return { id: result.insertedId.toString(), total_amount };
  });

export const trackOrder = createServerFn({ method: "GET" })
  .inputValidator((id: string) => z.string().min(24).parse(id))
  .handler(async ({ data: id }) => {
    try {
      const db = await getDb();
      const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
      
      if (!order) {
        throw new Error("Order not found. Please check the ID and try again.");
      }

      return {
        id: order._id.toString(),
        status: order.status || "pending",
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        created_at: order.created_at,
        items: order.items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price
        }))
      };
    } catch (err) {
      throw new Error("Invalid Order ID or server error.");
    }
  });

