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

// ─── PUBLIC PRODUCTS ──────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const database = await connectDB();
    const { category, featured } = req.query;
    const filter = { is_active: { $ne: false } };
    if (category) filter.category = category;
    if (featured === 'true') filter.is_featured = true;
    const products = await database.collection("products").find(filter).toArray();
    res.json(products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      original_price: p.original_price || null,
      category: p.category,
      tagline: p.tagline || '',
      image_url: p.image_url || '',
      rating: p.rating || 4.5,
      is_featured: p.is_featured || false,
      stock: p.stock || 100
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC SINGLE PRODUCT ────────────────────────
app.get('/api/products/:slug', async (req, res) => {
  try {
    const database = await connectDB();
    const product = await database.collection("products").findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      price: product.price,
      original_price: product.original_price || null,
      category: product.category,
      tagline: product.tagline || '',
      image_url: product.image_url || '',
      rating: product.rating || 4.5,
      is_featured: product.is_featured || false,
      stock: product.stock || 100
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC ORDER SUBMIT ───────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const database = await connectDB();
    const { customer_name, phone, email, city, address, postal_code, notes, discount_code, items } = req.body;

    const { ObjectId } = await import('mongodb');

    // Re-price from DB
    const objectIds = items.map(i => new ObjectId(i.product_id));
    const dbProducts = await database.collection("products")
      .find({ _id: { $in: objectIds }, is_active: true })
      .toArray();

    const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));
    const trustedItems = items.map(i => {
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

    const VALID_CODES = { "BREEZY10": 0.10, "WELCOME10": 0.10, "BREEZY20": 0.20 };
    const subtotal = trustedItems.reduce((s, i) => s + i.line_total, 0);
    let discount_amount = 0;
    let verified_code = null;
    if (discount_code) {
      const code = discount_code.toUpperCase().trim();
      const rate = VALID_CODES[code];
      if (rate) { discount_amount = Math.round(subtotal * rate); verified_code = code; }
    }

    const total_amount = subtotal - discount_amount;
    const result = await database.collection("orders").insertOne({
      customer_name, phone, email: email || null, address, city,
      postal_code: postal_code || null, notes: notes || null,
      discount_code: verified_code, discount_amount,
      items: trustedItems, subtotal, shipping_fee: 0,
      total_amount, status: 'pending', created_at: new Date()
    });

    res.json({ success: true, id: result.insertedId.toString(), total_amount });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC ORDER TRACK ───────────────────────────
app.get('/api/orders/track/:id', async (req, res) => {   // ← sirf yeh line badlo
  try {
    const database = await connectDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Order ID' });
    }

    const order = await database.collection("orders").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      id: order._id.toString(),
      status: order.status || 'pending',
      total_amount: order.total_amount || 0,
      subtotal: order.subtotal || 0,
      discount_amount: order.discount_amount || 0,
      created_at: order.created_at,
      customer_name: order.customer_name,
      phone: order.phone,
      city: order.city,
      items: order.items || []
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
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
      database.collection("orders").aggregate([{ $group: { _id: null, total: { $sum: "$total_amount" } } }]).toArray(),
      database.collection("orders").countDocuments({ created_at: { $gte: todayStart } }),
      database.collection("orders").aggregate([{ $match: { created_at: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: "$total_amount" } } }]).toArray()
    ]);
    const recentOrders = await database.collection("orders").find().sort({ created_at: -1 }).limit(5).project({ _id: 1, customer_name: 1, total_amount: 1, status: 1, created_at: 1 }).toArray();
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Admin Backend running on http://localhost:${PORT}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
});