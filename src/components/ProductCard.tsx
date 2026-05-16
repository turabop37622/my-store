import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products.functions";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  
  const price = Number(product?.price ?? 0);
  const originalPrice = Number(product?.original_price ?? 0);
  const slug = product?.slug ?? "";
  const name = product?.name ?? "Product";

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <div className="group flex flex-col">
      <Link
        to="/product/$slug"
        params={{ slug: slug }}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-secondary"
      >
        {(product?.badge || discount) && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
            {discount && (
              <span className="bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-lg">
                SAVE {discount}%
              </span>
            )}
            {product?.badge && (
              <span className="bg-background/95 text-foreground text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border border-border shadow-sm backdrop-blur-md">
                {product.badge}
              </span>
            )}
          </div>
        )}
        <img
          src={getProductImage(product?.image_url)}
          alt={name}
          width={1024}
          height={1024}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <button
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
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl active:scale-95"
          aria-label={`Add ${name} to cart`}
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </Link>
      <div className="mt-4 px-1">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/product/$slug"
            params={{ slug: slug }}
            className="font-bold text-[15px] hover:text-primary transition-colors line-clamp-1"
          >
            {name}
          </Link>
          {product?.rating && (
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0 font-semibold">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
              {Number(product.rating).toFixed(1)}
            </div>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground mt-1 line-clamp-1">{product?.tagline}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold text-base text-foreground">Rs {price.toLocaleString()}</span>
          {originalPrice > price && (
            <span className="text-xs text-muted-foreground line-through font-medium">
              Rs {originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-4 rounded-full text-xs font-bold h-10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
          onClick={() =>
            add({
              product_id: product?.id,
              slug: slug,
              name: name,
              price: price,
              image_url: product?.image_url,
              category: product?.category,
            })
          }
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}




