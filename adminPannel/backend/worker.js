import { MongoClient, ObjectId } from 'mongodb';

// ─── CORS HEADERS ─────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
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

    const result = await response.json();
    console.log("Brevo order email status:", response.status, JSON.stringify(result));

    if (!response.ok) {
      throw new Error(`Brevo error: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    console.error("Order email send error:", err);
  }
}

async function sendOrderCustomerEmail(order, env) {
  if (!order.email) return;
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "BreezyGo Store", email: "turabop37622@gmail.com" },
        to: [{ email: order.email }],
        subject: `Order Confirmed! #${order.id.slice(-8).toUpperCase()} - BreezyGo`,
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
            <p style="margin:0;color:#065f46;font-size:16px;font-weight:700;text-align:center;">🎉 Your Order is Confirmed!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;color:#374151;font-size:15px;">Hi <strong>${order.customer_name}</strong>, thank you for your order! We have received it and will process it soon.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr>
                <td>
                  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Order ID</p>
                  <p style="margin:0;color:#111827;font-size:16px;font-weight:700;font-family:monospace;">#${order.id.slice(-8).toUpperCase()}</p>
                </td>
                <td align="right">
                  <span style="background:#10b981;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;">CONFIRMED</span>
                </td>
              </tr>
            </table>
            <h3 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;border-bottom:2px solid #f3f4f6;padding-bottom:12px;">Delivery Details</h3>
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
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr>
                <td>
                  <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:600;">Total Amount (COD)</p>
                </td>
                <td align="right">
                  <p style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">Rs ${order.total_amount.toLocaleString()}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0;color:#6b7280;font-size:13px;text-align:center;">Payment will be collected at the time of delivery.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#6b7280;font-size:13px;">Thank you for shopping with <strong>BreezyGo Store</strong> 🛍️</p>
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
    console.log("Brevo customer order email status:", response.status, JSON.stringify(result));

    if (!response.ok) {
      throw new Error(`Brevo customer email error: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    console.error("Customer order email error:", err);
  }
}

async function sendReviewEmail(order, env) {
  if (!order.email) return;
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
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

    const result = await response.json();
    console.log("Brevo review email status:", response.status, JSON.stringify(result));

    if (!response.ok) {
      throw new Error(`Brevo review email error: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    console.error("Review email error:", err);
  }
}
async function sendPromoEmail(email, promoCode, expiresAt, env) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.BREVO_API_KEY
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


export default {
  async fetch(request, env, ctx) {
    let mongoClient = null;

    async function getDB() {
      if (!mongoClient) {
        mongoClient = new MongoClient(env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        await mongoClient.connect();
      }
      return mongoClient.db(env.MONGODB_DB || 'breezygo');
    }
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
        const adminPass = env.ADMIN_PASSWORD || "Ahlegand5712@";
        if (password === adminPass) {
          return jsonResponse({ success: true, token: "admin-session-" + Date.now() });
        }
        return jsonResponse({ error: "Invalid password" }, 401);
      }

      if (path.startsWith('/api/admin/')) {
        const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer admin-session-')) {
          return jsonResponse({ error: "Unauthorized access. Missing or invalid token." }, 401);
        }
      }

      // ─── PUBLIC PRODUCTS ─────────────────────────
      if (path === '/api/products' && method === 'GET') {
        const cacheKey = new Request(url.toString(), request);
        const cache = caches.default;
        let response = await cache.match(cacheKey);
        
        if (!response) {
          const db = await getDB();
          const category = url.searchParams.get('category');
          const featured = url.searchParams.get('featured');
          const filter = { is_active: { $ne: false } };
          if (category) filter.category = category;
          if (featured === 'true') filter.is_featured = true;
          const products = await db.collection("products").find(filter).project({ details: 0 }).toArray();
          response = jsonResponse(products.map(p => ({
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
          })), 200, { 'Cache-Control': 'public, max-age=60, s-maxage=60' });
          
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
        return response;
      }

      // ─── PUBLIC PRODUCT SEARCH ───────────────────
      if (path === '/api/products/search' && method === 'GET') {
        const db = await getDB();
        const q = url.searchParams.get('q') || '';
        if (!q || q.length < 3) {
          return jsonResponse([]);
        }
        const filter = {
          is_active: { $ne: false },
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
          ]
        };
        const products = await db.collection("products").find(filter).limit(8).toArray();
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
          stock: p.stock !== undefined ? Number(p.stock) : 100,
          images: p.images || (p.image_url ? [p.image_url] : [])
        })));
      }

      // ─── PUBLIC SINGLE PRODUCT ───────────────────
      if (path.startsWith('/api/products/') && method === 'GET') {
        const cacheKey = new Request(url.toString(), request);
        const cache = caches.default;
        let response = await cache.match(cacheKey);
        
        if (!response) {
          const slug = path.replace('/api/products/', '');
          const db = await getDB();
          const product = await db.collection("products").findOne({ slug });
          if (!product) return jsonResponse({ error: "Product not found" }, 404);
          response = jsonResponse({
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
          }, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=60' });
          
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
        return response;
      }

      // ─── PUBLIC SUPPORT CHAT AI ──────────────────
      if (path === '/api/support-chat' && method === 'POST') {
        const db = await getDB();
        const { messages } = await request.json();
        if (!Array.isArray(messages) || messages.length === 0) {
          return jsonResponse({ error: "Invalid messages format" }, 400);
        }

        const settings = await db.collection("app_settings").findOne({ _id: "global" }) || {};
        const aiEnabled = settings.ai_chat_enabled !== false;
        const systemPromptOverride = settings.ai_chat_system_prompt || "You are the AI assistant for BreezyGo Store. Delivery Times: Lahore 24-48 hours, Other Cities 4-6 days. Shipping is free. Keep responses short and in English/Roman Urdu.";

        if (!aiEnabled) {
          return jsonResponse({ error: "AI Chat is currently disabled" }, 403);
        }

        // Try to find any order ID mentioned
        const cleanMsg = messages.map(m => m.content).join(" ");
        const orderIdMatch = cleanMsg.match(/\b([A-Fa-f0-9]{24})\b/) || cleanMsg.match(/\b([A-Za-z0-9]{8})\b/);
        let orderInfo = "";
        if (orderIdMatch) {
          const matchedId = orderIdMatch[1];
          let order = null;
          if (matchedId.length === 24) {
            order = await db.collection("orders").findOne({ _id: new ObjectId(matchedId) });
          } else {
            const allOrders = await db.collection("orders").find().sort({ created_at: -1 }).limit(500).toArray();
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

        // Clean messages for Cloudflare Workers AI (roles must be 'system', 'user', or 'assistant')
        const aiMessages = [
          { role: 'system', content: finalSystemPrompt }
        ];
        for (const m of messages) {
          if (m.role === 'user' || m.role === 'assistant') {
            aiMessages.push({
              role: m.role,
              content: m.content
            });
          }
        }

        // Call Cloudflare Workers AI directly via binding
        let reply = "";
        try {
          const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: aiMessages
          });
          reply = aiResult.response || "I'm sorry, I couldn't process that.";
        } catch (aiError) {
          console.error("Cloudflare Workers AI Error:", aiError);
          return jsonResponse({ error: aiError.message || "Workers AI execution error" }, 500);
        }

        // Optionally log to support_conversations
        try {
          await db.collection("support_conversations").insertOne({
            messages: [...messages, { role: "assistant", content: reply }],
            order_info: orderInfo || null,
            created_at: new Date()
          });
        } catch (logErr) {
          console.error("Error logging support conversation:", logErr);
        }

        return jsonResponse({ reply });
      }

      // ─── PUBLIC ORDER SUBMIT ──────────────────────
      if (path === '/api/orders' && method === 'POST') {
        const db = await getDB();
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

          const qty2_discount = p.qty2_discount_percent !== undefined ? Number(p.qty2_discount_percent) : 3;
          const qty3_discount = p.qty3_discount_percent !== undefined ? Number(p.qty3_discount_percent) : 5;
          
          let discountPercent = 0;
          if (i.quantity === 2) {
            discountPercent = qty2_discount;
          } else if (i.quantity >= 3) {
            discountPercent = qty3_discount;
          }
          
          const finalPrice = Math.round(Number(p.price) * (1 - discountPercent / 100));

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
          const promo = await db.collection("promo_codes").findOne({ code });
          if (promo && !promo.used && new Date() < new Date(promo.expires_at)) {
            discount_amount = Math.round(subtotal * (promo.discount_percent / 100));
            verified_code = code;
          }
        }

        const total_amount = subtotal - discount_amount;
        const result = await db.collection("orders").insertOne({
          customer_name, phone, email: email || null, address, city,
          postal_code: postal_code || null, notes: notes || null,
          discount_code: verified_code, discount_amount,
          items: trustedItems, subtotal, shipping_fee: 0,
          total_amount, status: 'pending', created_at: new Date()
        });

        if (verified_code) {
          await db.collection("promo_codes").updateOne(
            { code: verified_code },
            { $set: { used: true, used_at: new Date() } }
          );
        }

        if (email) {
          await sendOrderCustomerEmail({
            id: result.insertedId.toString(),
            customer_name, phone, city, address,
            email, items: trustedItems, total_amount
          }, env);
        }

        await sendOrderEmail({
          id: result.insertedId.toString(),
          customer_name, phone, city, address,
          items: trustedItems,
          total_amount
        }, env);

        return jsonResponse({ success: true, id: result.insertedId.toString(), total_amount });
      }

      // ─── PUBLIC ORDER TRACK ───────────────────────
      if (path.startsWith('/api/orders/track/') && method === 'GET') {
        const query = decodeURIComponent(path.replace('/api/orders/track/', '')).trim();
        const db = await getDB();

        if (query.length === 24 && ObjectId.isValid(query)) {
          const order = await db.collection("orders").findOne({ _id: new ObjectId(query) });
          if (!order) return jsonResponse({ error: 'Order not found' }, 404);
          return jsonResponse({ type: 'single', orders: [formatOrder(order)] });
        }

        if (query.length === 8) {
          const all = await db.collection("orders")
            .find({}).sort({ created_at: -1 }).limit(500).toArray();
          const order = all.find(o => o._id.toString().slice(-8).toUpperCase() === query.toUpperCase()) || null;
          if (!order) return jsonResponse({ error: 'Order not found' }, 404);
          return jsonResponse({ type: 'single', orders: [formatOrder(order)] });
        }

        let orders = await db.collection("orders")
          .find({ phone: query }).sort({ created_at: -1 }).toArray();

        if (orders.length === 0) {
          orders = await db.collection("orders")
            .find({ email: query.toLowerCase() }).sort({ created_at: -1 }).toArray();
        }

        if (orders.length === 0) return jsonResponse({ error: 'No orders found' }, 404);
        return jsonResponse({ type: 'multiple', orders: orders.map(formatOrder) });
      }

      // ─── PUBLIC SUBSCRIBE ─────────────────────────
      if (path === '/api/subscribe' && method === 'POST') {
        const db = await getDB();
        const { email } = await request.json();
        if (!email || !email.includes('@')) return jsonResponse({ error: 'Valid email required' }, 400);
        const existing = await db.collection("subscribers").findOne({ email: email.toLowerCase() });
        if (existing) return jsonResponse({ error: 'Already subscribed' }, 409);
        await db.collection("subscribers").insertOne({
          email: email.toLowerCase(),
          status: 'pending',
          created_at: new Date()
        });
        return jsonResponse({ success: true });
      }

      // ─── VALIDATE PROMO CODE ──────────────────────
      if (path === '/api/promo/validate' && method === 'POST') {
        const db = await getDB();
        const { code } = await request.json();
        if (!code) return jsonResponse({ error: 'Code required' }, 400);
        const promo = await db.collection("promo_codes").findOne({ code: code.toUpperCase().trim() });
        if (!promo) return jsonResponse({ error: 'Invalid promo code' }, 404);
        if (promo.used) return jsonResponse({ error: 'Promo code already used' }, 400);
        if (new Date() > new Date(promo.expires_at)) return jsonResponse({ error: 'Promo code expired' }, 400);
        return jsonResponse({ valid: true, discount_percent: promo.discount_percent });
      }

      // ─── ADMIN GET SUBSCRIBERS ────────────────────
      if (path === '/api/admin/subscribers' && method === 'GET') {
        const db = await getDB();
        const subscribers = await db.collection("subscribers").find().sort({ created_at: -1 }).toArray();
        return jsonResponse(subscribers.map(s => ({
          id: s._id.toString(),
          email: s.email,
          status: s.status,
          promo_code: s.promo_code || null,
          date: new Date(s.created_at).toLocaleString()
        })));
      }

      // ─── ADMIN APPROVE SUBSCRIBER ─────────────────
      if (path === '/api/admin/subscribers/approve' && method === 'POST') {
        const { id } = await request.json();
        if (!id || !ObjectId.isValid(id)) return jsonResponse({ error: 'Invalid ID' }, 400);
        const db = await getDB();
        const subscriber = await db.collection("subscribers").findOne({ _id: new ObjectId(id) });
        if (!subscriber) return jsonResponse({ error: 'Subscriber not found' }, 404);
        if (subscriber.status === 'approved') return jsonResponse({ error: 'Already approved' }, 400);
        const promoCode = 'BREEZY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.collection("promo_codes").insertOne({
          code: promoCode,
          email: subscriber.email,
          discount_percent: 5,
          used: false,
          expires_at: expiresAt,
          created_at: new Date()
        });
        await db.collection("subscribers").updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: 'approved', promo_code: promoCode, approved_at: new Date() } }
        );
        await sendPromoEmail(subscriber.email, promoCode, expiresAt, env);
        return jsonResponse({ success: true });
      }

      // ─── ADMIN STATS ──────────────────────────────
      if (path === '/api/admin/stats' && method === 'GET') {
        const db = await getDB();
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
        const db = await getDB();
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
        const db = await getDB();
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
        const db = await getDB();
        await db.collection("orders").deleteMany({});
        return jsonResponse({ success: true });
      }

      // ─── ADMIN ORDER DELETE ONE ───────────────────
      if (path.startsWith('/api/admin/orders/') && method === 'DELETE') {
        const id = path.replace('/api/admin/orders/', '');
        if (!ObjectId.isValid(id)) return jsonResponse({ error: "Invalid order ID" }, 400);
        const db = await getDB();
        await db.collection("orders").deleteOne({ _id: new ObjectId(id) });
        return jsonResponse({ success: true });
      }

      // ─── ADMIN PRODUCTS GET ───────────────────────
      if (path === '/api/admin/products' && method === 'GET') {
        const db = await getDB();
        const products = await db.collection("products").find().sort({ created_at: -1 }).toArray();
        return jsonResponse(products.map(p => ({
          id: p._id.toString(),
          name: p.name,
          slug: p.slug,
          price: p.price,
          original_price: p.original_price || null,
          stock: p.stock || 100,
          category: p.category,
          image_url: p.image_url || '',
          is_active: p.is_active !== false,
          status: p.is_active !== false ? 'Active' : 'Out of Stock',
          details: p.details || [],
          images: p.images || (p.image_url ? [p.image_url] : []),
          qty2_discount_percent: p.qty2_discount_percent !== undefined ? p.qty2_discount_percent : 3,
          qty3_discount_percent: p.qty3_discount_percent !== undefined ? p.qty3_discount_percent : 5
        })));
      }

      // ─── ADMIN PRODUCTS ADD ───────────────────────
      if (path === '/api/admin/products' && method === 'POST') {
        const db = await getDB();
        const { name, slug, price, original_price, category, tagline, image_url, stock, details, images, qty2_discount_percent, qty3_discount_percent } = await request.json();
        const result = await db.collection("products").insertOne({
          name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          price: Number(price), original_price: original_price ? Number(original_price) : null,
          category, tagline: tagline || '', image_url: image_url || '',
          stock: Number(stock) || 100, is_active: true, is_featured: false,
          rating: 4.5, created_at: new Date(), details: details || [],
          images: images || [],
          qty2_discount_percent: qty2_discount_percent !== undefined ? Number(qty2_discount_percent) : 3,
          qty3_discount_percent: qty3_discount_percent !== undefined ? Number(qty3_discount_percent) : 5
        });
        return jsonResponse({ success: true, id: result.insertedId.toString() });
      }

      // ─── ADMIN PRODUCTS UPDATE ────────────────────
      if (path.startsWith('/api/admin/products/') && method === 'PUT') {
        const id = path.replace('/api/admin/products/', '');
        if (!ObjectId.isValid(id)) return jsonResponse({ error: "Invalid product ID" }, 400);
        const db = await getDB();
        const { name, slug, price, original_price, category, tagline, image_url, stock, is_active, details, images, qty2_discount_percent, qty3_discount_percent } = await request.json();
        const updateDoc = {
          name, price: Number(price),
          original_price: original_price ? Number(original_price) : null,
          category, tagline: tagline || '',
          stock: Number(stock) || 0,
          is_active: is_active !== false,
          details: details || [],
          qty2_discount_percent: qty2_discount_percent !== undefined ? Number(qty2_discount_percent) : 3,
          qty3_discount_percent: qty3_discount_percent !== undefined ? Number(qty3_discount_percent) : 5,
          updated_at: new Date()
        };
        if (images) updateDoc.images = images;
        if (slug) updateDoc.slug = slug;
        if (image_url) updateDoc.image_url = image_url;
        await db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
        return jsonResponse({ success: true });
      }

      // ─── ADMIN PRODUCTS DELETE ────────────────────
      if (path.startsWith('/api/admin/products/') && method === 'DELETE') {
        const id = path.replace('/api/admin/products/', '');
        if (!ObjectId.isValid(id)) return jsonResponse({ error: "Invalid product ID" }, 400);
        const db = await getDB();
        await db.collection("products").deleteOne({ _id: new ObjectId(id) });
        return jsonResponse({ success: true });
      }

      // ─── PUBLIC CONTACT ───────────────────────────
      if (path === '/api/contact' && method === 'POST') {
        const db = await getDB();
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
        const db = await getDB();
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
        const db = await getDB();
        await db.collection("contact_messages").updateOne(
          { _id: new ObjectId(id) }, { $set: { status: 'read', updated_at: new Date() } }
        );
        return jsonResponse({ success: true });
      }

      // ─── ADMIN MESSAGES DELETE ────────────────────
      if (path.startsWith('/api/admin/messages/') && method === 'DELETE') {
        const id = path.replace('/api/admin/messages/', '');
        if (!ObjectId.isValid(id)) return jsonResponse({ error: "Invalid message ID" }, 400);
        const db = await getDB();
        await db.collection("contact_messages").deleteOne({ _id: new ObjectId(id) });
        return jsonResponse({ success: true });
      }

      // ─── PUBLIC SETTINGS ──────────────────────────
      if (path === '/api/settings' && method === 'GET') {
        const db = await getDB();
        const settings = await db.collection("app_settings").findOne({ _id: "global" });
        const defaults = {
          live_viewers_enabled: true,
          live_viewers_min: 3,
          live_viewers_max: 30,
          live_viewers_interval_min: 15,
          live_viewers_interval_max: 45,
          sales_graph_enabled_global: true,
          lahore_delivery_hours: { min: 24, max: 48 },
          other_cities_processing_days: 2,
          other_cities_shipping_days: 2,
          homepage_banner_enabled: true,
          homepage_banner_text: "🚀 24-48 Hour Delivery Anywhere in Lahore — No Extra Charges!"
        };
        return jsonResponse({ ...defaults, ...(settings || {}), _id: undefined });
      }

      // ─── ADMIN SETTINGS GET ───────────────────────
      if (path === '/api/admin/settings' && method === 'GET') {
        const db = await getDB();
        const settings = await db.collection("app_settings").findOne({ _id: "global" });
        const defaults = {
          live_viewers_enabled: true,
          live_viewers_min: 3,
          live_viewers_max: 30,
          live_viewers_interval_min: 15,
          live_viewers_interval_max: 45,
          sales_graph_enabled_global: true,
          lahore_delivery_hours: { min: 24, max: 48 },
          other_cities_processing_days: 2,
          other_cities_shipping_days: 2,
          homepage_banner_enabled: true,
          homepage_banner_text: "🚀 24-48 Hour Delivery Anywhere in Lahore — No Extra Charges!"
        };
        return jsonResponse({ ...defaults, ...(settings || {}), _id: undefined });
      }

      // ─── ADMIN SETTINGS UPDATE ────────────────────
      if (path === '/api/admin/settings' && method === 'PUT') {
        const db = await getDB();
        const body = await request.json();
        await db.collection("app_settings").updateOne(
          { _id: "global" },
          { $set: { ...body, updated_at: new Date() } },
          { upsert: true }
        );
        return jsonResponse({ success: true });
      }

      // ─── PUBLIC STOCK BATCHES ─────────────────────
      if (path.startsWith('/api/stock-batches/') && method === 'GET') {
        const productId = path.replace('/api/stock-batches/', '');
        const db = await getDB();
        const batches = await db.collection("stock_batches")
          .find({ product_id: productId })
          .sort({ order: 1, created_at: 1 })
          .toArray();
        // Find first active batch (remaining > 0)
        const activeBatch = batches.find(b => (b.remaining ?? b.quantity) > 0) || null;
        return jsonResponse({
          active_batch: activeBatch ? {
            id: activeBatch._id.toString(),
            label: activeBatch.label,
            quantity: activeBatch.quantity,
            remaining: activeBatch.remaining ?? activeBatch.quantity,
          } : null,
          total_batches: batches.length,
        });
      }

      // ─── ADMIN STOCK BATCHES GET ──────────────────
      if (path.startsWith('/api/admin/stock-batches/') && method === 'GET') {
        const productId = path.replace('/api/admin/stock-batches/', '');
        const db = await getDB();
        const batches = await db.collection("stock_batches")
          .find({ product_id: productId })
          .sort({ order: 1, created_at: 1 })
          .toArray();
        return jsonResponse(batches.map((b, i) => ({
          id: b._id.toString(),
          product_id: b.product_id,
          label: b.label || `Batch ${i + 1}`,
          quantity: b.quantity,
          remaining: b.remaining ?? b.quantity,
          order: b.order ?? i,
          created_at: b.created_at,
        })));
      }

      // ─── ADMIN STOCK BATCHES ADD ──────────────────
      if (path.startsWith('/api/admin/stock-batches/') && method === 'POST') {
        const productId = path.replace('/api/admin/stock-batches/', '');
        const db = await getDB();
        const body = await request.json();
        const { label, quantity } = body;
        if (!quantity || quantity < 1) return jsonResponse({ error: 'Quantity required' }, 400);
        const count = await db.collection("stock_batches").countDocuments({ product_id: productId });
        const result = await db.collection("stock_batches").insertOne({
          product_id: productId,
          label: label || `Batch ${count + 1}`,
          quantity: Number(quantity),
          remaining: Number(quantity),
          order: count,
          created_at: new Date(),
        });
        return jsonResponse({ success: true, id: result.insertedId.toString() });
      }

      // ─── ADMIN STOCK BATCH DELETE ─────────────────
      if (path.startsWith('/api/admin/stock-batches/') && method === 'DELETE') {
        // path: /api/admin/stock-batches/delete/:batchId
        const batchId = path.replace('/api/admin/stock-batches/delete/', '');
        if (!ObjectId.isValid(batchId)) return jsonResponse({ error: 'Invalid batch ID' }, 400);
        const db = await getDB();
        await db.collection("stock_batches").deleteOne({ _id: new ObjectId(batchId) });
        return jsonResponse({ success: true });
      }

      // ─── PUBLIC DISCOUNTS ─────────────────────────
      if (path.startsWith('/api/discounts/') && method === 'GET') {
        const productId = path.replace('/api/discounts/', '');
        const db = await getDB();
        const now = new Date();
        const discount = await db.collection("timed_discounts").findOne({
          product_id: productId,
          start_time: { $lte: now },
          end_time: { $gt: now },
          cancelled: { $ne: true },
        });
        if (!discount) return jsonResponse({ active: false });
        return jsonResponse({
          active: true,
          id: discount._id.toString(),
          discount_percent: discount.discount_percent,
          start_time: discount.start_time,
          end_time: discount.end_time,
        });
      }

      // ─── PUBLIC REVIEWS POST ──────────────────────
      if (path.startsWith('/api/reviews/') && method === 'POST') {
        const productId = path.replace('/api/reviews/', '');
        const db = await getDB();
        const { customer_name, rating, comment, images } = await request.json();
        if (!customer_name || !rating) {
          return jsonResponse({ error: 'Customer name and rating are required' }, 400);
        }
        const newReview = {
          product_id: productId,
          customer_name,
          rating: Number(rating),
          comment: comment || '',
          images: Array.isArray(images) ? images : [],
          status: 'pending',
          is_active: true,
          created_at: new Date()
        };
        const result = await db.collection("reviews").insertOne(newReview);
        return jsonResponse({ success: true, id: result.insertedId.toString() });
      }

      // ─── PUBLIC REVIEWS SUMMARY GET ───────────────
      if (path.startsWith('/api/reviews/') && path.endsWith('/summary') && method === 'GET') {
        const productId = path.replace('/api/reviews/', '').replace('/summary', '');
        const db = await getDB();
        const realReviews = await db.collection("reviews")
          .find({ product_id: productId, status: 'approved', is_active: true })
          .toArray();

        let productName = "product";
        if (ObjectId.isValid(productId)) {
          const pObj = await db.collection("products").findOne({ _id: new ObjectId(productId) });
          if (pObj) productName = pObj.name;
        }

        const fakeReviews = getFakeReviewsForProduct(productId, productName);
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
        
        return jsonResponse({ average_rating, total_reviews, breakdown });
      }

      // ─── PUBLIC REVIEWS GET ───────────────────────
      if (path.startsWith('/api/reviews/') && method === 'GET') {
        const productId = path.replace('/api/reviews/', '');
        const db = await getDB();
        const realReviews = await db.collection("reviews")
          .find({ product_id: productId, status: 'approved', is_active: true })
          .sort({ created_at: -1 })
          .toArray();

        let productName = "product";
        if (ObjectId.isValid(productId)) {
          const pObj = await db.collection("products").findOne({ _id: new ObjectId(productId) });
          if (pObj) productName = pObj.name;
        }

        const fakeReviews = getFakeReviewsForProduct(productId, productName);
        const combined = [...realReviews, ...fakeReviews];

        return jsonResponse(combined.map(r => ({
          id: r._id.toString(),
          product_id: r.product_id,
          customer_name: r.customer_name,
          rating: r.rating,
          comment: r.comment,
          images: r.images || [],
          date: r.date || new Date(r.created_at).toLocaleDateString()
        })));
      }

      // ─── ADMIN REVIEWS PENDING COUNT ──────────────
      if (path === '/api/admin/reviews/pending-count' && method === 'GET') {
        const db = await getDB();
        const count = await db.collection("reviews").countDocuments({ status: 'pending' });
        return jsonResponse({ pending_count: count });
      }

      // ─── ADMIN REVIEWS GET ────────────────────────
      if (path === '/api/admin/reviews' && method === 'GET') {
        const db = await getDB();
        const productId = url.searchParams.get('product_id');
        const status = url.searchParams.get('status');
        const filter = {};
        if (productId) filter.product_id = productId;
        if (status && status !== 'all') filter.status = status;
        
        const reviews = await db.collection("reviews")
          .find(filter)
          .sort({ created_at: -1 })
          .toArray();
          
        const productIds = [...new Set(reviews.map(r => r.product_id))];
        const products = await db.collection("products")
          .find({ _id: { $in: productIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)) } })
          .project({ _id: 1, name: 1 })
          .toArray();
        const productMap = new Map(products.map(p => [p._id.toString(), p.name]));
        
        return jsonResponse(reviews.map(r => ({
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
      }

      // ─── ADMIN REVIEWS APPROVE ────────────────────
      if (path.startsWith('/api/admin/reviews/') && path.endsWith('/approve') && method === 'PUT') {
        const reviewId = path.replace('/api/admin/reviews/', '').replace('/approve', '');
        if (!ObjectId.isValid(reviewId)) return jsonResponse({ error: 'Invalid ID' }, 400);
        const db = await getDB();
        await db.collection("reviews").updateOne(
          { _id: new ObjectId(reviewId) },
          { $set: { status: 'approved', updated_at: new Date() } }
        );
        return jsonResponse({ success: true });
      }

      // ─── ADMIN REVIEWS REJECT ─────────────────────
      if (path.startsWith('/api/admin/reviews/') && path.endsWith('/reject') && method === 'PUT') {
        const reviewId = path.replace('/api/admin/reviews/', '').replace('/reject', '');
        if (!ObjectId.isValid(reviewId)) return jsonResponse({ error: 'Invalid ID' }, 400);
        const db = await getDB();
        await db.collection("reviews").updateOne(
          { _id: new ObjectId(reviewId) },
          { $set: { status: 'rejected', updated_at: new Date() } }
        );
        return jsonResponse({ success: true });
      }

      // ─── ADMIN REVIEWS TOGGLE ACTIVE ──────────────
      if (path.startsWith('/api/admin/reviews/') && path.endsWith('/toggle-active') && method === 'PUT') {
        const reviewId = path.replace('/api/admin/reviews/', '').replace('/toggle-active', '');
        if (!ObjectId.isValid(reviewId)) return jsonResponse({ error: 'Invalid ID' }, 400);
        const db = await getDB();
        const review = await db.collection("reviews").findOne({ _id: new ObjectId(reviewId) });
        if (!review) return jsonResponse({ error: 'Review not found' }, 404);
        
        await db.collection("reviews").updateOne(
          { _id: new ObjectId(reviewId) },
          { $set: { is_active: !review.is_active, updated_at: new Date() } }
        );
        return jsonResponse({ success: true, is_active: !review.is_active });
      }

      // ─── ADMIN REVIEWS DELETE ─────────────────────
      if (path.startsWith('/api/admin/reviews/') && method === 'DELETE') {
        const reviewId = path.replace('/api/admin/reviews/', '');
        if (!ObjectId.isValid(reviewId)) return jsonResponse({ error: 'Invalid ID' }, 400);
        const db = await getDB();
        await db.collection("reviews").deleteOne({ _id: new ObjectId(reviewId) });
        return jsonResponse({ success: true });
      }

      // ─── ADMIN DISCOUNTS GET ──────────────────────
      if (path === '/api/admin/discounts' && method === 'GET') {
        const db = await getDB();
        const now = new Date();
        const discounts = await db.collection("timed_discounts")
          .find({ cancelled: { $ne: true } })
          .sort({ created_at: -1 })
          .toArray();
        // Also fetch product names
        const productIds = [...new Set(discounts.map(d => d.product_id))];
        const products = await db.collection("products")
          .find({ _id: { $in: productIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)) } })
          .project({ _id: 1, name: 1, slug: 1, price: 1 })
          .toArray();
        const productMap = new Map(products.map(p => [p._id.toString(), p]));
        return jsonResponse(discounts.map(d => {
          const p = productMap.get(d.product_id) || {};
          const startTime = new Date(d.start_time);
          const endTime = new Date(d.end_time);
          let status = 'scheduled';
          if (now >= startTime && now < endTime) status = 'active';
          else if (now >= endTime) status = 'expired';
          return {
            id: d._id.toString(),
            product_id: d.product_id,
            product_name: p.name || 'Unknown',
            product_slug: p.slug || '',
            product_price: p.price || 0,
            discount_percent: d.discount_percent,
            start_time: d.start_time,
            end_time: d.end_time,
            status,
            created_at: d.created_at,
          };
        }));
      }

      // ─── ADMIN DISCOUNTS ADD ──────────────────────
      if (path === '/api/admin/discounts' && method === 'POST') {
        const db = await getDB();
        const { product_id, discount_percent, start_time, end_time } = await request.json();
        if (!product_id || !discount_percent || !start_time || !end_time) {
          return jsonResponse({ error: 'All fields required' }, 400);
        }
        const result = await db.collection("timed_discounts").insertOne({
          product_id,
          discount_percent: Number(discount_percent),
          start_time: new Date(start_time),
          end_time: new Date(end_time),
          cancelled: false,
          created_at: new Date(),
        });
        return jsonResponse({ success: true, id: result.insertedId.toString() });
      }

      // ─── ADMIN DISCOUNTS CANCEL ───────────────────
      if (path.startsWith('/api/admin/discounts/') && method === 'DELETE') {
        const id = path.replace('/api/admin/discounts/', '');
        if (!ObjectId.isValid(id)) return jsonResponse({ error: 'Invalid ID' }, 400);
        const db = await getDB();
        await db.collection("timed_discounts").updateOne(
          { _id: new ObjectId(id) },
          { $set: { cancelled: true, cancelled_at: new Date() } }
        );
        return jsonResponse({ success: true });
      }

      // ─── PUBLIC SALES DATA ────────────────────────
      if (path.startsWith('/api/sales-data/') && method === 'GET') {
        const productId = path.replace('/api/sales-data/', '');
        const db = await getDB();

        // Check if sales graph is globally enabled
        const settings = await db.collection("app_settings").findOne({ _id: "global" });
        const globalEnabled = settings?.sales_graph_enabled_global !== false;
        const perProductDisabled = settings?.sales_graph_disabled_products?.includes(productId);
        if (!globalEnabled || perProductDisabled) {
          return jsonResponse({ enabled: false });
        }

        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);

        // Aggregate from orders collection
        const todayAgg = await db.collection("orders").aggregate([
          { $match: { created_at: { $gte: todayStart }, 'items.product_id': productId } },
          { $unwind: '$items' },
          { $match: { 'items.product_id': productId } },
          { $group: { _id: null, units: { $sum: '$items.quantity' }, revenue: { $sum: '$items.line_total' } } }
        ]).toArray();

        // Daily breakdown for the past 7 days
        const weekOrders = await db.collection("orders").aggregate([
          { $match: { created_at: { $gte: weekStart }, 'items.product_id': productId } },
          { $unwind: '$items' },
          { $match: { 'items.product_id': productId } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at', timezone: 'Asia/Karachi' } },
              units: { $sum: '$items.quantity' },
              revenue: { $sum: '$items.line_total' }
            }
          },
          { $sort: { _id: 1 } }
        ]).toArray();

        // Build full 7-day array (fill missing days with 0)
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          const label = d.toLocaleDateString('en-PK', { weekday: 'short', timeZone: 'Asia/Karachi' });
          const found = weekOrders.find(w => w._id === key);
          days.push({ date: key, label, units: found?.units || 0, revenue: found?.revenue || 0 });
        }

        return jsonResponse({
          enabled: true,
          today: { units: todayAgg[0]?.units || 0, revenue: todayAgg[0]?.revenue || 0 },
          week: days,
        });
      }

      // ─── ADMIN SALES GRAPH SETTINGS ───────────────
      if (path === '/api/admin/sales-graph-settings' && method === 'PUT') {
        const db = await getDB();
        const { global_enabled, disabled_products } = await request.json();
        await db.collection("app_settings").updateOne(
          { _id: "global" },
          { $set: { sales_graph_enabled_global: global_enabled, sales_graph_disabled_products: disabled_products || [], updated_at: new Date() } },
          { upsert: true }
        );
        return jsonResponse({ success: true });
      }

      return jsonResponse({ error: "Not found" }, 404);

    } catch (error) {
      console.error("Worker error:", error);
      return jsonResponse({ error: error.message }, 500);
    } finally {
      if (mongoClient) {
        ctx.waitUntil(mongoClient.close().catch(console.error));
      }
    }
  }
};

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