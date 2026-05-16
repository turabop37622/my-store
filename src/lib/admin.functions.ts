import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "./db";

// Dummy admin auth check (replace with real auth later)
const requireAdmin = async () => {
  // In a real app, verify session cookie/token here
  return true;
};

export const getAdminStats = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();
    const db = await getDb();
    
    const [totalOrders, totalProducts, totalMessages, revenueData] = await Promise.all([
      db.collection("orders").countDocuments(),
      db.collection("products").countDocuments(),
      db.collection("contact_messages").countDocuments(),
      db.collection("orders").aggregate([
        { $match: { status: { $in: ["delivered", "shipped", "processing", "pending"] } } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } }
      ]).toArray()
    ]);

    const recentOrders = await db.collection("orders")
      .find()
      .sort({ created_at: -1 })
      .limit(5)
      .project({ _id: 1, customer_name: 1, total_amount: 1, status: 1, created_at: 1 })
      .toArray();

    return {
      totalOrders,
      totalProducts,
      totalMessages,
      totalRevenue: revenueData[0]?.total || 0,
      recentOrders: recentOrders.map(o => ({
        id: o._id.toString(),
        customer_name: o.customer_name,
        total_amount: o.total_amount,
        status: o.status,
        created_at: o.created_at
      }))
    };
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();
    const db = await getDb();
    const orders = await db.collection("orders").find().sort({ created_at: -1 }).toArray();
    return orders.map(o => ({
      id: o._id.toString(),
      customer_name: o.customer_name,
      email: o.email,
      phone: o.phone,
      city: o.city,
      total_amount: o.total_amount,
      status: o.status,
      created_at: o.created_at,
      items: o.items
    }));
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), status: z.string() }).parse)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    await db.collection("orders").updateOne(
      { _id: new ObjectId(data.id) },
      { $set: { status: data.status, updated_at: new Date() } }
    );
    return { success: true };
  });

export const getAdminProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();
    const db = await getDb();
    const products = await db.collection("products").find().sort({ created_at: -1 }).toArray();
    return products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      original_price: p.original_price,
      category: p.category,
      is_active: p.is_active,
      stock: p.stock
    }));
  });

export const toggleProductActive = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), is_active: z.boolean() }).parse)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    await db.collection("products").updateOne(
      { _id: new ObjectId(data.id) },
      { $set: { is_active: data.is_active, updated_at: new Date() } }
    );
    return { success: true };
  });

export const getAdminMessages = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();
    const db = await getDb();
    const messages = await db.collection("contact_messages").find().sort({ created_at: -1 }).toArray();
    return messages.map(m => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      created_at: m.created_at,
      status: m.status || 'unread'
    }));
  });

export const markMessageRead = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }).parse)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    await db.collection("contact_messages").updateOne(
      { _id: new ObjectId(data.id) },
      { $set: { status: 'read', updated_at: new Date() } }
    );
    return { success: true };
  });
