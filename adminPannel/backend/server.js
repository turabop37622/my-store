import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

if (typeof process !== 'undefined' && process.release?.name === 'node') {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: resolve(__dirname, '../../.env') });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let client = null;
let dbPromise = null;

async function connectDB() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
      const dbName = process.env.MONGODB_DB || process.env.DB_NAME || "breezygo";
      client = new MongoClient(uri);
      await client.connect();
      const database = client.db(dbName);
      console.log(`Connected to MongoDB (${dbName})!`);
      return database;
    })();
  }
  return dbPromise;
}

function formatOrder(order) {
  return {
    id: order._id.toString(),
    short_id: order._id.toString().slice(-8).toUpperCase(),
    status: order.status || 'pending',
    total_amount: order.total_amount || 0,
    subtotal: order.subtotal || 0,
    discount_amount: order.discount_amount || 0,
    created_at: order.created_at,
    customer_name: order.customer_name,
    phone: order.phone,
    city: order.city,
    items: order.items || []
  };
}

async function sendOrderEmail(order) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "BreezyGo Store", email: "turabop37622@gmail.com" },
        to: [{ email: process.env.ADMIN_EMAIL || "turabop37622@gmail.com" }],
        subject: `🛒 New Order - Rs ${order.total_amount.toLocaleString()} - ${order.customer_name}`,
        htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px 40px 30px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🛒 BreezyGo</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Premium Lifestyle Tech</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ecfdf5;padding:20px 40px;border-bottom:2px solid #d1fae5;">
            <p style="margin:0;color:#065f46;font-size:16px;font-weight:700;text-align:center;">🎉 New Order Received!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr>
                <td>
                  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
                  <p style="margin:0;color:#111827;font-size:16px;font-weight:700;font-family:monospace;">#${order.id.slice(-8).toUpperCase()}</p>
                </td>
                <td align="right">
                  <span style="background:#10b981;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;">PENDING</span>
                </td>
              </tr>
            </table>
            <h3 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;border-bottom:2px solid #f3f4f6;padding-bottom:12px;">👤 Customer Details</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td width="50%" style="padding:8px 0;">
                  <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Name</p>
                  <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">${order.customer_name}</p>
                </td>
                <td width="50%" style="padding:8px 0;">
                  <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Phone</p>
                  <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">${order.phone}</p>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:8px 0;">
                  <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Delivery Address</p>
                  <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">${order.address}, ${order.city}</p>
                </td>
              </tr>
            </table>
            <h3 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;border-bottom:2px solid #f3f4f6;padding-bottom:12px;">📦 Order Items</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${order.items.map(i => `
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${i.name}</p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Qty: ${i.quantity} × Rs ${i.price.toLocaleString()}</p>
                </td>
                <td align="right" style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                  <p style="margin:0;color:#10b981;font-size:15px;font-weight:700;">Rs ${i.line_total.toLocaleString()}</p>
                </td>
              </tr>`).join('')}
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;padding:20px;">
              <tr>
                <td>
                  <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:600;">Total Amount (COD)</p>
                </td>
                <td align="right">
                  <p style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">Rs ${order.total_amount.toLocaleString()}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#6b7280;font-size:13px;">This is an automated notification from <strong>BreezyGo Store</strong></p>
            <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      })
    });
    const data = await response.json();
    console.log("Brevo status:", response.status);
    console.log("Brevo response:", JSON.stringify(data));
  } catch (err) {
    console.error("Email send error:", err);
  }
}

async function sendReviewEmail(order) {
  if (!order.email) return;
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "BreezyGo Store", email: "turabop37622@gmail.com" },
        to: [{ email: order.email }],
        subject: `⭐ How was your order, ${order.customer_name}?`,
        htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">🛒 BreezyGo</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Premium Lifestyle Tech</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <div style="font-size:56px;margin-bottom:16px;">⭐</div>
            <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:800;">Your order has been delivered!</h2>
            <p style="margin:0 0 8px;color:#6b7280;font-size:15px;">Hi <strong>${order.customer_name}</strong>, we hope you love your purchase!</p>
            <p style="margin:32px 0 0;color:#9ca3af;font-size:12px;">Thank you for shopping with <strong>BreezyGo</strong> 💚</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      })
    });
    const data = await response.json();
    console.log("Review email status:", response.status, JSON.stringify(data));
  } catch (err) {
    console.error("Review email error:", err);
  }
}

async function sendPromoEmail(email, promoCode, expiresAt) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "BreezyGo Store", email: "turabop37622@gmail.com" },
        to: [{ email }],
        subject: `🎉 Your 5% OFF Promo Code is Here!`,
        htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;">BreezyGo</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Premium Lifestyle Tech</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <div style="font-size:56px;margin-bottom:16px;">🎉</div>
            <h2 style="margin:0 0 12px;color:#111827;font-size:24px;font-weight:800;">Welcome to the Club!</h2>
            <p style="color:#6b7280;font-size:15px;margin-bottom:32px;">Here's your exclusive 5% OFF promo code:</p>
            <div style="background:#f0fdf4;border:2px dashed #10b981;border-radius:12px;padding:24px;margin-bottom:24px;">
              <p style="margin:0;font-size:32px;font-weight:900;color:#059669;letter-spacing:4px;font-family:monospace;">${promoCode}</p>
            </div>
            <p style="color:#6b7280;font-size:13px;">Valid for <strong>24 hours</strong> only — expires ${new Date(expiresAt).toLocaleString('en-US')}</p>
            <p style="color:#ef4444;font-size:13px;font-weight:600;">Single use only — expires after first use</p>
            <a href="https://breezygo.com/shop" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:800;font-size:16px;">Shop Now</a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} BreezyGo Pakistan</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      })
    });
    const result = await response.json();
    console.log("Brevo promo email status:", response.status, JSON.stringify(result));
    if (!response.ok) {
      throw new Error(`Brevo promo email error: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    console.error("Promo email error:", err);
  }
}

