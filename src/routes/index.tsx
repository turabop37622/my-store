import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import hero2 from "@/assets/hero 2.jpg";
import hero3 from "@/assets/hero 3.jpg";
import mob1 from "@/assets/mob 1.jpg";
import mob2 from "@/assets/mob 2.jpg";
import best1 from "@/assets/best 1.png";
import best2 from "@/assets/best 2.jpg";
import best3 from "@/assets/best 3.jpg";
import { useHeaderTheme } from "@/lib/header-theme";
import { listProducts, type Product } from "@/lib/products.functions";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Headphones, Watch, Speaker, Cable, ShieldCheck, Truck, Lock } from "lucide-react";
import DeliveryBanner from "@/components/DeliveryBanner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "BreezyGo — Premium Earbuds, Watches & Lifestyle Tech | COD Pakistan" },
      {
        name: "description",
        content: "Premium tech accessories. Free shipping & Cash on Delivery across Pakistan.",
      },
    ],
  }),
});

function Index() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts(),
  });

  const featured = (products ?? []).filter((p) => p?.is_featured);
  const trending = (products ?? []).slice(0, 8);
  const newArrivals = (products ?? []).slice(3, 7);
  const banners: Product[] = (featured.length ? featured : trending).slice(0, 4);

  const flagshipProduct = featured.length > 0 ? featured[0] : trending[0];

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-20">
      <HeroCarousel banners={banners} loading={isLoading} />

      {/* --- Bento Category Grid --- */}
      <section className="mx-auto max-w-[1920px] px-4 md:px-[40px] py-16 md:py-24">
        <div className="mb-16 text-center md:text-left space-y-4">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-normal text-neutral-900 tracking-tighter leading-none">Explore the <span className="text-[#00a651]">Ecosystem.</span></h2>
          <p className="text-xl text-neutral-500 font-light tracking-tight">Premium tech designed for your lifestyle.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
          {/* Smart Watches (Large) */}
          <Link to="/shop" search={{ category: "Smart Watches" }} className="group md:col-span-2 md:row-span-2 relative rounded-[2rem] overflow-hidden bg-neutral-900 border border-neutral-800 p-8 flex flex-col justify-end">
            <img src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop" alt="Smart Watches" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <Watch className="absolute top-8 right-8 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-bold uppercase tracking-widest mb-3 border border-white/10">Flagship</span>
              <h3 className="text-3xl md:text-5xl font-medium text-white uppercase tracking-tight leading-none mb-2">Smart<br/>Watches</h3>
              <span className="text-[#00a651] font-bold flex items-center gap-2 transition-colors">Shop Collection <ArrowRight className="w-4 h-4" /></span>
            </div>
          </Link>

          {/* Earbuds (Tall) */}
          <Link to="/shop" search={{ category: "Earbuds" }} className="group md:col-span-1 md:row-span-2 relative rounded-[2rem] overflow-hidden bg-neutral-900 border border-neutral-800 p-8 flex flex-col justify-end hover:shadow-2xl transition-shadow duration-500">
            <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop" alt="Earbuds" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <Headphones className="absolute top-8 right-8 w-20 h-20 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-medium text-white uppercase tracking-tight leading-none mb-2">True Wireless<br/>Earbuds</h3>
              <span className="text-[#00a651] font-bold flex items-center gap-2">Explore <ArrowRight className="w-4 h-4" /></span>
            </div>
          </Link>

          {/* Headphones (Small) */}
          <Link to="/shop" search={{ category: "Headphones" }} className="group md:col-span-1 md:row-span-1 relative rounded-[2rem] overflow-hidden bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-end">
            <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop" alt="Headphones" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <Speaker className="absolute top-6 right-6 w-12 h-12 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-xl font-medium text-white uppercase tracking-tight mb-1">Headphones</h3>
              <span className="text-[#00a651] font-bold text-sm flex items-center gap-1">Browse <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Link>

          {/* Accessories (Small) */}
          <Link to="/shop" search={{ category: "Accessories" }} className="group md:col-span-1 md:row-span-1 relative rounded-[2rem] overflow-hidden bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-end shadow-lg shadow-[#00a651]/10">
            <img src="https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800&auto=format&fit=crop" alt="Accessories" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <Cable className="absolute top-6 right-6 w-12 h-12 text-white/20 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-xl font-medium text-white uppercase tracking-tight mb-1">Accessories</h3>
              <span className="text-[#00a651] font-bold text-sm flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* --- New Arrivals --- */}
      <section className="mx-auto max-w-[1920px] px-4 md:px-[40px] py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-16 text-center md:text-left">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-normal text-neutral-900 tracking-tighter leading-none">New Arrivals.</h2>
            <p className="text-xl text-neutral-500 font-light tracking-tight">The latest innovations, just landed.</p>
          </div>
          <Link to="/shop" className="text-neutral-900 font-medium tracking-wide text-sm hover:text-neutral-500 transition-colors flex items-center gap-2 border-b border-neutral-200 pb-1">
            Shop all new <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[2rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.slice(0, 4).map((p) => (
              p && <ProductCard key={p?.id} product={p} />
            ))}
          </div>
        )}
      </section>


      {/* --- Flagship Slider (User Requested Design) --- */}
      <FlagshipSlider banners={banners} />

      {/* --- Trending Products --- */}
      <section className="mx-auto max-w-[1920px] px-4 md:px-[40px] py-32">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-16 text-center md:text-left">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-normal text-neutral-900 tracking-tighter leading-none">Trending.</h2>
            <p className="text-xl text-neutral-500 font-light tracking-tight">Our most popular tech essentials right now.</p>
          </div>
          <Link to="/shop" className="text-neutral-900 font-medium tracking-wide text-sm hover:text-neutral-500 transition-colors flex items-center gap-2 border-b border-neutral-200 pb-1">
            Explore the collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[2rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.slice(0, 4).map((p) => (
              p && <ProductCard key={p?.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* --- Value Props (Minimal Editorial Style) --- */}
      <section className="bg-white py-32 border-y border-neutral-100">
        <div className="mx-auto max-w-[1920px] px-4 md:px-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:border-l border-neutral-200 md:pl-8">
              <ShieldCheck className="h-10 w-10 text-[#00a651] mb-8 stroke-[1.5]" />
              <h3 className="text-2xl font-normal tracking-tight text-neutral-900 mb-4">Official Warranty.</h3>
              <p className="text-neutral-500 font-light leading-relaxed text-lg">Every product comes with a comprehensive 12-month warranty, ensuring complete peace of mind.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:border-l border-neutral-200 md:pl-8">
              <Truck className="h-10 w-10 text-[#00a651] mb-8 stroke-[1.5]" />
              <h3 className="text-2xl font-normal tracking-tight text-neutral-900 mb-4">Express Delivery.</h3>
              <p className="text-neutral-500 font-light leading-relaxed text-lg">Experience rapid nationwide shipping. Get your premium tech delivered within 24 to 48 hours.</p>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left md:border-l border-neutral-200 md:pl-8">
              <Lock className="h-10 w-10 text-[#00a651] mb-8 stroke-[1.5]" />
              <h3 className="text-2xl font-normal tracking-tight text-neutral-900 mb-4">Secure Payment.</h3>
              <p className="text-neutral-500 font-light leading-relaxed text-lg">100% secure Cash on Delivery. Pay only when you receive your order at your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- The Philosophy / Extra Length Section --- */}
      <section className="py-32 md:py-48 bg-neutral-50">
        <div className="mx-auto max-w-[1920px] px-4 md:px-[40px] flex flex-col items-center text-center">
          <div className="max-w-4xl space-y-8">
            <span className="text-neutral-400 text-sm tracking-[0.3em] uppercase">The BreezyGo Philosophy</span>
            <ScrollRevealText text="We believe that premium technology should be beautifully designed, meticulously crafted, and accessible to everyone." />
            <div className="w-px h-24 bg-neutral-300 mx-auto mt-16"></div>
          </div>
        </div>
      </section>

      {/* --- COD Enhanced Banner (Minimal Version) --- */}
      <section className="py-24 bg-white border-t border-neutral-100">
        <div className="mx-auto max-w-[1920px] px-4 md:px-[40px]">
          <div className="relative overflow-hidden rounded-[40px] bg-neutral-950 p-12 md:p-32 flex flex-col md:flex-row items-center justify-between gap-16 group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>

            <div className="relative z-10 space-y-10 max-w-2xl text-center md:text-left">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tighter text-white leading-none">
                  Nationwide <br />
                  <span className="text-neutral-400">COD.</span>
                </h2>
                <p className="text-neutral-400 text-xl md:text-2xl font-light max-w-lg mx-auto md:mx-0 leading-snug">
                  Experience seamless shopping. Pay securely with cash upon delivery anywhere in Pakistan.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-8 pt-4">
                <Button asChild size="lg" className="bg-white hover:bg-neutral-200 text-neutral-950 rounded-full px-12 h-16 font-semibold tracking-wide shadow-[0_10px_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 active:scale-95 text-lg">
                  <Link to="/shop">Shop Now</Link>
                </Button>
                <div className="flex flex-col items-center md:items-start text-white/50">
                  <span className="text-xs font-medium uppercase tracking-[0.2em]">Crafted For</span>
                  <span className="font-normal text-xl tracking-tight text-white/80">Pakistan.</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex-1 flex justify-center w-full max-w-[300px] md:max-w-none">
              <div className="relative w-full aspect-square max-w-[400px] border-[1px] border-white/10 rounded-full flex items-center justify-center backdrop-blur-3xl bg-white/5 shadow-2xl">
                <div className="text-white/10 text-[120px] md:text-[200px] font-normal tracking-tighter select-none leading-none">PK</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroCarousel({ banners, loading }: { banners: Product[]; loading: boolean }) {
  const [current, setCurrent] = useState(0);
  const { setColor } = useHeaderTheme();
  const navigate = useNavigate();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setCurrent((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const slides = [
    { img: hero2, mobileImg: mob1, upto: "65", label: "BreezyGo", tag: "NEW", price: "4,499 PKR", color: "#0f172a" },
    { img: hero3, mobileImg: mob2, upto: "50", label: "BreezyGo", tag: "HOT", price: "1,999 PKR", color: "#171717" },
  ];

  useEffect(() => {
    setColor(slides[current].color);
  }, [current, setColor]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <section className="w-full">
        <Skeleton className="w-full aspect-[4/5] md:aspect-[21/9]" />
      </section>
    );
  }

  return (
    <section 
      className="relative w-full overflow-hidden transition-all duration-1000 pt-28 pb-4 px-4 md:pt-0 md:pb-0 md:px-0"
      style={{ background: `linear-gradient(to bottom, ${slides[current].color} 0%, #f5f5f5 40%, #f5f5f5 100%)` }}
    >
      {/* Delivery Banner embedded at the absolute bottom of hero screen on desktop, fixed top on mobile */}
      <div className="fixed top-0 left-0 w-full z-[60] md:absolute md:top-auto md:bottom-0 md:z-40">
        <DeliveryBanner />
      </div>

      <div 
        className="relative w-full aspect-[4/5] md:aspect-[21/9] bg-black overflow-hidden flex items-center shadow-none md:shadow-2xl rounded-[2rem] md:rounded-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"} cursor-pointer`}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button, a')) return;
              const targetSlug = banners?.[i]?.slug || banners?.[0]?.slug || "product";
              navigate({ to: "/product/$slug", params: { slug: targetSlug } });
            }}
          >
            <div className={`w-full h-full transition-transform duration-[5000ms] ease-linear ${i === current ? "scale-110" : "scale-100"}`}>
              <picture>
                <source media="(min-width: 768px)" srcSet={slide.img} />
                <img src={slide.mobileImg} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" />
              </picture>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10"></div>

            <div className="relative z-20 w-full max-w-[1920px] mx-auto px-4 md:px-[40px] h-full flex flex-col justify-center">
              <div className="max-w-2xl space-y-6 md:space-y-8 text-center md:text-left">
                <div className={`flex items-center justify-center md:justify-start gap-4 transition-all duration-700 delay-300 ${i === current ? "translate-y-0 opacity-50" : "-translate-y-10 opacity-0"}`}>
                  <span className="text-white font-black text-xl md:text-2xl tracking-tighter uppercase">{slide.label}</span>
                  <div className="h-8 md:h-10 w-[1.5px] bg-white hidden md:block"></div>
                  <span className="text-white/80 font-medium tracking-widest text-sm hidden md:block">{slide.price}</span>
                </div>
                
                <div className={`space-y-0 transition-all duration-700 delay-500 ${i === current ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                  <p className="text-yellow-400 font-black text-base md:text-2xl uppercase tracking-tight">{slide.tag}</p>
                  <h2 className="text-[40px] md:text-[100px] font-black text-white leading-none tracking-tight flex items-center justify-center md:justify-start">
                    {slide.upto}<span className="text-[20px] md:text-[50px] ml-1 md:ml-2">%</span><span className="text-[10px] md:text-[20px] ml-2 md:ml-4 self-center rotate-[-90deg] origin-left">OFF</span>
                  </h2>
                </div>

                <div className={`space-y-3 md:space-y-4 transition-all duration-700 delay-700 ${i === current ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                  <p className="text-white/80 text-base md:text-2xl font-bold tracking-tight">
                    Prices Starting From <span className="text-yellow-400">{slide.price}</span>
                  </p>
                  <div className="pt-4 md:pt-6">
                    <Button asChild size="lg" className="bg-[#facc15] hover:bg-[#eab308] text-black rounded-full px-8 md:px-12 h-12 md:h-14 text-sm md:text-xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all hover:scale-105 active:scale-95">
                      <Link to="/product/$slug" params={{ slug: banners?.[i]?.slug || banners?.[0]?.slug || "product" }}>
                         Get Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30 pointer-events-auto">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full shadow-lg ${i === current ? "h-1.5 w-8 md:w-10 bg-white" : "h-1.5 w-1.5 bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}function FlagshipSlider({ banners }: { banners: Product[] }) {
  const [current, setCurrent] = useState(0);

  const localBanners = [
    { img: best1, product: banners?.[0] },
    { img: best2, product: banners?.[1] },
    { img: best3, product: banners?.[2] },
  ].filter(b => b.product !== undefined);

  const displayBanners = localBanners.length > 0 ? localBanners : [
    { img: best1, product: null },
    { img: best2, product: null },
    { img: best3, product: null },
  ];

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % displayBanners.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? displayBanners.length - 1 : prev - 1));
  };

  return (
    <section className="relative w-full max-w-[1920px] mx-auto px-4 md:px-[40px] py-4 md:py-6 select-none">
      <div className="relative w-full h-[60vh] md:h-[700px] overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[#f5f5f5] shadow-lg flex items-center group">
        
        {/* Top Hanging "BEST SELLER" Badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white px-8 md:px-12 py-2 md:py-3 rounded-b-[1rem] shadow-sm z-30 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs flex gap-2 items-center">
          <span className="text-neutral-500 font-bold">BEST</span>
          <span className="text-[#E52823] font-bold">SELLER</span>
        </div>

        {displayBanners.map((slide, i) => {
          const content = (
            <div className="relative w-full h-full">
              <img 
                src={slide.img} 
                alt={`Best Seller ${i + 1}`} 
                className="w-full h-full object-cover" 
              />
            </div>
          );

          if (slide.product) {
            return (
              <Link
                to="/product/$slug"
                params={{ slug: slide.product.slug }}
                key={i}
                className={`absolute inset-0 w-full h-full block transition-opacity duration-1000 ease-in-out cursor-pointer ${i === current ? "opacity-100 z-20" : "opacity-0 z-10 pointer-events-none"}`}
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={i}
              className={`absolute inset-0 w-full h-full block transition-opacity duration-1000 ease-in-out ${i === current ? "opacity-100 z-20" : "opacity-0 z-10 pointer-events-none"}`}
            >
              {content}
            </div>
          );
        })}

        {/* Navigation Arrows (Left / Right Edges) */}
        <button onClick={prevSlide} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-600 transition-all z-30 opacity-0 group-hover:opacity-100 shadow-md">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button onClick={nextSlide} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-600 transition-all z-30 opacity-0 group-hover:opacity-100 shadow-md">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        {/* Carousel Indicators (Bottom Center) */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 pointer-events-auto">
          {displayBanners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
              className={`transition-all duration-300 rounded-full ${i === current ? "h-2 w-6 md:w-8 bg-[#E52823]" : "h-2 w-2 bg-white/50 hover:bg-white"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScrollRevealText({ text }: { text: string }) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const elementHeight = rect.height;
      const startReveal = windowHeight - 100;
      const endReveal = windowHeight * 0.2;
      const totalRange = startReveal - endReveal;
      
      const currentPos = startReveal - rect.top;
      let progress = currentPos / totalRange;
      progress = Math.max(0, Math.min(1, progress));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const words = text.split(" ");
  
  return (
    <h2 
      ref={containerRef}
      className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-tighter text-neutral-900 leading-[1.1] max-w-4xl mx-auto"
    >
      {words.map((word, index) => {
        const wordCount = words.length;
        const startThreshold = index / wordCount;
        const endThreshold = (index + 2) / wordCount; 
        
        let opacity = 0.15;
        if (scrollProgress > startThreshold) {
          const factor = (scrollProgress - startThreshold) / (endThreshold - startThreshold);
          opacity = 0.15 + (Math.min(1, factor) * 0.85);
        }

        const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        const isHighlighted = cleanWord === "premium" || cleanWord === "technology" || cleanWord === "designed";

        return (
          <span 
            key={index} 
            style={{ opacity }}
            className={`inline-block mr-[0.25em] transition-opacity duration-150 ease-out ${isHighlighted ? "text-[#00a651] font-semibold" : ""}`}
          >
            {word}
          </span>
        );
      })}
    </h2>
  );
}