import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getProductBySlug } from "@/lib/products.functions";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Star, ShieldCheck, Truck, Banknote, ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — BreezyGo` }],
  }),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const fetchProduct = useServerFn(getProductBySlug);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct({ data: { slug } }),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 pt-32 grid md:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return <div className="py-40 text-center">Product not found</div>;

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  return (
    <main className="min-h-screen bg-background pt-32 md:pt-40 pb-20">
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Section */}
          <div className="space-y-4">
            <div 
              className="aspect-square rounded-3xl overflow-hidden bg-secondary border border-border relative cursor-zoom-in group"
              onClick={() => setIsFullscreen(true)}
            >
               {discount && (
                  <span className="absolute top-4 right-4 z-10 bg-red-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                    {discount}% OFF
                  </span>
                )}
              <img
                src={getProductImage(activeImage || (product.images && product.images.length > 0 ? product.images[0] : product.image_url))}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {/* Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const imgs = product.images!;
                      const curr = imgs.indexOf(activeImage || imgs[0]);
                      setActiveImage(imgs[(curr - 1 + imgs.length) % imgs.length]);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 text-slate-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const imgs = product.images!;
                      const curr = imgs.indexOf(activeImage || imgs[0]);
                      setActiveImage(imgs[(curr + 1) % imgs.length]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 text-slate-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {product.images.map((img, idx) => {
                  const isActive = (activeImage || product.images![0]) === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        isActive ? "border-[#00a859] opacity-100 ring-2 ring-[#00a859]/20" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={getProductImage(img)} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover bg-secondary" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#00a859]">{product.category}</div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">{product.name}</h1>
              <p className="text-base text-slate-500">{product.tagline}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-slate-900">Rs {Number(product.price).toLocaleString()}</span>
              {product.original_price && (
                <span className="text-xl text-slate-400 line-through">
                  Rs {Number(product.original_price).toLocaleString()}
                </span>
              )}
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</span>
                <div className="flex items-center bg-white rounded-full p-1 border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-slate-900">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 rounded-full bg-[#00a859] hover:bg-[#00904a] text-white text-sm font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
                onClick={() => {
                  add({
                    product_id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: Number(product.price),
                    image_url: product.image_url,
                    category: product.category,
                  }, qty);
                  toast.success("Added to cart");
                }}
              >
                Add to Cart <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { icon: Truck, label: "Free Shipping" },
                  { icon: Banknote, label: "COD Available" },
                  { icon: ShieldCheck, label: "7-Day Warranty" },
                ].map((b) => (
                  <div key={b.label} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col items-center text-center gap-2">
                    <b.icon className="h-5 w-5 text-[#00a859]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ProductDetails product={product} />
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
          >
            <X className="h-8 w-8" />
          </button>
          
          <img
            src={getProductImage(activeImage || (product.images && product.images.length > 0 ? product.images[0] : product.image_url))}
            alt={product.name}
            className="max-w-[90vw] max-h-[90vh] object-contain select-none"
          />

          {product.images && product.images.length > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const imgs = product.images!;
                  const curr = imgs.indexOf(activeImage || imgs[0]);
                  setActiveImage(imgs[(curr - 1 + imgs.length) % imgs.length]);
                }}
                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const imgs = product.images!;
                  const curr = imgs.indexOf(activeImage || imgs[0]);
                  setActiveImage(imgs[(curr + 1) % imgs.length]);
                }}
                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}

const SPECS_BY_CATEGORY: Record<string, { label: string; value: string }[]> = {
  Earbuds: [
    { label: "Driver", value: "13mm dynamic" },
    { label: "Battery", value: "Up to 30 hrs (with case)" },
    { label: "Bluetooth", value: "5.3 · 10m range" },
    { label: "Charging", value: "Type-C · Fast charge" },
    { label: "Water Resistance", value: "IPX5" },
    { label: "Mic", value: "ENC noise cancellation" },
  ],
  "Smart Watches": [
    { label: "Display", value: '1.85" AMOLED · 600 nits' },
    { label: "Battery", value: "7 days typical use" },
    { label: "Sensors", value: "Heart rate · SpO2 · Sleep" },
    { label: "Calling", value: "Bluetooth calling" },
    { label: "Water Resistance", value: "IP68" },
    { label: "Strap", value: "22mm silicone, swappable" },
  ],
  Headphones: [
    { label: "Driver", value: "40mm dynamic" },
    { label: "Battery", value: "Up to 40 hrs playtime" },
    { label: "ANC", value: "Active Noise Cancellation" },
    { label: "Bluetooth", value: "5.3 multipoint" },
    { label: "Charging", value: "Type-C · Fast charge" },
    { label: "Foldable", value: "Yes, with carry pouch" },
  ],
  Speakers: [
    { label: "Output", value: "20W stereo" },
    { label: "Battery", value: "Up to 12 hrs playtime" },
    { label: "Sound", value: "360° room-filling" },
    { label: "Water Resistance", value: "IPX7" },
    { label: "Bluetooth", value: "5.3 · TWS pairing" },
    { label: "Aux", value: "3.5mm + USB-C" },
  ],
  Accessories: [
    { label: "Build", value: "Braided nylon" },
    { label: "Length", value: "1.2m" },
    { label: "Speed", value: "Fast charge supported" },
    { label: "Warranty", value: "6 months" },
  ],
};

const REVIEWS = [
  {
    name: "Ahmed R.",
    city: "Lahore",
    rating: 5,
    title: "Excellent quality!",
    body: "Sound clarity was better than expected. Delivery was done in 2 days, COD was smooth.",
    date: "2 weeks ago",
  },
  {
    name: "Sana K.",
    city: "Karachi",
    rating: 5,
    title: "Worth every rupee",
    body: "Battery life is amazing, packaging was premium. Highly recommend BreezyGo.",
    date: "1 month ago",
  },
  {
    name: "Bilal H.",
    city: "Islamabad",
    rating: 4,
    title: "Solid product",
    body: "Build quality is solid. A bit more bass would have been perfect, but overall worth the money.",
    date: "1 month ago",
  },
];

function ProductDetails({ product }: { product: { category: string; rating: number | null } }) {
  const specs = SPECS_BY_CATEGORY[product.category] ?? SPECS_BY_CATEGORY.Accessories;
  const avgRating = product.rating ?? 4.8;

  return (
    <div className="mt-12 grid lg:grid-cols-2 gap-10 border-t border-border pt-10">
      <div>
        <h2 className="text-xl font-bold mb-4">Product Details</h2>
        <dl className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
          {specs.map((s) => (
            <div key={s.label} className="grid grid-cols-3 px-4 py-3 text-sm">
              <dt className="text-muted-foreground col-span-1">{s.label}</dt>
              <dd className="font-medium col-span-2">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-current text-amber-500" />
            <span className="font-semibold">{Number(avgRating).toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
        </div>

        <div className="space-y-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center text-sm font-bold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm leading-tight">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.city} · {r.date}</div>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating ? "fill-current text-amber-500" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h3 className="font-semibold text-sm mt-3">{r.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
