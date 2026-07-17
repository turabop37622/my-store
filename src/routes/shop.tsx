import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, Watch, Headphones, Headset, Speaker, Cable } from "lucide-react";

const SearchSchema = z.object({
  category: z.any().optional(),
  page: z.any().optional(),
  q: z.string().optional(),
});

const CATEGORIES = [
  { name: "All", icon: LayoutGrid },
  { name: "Smart Watches", icon: Watch },
  { name: "Earbuds", icon: Headphones },
  { name: "Headphones", icon: Headset },
  { name: "Speakers", icon: Speaker },
  { name: "Accessories", icon: Cable },
];
const ITEMS_PER_PAGE = 15;
import { API_URL } from "@/lib/db";

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
  const q = (search as any).q as string | undefined;

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching products in shop:", err);
        return [];
      }
    },
  });

  const filtered = (() => {
    let list = products ?? [];
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter((p: any) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.tagline && p.tagline.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
      );
    } else if (category && category !== "All") {
      list = list.filter((p: any) => p.category === category);
    }
    return list;
  })();

  const safePage = isNaN(Number(page)) ? 1 : Number(page);
  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / ITEMS_PER_PAGE));
  const currentPage = Math.max(1, Math.min(safePage, totalPages));

  const paginatedItems = (filtered ?? []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-background pt-32 md:pt-40 pb-20">
      <div className="mx-auto max-w-[1920px] px-4 md:px-[40px]">
        <div className="flex flex-col gap-10 py-12 md:py-20 border-b border-border/40">
          <div className="space-y-4 text-center md:text-left max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tighter text-neutral-900 leading-none">
              {q ? `Search: "${q}"` : category || "All Products"}.
            </h1>
            <p className="text-neutral-500 text-lg md:text-xl font-medium tracking-tight">
              Showing {filtered.length} premium tech essentials
            </p>
          </div>

          <div className="w-full overflow-x-auto pb-2 scrollbar-none mt-4 md:mt-10">
            <div className="inline-flex items-center gap-8 border-b border-neutral-200 w-max min-w-full">
              {CATEGORIES.map((c) => {
                const isActive = category === c.name || (c.name === "All" && !category);
                return (
                  <Link
                    key={c.name}
                    to="/shop"
                    search={{ category: c.name === "All" ? undefined : c.name, page: 1 }}
                    className={`pb-5 text-[13px] md:text-sm font-semibold tracking-widest uppercase transition-colors relative whitespace-nowrap ${
                      isActive
                        ? "text-neutral-900"
                        : "text-neutral-400 hover:text-neutral-900"
                    }`}
                  >
                    {c.name}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-t-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-16 mt-12">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[24px]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <h3 className="text-3xl font-normal tracking-tight text-neutral-900">No products found</h3>
            <p className="text-neutral-500 mt-3 text-lg">Try adjusting your filters or category selection.</p>
            <Button asChild variant="outline" className="rounded-full px-8 mt-8 h-12">
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-16 mt-16">
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