// ─── AUTH ──────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Ahlegand5712@";

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: "admin-session-" + Date.now() });
  }
  return res.status(401).json({ error: "Invalid password" });
});

// ─── AUTH MIDDLEWARE ──────────────────────────────
app.use('/api/admin', (req, res, next) => {
  if (req.path === '/login') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer admin-session-')) {
    return res.status(401).json({ error: "Unauthorized access. Missing or invalid token." });
  }
  next();
});

// ─── PUBLIC PRODUCTS ──────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const database = await connectDB();
    const { category, featured } = req.query;
    const filter = { is_active: { $ne: false } };
    if (category) filter.category = category;
    if (featured === 'true') filter.is_featured = true;
    const products = await database.collection("products").find(filter).project({ details: 0 }).toArray();
    res.set('Cache-Control', 'public, max-age=300');
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
      stock: p.stock !== undefined ? Number(p.stock) : 100,
      is_active: p.is_active !== false,
      images: p.images || (p.image_url ? [p.image_url] : []),
      qty2_discount_percent: p.qty2_discount_percent !== undefined ? p.qty2_discount_percent : 3,
      qty3_discount_percent: p.qty3_discount_percent !== undefined ? p.qty3_discount_percent : 5
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC PRODUCT SEARCH ────────────────────────
app.get('/api/products/search', async (req, res) => {
  try {
    const database = await connectDB();
    const q = req.query.q || '';
    if (!q || q.length < 3) {
      return res.json([]);
    }
    const filter = {
      is_active: { $ne: false },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    };
    const products = await database.collection("products").find(filter).limit(8).toArray();
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
      stock: p.stock !== undefined ? Number(p.stock) : 100,
      images: p.images || (p.image_url ? [p.image_url] : [])
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
      stock: product.stock !== undefined ? Number(product.stock) : 100,
      is_active: product.is_active !== false,
      details: product.details || [],
      images: product.images || (product.image_url ? [product.image_url] : []),
      qty2_discount_percent: product.qty2_discount_percent !== undefined ? product.qty2_discount_percent : 3,
      qty3_discount_percent: product.qty3_discount_percent !== undefined ? product.qty3_discount_percent : 5
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

function getLocalMockResponse(userMessage, orderInfo) {
  const msg = userMessage.toLowerCase();

  if (orderInfo) {
    return `Aapke order ki details mil gayi hain:${orderInfo}\n\nLahore me delivery 24-48 hours aur baqi cities me 4-6 days me ho jati hai. Shipping free hai!`;
  }

  if (msg.includes("order") || msg.includes("track") || msg.includes("status")) {
    return "Aap apna 8-character ka Order ID (jaise #ABC12345) chat me likhein, main aapko status track karke bta dunga!";
  }

  if (msg.includes("earbud") || msg.includes("airpod") || msg.includes("headphone") || msg.includes("sound") || msg.includes("bud")) {
    return "BreezyGo par humare paas premium quality ke Earbuds aur Headphones available hain, jinki sound quality aur battery life excellent hai! Delivery Lahore me 24-48 ghante me bilkul free ho jati hai.";
  }

  if (msg.includes("delivery") || msg.includes("shipping") || msg.includes("time") || msg.includes("deliver") || msg.includes("charges")) {
    return "BreezyGo par shipping charges bilkul FREE hain! Lahore me delivery time 24-48 ghante hai, aur baqi cities me 4-6 din lagte hain.";
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("assalam") || msg.includes("kia hal")) {
    return "Hi! Main BreezyGo AI Support assistant hoon. Main aapki kya madad kar sakta hoon? (Local Mock Mode Active)";
  }

  return `Aapka message mil gaya hai: "${userMessage}". (Local Mock Mode Active). Agar aap apna order status check karna chahte hain to order ID likhein, ya delivery/products ke baare me poochhein!`;
}

// ─── PUBLIC SUPPORT CHAT AI ────────────────────────
app.post('/api/support-chat', async (req, res) => {
  try {
    const database = await connectDB();
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const settings = await database.collection("app_settings").findOne({ _id: "global" }) || {};
    const aiEnabled = settings.ai_chat_enabled !== false;
    const systemPromptOverride = settings.ai_chat_system_prompt || "You are the AI assistant for BreezyGo Store. Delivery Times: Lahore 24-48 hours, Other Cities 4-6 days. Shipping is free. Keep responses short and in English/Roman Urdu.";

    if (!aiEnabled) {
      return res.status(403).json({ error: "AI Chat is currently disabled" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }

    // Try to find any order ID mentioned
    const cleanMsg = messages.map(m => m.content).join(" ");
    const orderIdMatch = cleanMsg.match(/\b([A-Fa-f0-9]{24})\b/) || cleanMsg.match(/\b([A-Za-z0-9]{8})\b/);
    let orderInfo = "";
    if (orderIdMatch) {
      const matchedId = orderIdMatch[1];
      let order = null;
      if (matchedId.length === 24) {
        order = await database.collection("orders").findOne({ _id: new ObjectId(matchedId) });
      } else {
        const allOrders = await database.collection("orders").find().sort({ created_at: -1 }).limit(500).toArray();
        order = allOrders.find(o => o._id.toString().slice(-8).toUpperCase() === matchedId.toUpperCase());
      }
      if (order) {
        orderInfo = `\nFound matching order details:
- Order ID: #${order._id.toString().slice(-8).toUpperCase()}
- Status: ${order.status}
- Customer Name: ${order.customer_name}
- Total Amount: Rs ${order.total_amount}
- Items: ${order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
- Address: ${order.address}, ${order.city}
- Placed on: ${new Date(order.created_at).toLocaleString()}`;
      }
    }

    const finalSystemPrompt = `${systemPromptOverride}${orderInfo ? `\n\nCUSTOMER ORDER CONTEXT:\n${orderInfo}` : ""}`;

    // Clean and alternate messages for Gemini API
    const geminiMessages = [];
    for (const m of messages) {
      if (m.role === 'user' || m.role === 'assistant') {
        const role = m.role === 'assistant' ? 'model' : 'user';
        const text = m.content || "";
        if (!text.trim()) continue;

        if (geminiMessages.length > 0 && geminiMessages[geminiMessages.length - 1].role === role) {
          geminiMessages[geminiMessages.length - 1].parts[0].text += "\n" + text;
        } else {
          geminiMessages.push({
            role: role,
            parts: [{ text: text }]
          });
        }
      }
    }

    // Ensure the conversation starts with a user message
    while (geminiMessages.length > 0 && geminiMessages[0].role === 'model') {
      geminiMessages.shift();
    }

    if (geminiMessages.length === 0) {
      geminiMessages.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    // Call Gemini API using systemInstruction
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: finalSystemPrompt }]
        }
      })
    });

    const data = await response.json();
    let reply = "";
    if (!response.ok) {
      console.warn("Gemini API Error (falling back to local mock):", data);
      const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || "";
      reply = getLocalMockResponse(lastUserMsg, orderInfo);
    } else {
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    }

    // Optionally log to support_conversations
    try {
      await database.collection("support_conversations").insertOne({
        messages: [...messages, { role: "assistant", content: reply }],
        order_info: orderInfo || null,
        created_at: new Date()
      });
    } catch (logErr) {
      console.error("Error logging support conversation:", logErr);
    }

    return res.json({ reply });
  } catch (error) {
    console.error("Support Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── PUBLIC ORDER SUBMIT ───────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const database = await connectDB();
    const { customer_name, phone, email, city, address, postal_code, notes, discount_code, items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array" });
    }

    for (const item of items) {
      if (!item.product_id || !ObjectId.isValid(item.product_id)) {
        return res.status(400).json({ error: `Invalid product ID format: ${item.product_id || 'undefined'}` });
      }
    }

    const objectIds = items.map(i => new ObjectId(i.product_id));
    const dbProducts = await database.collection("products")
      .find({ _id: { $in: objectIds }, is_active: true })
      .toArray();

    const now = new Date();
    const timedDiscounts = await database.collection("timed_discounts")
      .find({
        product_id: { $in: items.map(i => i.product_id) },
        start_time: { $lte: now },
        end_time: { $gt: now },
        cancelled: { $ne: true }
      }).toArray();
    const discountMap = new Map(timedDiscounts.map(d => [d.product_id, d.discount_percent]));

    const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));
    const trustedItems = items.map(i => {
      const p = productMap.get(i.product_id);
      if (!p) throw new Error(`Product not available: ${i.name}`);

      const qty2_discount = p.qty2_discount_percent !== undefined ? Number(p.qty2_discount_percent) : 3;
      const qty3_discount = p.qty3_discount_percent !== undefined ? Number(p.qty3_discount_percent) : 5;

      let discountPercent = 0;
      if (i.quantity === 2) {
        discountPercent = qty2_discount;
      } else if (i.quantity >= 3) {
        discountPercent = qty3_discount;
      }

      const timedDiscountPercent = discountMap.get(p._id.toString()) || 0;
      const basePrice = timedDiscountPercent > 0
        ? Math.round(Number(p.price) * (1 - timedDiscountPercent / 100))
        : Number(p.price);

      const finalPrice = Math.round(basePrice * (1 - discountPercent / 100));

      return {
        product_id: p._id.toString(),
        slug: p.slug,
        name: p.name,
        price: finalPrice,
        original_price: Number(p.price),
        quantity: i.quantity,
        image_url: p.image_url,
        line_total: finalPrice * i.quantity,
      };
    });

    const subtotal = trustedItems.reduce((s, i) => s + i.line_total, 0);
    let discount_amount = 0;
    let verified_code = null;
    if (discount_code) {
      const code = String(discount_code).toUpperCase().trim();
      const promo = await database.collection("promo_codes").findOne({ code });
      if (promo && !promo.used && new Date() < new Date(promo.expires_at)) {
        discount_amount = Math.round(subtotal * (promo.discount_percent / 100));
        verified_code = code;
      }
    }

    const total_amount = subtotal - discount_amount;
    const result = await database.collection("orders").insertOne({
      customer_name, phone, email: email || null, address, city,
      postal_code: postal_code || null, notes: notes || null,
      discount_code: verified_code, discount_amount,
      items: trustedItems, subtotal, shipping_fee: 0,
      total_amount, status: 'pending', created_at: new Date()
    });

    if (verified_code) {
      await database.collection("promo_codes").updateOne(
        { code: verified_code },
        { $set: { used: true, used_at: new Date() } }
      );
    }

    await sendOrderEmail({
      id: result.insertedId.toString(),
      customer_name, phone, city, address,
      items: trustedItems,
      total_amount
    });

    res.json({ success: true, id: result.insertedId.toString(), total_amount });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC ORDER TRACK ───────────────────────────
app.get('/api/orders/track/:query', async (req, res) => {
  try {
    const database = await connectDB();
    const query = req.params.query.trim();

    if (query.length === 24 && ObjectId.isValid(query)) {
      const order = await database.collection("orders").findOne({ _id: new ObjectId(query) });
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json({ type: 'single', orders: [formatOrder(order)] });
    }

    if (query.length === 8) {
      const all = await database.collection("orders")
        .find({}).sort({ created_at: -1 }).limit(500).toArray();
      const order = all.find(o => o._id.toString().slice(-8).toUpperCase() === query.toUpperCase()) || null;
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json({ type: 'single', orders: [formatOrder(order)] });
    }

    let orders = await database.collection("orders")
      .find({ phone: query }).sort({ created_at: -1 }).toArray();

    if (orders.length === 0) {
      orders = await database.collection("orders")
        .find({ email: query.toLowerCase() }).sort({ created_at: -1 }).toArray();
    }

    if (orders.length === 0) return res.status(404).json({ error: 'No orders found' });
    return res.json({ type: 'multiple', orders: orders.map(formatOrder) });

  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC SUBSCRIBE ─────────────────────────────
app.post('/api/subscribe', async (req, res) => {
  try {
    const database = await connectDB();
    const { email } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
    const existing = await database.collection("subscribers").findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Already subscribed' });
    await database.collection("subscribers").insertOne({
      email: email.toLowerCase(),
      status: 'pending',
      created_at: new Date()
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── VALIDATE PROMO CODE ──────────────────────────
app.post('/api/promo/validate', async (req, res) => {
  try {
    const database = await connectDB();
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });
    const promo = await database.collection("promo_codes").findOne({ code: code.toUpperCase().trim() });
    if (!promo) return res.status(404).json({ error: 'Invalid promo code' });
    if (promo.used) return res.status(400).json({ error: 'Promo code already used' });
    if (new Date() > new Date(promo.expires_at)) return res.status(400).json({ error: 'Promo code expired' });
    res.json({ valid: true, discount_percent: promo.discount_percent });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── ADMIN GET SUBSCRIBERS ────────────────────────
app.get('/api/admin/subscribers', async (req, res) => {
  try {
    const database = await connectDB();
    const subscribers = await database.collection("subscribers").find().sort({ created_at: -1 }).toArray();
    res.json(subscribers.map(s => ({
      id: s._id.toString(),
      email: s.email,
      status: s.status,
      promo_code: s.promo_code || null,
      date: new Date(s.created_at).toLocaleString()
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── ADMIN APPROVE SUBSCRIBER ─────────────────────
app.post('/api/admin/subscribers/approve', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' });
    const database = await connectDB();
    const subscriber = await database.collection("subscribers").findOne({ _id: new ObjectId(id) });
    if (!subscriber) return res.status(404).json({ error: 'Subscriber not found' });
    if (subscriber.status === 'approved') return res.status(400).json({ error: 'Already approved' });
    const promoCode = 'BREEZY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await database.collection("promo_codes").insertOne({
      code: promoCode,
      email: subscriber.email,
      discount_percent: 5,
      used: false,
      expires_at: expiresAt,
      created_at: new Date()
    });
    await database.collection("subscribers").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'approved', promo_code: promoCode, approved_at: new Date() } }
    );
    await sendPromoEmail(subscriber.email, promoCode, expiresAt);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC CONTACT ────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const database = await connectDB();
    const { name, email, subject, message } = req.body;
    const result = await database.collection("contact_messages").insertOne({
      name, email, subject, message,
      status: 'unread',
      created_at: new Date()
    });
    if (!result.acknowledged) throw new Error("Could not submit message.");
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
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
      email: o.email || null,
      city: o.city,
      address: o.address,
      postalCode: o.postal_code || null,
      trackingId: o.tracking_id || null,
      items: o.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      total: o.total_amount,
      status: o.status || 'pending',
      date: new Date(o.created_at).toLocaleString()
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/orders', async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    const database = await connectDB();
    await database.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updated_at: new Date() } }
    );
    if (status === 'delivered') {
      const order = await database.collection("orders").findOne({ _id: new ObjectId(id) });
      if (order && order.email) {
        await sendReviewEmail({
          email: order.email,
          customer_name: order.customer_name,
          items: order.items
        });
      }
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/orders', async (req, res) => {
  try {
    const database = await connectDB();
    await database.collection("orders").deleteMany({});
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/orders/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
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
      status: p.is_active !== false ? 'Active' : 'Out of Stock',
      details: p.details || [],
      images: p.images || (p.image_url ? [p.image_url] : []),
      qty2_discount_percent: p.qty2_discount_percent !== undefined ? p.qty2_discount_percent : 3,
      qty3_discount_percent: p.qty3_discount_percent !== undefined ? p.qty3_discount_percent : 5,
      sales_baseline: p.sales_baseline || 0
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/products', async (req, res) => {
  try {
    const database = await connectDB();
    const { name, slug, price, original_price, category, tagline, image_url, stock, details, images, qty2_discount_percent, qty3_discount_percent, sales_baseline } = req.body;
    const result = await database.collection("products").insertOne({
      name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(price), original_price: original_price ? Number(original_price) : null,
      category, tagline: tagline || '', image_url: image_url || '',
      stock: Number(stock) || 100, is_active: true, is_featured: false,
      rating: 4.5, created_at: new Date(), details: details || [],
      images: images || [],
      qty2_discount_percent: qty2_discount_percent !== undefined ? Number(qty2_discount_percent) : 3,
      qty3_discount_percent: qty3_discount_percent !== undefined ? Number(qty3_discount_percent) : 5,
      sales_baseline: String(sales_baseline || "0,0,0,0,0,0,0")
    });
    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const database = await connectDB();
    const { name, slug, price, original_price, category, tagline, image_url, stock, is_active, details, images, qty2_discount_percent, qty3_discount_percent, sales_baseline } = req.body;
    const updateDoc = {
      name,
      price: Number(price),
      original_price: original_price ? Number(original_price) : null,
      category,
      tagline: tagline || '',
      stock: Number(stock) || 0,
      is_active: is_active !== false,
      details: details || [],
      qty2_discount_percent: qty2_discount_percent !== undefined ? Number(qty2_discount_percent) : 3,
      qty3_discount_percent: qty3_discount_percent !== undefined ? Number(qty3_discount_percent) : 5,
      sales_baseline: String(sales_baseline || "0,0,0,0,0,0,0"),
      updated_at: new Date()
    };
    if (images) updateDoc.images = images;
    if (slug) updateDoc.slug = slug;
    if (image_url) updateDoc.image_url = image_url;
    await database.collection("products").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateDoc }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
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
    const { id } = req.body;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }
    const database = await connectDB();
    await database.collection("contact_messages").updateOne(
      { _id: new ObjectId(id) }, { $set: { status: 'read', updated_at: new Date() } }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }
    const database = await connectDB();
    await database.collection("contact_messages").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC SETTINGS ──────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const database = await connectDB();
    const settings = await database.collection("app_settings").findOne({ _id: "global" });
    const defaults = {
      live_viewers_enabled: true, live_viewers_min: 3, live_viewers_max: 30,
      live_viewers_interval_min: 15, live_viewers_interval_max: 45,
      sales_graph_enabled_global: true,
      lahore_delivery_hours: { min: 24, max: 48 },
      other_cities_processing_days: 2,
      other_cities_shipping_days: 2,
      homepage_banner_enabled: true,
      homepage_banner_text: "🚀 24-48 Hour Delivery Anywhere in Lahore — No Extra Charges!"
    };
    res.json({ ...defaults, ...(settings || {}), _id: undefined });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── ADMIN SETTINGS ───────────────────────────────
app.get('/api/admin/settings', async (req, res) => {
  try {
    const database = await connectDB();
    const settings = await database.collection("app_settings").findOne({ _id: "global" });
    const defaults = {
      live_viewers_enabled: true, live_viewers_min: 3, live_viewers_max: 30,
      live_viewers_interval_min: 15, live_viewers_interval_max: 45,
      sales_graph_enabled_global: true,
      lahore_delivery_hours: { min: 24, max: 48 },
      other_cities_processing_days: 2,
      other_cities_shipping_days: 2,
      homepage_banner_enabled: true,
      homepage_banner_text: "🚀 24-48 Hour Delivery Anywhere in Lahore — No Extra Charges!"
    };
    res.json({ ...defaults, ...(settings || {}), _id: undefined });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/settings', async (req, res) => {
  try {
    const database = await connectDB();
    await database.collection("app_settings").updateOne(
      { _id: "global" },
      { $set: { ...req.body, updated_at: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC STOCK BATCHES ─────────────────────────
app.get('/api/stock-batches/:productId', async (req, res) => {
  try {
    const database = await connectDB();
    const batches = await database.collection("stock_batches")
      .find({ product_id: req.params.productId })
      .sort({ order: 1, created_at: 1 }).toArray();
    const activeBatch = batches.find(b => (b.remaining ?? b.quantity) > 0) || null;
    res.json({
      active_batch: activeBatch ? {
        id: activeBatch._id.toString(), label: activeBatch.label,
        quantity: activeBatch.quantity, remaining: activeBatch.remaining ?? activeBatch.quantity,
      } : null,
      total_batches: batches.length,
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── ADMIN STOCK BATCHES ──────────────────────────
app.get('/api/admin/stock-batches/:productId', async (req, res) => {
  try {
    const database = await connectDB();
    const batches = await database.collection("stock_batches")
      .find({ product_id: req.params.productId })
      .sort({ order: 1, created_at: 1 }).toArray();
    res.json(batches.map((b, i) => ({
      id: b._id.toString(), product_id: b.product_id,
      label: b.label || `Batch ${i + 1}`, quantity: b.quantity,
      remaining: b.remaining ?? b.quantity, order: b.order ?? i, created_at: b.created_at,
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/stock-batches/:productId', async (req, res) => {
  try {
    const database = await connectDB();
    const { label, quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Quantity required' });
    const count = await database.collection("stock_batches").countDocuments({ product_id: req.params.productId });
    const result = await database.collection("stock_batches").insertOne({
      product_id: req.params.productId,
      label: label || `Batch ${count + 1}`,
      quantity: Number(quantity), remaining: Number(quantity),
      order: count, created_at: new Date(),
    });
    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/stock-batches/delete/:batchId', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.batchId)) return res.status(400).json({ error: 'Invalid batch ID' });
    const database = await connectDB();
    await database.collection("stock_batches").deleteOne({ _id: new ObjectId(req.params.batchId) });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
// ─── PUBLIC REVIEWS ───────────────────────────────
app.post('/api/reviews/:productId', async (req, res) => {
  try {
    const database = await connectDB();
    const { customer_name, rating, comment, images } = req.body;
    if (!customer_name || !rating) {
      return res.status(400).json({ error: 'Customer name and rating are required' });
    }
    const newReview = {
      product_id: req.params.productId,
      customer_name,
      rating: Number(rating),
      comment: comment || '',
      images: Array.isArray(images) ? images : [],
      status: 'pending',
      is_active: true,
      created_at: new Date()
    };
    const result = await database.collection("reviews").insertOne(newReview);
    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC REVIEWS HELPERS ───────────────────────
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getFakeReviewsForProduct(productId, productName = "product") {
  const seed = hashCode(productId);

  const firstNames = ["Ahmed", "Muhammad", "Sana", "Zainab", "Ali", "Bilal", "Ayesha", "Fatima", "Hamza", "Osama", "Kiran", "Sidra", "Tayyab", "Zain", "Farhan", "Maria", "Usman", "Arslan", "Hassan", "Nida"];
  const lastNames = ["R.", "K.", "H.", "S.", "A.", "M.", "B.", "Z.", "F.", "T.", "N.", "I.", "U.", "G.", "P."];
  const cities = ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Rawalpindi", "Peshawar", "Multan", "Sialkot", "Quetta", "Gujranwala"];

  const isWatch = productName.toLowerCase().includes("watch") || productName.toLowerCase().includes("luna");
  const isAudio = productName.toLowerCase().includes("earbud") || productName.toLowerCase().includes("bud") || productName.toLowerCase().includes("pod") || productName.toLowerCase().includes("audio") || productName.toLowerCase().includes("headphone");

  const watchComments = [
    { rating: 5, comment: "Incredible value for money. The Bluetooth calling feature works perfectly, and the speaker is surprisingly loud and clear. Very premium finish!" },
    { rating: 5, comment: "I am using this watch since a week and battery is still at 40%. The display is super sharp and touch response is very smooth. Fully satisfied." },
    { rating: 4, comment: "Great watch! Screen and body build quality is top-notch. Step tracking is 95% accurate. Delivery was super fast in Lahore." },
    { rating: 5, comment: "Mind blowing product. BreezyGo level design at a very affordable price. Highly recommended to everyone!" },
    { rating: 5, comment: "Watch ki quality bht achi hai. Metallic body feels solid and health sensors work fine. Recommended." }
  ];

  const audioComments = [
    { rating: 5, comment: "Sound quality is outstanding, bass is very deep and active noise cancellation is decent. Battery backup is around 30 hours with case." },
    { rating: 5, comment: "Best buds at this price tag. Connects instantly with my iPhone. Comfort is great, doesn't fall out during running." },
    { rating: 4, comment: "Very good sound signature and clear mic quality during phone calls. Case feels light but build is decent." },
    { rating: 5, comment: "Bht zabardast sound hai. Base bht heavy hai or charge b bht jaldi hoty hain. Recommended." },
    { rating: 5, comment: "Delivery was very fast (only 2 days to Karachi). Sound is crystal clear. Definitely buying another one." }
  ];

  const generalComments = [
    { rating: 5, comment: "Highly impressed with the premium packaging and build quality. Exceeded my expectations!" },
    { rating: 5, comment: "Product is 100% original as advertised. Seller was cooperative on WhatsApp and delivery was quick." },
    { rating: 4, comment: "Quality is good and works perfectly. Value for money product." },
    { rating: 5, comment: "Bht pyari cheez hai, packing bht achi thi. Direct delivery mili 2 din ma." },
    { rating: 5, comment: "Worth every rupee. The premium finish is amazing." }
  ];

  const commentPool = isWatch ? watchComments : (isAudio ? audioComments : generalComments);

  const fakeReviews = [];
  const count = 3;

  for (let i = 0; i < count; i++) {
    const nameIdx = (seed + i * 7) % firstNames.length;
    const lastIdx = (seed + i * 13) % lastNames.length;
    const cityIdx = (seed + i * 19) % cities.length;
    const commentIdx = (seed + i * 3) % commentPool.length;

    const poolItem = commentPool[commentIdx];
    const rating = poolItem.rating;
    const comment = poolItem.comment;

    const daysAgo = ((seed + i * 11) % 25) + 3;
    const dateText = daysAgo < 7 ? `${daysAgo} days ago` : (daysAgo < 14 ? "1 week ago" : (daysAgo < 21 ? "2 weeks ago" : "3 weeks ago"));

    fakeReviews.push({
      _id: `fake-${productId}-${i}`,
      product_id: productId,
      customer_name: `${firstNames[nameIdx]} ${lastNames[lastIdx]} (${cities[cityIdx]})`,
      rating: rating,
      comment: comment,
      images: [],
      status: "approved",
      is_active: true,
      created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      date: dateText,
      is_fake: true
    });
  }

  return fakeReviews;
}

app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const database = await connectDB();
    const realReviews = await database.collection("reviews")
      .find({ product_id: req.params.productId, status: 'approved', is_active: true })
      .sort({ created_at: -1 })
      .toArray();

    let productName = "product";
    if (ObjectId.isValid(req.params.productId)) {
      const pObj = await database.collection("products").findOne({ _id: new ObjectId(req.params.productId) });
      if (pObj) productName = pObj.name;
    }

    const fakeReviews = getFakeReviewsForProduct(req.params.productId, productName);
    const combined = [...realReviews, ...fakeReviews];

    res.json(combined.map(r => ({
      id: r._id.toString(),
      product_id: r.product_id,
      customer_name: r.customer_name,
      rating: r.rating,
      comment: r.comment,
      images: r.images || [],
      date: r.date || new Date(r.created_at).toLocaleDateString()
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/reviews/:productId/summary', async (req, res) => {
  try {
    const database = await connectDB();
    const realReviews = await database.collection("reviews")
      .find({ product_id: req.params.productId, status: 'approved', is_active: true })
      .toArray();

    let productName = "product";
    if (ObjectId.isValid(req.params.productId)) {
      const pObj = await database.collection("products").findOne({ _id: new ObjectId(req.params.productId) });
      if (pObj) productName = pObj.name;
    }

    const fakeReviews = getFakeReviewsForProduct(req.params.productId, productName);
    const reviews = [...realReviews, ...fakeReviews];

    const total_reviews = reviews.length;
    let sum = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(r => {
      sum += r.rating;
      const roundedRating = Math.round(r.rating);
      if (distribution[roundedRating] !== undefined) {
        distribution[roundedRating]++;
      }
    });

    const average_rating = total_reviews > 0 ? Number((sum / total_reviews).toFixed(1)) : 0;

    const breakdown = {};
    for (let i = 5; i >= 1; i--) {
      const count = distribution[i];
      const percentage = total_reviews > 0 ? Math.round((count / total_reviews) * 100) : 0;
      breakdown[i] = { count, percentage };
    }

    res.json({ average_rating, total_reviews, breakdown });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── ADMIN REVIEWS ────────────────────────────────
app.get('/api/admin/reviews', async (req, res) => {
  try {
    const database = await connectDB();
    const { product_id, status } = req.query;
    const filter = {};
    if (product_id) filter.product_id = product_id;
    if (status && status !== 'all') filter.status = status;

    const reviews = await database.collection("reviews")
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();

    // Fetch unique product names to display to admin
    const productIds = [...new Set(reviews.map(r => r.product_id))];
    const products = await database.collection("products")
      .find({ _id: { $in: productIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)) } })
      .project({ _id: 1, name: 1 })
      .toArray();
    const productMap = new Map(products.map(p => [p._id.toString(), p.name]));

    res.json(reviews.map(r => ({
      id: r._id.toString(),
      product_id: r.product_id,
      product_name: productMap.get(r.product_id) || 'Unknown Product',
      customer_name: r.customer_name,
      rating: r.rating,
      comment: r.comment,
      images: r.images || [],
      status: r.status || 'pending',
      is_active: r.is_active !== false,
      created_at: r.created_at,
      date: new Date(r.created_at).toLocaleDateString()
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/reviews/pending-count', async (req, res) => {
  try {
    const database = await connectDB();
    const count = await database.collection("reviews").countDocuments({ status: 'pending' });
    res.json({ pending_count: count });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/reviews/:reviewId/approve', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.reviewId)) return res.status(400).json({ error: 'Invalid review ID' });
    const database = await connectDB();
    await database.collection("reviews").updateOne(
      { _id: new ObjectId(req.params.reviewId) },
      { $set: { status: 'approved', updated_at: new Date() } }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/reviews/:reviewId/reject', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.reviewId)) return res.status(400).json({ error: 'Invalid review ID' });
    const database = await connectDB();
    await database.collection("reviews").updateOne(
      { _id: new ObjectId(req.params.reviewId) },
      { $set: { status: 'rejected', updated_at: new Date() } }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/reviews/:reviewId/toggle-active', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.reviewId)) return res.status(400).json({ error: 'Invalid review ID' });
    const database = await connectDB();
    const review = await database.collection("reviews").findOne({ _id: new ObjectId(req.params.reviewId) });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    await database.collection("reviews").updateOne(
      { _id: new ObjectId(req.params.reviewId) },
      { $set: { is_active: !review.is_active, updated_at: new Date() } }
    );
    res.json({ success: true, is_active: !review.is_active });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/reviews/:reviewId', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.reviewId)) return res.status(400).json({ error: 'Invalid review ID' });
    const database = await connectDB();
    await database.collection("reviews").deleteOne({ _id: new ObjectId(req.params.reviewId) });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC DISCOUNTS ─────────────────────────────
app.get('/api/discounts/:productId', async (req, res) => {
  try {
    const database = await connectDB();
    const now = new Date();
    const discount = await database.collection("timed_discounts").findOne({
      product_id: req.params.productId,
      start_time: { $lte: now }, end_time: { $gt: now }, cancelled: { $ne: true },
    });
    if (!discount) return res.json({ active: false });
    res.json({
      active: true, id: discount._id.toString(),
      discount_percent: discount.discount_percent,
      start_time: discount.start_time, end_time: discount.end_time,
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── ADMIN DISCOUNTS ──────────────────────────────
app.get('/api/admin/discounts', async (req, res) => {
  try {
    const database = await connectDB();
    const now = new Date();
    const discounts = await database.collection("timed_discounts")
      .find({ cancelled: { $ne: true } }).sort({ created_at: -1 }).toArray();
    const productIds = [...new Set(discounts.map(d => d.product_id))];
    const products = await database.collection("products")
      .find({ _id: { $in: productIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)) } })
      .project({ _id: 1, name: 1, slug: 1, price: 1 }).toArray();
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    res.json(discounts.map(d => {
      const p = productMap.get(d.product_id) || {};
      const startTime = new Date(d.start_time); const endTime = new Date(d.end_time);
      let status = 'scheduled';
      if (now >= startTime && now < endTime) status = 'active';
      else if (now >= endTime) status = 'expired';
      return {
        id: d._id.toString(), product_id: d.product_id,
        product_name: p.name || 'Unknown', product_slug: p.slug || '', product_price: p.price || 0,
        discount_percent: d.discount_percent, start_time: d.start_time, end_time: d.end_time,
        status, created_at: d.created_at,
      };
    }));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/discounts', async (req, res) => {
  try {
    const database = await connectDB();
    const { product_id, discount_percent, start_time, end_time } = req.body;
    if (!product_id || !discount_percent || !start_time || !end_time)
      return res.status(400).json({ error: 'All fields required' });
    const result = await database.collection("timed_discounts").insertOne({
      product_id, discount_percent: Number(discount_percent),
      start_time: new Date(start_time), end_time: new Date(end_time),
      cancelled: false, created_at: new Date(),
    });
    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/discounts/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const database = await connectDB();
    await database.collection("timed_discounts").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { cancelled: true, cancelled_at: new Date() } }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUBLIC SALES DATA ────────────────────────────
app.get('/api/sales-data/:productId', async (req, res) => {
  try {
    const database = await connectDB();
    const settings = await database.collection("app_settings").findOne({ _id: "global" });
    const globalEnabled = settings?.sales_graph_enabled_global !== false;
    const perProductDisabled = settings?.sales_graph_disabled_products?.includes(req.params.productId);
    if (!globalEnabled || perProductDisabled) return res.json({ enabled: false });

    // Fetch product to get sales baselines
    let baselines = [0, 0, 0, 0, 0, 0, 0];
    if (ObjectId.isValid(req.params.productId)) {
      const product = await database.collection("products").findOne({ _id: new ObjectId(req.params.productId) });
      if (product && product.sales_baseline) {
        const valStr = String(product.sales_baseline);
        if (valStr.includes(',')) {
          baselines = valStr.split(',').map(n => Number(n.trim()) || 0);
        } else {
          const singleNum = Number(valStr) || 0;
          baselines = [0, 0, 0, 0, 0, 0, singleNum];
        }
      }
    }
    while (baselines.length < 7) baselines.unshift(0);
    if (baselines.length > 7) baselines = baselines.slice(0, 7);

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
    const todayAgg = await database.collection("orders").aggregate([
      { $match: { created_at: { $gte: todayStart }, 'items.product_id': req.params.productId } },
      { $unwind: '$items' },
      { $match: { 'items.product_id': req.params.productId } },
      { $group: { _id: null, units: { $sum: '$items.quantity' }, revenue: { $sum: '$items.line_total' } } }
    ]).toArray();
    const weekOrders = await database.collection("orders").aggregate([
      { $match: { created_at: { $gte: weekStart }, 'items.product_id': req.params.productId } },
      { $unwind: '$items' },
      { $match: { 'items.product_id': req.params.productId } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at', timezone: 'Asia/Karachi' } }, units: { $sum: '$items.quantity' }, revenue: { $sum: '$items.line_total' } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-PK', { weekday: 'short', timeZone: 'Asia/Karachi' });
      const found = weekOrders.find(w => w._id === key);
      let units = (found?.units || 0) + baselines[6 - i];
      days.push({ date: key, label, units, revenue: found?.revenue || 0 });
    }
    res.json({ enabled: true, today: { units: (todayAgg[0]?.units || 0) + baselines[6], revenue: todayAgg[0]?.revenue || 0 }, week: days });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── ADMIN SALES GRAPH SETTINGS ───────────────────
app.put('/api/admin/sales-graph-settings', async (req, res) => {
  try {
    const database = await connectDB();
    const { global_enabled, disabled_products } = req.body;
    await database.collection("app_settings").updateOne(
      { _id: "global" },
      { $set: { sales_graph_enabled_global: global_enabled, sales_graph_disabled_products: disabled_products || [], updated_at: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = process.env.PORT || 5000;
const isMain = typeof process !== 'undefined' && process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  app.listen(PORT, () => {
    console.log(`Admin Backend running on http://localhost:${PORT}`);
  });
}

export default app;