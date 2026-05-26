import { MongoClient, ObjectId } from 'mongodb';

// ─── CORS HEADERS ─────────────────────────────────
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

// ─── DB CONNECTION ────────────────────────────────
async function connectDB(env) {
    const client = new MongoClient(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
    });
    await client.connect();
    return client.db(env.MONGODB_DB || 'breezygo');
}

// ─── EMAIL FUNCTIONS ──────────────────────────────
async function sendOrderEmail(order, env) {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: "BreezyGo Store", email: "turabop37622@gmail.com" },
                to: [{ email: env.ADMIN_EMAIL || "turabop37622@gmail.com" }],
                subject: `New Order - Rs ${order.total_amount.toLocaleString()} - ${order.customer_name}`,
                htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px 40px 30px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">BreezyGo</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Premium Lifestyle Tech</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ecfdf5;padding:20px 40px;border-bottom:2px solid #d1fae5;">
            <p style="margin:0;color:#065f46;font-size:16px;font-weight:700;text-align:center;">New Order Received!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr>
                <td>
                  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Order ID</p>
                  <p style="margin:0;color:#111827;font-size:16px;font-weight:700;font-family:monospace;">#${order.id.slice(-8).toUpperCase()}</p>
                </td>
                <td align="right">
                  <span style="background:#10b981;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;">PENDING</span>
                </td>
              </tr>
            </table>
            <h3 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;border-bottom:2px solid #f3f4f6;padding-bottom:12px;">Customer Details</h3>
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
            <h3 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;border-bottom:2px solid #f3f4f6;padding-bottom:12px;">Order Items</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${order.items.map(i => `
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${i.name}</p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Qty: ${i.quantity} x Rs ${i.price.toLocaleString()}</p>
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
            <p style="margin:0;color:#6b7280;font-size:13px;">Automated notification from <strong>BreezyGo Store</strong></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
            })
        });
        console.log("Brevo status:", response.status);
    } catch (err) {
        console.error("Email send error:", err);
    }
}

async function sendReviewEmail(order, env) {
    if (!order.email) return;
    try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: "BreezyGo Store", email: "turabop37622@gmail.com" },
                to: [{ email: order.email }],
                subject: `How was your order, ${order.customer_name}?`,
                htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">BreezyGo</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:800;">Your order has been delivered!</h2>
            <p style="margin:0;color:#6b7280;font-size:15px;">Hi <strong>${order.customer_name}</strong>, we hope you love your purchase!</p>
            <p style="margin:32px 0 0;color:#9ca3af;font-size:12px;">Thank you for shopping with <strong>BreezyGo</strong></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
            })
        });
    } catch (err) {
        console.error("Review email error:", err);
    }
}

