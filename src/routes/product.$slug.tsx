import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getProductBySlug } from "@/lib/products.functions";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Minus, 
  Plus, 
  Star, 
  ShieldCheck, 
  Truck, 
  Banknote, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  Heart, 
  Share2, 
  Compass, 
  Cpu, 
  Bell, 
  Droplets,
  Calendar,
  Sparkles,
  Info,
  MapPin
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { API_URL } from "@/lib/db";
import { toast } from "sonner";

import LiveViewersCounter from "@/components/LiveViewersCounter";
import StockBatchBadge from "@/components/StockBatchBadge";
import TimedDiscountBanner from "@/components/TimedDiscountBanner";
import SalesGraph from "@/components/SalesGraph";
import DeliveryEstimate from "@/components/DeliveryEstimate";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [{ title: `${params.slug.replace(/-/g, ' ').toUpperCase()} — Premium Details | BreezyGo` }],
  }),
});

// Color variants configuration inspired by Zero Lifestyle Luna Smartwatch
const LUNA_COLOR_VARIANTS = [
  { name: "Black", colorCode: "#121212", label: "Midnight Cosmic Black" },
  { name: "Gray", colorCode: "#7A7A7A", label: "Space Grey Metallic" },
  { name: "Black Gold", colorCode: "#C5A880", label: "Royal Black Gold Edition" },
  { name: "Pink Gold", colorCode: "#E2C3C9", label: "Elegant Rose Gold" },
  { name: "Blue", colorCode: "#1E3048", label: "Deep Ocean Blue" },
];

