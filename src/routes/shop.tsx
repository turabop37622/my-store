import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SearchSchema = z.object({
  category: z.any().optional(),
  page: z.any().optional(),
});

const CATEGORIES = ["All", "Smart Watches", "Earbuds", "Headphones", "Speakers", "Accessories"];
const ITEMS_PER_PAGE = 15;
const API_URL = "https://breezygo-admin-backend.turabop37622.workers.dev";

export const Route = createFileRoute("/shop")({
  validateSearch: (s) => SearchSchema.parse(s),
  component: Shop,
  head: () => ({
    meta: [{ title: "Shop All — BreezyGo" }],
  }),
});

function Shop() {
  const search = Route.useSearch();
  const category = search.category;
  const page = search.page;

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: typeof window !== "undefined",
  });

  const filtered =
    category && category !== "All"
      ? (products ?? []).filter((p: any) => p.category === category)
      : products ?? [];

  const safePage = isNaN(Number(page)) ? 1 : Number(page);
  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / ITEMS_PER_PAGE));
  const currentPage = Math.max(1, Math.min(safePage, totalPages));

  const paginatedItems = (filtered ?? []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-background pt-32 md:pt-40 pb-20">
      <div className="mx-auto max-w-[1600px] px-4 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 border-b border-white/5">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
              {category || "Shop All"} <span className="text-primary/80">Products</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Showing {filtered.length} premium tech essentials
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ category: c === "All" ? undefined : c, page: 1 }}
                className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${(category === c || (c === "All" && !category))
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-12">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-[2rem] border border-white/5">
            <h3 className="text-lg font-bold uppercase">No products found</h3>
            <p className="text-white/40 mt-2">Try adjusting your filters or category selection.</p>
            <Button asChild variant="outline" className="rounded-full px-8 mt-4">
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-12">
              {paginatedItems.map((p: any) => (
                p && <ProductCard key={p?.id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-20 flex items-center justify-center gap-3">
                <Link
                  disabled={currentPage <= 1}
                  to="/shop"
                  search={{ ...search, page: Math.max(1, currentPage - 1) }}
                  className={`h-12 w-12 rounded-full flex items-center justify-center border border-border transition-all ${currentPage <= 1 ? "opacity-30 pointer-events-none" : "hover:border-primary hover:text-primary active:scale-95"
                    }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Link
                      key={i}
                      to="/shop"
                      search={{ ...search, page: i + 1 }}
                      className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === i + 1
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>

                <Link
                  disabled={currentPage >= totalPages}
                  to="/shop"
                  search={{ ...search, page: Math.min(totalPages, currentPage + 1) }}
                  className={`h-12 w-12 rounded-full flex items-center justify-center border border-border transition-all ${currentPage >= totalPages ? "opacity-30 pointer-events-none" : "hover:border-primary hover:text-primary active:scale-95"
                    }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}