// ─── MAIN ROUTER ──────────────────────────────────
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        if (method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        try {
            // ─── AUTH ────────────────────────────────────
            if (path === '/api/admin/login' && method === 'POST') {
                const { password } = await request.json();
                const adminPass = env.ADMIN_PASSWORD || "breezy2026";
                if (password === adminPass) {
                    return jsonResponse({ success: true, token: "admin-session-" + Date.now() });
                }
                return jsonResponse({ error: "Invalid password" }, 401);
            }

            // ─── PUBLIC PRODUCTS ─────────────────────────
            if (path === '/api/products' && method === 'GET') {
                const db = await connectDB(env);
                const category = url.searchParams.get('category');
                const featured = url.searchParams.get('featured');
                const filter = { is_active: { $ne: false } };
                if (category) filter.category = category;
                if (featured === 'true') filter.is_featured = true;
                const products = await db.collection("products").find(filter).toArray();
                return jsonResponse(products.map(p => ({
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
                    stock: p.stock || 100,
                    details: p.details || []
                })));
            }

            // ─── PUBLIC SINGLE PRODUCT ───────────────────
            if (path.startsWith('/api/products/') && method === 'GET') {
                const slug = path.replace('/api/products/', '');
                const db = await connectDB(env);
                const product = await db.collection("products").findOne({ slug });
                if (!product) return jsonResponse({ error: "Product not found" }, 404);
                return jsonResponse({
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
                    stock: product.stock || 100,
                    details: product.details || []
                });
            }

            // ─── PUBLIC ORDER SUBMIT ──────────────────────
            if (path === '/api/orders' && method === 'POST') {
                const db = await connectDB(env);
                const body = await request.json();
                const { customer_name, phone, email, city, address, postal_code, notes, discount_code, items } = body;

                if (!Array.isArray(items)) return jsonResponse({ error: "Items must be an array" }, 400);

                for (const item of items) {
                    if (!item.product_id || !ObjectId.isValid(item.product_id)) {
                        return jsonResponse({ error: `Invalid product ID format: ${item.product_id || 'undefined'}` }, 400);
                    }
                }

                const objectIds = items.map(i => new ObjectId(i.product_id));
                const dbProducts = await db.collection("products")
                    .find({ _id: { $in: objectIds }, is_active: true }).toArray();

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
                const result = await db.collection("orders").insertOne({
                    customer_name, phone, email: email || null, address, city,
                    postal_code: postal_code || null, notes: notes || null,
                    discount_code: verified_code, discount_amount,
                    items: trustedItems, subtotal, shipping_fee: 0,
                    total_amount, status: 'pending', created_at: new Date()
                });

                await sendOrderEmail({
                    id: result.insertedId.toString(),
                    customer_name, phone, city, address,
                    items: trustedItems, total_amount
                }, env);

                return jsonResponse({ success: true, id: result.insertedId.toString(), total_amount });
            }

            // ─── PUBLIC ORDER TRACK ───────────────────────
            if (path.startsWith('/api/orders/track/') && method === 'GET') {
                const query = decodeURIComponent(path.replace('/api/orders/track/', '')).trim();
                const db = await connectDB(env);

                // 24-char MongoDB ID
                if (query.length === 24 && ObjectId.isValid(query)) {
                    const order = await db.collection("orders").findOne({ _id: new ObjectId(query) });
                    if (!order) return jsonResponse({ error: 'Order not found' }, 404);
                    return jsonResponse({ type: 'single', orders: [formatOrder(order)] });
                }

                // 8-char short ID
                if (query.length === 8) {
                    const all = await db.collection("orders")
                        .find({}).sort({ created_at: -1 }).limit(500).toArray();
                    const order = all.find(o => o._id.toString().slice(-8).toUpperCase() === query.toUpperCase()) || null;
                    if (!order) return jsonResponse({ error: 'Order not found' }, 404);
                    return jsonResponse({ type: 'single', orders: [formatOrder(order)] });
                }

                // Phone number
                let orders = await db.collection("orders")
                    .find({ phone: query }).sort({ created_at: -1 }).toArray();

                // Email
                if (orders.length === 0) {
                    orders = await db.collection("orders")
                        .find({ email: query.toLowerCase() }).sort({ created_at: -1 }).toArray();
                }

                if (orders.length === 0) return jsonResponse({ error: 'No orders found' }, 404);
                return jsonResponse({ type: 'multiple', orders: orders.map(formatOrder) });
            }

            // ─── ADMIN STATS ──────────────────────────────
            if (path === '/api/admin/stats' && method === 'GET') {
                const db = await connectDB(env);
                const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
                const [totalOrders, totalProducts, totalMessages, revenueData, todayOrders, todayRevenue] = await Promise.all([
                    db.collection("orders").countDocuments(),
                    db.collection("products").countDocuments(),
                    db.collection("contact_messages").countDocuments(),
                    db.collection("orders").aggregate([{ $group: { _id: null, total: { $sum: "$total_amount" } } }]).toArray(),
                    db.collection("orders").countDocuments({ created_at: { $gte: todayStart } }),
                    db.collection("orders").aggregate([{ $match: { created_at: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: "$total_amount" } } }]).toArray()
                ]);
                const recentOrders = await db.collection("orders").find().sort({ created_at: -1 }).limit(5).project({ _id: 1, customer_name: 1, total_amount: 1, status: 1, created_at: 1 }).toArray();
                return jsonResponse({
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
            }

            // ─── ADMIN ORDERS GET ─────────────────────────
            if (path === '/api/admin/orders' && method === 'GET') {
                const db = await connectDB(env);
                const orders = await db.collection("orders").find().sort({ created_at: -1 }).toArray();
                return jsonResponse(orders.map(o => ({
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
            }

            // ─── ADMIN ORDERS UPDATE ──────────────────────
            if (path === '/api/admin/orders' && method === 'POST') {
                const db = await connectDB(env);
                const { id, status } = await request.json();
                if (!id || !ObjectId.isValid(id)) return jsonResponse({ error: "Invalid order ID" }, 400);
                await db.collection("orders").updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { status, updated_at: new Date() } }
                );
                if (status === 'delivered') {
                    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
                    if (order && order.email) {
                        await sendReviewEmail({ email: order.email, customer_name: order.customer_name, items: order.items }, env);
                    }
                }
                return jsonResponse({ success: true });
            }

            // ─── ADMIN ORDERS DELETE ALL ──────────────────
            if (path === '/api/admin/orders' && method === 'DELETE') {
                const db = await connectDB(env);
                await db.collection("orders").deleteMany({});
                return jsonResponse({ success: true });
            }

            // ─── ADMIN ORDER DELETE ONE ───────────────────
            if (path.startsWith('/api/admin/orders/') && method === 'DELETE') {
                const id = path.replace('/api/admin/orders/', '');
                if (!ObjectId.isValid(id)) return jsonResponse({ error: "Invalid order ID" }, 400);
                const db = await connectDB(env);
                await db.collection("orders").deleteOne({ _id: new ObjectId(id) });
                return jsonResponse({ success: true });
            }

            // ─── ADMIN PRODUCTS GET ───────────────────────
            if (path === '/api/admin/products' && method === 'GET') {
                const db = await connectDB(env);
                const products = await db.collection("products").find().sort({ created_at: -1 }).toArray();
                return jsonResponse(products.map(p => ({
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
                    details: p.details || []
                })));
            }

            // ─── ADMIN PRODUCTS ADD ───────────────────────
            if (path === '/api/admin/products' && method === 'POST') {
                const db = await connectDB(env);
                const { name, slug, price, original_price, category, tagline, image_url, stock, details } = await request.json();
                const result = await db.collection("products").insertOne({
                    name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                    price: Number(price), original_price: original_price ? Number(original_price) : null,
                    category, tagline: tagline || '', image_url: image_url || '',
                    stock: Number(stock) || 100, is_active: true, is_featured: false,
                    rating: 4.5, created_at: new Date(), details: details || []
                });
                return jsonResponse({ success: true, id: result.insertedId.toString() });
            }

            // ─── ADMIN PRODUCTS UPDATE ────────────────────
            if (path.startsWith('/api/admin/products/') && method === 'PUT') {
                const id = path.replace('/api/admin/products/', '');
                if (!ObjectId.isValid(id)) return jsonResponse({ error: "Invalid product ID" }, 400);
                const db = await connectDB(env);
                const { name, slug, price, original_price, category, tagline, image_url, stock, is_active, details } = await request.json();
                const updateDoc = {
                    name, price: Number(price),
                    original_price: original_price ? Number(original_price) : null,
                    category, tagline: tagline || '',
                    stock: Number(stock) || 0,
                    is_active: is_active !== false,
                    details: details || [],
                    updated_at: new Date()
                };
                if (slug) updateDoc.slug = slug;
                if (image_url) updateDoc.image_url = image_url;
                await db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
                return jsonResponse({ success: true });
            }

            // ─── ADMIN PRODUCTS DELETE ────────────────────
            if (path.startsWith('/api/admin/products/') && method === 'DELETE') {
                const id = path.replace('/api/admin/products/', '');
                if (!ObjectId.isValid(id)) return jsonResponse({ error: "Invalid product ID" }, 400);
                const db = await connectDB(env);
                await db.collection("products").deleteOne({ _id: new ObjectId(id) });
                return jsonResponse({ success: true });
            }

            // ─── PUBLIC CONTACT ───────────────────────────
            if (path === '/api/contact' && method === 'POST') {
                const db = await connectDB(env);
                const { name, email, subject, message } = await request.json();
                const result = await db.collection("contact_messages").insertOne({
                    name, email, subject, message,
                    status: 'unread', created_at: new Date()
                });
                if (!result.acknowledged) throw new Error("Could not submit message.");
                return jsonResponse({ success: true });
            }

            // ─── ADMIN MESSAGES GET ───────────────────────
            if (path === '/api/admin/messages' && method === 'GET') {
                const db = await connectDB(env);
                const messages = await db.collection("contact_messages").find().sort({ created_at: -1 }).toArray();
                return jsonResponse(messages.map(m => ({
                    id: m._id.toString(), name: m.name, email: m.email,
                    subject: m.subject || "General Inquiry", body: m.message,
                    status: m.status || 'unread',
                    date: new Date(m.created_at).toLocaleString()
                })));
            }

            // ─── ADMIN MESSAGES UPDATE ────────────────────
            if (path === '/api/admin/messages' && method === 'POST') {
                const { id } = await request.json();
                if (!id || !ObjectId.isValid(id)) return jsonResponse({ error: "Invalid message ID" }, 400);
                const db = await connectDB(env);
                await db.collection("contact_messages").updateOne(
                    { _id: new ObjectId(id) }, { $set: { status: 'read', updated_at: new Date() } }
                );
                return jsonResponse({ success: true });
            }

            // ─── ADMIN MESSAGES DELETE ────────────────────
            if (path.startsWith('/api/admin/messages/') && method === 'DELETE') {
                const id = path.replace('/api/admin/messages/', '');
                if (!ObjectId.isValid(id)) return jsonResponse({ error: "Invalid message ID" }, 400);
                const db = await connectDB(env);
                await db.collection("contact_messages").deleteOne({ _id: new ObjectId(id) });
                return jsonResponse({ success: true });
            }

            return jsonResponse({ error: "Not found" }, 404);

        } catch (error) {
            console.error("Worker error:", error);
            return jsonResponse({ error: error.message }, 500);
        }
    }
};