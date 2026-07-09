import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { getProductImage } from "@/lib/product-images";

export function CartSheet() {
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle>Your Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="h-16 w-16 rounded-full bg-secondary inline-flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Add some products to start shopping.</p>
            <Button asChild className="mt-6 rounded-full" onClick={close}>
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((i) => (
                <div key={i.product_id} className="flex gap-3">
                  <Link
                    to="/product/$slug"
                    params={{ slug: i.slug }}
                    onClick={close}
                    className="shrink-0"
                  >
                    <img
                      src={getProductImage(i.image_url)}
                      alt={i.name}
                      width={72}
                      height={72}
                      className="h-18 w-18 rounded-lg object-cover bg-secondary"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/product/$slug"
                      params={{ slug: i.slug }}
                      onClick={close}
                      className="text-sm font-medium hover:underline line-clamp-2"
                    >
                      {i.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{i.category}</div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="inline-flex items-center border border-border rounded-full">
                        <button
                          type="button"
                          onClick={() => setQty(i.product_id, i.quantity - 1)}
                          className="h-7 w-7 inline-flex items-center justify-center hover:bg-secondary rounded-l-full"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{i.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQty(i.product_id, i.quantity + 1)}
                          className="h-7 w-7 inline-flex items-center justify-center hover:bg-secondary rounded-r-full"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold">
                        Rs {(() => {
                          const qty2 = i.qty2_discount_percent !== undefined ? i.qty2_discount_percent : 3;
                          const qty3 = i.qty3_discount_percent !== undefined ? i.qty3_discount_percent : 5;
                          let disc = 0;
                          if (i.quantity === 2) disc = qty2;
                          else if (i.quantity >= 3) disc = qty3;
                          const finalPrice = Math.round(i.price * (1 - disc / 100));
                          return (finalPrice * i.quantity).toLocaleString();
                        })()}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i.product_id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-5 space-y-3 bg-secondary/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary font-medium">FREE</span>
              </div>
              <Button asChild size="lg" className="w-full rounded-full h-12" onClick={close}>
                <Link to="/checkout">Checkout · Rs {subtotal.toLocaleString()}</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
