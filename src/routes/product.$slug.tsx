import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
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
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ChevronDown,
  Award,
  Monitor,
  Activity,
  Bluetooth,
  Battery,
  Droplets,
  Bell,
  Smartphone,
  Wifi,
  Zap,
  Headphones,
  Phone,
  Shield,
  Palette,
  Sparkles,
  RefreshCcw,
  CreditCard,
  FileText,
  BarChart2,
  HelpCircle,
  ArrowUp,
  Info,
  Watch,
  Speaker,
  Clock,
  Settings,
  Camera,
  Music,
  Link as LinkIcon,
  MessageCircle,
  Users,
  Gift,
  ShoppingCart
} from "lucide-react";

const AVAILABLE_ICONS: Record<string, any> = {
  Smartphone, Palette, Sparkles, Wifi, Phone, Activity, Zap, Battery, Droplets, Info, Watch, Headphones, Speaker, Bluetooth, Heart, Clock, Shield, Settings, Camera, Music, HelpCircle
};
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
    meta: [{ title: `${params.slug.replace(/-/g, " ").toUpperCase()} — Premium Details | BreezyGo` }],
  }),
});

const LUNA_COLOR_VARIANTS = [
  { name: "Black", colorCode: "#121212", label: "Midnight Cosmic Black" },
  { name: "Gray", colorCode: "#7A7A7A", label: "Space Grey Metallic" },
  { name: "Black Gold", colorCode: "#C5A880", label: "Royal Black Gold Edition" },
  { name: "Pink Gold", colorCode: "#E2C3C9", label: "Elegant Rose Gold" },
  { name: "Blue", colorCode: "#1E3048", label: "Deep Ocean Blue" },
];

const FAQ_DATA = [
  { q: "What is the warranty policy?", a: "All products come with a 7-day replacement warranty. If you receive a defective or damaged product, we'll replace it free of charge. Contact us via WhatsApp for instant support." },
  { q: "How long does delivery take?", a: "Lahore orders are delivered within 24-48 hours via express dispatch. All other cities across Pakistan receive their orders within 4-8 business days." },
  { q: "Is Cash on Delivery (COD) available?", a: "Yes! We offer Cash on Delivery across all cities in Pakistan. You pay only when the product is delivered to your doorstep." },
  { q: "Can I track my order?", a: "Absolutely. Once your order is dispatched, you'll receive a tracking number via SMS and WhatsApp. You can track your order in real-time." },
  { q: "What if I want to buy in bulk?", a: "We offer special bulk pricing with additional discounts. Select the bundle options on this page, or contact us via WhatsApp for custom bulk orders." },
];

// Ronin-style interactive sound tabs
const SOUND_TABS = [
  { title: "Exceptional Call Clarity", desc: "Crystal-clear calls powered by advanced dual microphones with noise isolation technology. Every word is captured with precision, even in noisy environments.", img: "https://placehold.co/500x700/2d2d2d/999999?text=Call+Clarity&font=poppins" },
  { title: "Studio Engineered Sound", desc: "Refined in the studio to bring out the depth, detail, and emotion in every note. Custom-tuned drivers deliver thunderous bass and crystal-clear highs.", img: "https://placehold.co/500x700/1a1a2e/999999?text=Studio+Sound&font=poppins" },
  { title: "Multi Band Bass", desc: "Immersive sound creates a rich, all-around audio experience that makes you feel fully inside what you're listening to.", img: "https://placehold.co/500x700/0d1b2a/999999?text=Multi+Bass&font=poppins" },
];

// Feature card items (Ronin left-side card list)
const FEATURE_CARDS = [
  { icon: Headphones, title: "HD Display", sub: "1.39\" Full Touch" },
  { icon: Phone, title: "BT Calling", sub: "Built-in Speaker & Mic" },
  { icon: Activity, title: "Health Monitor", sub: "Heart Rate & SpO2" },
  { icon: Droplets, title: "IP67 Water", sub: "Dust & Splash Proof" },
];

// Ronin-style specs with outline icons
const SPEC_CATEGORIES = [
  {
    icon: Smartphone, title: "Model",
    items: [{ label: "Name", value: "Luna" }, { label: "Category", value: "Smart Watch" }],
  },
  {
    icon: Palette, title: "Colors",
    items: [{ label: "Available", value: "Black, Grey, Black Gold, Rose Gold, Blue" }],
  },
  {
    icon: Sparkles, title: "Look and Feel",
    items: [{ label: "Build", value: "Full Metal Cosmic Body" }, { label: "Display", value: '1.39" IPS Full Touch HD Screen' }],
  },
  {
    icon: Wifi, title: "Connectivity",
    items: [
      { label: "Bluetooth Version", value: "V5.2" },
      { label: "Compatibility", value: "Android 5.0+ / iOS 9.0+" },
      { label: "Dual Device Connection", value: "Yes" },
    ],
  },
  {
    icon: Phone, title: "Calling",
    items: [{ label: "BT Calling", value: "HD Built-in Speaker & Microphone" }],
  },
  {
    icon: Activity, title: "Health Monitoring",
    items: [
      { label: "Heart Rate", value: "24/7 Continuous Monitoring" },
      { label: "SpO2", value: "Blood Oxygen Level Tracking" },
      { label: "Sleep Analysis", value: "Deep, Light & REM Cycles" },
    ],
  },
  {
    icon: Zap, title: "Charging",
    items: [{ label: "Type", value: "Magnetic Charging Cable (Included)" }, { label: "Charging Time", value: "~2 Hours" }],
  },
  {
    icon: Battery, title: "Battery",
    items: [{ label: "Standby", value: "Up to 7 Days Normal Use" }, { label: "Active Use", value: "Up to 3 Days" }],
  },
  {
    icon: Droplets, title: "Water Resistance",
    items: [{ label: "Rating", value: "IP67 Certified" }],
  },
];

