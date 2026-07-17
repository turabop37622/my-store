import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu, X, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useState, useEffect } from "react";
import { useHeaderTheme } from "@/lib/header-theme";

import { API_URL } from "@/lib/db";

const NAV_LINKS = [
  { label: "Home", to: "/", search: undefined },
  { label: "Smart Watches", to: "/shop", search: { category: "Smart Watches" } },
  { label: "BreezyGo Earbuds", to: "/shop", search: { category: "Earbuds" } },
  { label: "Headphones", to: "/shop", search: { category: "Headphones" } },
  { label: "Speakers", to: "/shop", search: { category: "Speakers" } },
  { label: "Support", to: "/support", search: undefined },
];

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  category: string;
}

export function Header() {
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const open = useCart((s) => s.open);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { color: themeColor } = useHeaderTheme();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 45);

      if (currentScrollY < 100) {
        setIsVisible(true);
      } else {
        if (currentScrollY > lastScrollY) {
          setIsVisible(false); // Scrolling down
        } else {
          setIsVisible(true);  // Scrolling up
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch search results
  useEffect(() => {
    if (debouncedQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(debouncedQuery.trim())}`)
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((data) => {
        setSearchResults(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setIsLoading(false);
      });
  }, [debouncedQuery]);

  const handleSearchOpen = () => {
    setSearchOpen(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const getGlassColor = (color: string) => {
    if (color && color.startsWith('#') && color.length === 7) {
      return color + '80'; // 50% opacity
    }
    return color;
  };

  const isDarkTheme = isHome && !isScrolled;

  const headerStyle = {
    backgroundColor: isDarkTheme ? getGlassColor(themeColor) : 'rgba(255, 255, 255, 0.85)',
  };

  const isProductPage = location.pathname.startsWith("/product/");
  const isHomePage = location.pathname === "/";

  return (
    <>
      <header
        style={headerStyle}
        className={`fixed left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] md:w-[calc(100%-5rem)] max-w-[1840px] z-50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] backdrop-blur-xl border rounded-full ${
          isScrolled 
            ? (isHomePage ? 'top-8 md:top-4 shadow-2xl' : 'top-3 md:top-4 shadow-2xl')
            : (isHomePage ? 'top-11 md:top-6 shadow-xl' : 'top-4 md:top-6 shadow-xl')
        } ${isDarkTheme ? 'border-white/10' : 'border-neutral-200/50'} ${
          (!isVisible || (isProductPage && isScrolled)) ? '-translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Main Header Pill */}
        <div className="w-full px-4 md:px-10 h-12 md:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-medium text-xl shadow-lg group-hover:scale-105 transition-transform ${isDarkTheme ? 'bg-white text-black' : 'bg-neutral-900 text-white'}`}>
                B
              </div>
              <span className={`text-lg font-normal tracking-tighter hidden sm:block transition-colors ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}>BreezyGo</span>
            </Link>
          {/* Desktop Nav Segments */}
          <nav className={`hidden lg:flex items-center p-1.5 rounded-full border transition-colors ${isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-neutral-100/50 border-neutral-200/50'}`}>
            {NAV_LINKS.map((link) => {
              // Exact active matching logic
              const isActive = link.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.to) && (
                    link.search?.category ? (location.search as any)?.category === link.search.category : true
                  );

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  search={link.search}
                  className={`px-5 py-2 text-[13px] font-medium rounded-full tracking-wide transition-all duration-300 ${
                    isActive
                      ? isDarkTheme ? "bg-white text-black shadow-md scale-105" : "bg-neutral-900 text-white shadow-md scale-105"
                      : isDarkTheme ? "text-white/60 hover:text-white hover:bg-white/10" : "text-neutral-500 hover:text-neutral-900 hover:bg-white/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={handleSearchOpen} className={`hover:opacity-70 transition-opacity ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}>
              <Search className="h-5 w-5" />
            </button>
            <button onClick={open} className={`relative group hover:opacity-70 transition-opacity ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}>
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#00a651] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setMobileOpen(true)} className={`lg:hidden ml-2 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#0f0f0f] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <span className="text-lg font-normal tracking-tighter text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-6 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  search={link.search}
                  onClick={() => setMobileOpen(false)}
                  className="block py-4 px-4 text-lg font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                {[
                  { label: "Track Order", to: "/track-order" },
                  { label: "Contact Us", to: "/contact" },
                  { label: "Corporate", to: "/corporate" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 px-4 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="p-6 border-t border-white/10">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full h-14 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold rounded-2xl transition-all"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleSearchClose} />
          <div className="relative max-w-2xl mx-auto mt-32 px-4">
            <div className="bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-4 p-6">
                <Search className="h-6 w-6 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 text-xl font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      handleSearchClose();
                      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                    }
                    if (e.key === "Escape") handleSearchClose();
                  }}
                />
                <button onClick={handleSearchClose} className="text-slate-400 hover:text-slate-900 shrink-0">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Live Search Results */}
              {searchQuery.trim() && (
                <div className="border-t border-slate-100">
                  {searchQuery.trim().length < 3 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      Please enter at least 3 characters to search...
                    </div>
                  ) : isLoading ? (
                    <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to="/product/$slug"
                          params={{ slug: product.slug }}
                          onClick={handleSearchClose}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#10b981] transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400">{product.category}</p>
                          </div>
                          <p className="text-sm font-bold text-[#10b981] shrink-0">
                            Rs {product.price.toLocaleString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      No products found for "<span className="font-semibold text-slate-600">{searchQuery}</span>"
                    </div>
                  )}
                </div>
              )}

              {/* Popular Tags — show when no query */}
              {!searchQuery.trim() && (
                <div className="border-t border-slate-100 p-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Popular</p>
                  <div className="flex flex-wrap gap-2">
                    {["Earbuds", "Smart Watches", "Headphones", "Speakers"].map((q) => (
                      <Link
                        key={q}
                        to="/shop"
                        search={{ category: q }}
                        onClick={handleSearchClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-semibold text-slate-700 transition-colors"
                      >
                        {q}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}