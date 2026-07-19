import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products.functions";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);

  const price = Number(product?.price ?? 0);
  const originalPrice = Number(product?.original_price ?? 0);
  const slug = product?.slug ?? "";
  const name = product?.name ?? "Product";
  const imageUrl = product?.image_url || (product?.images && product.images.length > 0 ? product.images[0] : null);

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const isOutOfStock = product?.stock === 0 || product?.is_active === false;

  return (
    <div className="group flex flex-col relative bg-transparent transition-all duration-500">
      <Link
        to="/product/$slug"
        params={{ slug: slug }}
        className="relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-[#f8f9fa] isolate"
      >
        {(product?.badge || discount || isOutOfStock) && (
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
            {isOutOfStock && (
              <span className="bg-neutral-900/90 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                Sold Out
              </span>
            )}
            {!isOutOfStock && discount && (
              <span className="bg-[#00a651]/10 text-[#00a651] border border-[#00a651]/20 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                Save {discount}%
              </span>
            )}
            {product?.badge && (
              <span className="bg-white/80 backdrop-blur-md text-neutral-900 border border-black/5 shadow-sm text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                {product.badge}
              </span>
            )}
          </div>
        )}
        
        {/* Subtle radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
        
        <img
          src={imageUrl || "https://placehold.co/1024x1024/f8f9fa/d1d5db?text=No+Image"}
          alt={name}
          width={1024}
          height={1024}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 will-change-transform"
          onError={(e) => { e.currentTarget.src = "https://placehold.co/1024x1024/f8f9fa/d1d5db?text=No+Image"; }}
        />
        
        {/* Quick Add Overlay Button (Desktop) */}
        {!isOutOfStock && (
          <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20 hidden md:block">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                add({
                  product_id: product?.id,
                  slug: slug,
                  name: name,
                  price: price,
                  image_url: product?.image_url,
                  category: product?.category,
                });
              }}
              className="w-full rounded-full bg-white/90 backdrop-blur-lg border border-black/5 text-neutral-900 hover:bg-black hover:text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-colors h-12 font-semibold tracking-wide"
            >
              <Plus className="w-4 h-4 mr-2" /> Quick Add
            </Button>
          </div>
        )}
      </Link>

      <div className="mt-5 px-1 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              to="/product/$slug"
              params={{ slug: slug }}
              className="font-semibold text-base md:text-lg tracking-tight text-neutral-900 hover:text-[#00a651] transition-colors line-clamp-1"
            >
              {name}
            </Link>
            <p className="text-[13px] text-neutral-600 mt-1 line-clamp-1 font-medium">{product?.tagline || "Premium Tech Essential"}</p>
          </div>
          {product?.rating && (
            <div className="flex items-center gap-1 bg-neutral-200 px-2 py-1 rounded-md text-xs text-neutral-700 font-semibold shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {Number(product.rating).toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-lg text-neutral-900">Rs {price.toLocaleString()}</span>
            {originalPrice > price && (
              <span className="text-[13px] text-neutral-500 line-through font-medium">
                Rs {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Mobile Add to Cart */}
          {!isOutOfStock && (
            <button
              aria-label={`Add ${name} to cart`}
              className="md:hidden w-12 h-12 rounded-full bg-neutral-200 text-neutral-900 flex items-center justify-center active:scale-95 transition-transform"
              onClick={(e) => {
                e.preventDefault();
                add({
                  product_id: product?.id,
                  slug: slug,
                  name: name,
                  price: price,
                  image_url: product?.image_url,
                  category: product?.category,
                });
              }}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}