function ProductPage() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timedDiscountPercent, setTimedDiscountPercent] = useState(0);
  const [selectedColor, setSelectedColor] = useState(LUNA_COLOR_VARIANTS[0]);
  const [isLiked, setIsLiked] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll event for scroll-to-top
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ronin-style states
  const [activeSection, setActiveSection] = useState("overview");
  const [showStickyTabs, setShowStickyTabs] = useState(false);
  const [showStickyBottom, setShowStickyBottom] = useState(false);
  const [activeSoundTab, setActiveSoundTab] = useState(1); // Studio Engineered Sound is active by default like Ronin
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Section refs
  const overviewRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

  const activeProductFeatures = product?.features && product.features.length > 0 ? product.features : FEATURE_CARDS;
  const activeProductSoundTabs = product?.sound_tabs && product.sound_tabs.length > 0 ? product.sound_tabs : SOUND_TABS;
  const activeProductSpecs = product?.specs && product.specs.length > 0 ? product.specs : SPEC_CATEGORIES;
  const activeProductTestimonials = product?.testimonials && product.testimonials.length > 0 ? product.testimonials : null;

  // Reviews state
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewImages, setNewReviewImages] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const res = await fetch(`${API_URL}/api/reviews/${product.id}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!product?.id,
  });

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ["reviews-summary", product?.id],
    queryFn: async () => {
      if (!product?.id) return null;
      const res = await fetch(`${API_URL}/api/reviews/${product.id}/summary`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (product) {
      setActiveImage(product.images && product.images.length > 0 ? product.images[0] : product.image_url);
    }
  }, [product]);

  // Auto-play sound tabs slider
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSoundTab((prev) => (prev + 1) % activeProductSoundTabs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeProductSoundTabs.length]);

  // Scroll handler for sticky tabs + bottom bar + active section
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowStickyTabs(y > 700);
      if (ctaRef.current) {
        setShowStickyBottom(ctaRef.current.getBoundingClientRect().bottom < 0);
      }
      const sections = [
        { id: "overview", ref: overviewRef },
        { id: "specs", ref: specsRef },
        { id: "faq", ref: faqRef },
        { id: "reviews", ref: reviewsRef },
      ];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].ref.current;
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = { overview: overviewRef, specs: specsRef, faq: faqRef, reviews: reviewsRef, features: featuresRef };
    const ref = refs[id];
    if (ref?.current) {
      window.scrollTo({ top: ref.current.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] pt-32 pb-20">
        <div className="mx-auto max-w-[1920px] px-4 md:px-[40px] grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl bg-neutral-200" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-1/4 bg-neutral-200" />
            <Skeleton className="h-10 w-3/4 bg-neutral-200" />
            <Skeleton className="h-6 w-1/3 bg-neutral-200" />
            <Skeleton className="h-32 w-full bg-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center flex-col gap-6 py-40">
        <h2 className="text-2xl font-bold text-neutral-900">Product not found</h2>
        <Link to="/shop" className="text-[#00a651] hover:underline flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back to Shop</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0 || product.is_active === false;
  const discount = product.original_price && product.original_price > product.price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : null;
  const qty2Discount = product.qty2_discount_percent ?? 3;
  const qty3Discount = product.qty3_discount_percent ?? 5;
  const originalUnitPrice = timedDiscountPercent > 0 ? Math.round(Number(product.price) * (1 - timedDiscountPercent / 100)) : Number(product.price);
  const price1 = originalUnitPrice;
  const price2 = Math.round(originalUnitPrice * (1 - qty2Discount / 100));
  const price3 = Math.round(originalUnitPrice * (1 - qty3Discount / 100));

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${product.name} - ${product.tagline || ""} ${shareUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: product.name, text: product.tagline || "", url: window.location.href }).catch(console.error);
    } else {
      setShowSharePopover(!showSharePopover);
    }
  };

  const handleBuyNow = () => {
    const finalPrice = timedDiscountPercent > 0 ? Math.round(Number(product.price) * (1 - timedDiscountPercent / 100)) : Number(product.price);
    add({ product_id: product.id, slug: product.slug, name: product.name, price: finalPrice, image_url: product.image_url, category: product.category, qty2_discount_percent: product.qty2_discount_percent, qty3_discount_percent: product.qty3_discount_percent }, qty, false);
    toast.success("Redirecting to checkout...");
    router.navigate({ to: "/checkout" });
  };

  const handleWhatsAppOrder = () => {
    const finalPrice = timedDiscountPercent > 0 ? Math.round(Number(product.price) * (1 - timedDiscountPercent / 100)) : Number(product.price);
    const message = `Hello BreezyGo! I'm interested in buying:\nProduct: ${product.name}\nColor: ${selectedColor.label}\nQuantity: ${qty}\nPrice: Rs. ${finalPrice.toLocaleString()}\n\nPlease confirm my order.`;
    window.open(`https://wa.me/923320009376?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleAddToCart = () => {
    const finalPrice = timedDiscountPercent > 0 ? Math.round(Number(product.price) * (1 - timedDiscountPercent / 100)) : Number(product.price);
    add({ product_id: product.id, slug: product.slug, name: product.name, price: finalPrice, image_url: product.image_url, category: product.category, qty2_discount_percent: product.qty2_discount_percent, qty3_discount_percent: product.qty3_discount_percent }, qty);
    toast.success("Added to cart");
  };

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] text-neutral-800 pt-28 md:pt-36 pb-0 overflow-clip">
        <Toaster richColors position="top-center" />

        {/* ════════ STICKY TABS (Floating Glassmorphism Pill) ════════ */}
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${showStickyTabs ? "translate-y-0 opacity-100 scale-100" : "-translate-y-10 opacity-0 scale-95 pointer-events-none"}`}>
          <div className="bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 rounded-full p-1.5 flex items-center justify-center gap-1">
            {[
              { id: "overview", label: "Overview", icon: FileText },
              { id: "specs", label: "Specs", icon: BarChart2 },
              { id: "faq", label: "FAQ's", icon: HelpCircle },
              { id: "reviews", label: "Reviews", icon: Star },
            ].map((tab) => (
              <button key={tab.id} onClick={() => scrollToSection(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeSection === tab.id ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/60" : "bg-transparent text-neutral-600 hover:bg-white/50 hover:text-neutral-900"}`}>
                <tab.icon className="h-4 w-4 stroke-[2.5]" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ════════ TOP SECTION: IMAGE GALLERY + PRODUCT INFO ════════ */}
        <div className="mx-auto max-w-[1920px] px-4 md:px-[40px] pt-2">
          {/* Breadcrumbs (Moved outside grid to align both columns at the top) */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/shop" className="hover:text-neutral-900 transition-colors">{product.category || "Shop"}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-neutral-900 font-medium">{product.name}</span>
          </div>

          <div className="grid xl:grid-cols-12 gap-10 xl:gap-14 items-start overflow-visible">
            {/* ── LEFT: Image Gallery ── */}
            <div className="col-span-12 xl:col-span-7 xl:sticky xl:top-36 flex flex-col">
              <div className="bg-white rounded-3xl p-4 xl:p-5 border border-neutral-100 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center w-full">
                {/* Main Image Wrapper */}
                <div className="relative w-full aspect-square xl:aspect-auto xl:h-[520px] 2xl:h-[550px] rounded-2xl overflow-hidden bg-[#f4f5f7] cursor-zoom-in group flex items-center justify-center" onClick={() => setIsFullscreen(true)}>
                  {/* Badges & Actions */}
                  {isOutOfStock ? (
                    <span className="absolute top-4 left-4 z-10 bg-neutral-900 text-white text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-full shadow-lg">OUT OF STOCK</span>
                  ) : discount && (
                    <span className="absolute top-4 left-4 z-10 bg-[#00a651] text-white text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-full shadow-lg">{discount}% OFF</span>
                  )}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-md ${isLiked ? "bg-red-500 text-white" : "bg-white text-neutral-500 hover:text-neutral-900 hover:scale-105"}`}>
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                    </button>
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); handleShare(); }}
                        className="h-10 w-10 rounded-full bg-white text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors shadow-md hover:scale-105">
                        <Share2 className="h-5 w-5" />
                      </button>
                      {showSharePopover && (
                        <div className="absolute right-0 top-12 z-50 w-52 bg-white border border-neutral-200 shadow-xl p-3 flex flex-col gap-2 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1 border-b pb-1">Share Product</div>
                          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); setShowSharePopover(false); }}
                            className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-black py-1.5 hover:bg-neutral-50 px-2 transition-colors flex items-center gap-2 rounded-lg">
                            <LinkIcon className="h-4 w-4 shrink-0" /> Copy Link
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <img src={getProductImage(activeImage || product.image_url)} alt={product.name} className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 mix-blend-multiply" />

                  {/* Prev/Next Arrows */}
                  {product.images && product.images.length > 1 && (
                    <>
                      <button type="button" onClick={(e) => { e.stopPropagation(); const imgs = product.images || []; const curr = imgs.indexOf(activeImage || ""); setActiveImage(imgs[(curr - 1 + imgs.length) % imgs.length]); }}
                        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 text-neutral-800 items-center justify-center transition-all hover:scale-110">
                        <ChevronLeft className="h-7 w-7" />
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); const imgs = product.images || []; const curr = imgs.indexOf(activeImage || ""); setActiveImage(imgs[(curr + 1) % imgs.length]); }}
                        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 text-neutral-800 items-center justify-center transition-all hover:scale-110">
                        <ChevronRight className="h-7 w-7" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto mt-2 p-2 hide-scrollbar w-full justify-center shrink-0">
                    {product.images.map((img: string, idx: number) => (
                      <button key={idx} onClick={() => setActiveImage(img)}
                        className={`relative flex-shrink-0 w-16 h-16 xl:w-20 xl:h-20 rounded-xl overflow-hidden border-2 transition-all bg-[#f4f5f7] ${activeImage === img ? "border-neutral-900 opacity-100 scale-110 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`}>
                        <img src={getProductImage(img)} alt={`view ${idx + 1}`} className="absolute inset-0 w-full h-full object-contain p-1 mix-blend-multiply" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Product Info Panel ── */}
            <div className="col-span-12 xl:col-span-5">
              <div className="bg-white rounded-3xl p-6 xl:p-8 border border-neutral-100 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] space-y-5">
                <span className="text-[11px] font-medium tracking-wide text-neutral-500">{product.category}</span>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-[1.1] tracking-tighter">{product.name}</h1>
                {product.tagline && <p className="text-sm text-neutral-500">{product.tagline}</p>}
                <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-neutral-200">
                  <LiveViewersCounter />
                  <StockBatchBadge productId={product.id} />
                </div>
                <TimedDiscountBanner productId={product.id} onDiscountChange={(p) => setTimedDiscountPercent(p)} />

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-neutral-900">Rs.{originalUnitPrice.toLocaleString()}</span>
                  {product.original_price && <span className="text-lg text-neutral-400 line-through">Rs.{Number(product.original_price).toLocaleString()}</span>}
                </div>

                {/* Color Swatches */}
                {product.category && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500">Color:</span>
                      <span className="text-sm font-medium text-neutral-900">{selectedColor.name}</span>
                    </div>
                    <div className="flex gap-3">
                      {LUNA_COLOR_VARIANTS.map((c) => (
                        <button key={c.name} onClick={() => setSelectedColor(c)}
                          className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor.name === c.name ? "border-neutral-900 scale-110 shadow-md" : "border-neutral-300 hover:border-neutral-500"}`}
                          style={{ backgroundColor: c.colorCode }} title={c.label}>
                          {selectedColor.name === c.name && <span className="h-3 w-3 rounded-full bg-white shadow block mix-blend-difference" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div ref={ctaRef} className="space-y-3 pt-2">
                  <Button size="lg" disabled={isOutOfStock} className="w-full h-14 rounded-xl bg-[#00a651] hover:bg-[#008a44] text-white text-sm font-medium tracking-wide shadow-md transition-all" onClick={handleBuyNow}>
                    <ShoppingCart className="h-5 w-5 mr-2" /> {isOutOfStock ? "Out of Stock" : "Buy Now"}
                  </Button>
                  <Button size="lg" disabled={isOutOfStock} variant="outline" className="w-full h-14 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-medium tracking-wide transition-all" onClick={handleAddToCart}>
                    <Plus className="h-5 w-5 mr-2" /> Add to Cart
                  </Button>

                  {/* WhatsApp button */}
                  <Button size="lg" variant="outline" onClick={handleWhatsAppOrder}
                    className="w-full h-14 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-sm font-medium tracking-wide flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#25D366" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Order via WhatsApp
                  </Button>
                </div>

                {/* Bundle Deal Selector */}
                <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white">
                  <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-1">Limited Time Offer</div>
                      <div className="text-2xl font-semibold text-neutral-900 leading-none">
                        Rs {(qty === 1 ? price1 : qty === 2 ? price2 * 2 : price3 * qty).toLocaleString()}
                        <span className="text-sm font-bold text-neutral-400 ml-2">total</span>
                      </div>
                      {product.original_price && <div className="text-xs text-neutral-400 line-through mt-0.5">Was Rs {(Number(product.original_price) * qty).toLocaleString()}</div>}
                    </div>
                    {discount && (
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-[#00a651] leading-none">{discount}%</div>
                        <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest">OFF</div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 pb-5 space-y-2">
                    <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-2">Choose Your Bundle</div>
                    {[
                      { label: "Single Pack", qty: 1, tag: null, price: price1, sub: "Standard price" },
                      { label: "Double Saver", qty: 2, tag: `Save ${qty2Discount}%`, price: price2, sub: `${qty2Discount}% instant off/unit`, color: "emerald" },
                      { label: "Mega Value", qty: 3, tag: `Save ${qty3Discount}%`, price: price3, sub: `${qty3Discount}% instant off/unit`, color: "red" },
                    ].map((deal) => {
                      const isActive = deal.qty === 3 ? qty >= 3 : qty === deal.qty;
                      return (
                        <button key={deal.label} type="button" onClick={() => setQty(deal.qty)}
                          className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer ${isActive ? "border-[#00a651] bg-gradient-to-r from-[#00a651] to-[#008a44] text-white shadow-lg shadow-[#00a651]/20 scale-[1.01]" : "border-neutral-200 bg-white hover:border-[#00a651]/50 hover:bg-[#00a651]/5 text-neutral-800"}`}>
                          <div className="flex items-center gap-3.5">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isActive ? "border-white bg-white/20" : "border-neutral-300 bg-white"}`}>
                              {isActive && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <div className={`text-xs font-normal ${isActive ? "text-white" : "text-neutral-900"}`}>Buy {deal.qty === 3 ? "3+" : deal.qty} — {deal.label}</div>
                              <div className={`text-[10px] font-normal mt-0.5 ${isActive ? "text-white/80" : "text-neutral-400"}`}>{deal.sub}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className={`text-sm font-normal ${isActive ? "text-white" : "text-neutral-900"}`}>Rs {deal.price.toLocaleString()}<span className={`text-[10px] font-normal ml-0.5 ${isActive ? "text-white/80" : "text-neutral-400"}`}>/unit</span></div>
                            {deal.tag && <span className={`text-[8.5px] font-normal uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${isActive ? "bg-white text-[#00a651]" : deal.color === "emerald" ? "bg-emerald-50 text-[#00a651] border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>{deal.tag}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Corporate / Bulk order */}
                <div className="flex items-center justify-between px-5 py-3 bg-neutral-100 rounded-xl text-sm">
                  <span className="text-neutral-600 font-medium">Corporate Gifting | Bulk Order</span>
                  <button onClick={handleWhatsAppOrder} className="text-[#00a651] font-bold text-xs hover:underline">Click Here</button>
                </div>
              </div>
            </div>
          </div>

          {/* ════════ TRUST BADGES (Ronin-style horizontal strip) ════════ */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-16 py-6 border-t border-b border-neutral-200">
            {[
              { icon: RefreshCcw, label: "Replacement" },
              { icon: ShieldCheck, label: "Warranty" },
              { icon: Truck, label: "Shipping" },
              { icon: CreditCard, label: "Payment" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 text-neutral-600">
                <b.icon className="h-6 w-6 stroke-[1.5]" />
                <span className="text-sm font-semibold">{b.label}</span>
              </div>
            ))}
          </div>

          {/* ════════ TAB NAVIGATION (non-sticky version, centered like Ronin) ════════ */}
          <div className="flex items-center justify-center gap-3 py-8 flex-wrap">
            {[
              { id: "overview", label: "Overview", icon: FileText },
              { id: "specs", label: "Specs", icon: BarChart2 },
              { id: "faq", label: "FAQ's", icon: HelpCircle },
              { id: "reviews", label: "Reviews", icon: Star },
            ].map((tab) => (
              <button key={tab.id} onClick={() => scrollToSection(tab.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm">
                <tab.icon className="h-4 w-4 stroke-[2]" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════ */}
        {/* BELOW THE FOLD: FULL-WIDTH SECTIONS (Ronin-style)                     */}
        {/* ════════════════════════════════════════════════════════════════════════ */}

        {/* ═══ SECTION 1: HERO BANNER (Full-width product showcase) ═══ */}
        <div ref={overviewRef} className="relative w-full overflow-hidden bg-neutral-900" style={{ minHeight: "100vh" }}>
          {product.hero_image ? <img src={product.hero_image} alt="hero bg" className="absolute inset-0 w-full h-full object-cover opacity-40 hidden md:block" /> : <div className="absolute inset-0 bg-neutral-800 hidden md:block" />}
          {product.hero_image_mobile ? <img src={product.hero_image_mobile} alt="hero bg mobile" className="absolute inset-0 w-full h-full object-cover opacity-40 block md:hidden" /> : (product.hero_image ? <img src={product.hero_image} alt="hero bg" className="absolute inset-0 w-full h-full object-cover opacity-40 block md:hidden" /> : <div className="absolute inset-0 bg-neutral-800 block md:hidden" />)}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-[clamp(4rem,12vw,10rem)] font-black text-white/20 leading-none tracking-tighter uppercase select-none whitespace-pre-line">{product.hero_text || product.name}</h2>
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-neutral-400 mt-4">{product.hero_subtitle || "Premium Smart Watch Collection"}</p>
            <button onClick={() => scrollToSection("features")}
              className="mt-8 px-8 py-3 bg-[#00a651] hover:bg-[#008a44] text-white rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg">
              Explore <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ═══ SECTION 2: FEATURE CARDS + WATERMARK (Ronin 2-col layout) ═══ */}
        <div ref={featuresRef} className="bg-white py-16">
          <div className="mx-auto max-w-[1920px] w-full px-4 md:px-[40px] grid lg:grid-cols-12 gap-8 items-start">
            {/* Left: Feature card list (like Ronin's ANC/ENC/Dual Device/Speaker cards) */}
            <div className="lg:col-span-4 space-y-4">
              {activeProductFeatures.map((f: any, i: number) => (
                <div key={i} className="flex items-center gap-4 bg-neutral-50 rounded-2xl px-6 py-5 border border-neutral-100 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 text-neutral-600 overflow-hidden">
                    {f.icon ? <f.icon className="h-6 w-6" /> : (f.image ? <img src={f.image} className="w-full h-full object-cover" alt={f.title} /> : <Zap className="h-6 w-6" />)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{f.title}</div>
                    <div className="text-xs text-neutral-400 font-medium">{f.subtitle || f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Large watermark text area (like Ronin's "Software Based Earbuds" + "Pebble" watermark) */}
            <div className="lg:col-span-8 bg-neutral-50 rounded-3xl border border-neutral-100 flex flex-col items-center justify-center py-20 px-8 text-center relative overflow-hidden" style={{ minHeight: "450px" }}>
              {product.watermark_image && <img src={product.watermark_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 z-0" />}

              <div className="relative z-10 w-full flex flex-col items-center">
                <p className={`text-base md:text-lg font-medium tracking-wide ${product.watermark_image ? 'text-white' : 'text-neutral-400'}`}>
                  {product.watermark_title || "Feature-Packed Smart Watch"}
                </p>
                <h3 className={`text-[clamp(5rem,10vw,9rem)] font-medium leading-none tracking-tighter select-none mt-2 italic ${product.watermark_image ? 'text-white/30' : 'text-neutral-200'}`} style={{ fontFamily: "Georgia, serif" }}>
                  {product.watermark_text || product.name?.split(" ")[0] || "Luna"}
                </h3>
              </div>
            </div>
          </div>
        </div>



        {/* ═══ SECTION 4: INTERACTIVE SOUND/FEATURE SLIDER (Ronin-style) ═══ */}
        {/* Left: vertical text tabs — Right: image carousel with rounded capsule peek images */}
        <div className="bg-[#f5f5f5] py-20">
          <div className="mx-auto max-w-[1920px] w-full px-4 md:px-[40px] grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Tab buttons */}
            <div className="w-full md:w-[350px] space-y-6 shrink-0 relative z-10">
              {activeProductSoundTabs.map((tab: any, i: number) => (
                <div key={i}
                  className={`cursor-pointer transition-all duration-300 border-l-[3px] pl-5 py-1 ${activeSoundTab === i ? 'border-neutral-900 opacity-100' : 'border-neutral-200 opacity-40 hover:opacity-70'}`}
                  onClick={() => setActiveSoundTab(i)}
                >
                  <h3 className="text-xl md:text-2xl font-medium text-neutral-900 leading-tight mb-2 tracking-tight">{tab.title}</h3>
                  <div className={`grid transition-all duration-500 ease-in-out ${activeSoundTab === i ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="text-neutral-600 text-sm leading-relaxed">{tab.desc || "Experience premium quality tailored for your lifestyle."}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Image display with morphing peek capsule images on sides */}
            <div className="relative w-full max-w-[650px] aspect-[4/5] md:aspect-auto md:h-[625px] mx-auto overflow-hidden md:overflow-visible">
              {activeProductSoundTabs.map((tab: any, idx: number) => {
                const isActive = idx === activeSoundTab;
                const isPrev = idx === (activeSoundTab - 1 + activeProductSoundTabs.length) % activeProductSoundTabs.length;
                const isNext = idx === (activeSoundTab + 1) % activeProductSoundTabs.length;

                const dynamicStyles: React.CSSProperties = isActive ? {
                  left: "50%",
                  width: "100%",
                  maxWidth: "500px",
                  height: "100%",
                  maxHeight: "625px",
                  borderRadius: "1.5rem", // 3xl
                  zIndex: 10,
                } : isPrev ? {
                  left: "25px",
                  width: "50px",
                  height: "350px",
                  borderRadius: "9999px",
                  zIndex: 0,
                } : {
                  left: "calc(100% - 25px)",
                  width: "50px",
                  height: "350px",
                  borderRadius: "9999px",
                  zIndex: 0,
                };

                return (
                  <div key={idx} onClick={() => !isActive && setActiveSoundTab(idx)}
                    className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-neutral-200 transition-all duration-1000 ease-in-out ${isActive ? "opacity-100 cursor-default shadow-2xl" : "opacity-0 md:opacity-60 cursor-pointer pointer-events-none md:pointer-events-auto hover:opacity-80"}`}
                    style={dynamicStyles}>
                    <img src={tab.img} alt={tab.title} className="w-full h-full object-cover transition-transform duration-1000 ease-in-out" />
                    {!isActive && <div className="absolute inset-0 bg-black/10 transition-opacity duration-1000" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>



        {/* ═══ SECTION 6: OVERVIEW (Ronin-style text block) ═══ */}
        <div className="bg-[#f5f5f5] py-16">
          <div className="mx-auto max-w-[1920px] w-full px-4 md:px-[40px]">
            <h2 className="text-3xl font-medium text-neutral-900 tracking-tighter mb-6">Overview</h2>
            <p className="text-neutral-600 leading-relaxed">
              Exclusive premium {product.name} smart watch. Featuring a stunning 1.39" IPS Full Touch HD display, this
              feature-packed wearable delivers an immersive experience. Designed for those who demand the best, it features
              advanced Bluetooth 5.2 calling with built-in HD speaker and microphone, comprehensive 24/7 health monitoring
              including heart rate, SpO2, and sleep analysis. Complete with an IP67 dust and water resistance rating and a
              magnetic charging cable, the {product.name} is the ultimate combination of style, technology, and performance.
            </p>
          </div>
        </div>

        {/* ═══ SECTION 7: SPECS TABLE (Ronin-style with icon categories) ═══ */}
        <div ref={specsRef} className="bg-white py-16">
          <div className="mx-auto max-w-[1920px] w-full px-4 md:px-[40px]">
            <h2 className="text-3xl font-medium text-neutral-900 tracking-tighter mb-8">Explore The Specs</h2>
            <div className="divide-y divide-neutral-100">
              {activeProductSpecs.map((cat: any, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-6 py-8 items-start">
                  <div className="col-span-4 flex items-center gap-3">
                    {(() => {
                      const IconComp = AVAILABLE_ICONS[cat.iconName] || HelpCircle;
                      return <IconComp className="h-6 w-6 text-neutral-600 stroke-[1.5]" />;
                    })()}
                    <h3 className="text-base font-medium text-neutral-900">{cat.title || cat.categoryName}</h3>
                  </div>
                  {/* Spec values */}
                  <div className="col-span-8 space-y-1.5">
                    {(cat.items || cat.attributes || []).map((item: any, j: number) => (
                      <div key={j} className="text-sm text-neutral-600">
                        <span className="font-medium text-neutral-800">{item.label}:</span> {item.value}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ SECTION 8: FAQ ACCORDION ═══ */}
        <div ref={faqRef} className="bg-[#f5f5f5] py-16">
          <div className="mx-auto max-w-[1920px] w-full px-4 md:px-[40px]">
            <h2 className="text-3xl font-medium text-neutral-900 tracking-tighter mb-8">FAQ's</h2>
            <div className="space-y-3">
              {FAQ_DATA.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                    <button onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors">
                      <span className="text-sm font-medium text-neutral-800">{faq.q}</span>
                      <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="px-6 pb-4 text-sm text-neutral-500 leading-relaxed">{faq.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ SECTION 9: SALES GRAPH ═══ */}
        <div className="bg-white py-16">
          <div className="mx-auto max-w-[1920px] w-full px-4 md:px-[40px]">
            <SalesGraph productId={product.id} />
          </div>
        </div>

        {/* ═══ SECTION 10: REVIEWS (Ronin-style) ═══ */}
        <div ref={reviewsRef} className="bg-[#f5f5f5] py-16">
          <div className="mx-auto max-w-[1920px] w-full px-4 md:px-[40px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-medium text-neutral-900 tracking-tighter">Customer Reviews</h2>
              <div className="flex items-center gap-3">
                {summary && (
                  <div className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-xl">
                    <span className="text-2xl font-medium text-neutral-900">{summary.average_rating?.toFixed(1)}</span>
                    <div>
                      <div className="flex text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(summary.average_rating || 0) ? "fill-current" : "text-neutral-200"}`} />)}</div>
                      <div className="text-[10px] text-neutral-500 font-medium">{summary.total_reviews} reviews</div>
                    </div>
                  </div>
                )}
                <Button onClick={() => { setShowReviewForm(!showReviewForm); setReviewSubmitted(false); }}
                  className="rounded-xl bg-neutral-900 hover:bg-black text-white font-medium text-xs tracking-wide px-5 py-2.5">
                  {showReviewForm ? "Close" : "Write a Review"}
                </Button>
              </div>
            </div>

            {/* Star Breakdown */}
            {summary && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8 grid sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = summary?.breakdown?.[star]?.percentage || 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs font-bold text-neutral-600">
                        <span className="w-10 text-right shrink-0">{star} ★</span>
                        <div className="flex-1 h-2.5 bg-neutral-200 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} /></div>
                        <span className="w-8 text-neutral-400">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <div className="text-6xl font-black text-neutral-900">{summary.average_rating?.toFixed(1)}</div>
                  <div className="flex justify-center gap-0.5 text-amber-500 mt-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-6 w-6 ${i < Math.round(summary.average_rating || 0) ? "fill-current" : "text-neutral-200"}`} />)}</div>
                  <div className="text-sm text-neutral-500 font-bold mt-2">Based on {summary.total_reviews} verified reviews</div>
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <div className="border border-neutral-200 rounded-2xl p-6 md:p-8 bg-white shadow-sm mb-8 space-y-6">
                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-wide">Share Your Experience</h3>
                {reviewSubmitted ? (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold text-center">🎉 Thanks! Your review is pending approval.</div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newReviewName.trim() || !newReviewComment.trim()) { toast.error("Please fill in name and comment."); return; }
                    try {
                      setSubmittingReview(true);
                      const res = await fetch(`${API_URL}/api/reviews/${product.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer_name: newReviewName, rating: newReviewRating, comment: newReviewComment, images: newReviewImages }) });
                      if (!res.ok) throw new Error("Failed");
                      toast.success("Review submitted!");
                      setNewReviewName(""); setNewReviewComment(""); setNewReviewRating(5); setNewReviewImages([]);
                      setReviewSubmitted(true); refetchReviews(); refetchSummary();
                      setTimeout(() => { setShowReviewForm(false); setReviewSubmitted(false); }, 4000);
                    } catch { toast.error("Error submitting review."); } finally { setSubmittingReview(false); }
                  }} className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">Your Name</label>
                      <input type="text" required value={newReviewName} onChange={(e) => setNewReviewName(e.target.value)} placeholder="Enter your name"
                        className="w-full h-11 px-4 border border-neutral-200 bg-neutral-50 rounded-xl text-sm outline-none focus:border-neutral-900 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">Star Rating</label>
                      <div className="flex gap-2 mt-1">{[1, 2, 3, 4, 5].map((s) => <button key={s} type="button" onClick={() => setNewReviewRating(s)} className="transition-transform hover:scale-110"><Star className={`h-7 w-7 ${s <= newReviewRating ? "text-amber-500 fill-current" : "text-neutral-200"}`} /></button>)}</div>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">Review</label>
                      <textarea required rows={4} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} placeholder="Share your thoughts..."
                        className="w-full p-4 border border-neutral-200 bg-neutral-50 rounded-xl text-sm outline-none focus:border-neutral-900 transition-colors resize-none" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block">Add Photos (Max 3)</label>
                      <input type="file" multiple accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files; if (!files) return;
                          if (newReviewImages.length + files.length > 3) { toast.error("Max 3 images."); return; }
                          Array.from(files).forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const img = new window.Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                let w = img.width, h = img.height, mx = 800;
                                if (w > h) { if (w > mx) { h *= mx / w; w = mx; } } else { if (h > mx) { w *= mx / h; h = mx; } }
                                canvas.width = w; canvas.height = h;
                                canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
                                setNewReviewImages(prev => [...prev, canvas.toDataURL("image/jpeg", 0.7)]);
                              };
                              img.src = ev.target?.result as string;
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
                                className="absolute -top-1 -right-1 bg-black text-white rounded-full hover:bg-red-600 transition-colors shadow" style={{ padding: "2px" }}>
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="submit" disabled={submittingReview}
                        className="rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest px-8 py-3 w-full sm:w-auto">
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Reviews Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.length === 0 ? (
                <div className="col-span-full p-16 text-center text-neutral-400 italic text-sm border border-dashed border-neutral-300 rounded-2xl bg-white">No reviews yet. Be the first!</div>
              ) : (
                reviews.map((r: any) => (
                  <div key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-100 text-neutral-700 flex items-center justify-center text-sm font-black shrink-0">{r.customer_name?.charAt(0) || "U"}</div>
                        <div>
                          <div className="font-bold text-sm text-neutral-900">{r.customer_name}</div>
                          <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Verified</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex gap-0.5 justify-end">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current text-amber-500" : "text-neutral-200"}`} />)}</div>
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

        {/* ════════ STICKY BOTTOM BAR (Ronin-style) ════════ */}
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${showStickyBottom ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}>
          <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="mx-auto max-w-[1920px] px-4 md:px-[40px] py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                  <img src={getProductImage(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 line-clamp-1">{product.name}</div>
                  <div className="text-base font-black text-neutral-900">Rs.{originalUnitPrice.toLocaleString()}</div>
                </div>
              </div>
              <Button size="lg" disabled={isOutOfStock} className="h-12 px-8 rounded-full bg-neutral-900 hover:bg-black text-white text-sm font-bold flex items-center gap-2 shadow-md" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* ════════ MODALS ════════ */}
        {selectedReviewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out" onClick={() => setSelectedReviewImage(null)}>
            <button onClick={() => setSelectedReviewImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2"><X className="h-8 w-8" /></button>
            <img src={selectedReviewImage} alt="Expanded" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" />
          </div>
        )}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
            <button onClick={() => setIsFullscreen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2"><X className="h-8 w-8" /></button>
            <img src={getProductImage(activeImage || product.image_url)} alt={product.name} className="max-w-[90vw] max-h-[90vh] object-contain" />
            {product.images && product.images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); const imgs = product.images!; const curr = imgs.indexOf(activeImage || imgs[0]); setActiveImage(imgs[(curr - 1 + imgs.length) % imgs.length]); }}
                  className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); const imgs = product.images!; const curr = imgs.indexOf(activeImage || imgs[0]); setActiveImage(imgs[(curr + 1) % imgs.length]); }}
                  className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-44 right-6 z-[60] h-12 w-12 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-2xl hover:bg-black hover:scale-110 transition-all">
          <ArrowUp className="h-5 w-5 stroke-[2.5]" />
        </button>
      )}

    </>
  );
}