function ProductPage() {
  const { slug } = Route.useParams();
  const fetchProduct = useServerFn(getProductBySlug);
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timedDiscountPercent, setTimedDiscountPercent] = useState(0);
  const [selectedColor, setSelectedColor] = useState(LUNA_COLOR_VARIANTS[0]);
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "reviews" | "policy">("features");
  const [isLiked, setIsLiked] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct({ data: { slug } }),
  });

  // Reviews state hooks
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewImages, setNewReviewImages] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);

  // Queries for reviews
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const res = await fetch(`${API_URL}/api/reviews/${product.id}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!product?.id
  });

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ["reviews-summary", product?.id],
    queryFn: async () => {
      if (!product?.id) return null;
      const res = await fetch(`${API_URL}/api/reviews/${product.id}/summary`);
      if (!res.ok) throw new Error("Failed to fetch reviews summary");
      return res.json();
    },
    enabled: !!product?.id
  });

  // Automatically update active image when product data loads
  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        setActiveImage(product.images[0]);
      } else {
        setActiveImage(product.image_url);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-32 pb-20">
        <div className="mx-auto max-w-[1400px] px-4 md:px-10 grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-3xl bg-slate-900" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-1/4 bg-slate-900" />
            <Skeleton className="h-12 w-3/4 bg-slate-900" />
            <Skeleton className="h-6 w-1/3 bg-slate-900" />
            <Skeleton className="h-32 w-full bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-6 py-40">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/shop" className="text-[#00a859] hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0 || product.is_active === false;

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const qty2Discount = product.qty2_discount_percent !== undefined ? product.qty2_discount_percent : 3;
  const qty3Discount = product.qty3_discount_percent !== undefined ? product.qty3_discount_percent : 5;

  const originalUnitPrice = timedDiscountPercent > 0 
    ? Math.round(Number(product.price) * (1 - timedDiscountPercent / 100)) 
    : Number(product.price);

  const price1 = originalUnitPrice;
  const price2 = Math.round(originalUnitPrice * (1 - qty2Discount / 100));
  const price3 = Math.round(originalUnitPrice * (1 - qty3Discount / 100));

  // Render specifications based on product category
  const specs = [
    { label: "Display Size", value: product.category === "Smart Watches" ? '1.39" IPS Full Touch HD Screen' : "Standard" },
    { label: "Battery Standby", value: product.category === "Smart Watches" ? "Up to 7 Days Normal Use" : "Extended" },
    { label: "Water Resistance", value: "IP67 Certified Dust & Water Resistant" },
    { label: "Connectivity", value: "Bluetooth 5.2 / Calling Enabled" },
    { label: "Health Monitors", value: "Active heart rate, SpO2, and Sleep tracking" },
    { label: "Compatiblity", value: "Android 5.0+ / iOS 9.0+" },
  ];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${product.name} - ${product.tagline || ""} ${shareUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.name,
        text: product.tagline || "",
        url: window.location.href,
      }).catch(console.error);
    } else {
      setShowSharePopover(!showSharePopover);
    }
  };

  const handleBuyNow = () => {
    const finalPrice = timedDiscountPercent > 0 
      ? Math.round(Number(product.price) * (1 - timedDiscountPercent / 100)) 
      : Number(product.price);
    
    add({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price: finalPrice,
      image_url: product.image_url,
      category: product.category,
      qty2_discount_percent: product.qty2_discount_percent,
      qty3_discount_percent: product.qty3_discount_percent,
    }, qty, false);
    
    toast.success("Redirecting to checkout...");
    router.navigate({ to: "/checkout" });
  };

  const handleWhatsAppOrder = () => {
    const finalPrice = timedDiscountPercent > 0 
      ? Math.round(Number(product.price) * (1 - timedDiscountPercent / 100)) 
      : Number(product.price);
    
    const message = `Hello BreezyGo! I'm interested in buying:
Product: ${product.name}
Color: ${selectedColor.label}
Quantity: ${qty}
Price: Rs. ${finalPrice.toLocaleString()}

Please confirm my order.`;
    
    window.open(`https://wa.me/923320009376?text=${encodeURIComponent(message)}`, "_blank");
  };  return (
    <main className="min-h-screen bg-white text-neutral-900 pt-32 md:pt-40 pb-20 overflow-x-hidden selection:bg-neutral-900 selection:text-white font-sans">
      <Toaster richColors position="top-center" />
      
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className={`h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center transition-all ${
                isLiked ? "bg-red-50 border-red-200 text-red-500" : "bg-neutral-50 text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <div className="relative">
              <button 
                onClick={handleShare}
                className="h-10 w-10 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {showSharePopover && (
                <div className="absolute right-0 top-12 z-50 w-52 bg-white border border-neutral-200 shadow-xl p-3 flex flex-col gap-2 rounded-none animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1 border-b pb-1">
                    Share Product
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                      setShowSharePopover(false);
                    }}
                    className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-black py-1.5 hover:bg-neutral-50 px-2 transition-colors flex items-center gap-2"
                  >
                    <span>🔗</span> Copy Link
                  </button>
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowSharePopover(false)}
                    className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-[#25D366] py-1.5 hover:bg-neutral-50 px-2 transition-colors flex items-center gap-2"
                  >
                    <span>💬</span> Share on WhatsApp
                  </a>
                  <a 
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowSharePopover(false)}
                    className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-[#1877F2] py-1.5 hover:bg-neutral-50 px-2 transition-colors flex items-center gap-2"
                  >
                    <span>👥</span> Share on Facebook
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
 
        {/* Main Product Layout */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Image Section */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-36">
            <div 
              className="aspect-square rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 relative cursor-zoom-in group shadow-md"
              onClick={() => setIsFullscreen(true)}
            >
              {/* Floating badges */}
              {isOutOfStock ? (
                <span className="absolute top-4 left-4 z-10 bg-neutral-900 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
                  OUT OF STOCK
                </span>
              ) : discount && (
                <span className="absolute top-4 left-4 z-10 bg-[#de2a2a] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  {discount}% OFF
                </span>
              )}
              
              <img
                src={getProductImage(activeImage || product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 text-black border border-neutral-200 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 text-black border border-neutral-200 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {product.images.map((img, idx) => {
                  const isActive = activeImage === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        isActive ? "border-black opacity-100 scale-105" : "border-neutral-250 opacity-60 hover:opacity-100 hover:scale-102"
                      }`}
                    >
                      <img src={getProductImage(img)} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover bg-white" />
                    </button>
                  );
                })}
              </div>
            )}
 
            {/* Float Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
              {[
                { icon: Compass, title: "1.39\" Screen", desc: "HD Display" },
                { icon: Droplets, title: "IP67 Water", desc: "Dust & Sweat Resistant" },
                { icon: Cpu, title: "BT Calling", desc: "HD Built-in Mic" },
                { icon: Sparkles, title: "Health Suite", desc: "Heart Rate & SpO2" },
                { icon: Bell, title: "Smart Notify", desc: "Quick alerts" },
                { icon: Calendar, title: "7-Day Battery", desc: "Magnetic Charging" },
              ].map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center flex-shrink-0">
                    <h.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 leading-tight">{h.title}</h4>
                    <p className="text-[10px] text-neutral-500 leading-normal">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
          {/* Right Column: Checkout & Info Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-neutral-100 px-3 py-1 rounded-sm">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 bg-neutral-100 px-3 py-1 rounded-sm">
                    {product.badge}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight uppercase font-sans">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-lg text-neutral-600 leading-relaxed font-sans">{product.tagline}</p>
              )}
              
              {/* Realtime elements */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-b border-neutral-200 pb-4">
                <LiveViewersCounter />
                <StockBatchBadge productId={product.id} />
              </div>
            </div>

            {/* Timed discount banner */}
            <TimedDiscountBanner 
              productId={product.id} 
              onDiscountChange={(percent) => setTimedDiscountPercent(percent)} 
            />

            {/* Clean Active Price in Right Column */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-neutral-900">
                Rs {originalUnitPrice.toLocaleString()}
              </span>
              {product.original_price && (
                <span className="text-base text-neutral-400 line-through">
                  Rs {Number(product.original_price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Color Swatches */}
            {product.category === "Smart Watches" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Color Variant</span>
                  <span className="text-xs font-bold text-neutral-900">{selectedColor.label}</span>
                </div>
                <div className="flex gap-3">
                  {LUNA_COLOR_VARIANTS.map((c) => {
                    const isSelected = selectedColor.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-black scale-110" : "border-neutral-200 hover:border-neutral-400"
                        }`}
                        style={{ backgroundColor: c.colorCode }}
                        title={c.label}
                      >
                        {isSelected && (
                          <span className="h-3.5 w-3.5 rounded-full bg-white shadow-md block mix-blend-difference" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Checkout Options */}
            <div className="space-y-6 pt-6 border-t border-neutral-200">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 w-16">Quantity</span>
                 <div className="flex items-center bg-white border-2 border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      disabled={isOutOfStock}
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="h-11 w-11 flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-700 disabled:opacity-30 rounded-l-2xl"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-black text-neutral-900 text-sm">{isOutOfStock ? 0 : qty}</span>
                    <button
                      disabled={isOutOfStock}
                      onClick={() => setQty(qty + 1)}
                      className="h-11 w-11 flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-700 disabled:opacity-30 rounded-r-2xl"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Buying CTA Grid */}
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    disabled={isOutOfStock}
                    className="w-full h-14 rounded-xl bg-black hover:bg-neutral-900 text-white text-sm font-bold uppercase tracking-widest transition-all"
                    onClick={() => {
                      const finalPrice = timedDiscountPercent > 0 
                        ? Math.round(Number(product.price) * (1 - timedDiscountPercent / 100)) 
                        : Number(product.price);
                      add({
                        product_id: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: finalPrice,
                        image_url: product.image_url,
                        category: product.category,
                        qty2_discount_percent: product.qty2_discount_percent,
                        qty3_discount_percent: product.qty3_discount_percent,
                      }, qty);
                      toast.success("Added to cart");
                    }}
                  >
                    Add to Cart
                  </Button>
                  
                  <Button
                    size="lg"
                    disabled={isOutOfStock}
                    className="w-full h-14 rounded-xl bg-[#2e9e7b] hover:bg-[#258567] text-white text-sm font-bold uppercase tracking-widest shadow-md transition-all relative overflow-hidden group"
                    onClick={handleBuyNow}
                  >
                    {/* Shining light animation effect */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    {isOutOfStock ? "Out of Stock" : "Buy Now (COD)"}
                  </Button>
                </div>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWhatsAppOrder}
                  className="w-full h-14 rounded-xl border border-emerald-500/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  {/* Official WhatsApp SVG icon */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Order via WhatsApp
                </Button>
              </div>

              {/* Bundle Deal Selector — below WhatsApp */}
              <div className="mt-2 rounded-3xl overflow-hidden border-2 border-neutral-100 bg-gradient-to-br from-white to-neutral-50/60">
                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-1">Limited Time Offer</div>
                    <div className="text-2xl font-black text-neutral-900 leading-none">
                      Rs {(qty === 1 ? price1 : qty === 2 ? price2 * 2 : price3 * qty).toLocaleString()}
                      <span className="text-sm font-bold text-neutral-400 ml-2">total</span>
                    </div>
                    {product.original_price && (
                      <div className="text-xs text-neutral-400 line-through mt-0.5">
                        Was Rs {(Number(product.original_price) * qty).toLocaleString()}
                      </div>
                    )}
                  </div>
                  {discount && (
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-600 leading-none">{discount}%</div>
                      <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest">OFF</div>
                    </div>
                  )}
                </div>

                {/* Deal picker */}
                <div className="px-4 pb-5 space-y-2">
                  <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-2">Choose Your Bundle</div>
                  {[
                    { label: "Single Pack", qty: 1, tag: null, price: price1, sub: "Standard price" },
                    { label: "Double Saver", qty: 2, tag: `Save ${qty2Discount}%`, price: price2, sub: `${qty2Discount}% instant off/unit`, color: "emerald" },
                    { label: "Mega Value", qty: 3, tag: `Save ${qty3Discount}%`, price: price3, sub: `${qty3Discount}% instant off/unit`, color: "red" },
                  ].map((deal) => {
                    const isActive = deal.qty === 3 ? qty >= 3 : qty === deal.qty;
                    return (
                      <button
                        key={deal.label}
                        type="button"
                        onClick={() => setQty(deal.qty)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                          isActive
                            ? "border-neutral-900 bg-neutral-900 text-white shadow-lg"
                            : "border-neutral-150 bg-white hover:border-neutral-300 text-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isActive ? "border-white" : "border-neutral-300"
                          }`}>
                            {isActive && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className={`text-xs font-black ${isActive ? "text-white" : "text-neutral-900"}`}>
                              Buy {deal.qty === 3 ? "3+" : deal.qty} — {deal.label}
                            </div>
                            <div className={`text-[10px] font-medium ${isActive ? "text-white/60" : "text-neutral-400"}`}>{deal.sub}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`text-sm font-black ${isActive ? "text-white" : "text-neutral-900"}`}>
                            Rs {deal.price.toLocaleString()}<span className={`text-[10px] font-medium ml-0.5 ${isActive ? "text-white/60" : "text-neutral-400"}`}>/unit</span>
                          </div>
                          {deal.tag && (
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              isActive
                                ? deal.color === "emerald" ? "bg-emerald-400 text-emerald-900" : "bg-red-400 text-red-900"
                                : deal.color === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            }`}>{deal.tag}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Full-Width Landscape Delivery & Trust Card ===== */}
        <div className="mt-8 rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
          {/* Dark header strip */}
          <div className="bg-neutral-900 flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-black text-sm tracking-tight">Fast & Free Delivery</span>
              <span className="text-neutral-500 text-[10px] font-medium">· Nationwide Cash on Delivery</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              🚀 Free Shipping
            </span>
          </div>

          {/* 5-column landscape body */}
          <div className="grid grid-cols-5 divide-x divide-neutral-100 bg-white">

            {/* Col 1–2: ETA + city toggle + steps */}
            <div className="col-span-2 px-6 py-5 flex flex-col justify-between gap-4 bg-neutral-50/50">
              {/* City toggle row */}
              <div className="flex items-center gap-3">
                <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Delivery To</span>
                <div className="flex bg-white border border-neutral-200 rounded-lg overflow-hidden ml-auto shadow-sm">
                  <button type="button" className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border-r border-neutral-200">Lahore</button>
                  <button type="button" className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-neutral-500 hover:bg-neutral-50 transition-colors">Other Cities</button>
                </div>
              </div>

              {/* ETA headline */}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl">⚡</span>
                  <span className="text-2xl font-black text-neutral-900 leading-none">Within 24–48 Hrs</span>
                </div>
                <div className="text-xs text-neutral-500 font-medium">Lahore orders • Express next-day dispatch</div>
              </div>

              {/* Step tracker */}
              <div className="flex items-center gap-1">
                {[
                  { emoji: "📦", label: "Order Packed" },
                  { emoji: "🚚", label: "On The Way" },
                  { emoji: "🏠", label: "Delivered" },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className="h-9 w-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-base shadow-sm">
                        {step.emoji}
                      </div>
                      <span className="text-[8px] text-neutral-500 font-bold mt-1.5 text-center leading-tight">{step.label}</span>
                    </div>
                    {i < 2 && (
                      <div className="w-6 shrink-0 flex items-center justify-center mb-4">
                        <div className="w-full border-t-2 border-dashed border-neutral-200" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: COD */}
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center gap-2.5 hover:bg-emerald-50/50 transition-colors group cursor-default">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors shadow-sm">
                <Banknote className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-neutral-800">COD Available</div>
                <div className="text-[10px] text-neutral-400 font-medium mt-0.5">Pay when you receive</div>
              </div>
              <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">✓ Available</span>
            </div>

            {/* Col 4: Warranty */}
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center gap-2.5 hover:bg-blue-50/50 transition-colors group cursor-default">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors shadow-sm">
                <ShieldCheck className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-neutral-800">7-Day Warranty</div>
                <div className="text-[10px] text-neutral-400 font-medium mt-0.5">Hassle-free replacement</div>
              </div>
              <span className="text-[8px] font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">✓ Guaranteed</span>
            </div>

            {/* Col 5: Express */}
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center gap-2.5 hover:bg-purple-50/50 transition-colors group cursor-default">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors shadow-sm">
                <Truck className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-neutral-800">Free Shipping</div>
                <div className="text-[10px] text-neutral-400 font-medium mt-0.5">All over Pakistan</div>
              </div>
              <span className="text-[8px] font-extrabold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">✓ Nationwide</span>
            </div>

          </div>

          {/* Bottom ticker */}
          <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-2.5 flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
              ⚡ Lahore: 24–48 Hours &nbsp;·&nbsp; Other Cities: 4–8 Business Days &nbsp;·&nbsp; 100% Secure Packaging
            </span>
          </div>
        </div>

        {/* Lower Section: Tabs Container */}
        <div className="mt-16 border-t border-neutral-200 pt-16">
          <div className="flex border-b border-neutral-200 overflow-x-auto hide-scrollbar">
            {[
              { id: "features", label: "Overview & Features" },
              { id: "specs", label: "Full Specifications" },
              { id: "policy", label: "Shipping & COD Policy" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-4 px-6 text-sm font-bold tracking-wider uppercase border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === t.id 
                    ? "border-black text-black" 
                    : "border-transparent text-neutral-500 hover:text-black"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="py-10">
            {/* Tab: Features */}
            {activeTab === "features" && (
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Discover Cosmic Possibilities</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    Strap into the future with the {product.name}. Featuring a metallic cosmic body, full touch HD responsive display, and advanced calling capabilities, this watch is designed to blend elegance with rugged intelligence.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Fully Metal Cosmic Body for premium shockproof durability.",
                      "High-fidelity integrated Speaker & Microphone for active Bluetooth calls.",
                      "Smart health diagnostics: monitor SpO2 levels and 24/7 heart rate.",
                      "Multiple active workouts: customize your workouts and analyze statistics.",
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                        <span className="h-5 w-5 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="aspect-video rounded-none overflow-hidden bg-neutral-50 border border-neutral-200 relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 flex flex-col justify-end p-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">BreezyGo Luna Smartwatch Edition</h4>
                    <p className="text-xs text-neutral-300">Designed for modern visionaries</p>
                  </div>
                  <img src={getProductImage(product.image_url)} alt="Marketing highlight" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            )}

            {/* Tab: Specs */}
            {activeTab === "specs" && (
              <div className="max-w-3xl">
                <h3 className="text-xl font-bold text-neutral-900 mb-6 uppercase tracking-wider">Technical Specifications</h3>
                <dl className="divide-y divide-neutral-100 border border-neutral-200 rounded-none overflow-hidden">
                  {specs.map((s) => (
                    <div key={s.label} className="grid grid-cols-3 px-6 py-4 text-sm bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                      <dt className="text-neutral-500 font-semibold col-span-1">{s.label}</dt>
                      <dd className="text-neutral-900 font-medium col-span-2">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Tab: Policy */}
            {activeTab === "policy" && (
              <div className="grid md:grid-cols-3 gap-8 text-sm text-neutral-700">
                <div className="p-6 rounded-none border border-neutral-200 bg-neutral-50/30 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider">Free Fast Shipping</h4>
                  <p className="leading-relaxed text-neutral-500">
                    All orders in Pakistan qualify for free express shipping. Delivery takes 2-4 business days. Tracking details will be shared on WhatsApp / SMS.
                  </p>
                </div>
                <div className="p-6 rounded-none border border-neutral-200 bg-neutral-50/30 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider">Cash on Delivery</h4>
                  <p className="leading-relaxed text-neutral-500">
                    Pay only when your package is delivered to your doorstep. Inspect package security seals upon receiving. Available nationwide.
                  </p>
                </div>
                <div className="p-6 rounded-none border border-neutral-200 bg-neutral-50/30 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider">7-Day Replacement</h4>
                  <p className="leading-relaxed text-neutral-500">
                    Enjoy a 7-day hassle-free replacement warranty if you receive a faulty or damaged product. Our support agents are active 24/7 on WhatsApp.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sales Graph section */}
        <div className="mt-16 pt-12 border-t border-neutral-200">
          <SalesGraph productId={product.id} />
        </div>

        {/* ===== Reviews Section — Always Visible Below Sales Graph ===== */}
        <div className="mt-16 pt-12 border-t border-neutral-200">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Customer Reviews</h2>
              <p className="text-sm text-neutral-500 mt-1">Real feedback from verified buyers</p>
            </div>
            <div className="flex items-center gap-3">
              {summary && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl">
                  <span className="text-2xl font-black text-neutral-900">{summary.average_rating?.toFixed(1)}</span>
                  <div>
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(summary.average_rating || 0) ? "fill-current" : "text-neutral-200"}`} />
                      ))}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-bold">{summary.total_reviews} reviews</div>
                  </div>
                </div>
              )}
              <Button
                onClick={() => { setShowReviewForm(!showReviewForm); setReviewSubmitted(false); }}
                className="rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5"
              >
                {showReviewForm ? "Close" : "Write a Review"}
              </Button>
            </div>
          </div>

          {/* Star Breakdown Bar */}
          {summary && (
            <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 mb-8 grid sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage = summary?.breakdown?.[star]?.percentage || 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs font-bold text-neutral-600">
                      <span className="w-10 text-right shrink-0">{star} ★</span>
                      <div className="flex-1 h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-neutral-400">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-center">
                <div className="text-6xl font-black text-neutral-900">{summary.average_rating?.toFixed(1)}</div>
                <div className="flex justify-center gap-0.5 text-amber-500 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-6 w-6 ${i < Math.round(summary.average_rating || 0) ? "fill-current" : "text-neutral-200"}`} />
                  ))}
                </div>
                <div className="text-sm text-neutral-500 font-bold mt-2">Based on {summary.total_reviews} verified reviews</div>
              </div>
            </div>
          )}

          {/* Review Submission Form */}
          {showReviewForm && (
            <div className="border border-neutral-200 rounded-3xl p-6 md:p-8 bg-white shadow-sm mb-8 space-y-6">
              <h3 className="text-lg font-black text-neutral-900 uppercase tracking-wide">Share Your Experience</h3>
              {reviewSubmitted ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold text-center">
                  🎉 Thanks! Your review is pending approval and will appear shortly.
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newReviewName.trim() || !newReviewComment.trim()) { toast.error("Please fill in name and comment."); return; }
                  try {
                    setSubmittingReview(true);
                    const res = await fetch(`${API_URL}/api/reviews/${product.id}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ customer_name: newReviewName, rating: newReviewRating, comment: newReviewComment, images: newReviewImages })
                    });
                    if (!res.ok) throw new Error("Failed to submit review");
                    toast.success("Review submitted! Pending moderation.");
                    setNewReviewName(""); setNewReviewComment(""); setNewReviewRating(5); setNewReviewImages([]);
                    setReviewSubmitted(true); refetchReviews(); refetchSummary();
                    setTimeout(() => { setShowReviewForm(false); setReviewSubmitted(false); }, 4000);
                  } catch (err) { toast.error("Error submitting review."); } finally { setSubmittingReview(false); }
                }} className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">Your Name</label>
                    <input type="text" required value={newReviewName} onChange={(e) => setNewReviewName(e.target.value)} placeholder="Enter your name"
                      className="w-full h-11 px-4 border border-neutral-200 bg-neutral-50 rounded-xl text-sm outline-none focus:border-black transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">Star Rating</label>
                    <div className="flex gap-2 mt-1">
                      {[1,2,3,4,5].map((star) => (
                        <button key={star} type="button" onClick={() => setNewReviewRating(star)} className="transition-transform hover:scale-110">
                          <Star className={`h-7 w-7 ${star <= newReviewRating ? "text-amber-500 fill-current" : "text-neutral-200"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">Review Comments</label>
                    <textarea required rows={4} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      className="w-full p-4 border border-neutral-200 bg-neutral-50 rounded-xl text-sm outline-none focus:border-black transition-colors resize-none" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block">Add Photos (Max 3)</label>
                    <input type="file" multiple accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files; if (!files) return;
                        if (newReviewImages.length + files.length > 3) { toast.error("Max 3 images."); return; }
                        Array.from(files).forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new window.Image();
                            img.onload = () => {
                              const canvas = document.createElement("canvas");
                              let w = img.width, h = img.height, mx = 800;
                              if (w > h) { if (w > mx) { h *= mx/w; w = mx; } } else { if (h > mx) { w *= mx/h; h = mx; } }
                              canvas.width = w; canvas.height = h;
                              canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
                              setNewReviewImages(prev => [...prev, canvas.toDataURL("image/jpeg", 0.7)]);
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                      className="text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer" />
                    {newReviewImages.length > 0 && (
                      <div className="flex gap-3 mt-3 flex-wrap">
                        {newReviewImages.map((img, idx) => (
                          <div key={idx} className="relative h-16 w-16 border border-neutral-200 bg-neutral-100 rounded-xl overflow-hidden">
                            <img src={img} alt="preview" className="h-full w-full object-cover" />
                            <button type="button" onClick={() => setNewReviewImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-black text-white rounded-full hover:bg-red-600 transition-colors shadow" style={{ padding: '2px' }}>
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={submittingReview}
                      className="rounded-xl bg-black hover:bg-neutral-950 text-white font-bold text-xs uppercase tracking-widest px-8 py-3 w-full sm:w-auto">
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Reviews List Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.length === 0 ? (
              <div className="col-span-full p-16 text-center text-neutral-400 italic text-sm border border-dashed border-neutral-200 rounded-3xl">
                No verified reviews yet. Be the first!
              </div>
            ) : (
              reviews.map((r: any) => (
                <div key={r.id} className="rounded-2xl border border-neutral-100 bg-white p-6 space-y-4 hover:shadow-md hover:border-neutral-200 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-100 text-neutral-700 flex items-center justify-center text-sm font-black shrink-0">
                        {r.customer_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-neutral-900">{r.customer_name}</div>
                        <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Verified Buyer</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex gap-0.5 justify-end">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current text-amber-500" : "text-neutral-200"}`} />
                        ))}
                      </div>
                      <span className="text-[9px] text-neutral-400 font-bold">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{r.comment}</p>
                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {r.images.map((img: string, idx: number) => (
                        <div key={idx} onClick={() => setSelectedReviewImage(img)}
                          className="h-14 w-14 border border-neutral-200 rounded-xl overflow-hidden cursor-zoom-in hover:opacity-80 transition-opacity bg-neutral-100">
                          <img src={img} alt="review" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Review Image Lightbox */}
      {selectedReviewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
          onClick={() => setSelectedReviewImage(null)}
        >
          <button 
            onClick={() => setSelectedReviewImage(null)} 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
          >
            <X className="h-8 w-8" />
          </button>
          
          <img
            src={selectedReviewImage}
            alt="Expanded Review"
            className="max-w-[90vw] max-h-[90vh] object-contain select-none rounded-xl shadow-2xl"
          />
        </div>
      )}

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
            src={getProductImage(activeImage || product.image_url)}
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
