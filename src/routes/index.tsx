import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { listProducts, type Product } from "@/lib/products.functions";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getProductImage } from "@/lib/product-images";
import { ArrowRight, Headphones, Watch, Speaker, Wind, Cable } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "BreezyGo — Earbuds, Watches & Lifestyle Tech | COD Pakistan" },
      {
        name: "description",
        content:
          "Premium earbuds, smart watches, headphones & accessories. Free shipping & Cash on Delivery across Pakistan.",
      },
    ],
  }),
});

const CATEGORIES = [
  { name: "Earbuds", icon: Headphones },
  { name: "Smart Watches", icon: Watch },
  { name: "Headphones", icon: Headphones },
  { name: "Speakers", icon: Speaker },
  { name: "Accessories", icon: Cable },
];

function Index() {
  const fetchProducts = useServerFn(listProducts);
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  const featured = (products ?? []).filter((p) => p?.is_featured);
  const trending = (products ?? []).slice(0, 8);
  const banners: Product[] = (featured.length ? featured : trending).slice(0, 4);


  return (
    <div className="bg-background min-h-screen">
      {/* Hero carousel */}
      <HeroCarousel banners={banners} loading={isLoading} />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c?.name}
                to="/shop"
                search={{ category: c?.name }}
                className="group rounded-3xl bg-secondary hover:bg-accent transition-colors p-5 flex flex-col items-center text-center gap-2"
              >
                <span className="h-12 w-12 rounded-full bg-background inline-flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {Icon && <Icon className="h-5 w-5" />}
                </span>
                <span className="font-semibold text-sm">{c?.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-[1600px] px-4 md:px-10 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-primary">
              // Best Sellers
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 uppercase tracking-tighter">Most loved <span className="text-primary/80">this week</span></h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full border border-border/50 hover:bg-secondary transition-all">
            <Link to="/shop">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>


        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {(featured.length ? featured : trending).map((p) => (
              p && <ProductCard key={p?.id} product={p} />
            ))}
          </div>
        )}
      </section>


      {/* Creative Pakistan COD Banner */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-4 md:px-10">
          <div className="relative group overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#064e3b] via-[#022c22] to-black p-8 md:p-20 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Background Decoration */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
              <svg width="600" height="600" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5" className="scale-[3]">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>

            <div className="relative z-10 space-y-8 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-green-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  Pakistan's Most Trusted Tech
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-white leading-none">
                  PAKISTAN-WIDE <br />
                  <span className="text-green-500">COD</span> SERVICE
                </h2>
                <p className="text-white/60 text-base md:text-lg font-medium max-w-lg">
                  Order without online payment. Pay cash on delivery. We deliver all over Pakistan.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-4">
                <Button asChild size="lg" className="bg-[#00a651] hover:bg-[#008a44] text-white rounded-full px-12 h-14 text-lg font-black uppercase tracking-widest shadow-[0_0_40px_rgba(0,166,81,0.3)] transition-all hover:scale-105 active:scale-95">
                  <Link to="/shop">Start Shopping</Link>
                </Button>
                
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Proudly</span>
                  <span className="text-white font-black text-xl tracking-tighter uppercase">Made in Pakistan</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-green-500/20 rounded-full blur-[100px] absolute animate-pulse"></div>
              <div className="relative text-white/10 text-[150px] md:text-[200px] font-black select-none">PK</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import hero2 from "@/assets/hero 2.png";
import hero3 from "@/assets/hero 3.png";

import { useHeaderTheme } from "@/lib/header-theme";

function HeroCarousel({ banners, loading }: { banners: Product[]; loading: boolean }) {
  const [current, setCurrent] = useState(0);
  const { setColor } = useHeaderTheme();
  
  const slides = [
    { 
      img: hero2, 
      upto: "65", 
      label: "BreezyGo", 
      tag: "NEW", 
      price: "4,499 PKR",
      color: "#0f172a" // Dark Indigo
    },
    { 
      img: hero3, 
      upto: "50", 
      label: "BreezyGo", 
      tag: "HOT", 
      price: "1,999 PKR",
      color: "#171717" // Rich Charcoal
    }
  ];

  useEffect(() => {
    // Update global header color when slide changes
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
        <Skeleton className="w-full h-[60vh] md:h-[92vh]" />
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-background pt-[115px]">
      {/* Aspect-Ratio based Hero Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-video md:aspect-[2.4/1] bg-black overflow-hidden flex items-center shadow-2xl">
         
         {/* Slides Container */}
         {slides.map((slide, i) => (
           <div 
             key={i}
             className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
           >
              {/* Background Image with Slow Zoom */}
              <div className={`w-full h-full transition-transform duration-[5000ms] ease-linear ${i === current ? 'scale-110' : 'scale-100'}`}>
                <img
                  src={slide.img}
                  alt={`Banner ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10"></div>

              {/* Content Layer with Staggered Animations */}
              <div className="relative z-20 w-full max-w-[1600px] mx-auto px-4 md:px-10 h-full flex flex-col justify-center">
                 <div className="max-w-2xl space-y-6 md:space-y-8 text-center md:text-left">
                    
                    {/* Label - Slide Down */}
                    <div className={`flex items-center justify-center md:justify-start gap-4 transition-all duration-700 delay-300 ${i === current ? 'translate-y-0 opacity-50' : '-translate-y-10 opacity-0'}`}>
                       <span className="text-white font-black text-xl md:text-2xl tracking-tighter uppercase">{slide.label}</span>
                       <div className="h-8 md:h-10 w-[1.5px] bg-white hidden md:block"></div>
                    </div>

                    {/* Main Title - Slide Up */}
                    <div className={`space-y-0 transition-all duration-700 delay-500 ${i === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                       <p className="text-yellow-400 font-black text-base md:text-2xl uppercase tracking-tight">{slide.tag}</p>
                       <h2 className="text-[40px] md:text-[100px] font-black text-white leading-none tracking-tight flex items-center justify-center md:justify-start">
                          {slide.upto}<span className="text-[20px] md:text-[50px] ml-1 md:ml-2">%</span><span className="text-[10px] md:text-[20px] ml-2 md:ml-4 self-center rotate-[-90deg] origin-left">OFF</span>
                       </h2>
                    </div>

                    {/* Description & Button - Fade In */}
                    <div className={`space-y-3 md:space-y-4 transition-all duration-700 delay-700 ${i === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                       <p className="text-white/80 text-base md:text-2xl font-bold tracking-tight">
                          Prices Starting From <span className="text-yellow-400">{slide.price}</span>
                       </p>
                       <div className="pt-4 md:pt-6">
                          <Button asChild size="lg" className="bg-[#facc15] hover:bg-[#eab308] text-black rounded-full px-8 md:px-12 h-12 md:h-14 text-sm md:text-xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all hover:scale-105 active:scale-95">
                             <Link 
                               to="/product/$slug" 
                               params={{ slug: banners?.[i]?.slug || banners?.[0]?.slug || 'product' }}
                             >
                               Get Now
                             </Link>
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         ))}

         {/* Indicators Dots */}
         <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {slides.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full shadow-lg ${i === current ? 'h-1.5 w-8 md:w-10 bg-white' : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
         </div>
      </div>
    </section>
  );
}














