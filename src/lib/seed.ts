import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import path from "path";

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "breezygo";

const products = [
  {
    slug: "earbuds-pearl",
    name: "Breezy Buds Pearl",
    category: "Earbuds",
    tagline: "Pure sound, elegant design",
    description: "Premium wireless earbuds with active noise cancellation and 30-hour battery life.",
    price: 4500,
    original_price: 6500,
    image_url: "earbuds-pearl",
    is_featured: true,
    is_active: true,
    sort_order: 1,
    badge: "New Arrival"
  },
  {
    slug: "earbuds-black",
    name: "Breezy Buds Black Edition",
    category: "Earbuds",
    tagline: "Deep bass, stealth look",
    description: "Sport-ready earbuds with IPX7 water resistance and touch controls.",
    price: 3800,
    original_price: 5000,
    image_url: "earbuds-black",
    is_featured: true,
    is_active: true,
    sort_order: 2,
    badge: "Popular"
  },
  {
    slug: "watch-silver",
    name: "Apex Watch Silver",
    category: "Smart Watches",
    tagline: "Time evolved",
    description: "Sleek stainless steel smart watch with heart rate monitoring and GPS.",
    price: 8500,
    original_price: 12000,
    image_url: "watch-silver",
    is_featured: true,
    is_active: true,
    sort_order: 3
  },
  {
    slug: "watch-classic",
    name: "Legacy Classic Watch",
    category: "Smart Watches",
    tagline: "Timeless style",
    description: "A hybrid smart watch that combines traditional looks with modern tech.",
    price: 7200,
    original_price: 9500,
    image_url: "watch-classic",
    is_featured: false,
    is_active: true,
    sort_order: 4
  },
  {
    slug: "headphones-beige",
    name: "Sonic Pro Headphones",
    category: "Headphones",
    tagline: "Studio quality on the go",
    description: "Over-ear headphones with 40mm drivers and ultra-soft cushions.",
    price: 12500,
    original_price: 18000,
    image_url: "headphones-beige",
    is_featured: true,
    is_active: true,
    sort_order: 5,
    badge: "Limited Edition"
  },
  {
    slug: "speaker-sage",
    name: "Aura Bluetooth Speaker",
    category: "Speakers",
    tagline: "Room-filling sound",
    description: "Portable 20W speaker with 360-degree audio and RGB lighting.",
    price: 5500,
    original_price: 7500,
    image_url: "speaker-sage",
    is_featured: false,
    is_active: true,
    sort_order: 6
  },
  {
    slug: "powerbank",
    name: "Turbo Power Bank 20K",
    category: "Accessories",
    tagline: "Never run out of juice",
    description: "20,000mAh fast-charging power bank with digital display.",
    price: 3200,
    original_price: 4500,
    image_url: "powerbank",
    is_featured: false,
    is_active: true,
    sort_order: 7
  },
  {
    slug: "cable",
    name: "Ultra Tough USB-C Cable",
    category: "Accessories",
    tagline: "Built to last",
    description: "Braided nylon cable with 100W power delivery support.",
    price: 850,
    original_price: 1200,
    image_url: "cable",
    is_featured: false,
    is_active: true,
    sort_order: 8
  },
  {
    slug: "earbuds-pro-max",
    name: "Breezy Buds Pro Max",
    category: "Earbuds",
    tagline: "Next gen audio",
    description: "Spatial audio with dynamic head tracking and 40-hour battery life.",
    price: 6500,
    original_price: 9000,
    image_url: "earbuds-pearl",
    is_featured: true,
    is_active: true,
    sort_order: 9,
    badge: "Hot"
  },
  {
    slug: "watch-ultra-black",
    name: "Apex Watch Ultra",
    category: "Smart Watches",
    tagline: "Rugged. Capable.",
    description: "Aerospace-grade titanium case with up to 60 hours of battery life.",
    price: 15500,
    original_price: 22000,
    image_url: "watch-silver",
    is_featured: true,
    is_active: true,
    sort_order: 10
  },
  {
    slug: "headphones-black",
    name: "Elite ANC Headphones",
    category: "Headphones",
    tagline: "Silence everything",
    description: "Industry leading noise cancellation with premium leather finish.",
    price: 18500,
    original_price: 25000,
    image_url: "headphones-beige",
    is_featured: false,
    is_active: true,
    sort_order: 11
  },
  {
    slug: "earbuds-lite",
    name: "Breezy Buds Lite",
    category: "Earbuds",
    tagline: "Lightweight. Powerful.",
    description: "Compact design with powerful 10mm drivers and IPX5 rating.",
    price: 2500,
    original_price: 3500,
    image_url: "earbuds-black",
    is_featured: false,
    is_active: true,
    sort_order: 12
  },
  {
    slug: "watch-fit-pro",
    name: "Apex Fit Pro",
    category: "Smart Watches",
    tagline: "Your health, tracked.",
    description: "Focus on fitness with 100+ workout modes and blood oxygen monitoring.",
    price: 5200,
    original_price: 7500,
    image_url: "watch-classic",
    is_featured: true,
    is_active: true,
    sort_order: 13
  },
  {
    slug: "speaker-mini",
    name: "Nano Portable Speaker",
    category: "Speakers",
    tagline: "Small size, big sound",
    description: "Pocket-sized Bluetooth speaker with 10-hour playtime.",
    price: 2200,
    original_price: 3000,
    image_url: "speaker-sage",
    is_featured: false,
    is_active: true,
    sort_order: 14
  },
  {
    slug: "wireless-charger",
    name: "Turbo Qi Pad",
    category: "Accessories",
    tagline: "No more wires",
    description: "15W fast wireless charging pad with slip-resistant surface.",
    price: 1800,
    original_price: 2500,
    image_url: "powerbank",
    is_featured: false,
    is_active: true,
    sort_order: 15
  },
  {
    slug: "hdmi-adapter",
    name: "6-in-1 Hub",
    category: "Accessories",
    tagline: "Expand your connectivity",
    description: "Aluminum USB-C hub with HDMI, USB-A, and SD card slots.",
    price: 4200,
    original_price: 6000,
    image_url: "cable",
    is_featured: false,
    is_active: true,
    sort_order: 16
  },
  {
    slug: "earbuds-sport",
    name: "Breezy Sport Buds",
    category: "Earbuds",
    tagline: "Ear hooks for secure fit",
    description: "Stay in place during the most intense workouts with wrap-around hooks.",
    price: 4200,
    original_price: 5500,
    image_url: "earbuds-black",
    is_featured: false,
    is_active: true,
    sort_order: 17
  },
  {
    slug: "watch-elegant",
    name: "Apex Elegant Gold",
    category: "Smart Watches",
    tagline: "Luxury meets tech",
    description: "Gold plated bezel with premium leather strap for the ultimate look.",
    price: 12500,
    original_price: 16000,
    image_url: "watch-silver",
    is_featured: false,
    is_active: true,
    sort_order: 18,
    badge: "Elite"
  },
  {
    slug: "headphones-wireless",
    name: "Studio Air Pro",
    category: "Headphones",
    tagline: "Feather light comfort",
    description: "Ultra-lightweight design for all-day listening without fatigue.",
    price: 9500,
    original_price: 14000,
    image_url: "headphones-beige",
    is_featured: false,
    is_active: true,
    sort_order: 19
  },
  {
    slug: "case-pro",
    name: "Armor Silicon Case",
    category: "Accessories",
    tagline: "Maximum protection",
    description: "Shock-absorbent silicon case for earbuds and watches.",
    price: 650,
    original_price: 900,
    image_url: "powerbank",
    is_featured: false,
    is_active: true,
    sort_order: 20
  },
  {
    slug: "earbuds-nova",
    name: "Breezy Buds Nova",
    category: "Earbuds",
    tagline: "Crystal clear calls",
    description: "Quad-microphone system for studio-quality voice calls anywhere.",
    price: 4900,
    original_price: 7000,
    image_url: "earbuds-pearl",
    is_featured: true,
    is_active: true,
    sort_order: 21
  },
  {
    slug: "watch-stealth",
    name: "Apex Stealth Black",
    category: "Smart Watches",
    tagline: "Modern minimalism",
    description: "Matte black finish with always-on AMOLED display.",
    price: 9800,
    original_price: 13500,
    image_url: "watch-silver",
    is_featured: false,
    is_active: true,
    sort_order: 22
  },
  {
    slug: "speaker-party",
    name: "Boom Box 50W",
    category: "Speakers",
    tagline: "Start the party",
    description: "High-output 50W speaker with dual woofers and extra bass.",
    price: 12000,
    original_price: 18000,
    image_url: "speaker-sage",
    is_featured: true,
    is_active: true,
    sort_order: 23
  },
  {
    slug: "car-charger",
    name: "Dual Turbo Car Kit",
    category: "Accessories",
    tagline: "Charge on the road",
    description: "65W dual port car charger with fast charge support.",
    price: 1500,
    original_price: 2200,
    image_url: "powerbank",
    is_featured: false,
    is_active: true,
    sort_order: 24
  },
  {
    slug: "earbuds-zen",
    name: "Breezy Buds Zen",
    category: "Earbuds",
    tagline: "Mindful listening",
    description: "Designed for relaxation with built-in ambient soundscapes.",
    price: 5200,
    original_price: 7500,
    image_url: "earbuds-pearl",
    is_featured: false,
    is_active: true,
    sort_order: 25
  },
  {
    slug: "watch-active",
    name: "Apex Active Pro",
    category: "Smart Watches",
    tagline: "Designed for sport",
    description: "Sweat-proof silicone strap and precise calorie tracking.",
    price: 6800,
    original_price: 9500,
    image_url: "watch-classic",
    is_featured: false,
    is_active: true,
    sort_order: 26
  },
  {
    slug: "headphones-retro",
    name: "Classic Studio Wired",
    category: "Headphones",
    tagline: "Pure analog sound",
    description: "Wired studio headphones for audiophiles who demand the best.",
    price: 15000,
    original_price: 20000,
    image_url: "headphones-beige",
    is_featured: false,
    is_active: true,
    sort_order: 27
  },
  {
    slug: "mouse-pad",
    name: "RGB Gaming Surface",
    category: "Accessories",
    tagline: "Smooth control",
    description: "Large desk mat with customizable RGB lighting edges.",
    price: 2500,
    original_price: 3800,
    image_url: "powerbank",
    is_featured: false,
    is_active: true,
    sort_order: 28
  }

];

async function seed() {
  if (!uri) {
    console.error("MONGODB_URI missing from .env");
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    
    // Clear existing products
    await db.collection("products").deleteMany({});
    console.log("Cleared existing products");
    
    // Insert new products
    await db.collection("products").insertMany(products);
    console.log(`Inserted ${products.length} products`);
    
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await client.close();
  }
}

seed();
