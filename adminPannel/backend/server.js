import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "breezygo";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "breezy2026";
const client = new MongoClient(MONGODB_URI);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Connected to MongoDB (${DB_NAME})!`);
  }
  return db;
}

// ─── AUTH ──────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: "admin-session-" + Date.now() });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// ─── STATS ────────────────────────────────────────
app.get('/api/admin/stats', async (req, res) => {
  try {
    const database = await connectDB();

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [totalOrders, totalProducts, totalMessages, revenueData, todayOrders, todayRevenue] = await Promise.all([
      database.collection("orders").countDocuments(),
      database.collection("products").countDocuments(),
      database.collection("contact_messages").countDocuments(),
      database.collection("orders").aggregate([
        { $group: { _id: null, total: { $sum: "$total_amount" } } }
      ]).toArray(),
      database.collection("orders").countDocuments({ created_at: { $gte: todayStart } }),
      database.collection("orders").aggregate([
        { $match: { created_at: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } }
      ]).toArray()
    ]);

    const recentOrders = await database.collection("orders")
      .find().sort({ created_at: -1 }).limit(5)
      .project({ _id: 1, customer_name: 1, total_amount: 1, status: 1, created_at: 1 })
      .toArray();

    res.json({
      totalOrders, totalProducts, totalMessages,
      totalRevenue: revenueData[0]?.total || 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      recentOrders: recentOrders.map(o => ({
        id: o._id.toString(),
        customer: o.customer_name,
        amount: `Rs ${(o.total_amount || 0).toLocaleString()}`,
        status: o.status || 'pending',
        date: new Date(o.created_at).toLocaleDateString()
      }))
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── ORDERS ───────────────────────────────────────
app.get('/api/admin/orders', async (req, res) => {
  try {
    const database = await connectDB();
    const orders = await database.collection("orders").find().sort({ created_at: -1 }).toArray();
    res.json(orders.map(o => ({
      id: o._id.toString(),
      customer: o.customer_name,
      phone: o.phone,
      city: o.city,
      address: o.address,
      items: o.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      total: o.total_amount,
      status: o.status || 'pending',
      date: new Date(o.created_at).toLocaleString()
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/orders', async (req, res) => {
  try {
    const database = await connectDB();
    const { id, status } = req.body;
    await database.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updated_at: new Date() } }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/orders/:id', async (req, res) => {
  try {
    const database = await connectDB();
    await database.collection("orders").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PRODUCTS ─────────────────────────────────────
app.get('/api/admin/products', async (req, res) => {
  try {
    const database = await connectDB();
    const products = await database.collection("products").find().sort({ created_at: -1 }).toArray();
    res.json(products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      original_price: p.original_price || null,
      stock: p.stock || 100,
      category: p.category,
      tagline: p.tagline || '',
      image_url: p.image_url || '',
      is_active: p.is_active !== false,
      status: p.is_active !== false ? 'Active' : 'Out of Stock'
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/products', async (req, res) => {
  try {
    const database = await connectDB();
    const { name, slug, price, original_price, category, tagline, image_url, stock } = req.body;
    const result = await database.collection("products").insertOne({
      name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(price), original_price: original_price ? Number(original_price) : null,
      category, tagline: tagline || '', image_url: image_url || '',
      stock: Number(stock) || 100, is_active: true, is_featured: false,
      rating: 4.5, created_at: new Date()
    });
    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const { name, price, original_price, category, tagline, stock, is_active } = req.body;
    await database.collection("products").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, price: Number(price), original_price: original_price ? Number(original_price) : null, category, tagline, stock: Number(stock), is_active, updated_at: new Date() } }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const database = await connectDB();
    await database.collection("products").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── MESSAGES ─────────────────────────────────────
app.get('/api/admin/messages', async (req, res) => {
  try {
    const database = await connectDB();
    const messages = await database.collection("contact_messages").find().sort({ created_at: -1 }).toArray();
    res.json(messages.map(m => ({
      id: m._id.toString(), name: m.name, email: m.email,
      subject: m.subject || "General Inquiry", body: m.message,
      status: m.status || 'unread',
      date: new Date(m.created_at).toLocaleString()
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/messages', async (req, res) => {
  try {
    const database = await connectDB();
    const { id } = req.body;
    await database.collection("contact_messages").updateOne(
      { _id: new ObjectId(id) }, { $set: { status: 'read', updated_at: new Date() } }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    const database = await connectDB();
    await database.collection("contact_messages").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Admin Backend running on http://localhost:${PORT}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
});