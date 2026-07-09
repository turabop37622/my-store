import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Truck, ShieldCheck, Headphones, Zap, Mail, ArrowRight, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setSubStatus("error");
      } else {
        setSubStatus("done");
        setEmail("");
      }
    } catch {
      setErrorMsg("Could not connect. Try again.");
      setSubStatus("error");
    }
  };

  return (
    <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 mt-20 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto max-w-[1600px] px-4 md:px-10">
        {/* Top Section: Newsletter & Brand */}
        <div className="grid lg:grid-cols-12 gap-16 pb-20 border-b border-white/5">
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500">
                B
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase text-white">BreezyGo</span>
            </Link>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Pakistan's premium digital lifestyle brand. We bring you world-class audio, smart wearables, and tech essentials with a touch of local soul.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Youtube, href: "#", label: "Youtube" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group"
                >
                  <s.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  Join the Club
                </div>
                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  Unlock 5% OFF <br /> On Your First Order
                </h3>
                <p className="text-white/40 text-sm font-medium">
                  Be the first to know about new drops, exclusive sales, and tech news.
                </p>

                {subStatus === "done" ? (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 max-w-md">
                    <span className="text-emerald-400 text-xl">✓</span>
                    <div>
                      <p className="text-emerald-400 font-bold text-sm">You're on the list!</p>
                      <p className="text-white/40 text-xs mt-0.5">Admin will review and send your promo code soon.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={handleSubscribe}>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={subStatus === "loading"}
                        required
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
                      />
                      <Button
                        type="submit"
                        disabled={subStatus === "loading"}
                        className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                      >
                        {subStatus === "loading" ? "..." : <>Subscribe <ArrowRight className="ml-2 h-4 w-4" /></>}
                      </Button>
                    </form>
                    {subStatus === "error" && (
                      <p className="text-red-400 text-sm -mt-2">{errorMsg}</p>
                    )}
                  </>
                )}
              </div>
              {/* Decorative circle */}
              <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            </div>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-20">
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-white/30">Quick Shop</h4>
            <ul className="space-y-4">
              {["Earbuds", "Smart Watches", "Headphones", "Speakers", "Accessories"].map((link) => (
                <li key={link}>
                  <Link
                    to="/shop"
                    search={{ category: link }}
                    className="text-white/60 hover:text-primary hover:translate-x-1 transition-all inline-block font-medium"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-white/30">Customer Help</h4>
            <ul className="space-y-4">
              {[
                { label: "Track Your Order", to: "/track-order" },
                { label: "Shipping Policy", to: "/shipping-policy" },
                { label: "Return & Refund", to: "/returns-policy" },
                { label: "Support Center", to: "/support" },
                { label: "Contact Us", to: "/contact" },
                { label: "About Us", to: "/about" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-primary hover:translate-x-1 transition-all inline-block font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-white/30">Shop Perks</h4>
            <div className="space-y-6">
              {[
                { icon: Truck, title: "Free Shipping", sub: "Pakistan-wide delivery" },
                { icon: ShieldCheck, title: "Official Warranty", sub: "7-Day easy replacement" },
                { icon: Zap, title: "Fast COD", sub: "Pay when you receive" },
              ].map((perk) => (
                <div key={perk.title} className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <perk.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-white tracking-widest">{perk.title}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{perk.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <span>© {new Date().getFullYear()} BreezyGo Pakistan. All Rights Reserved.</span>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Made in Pakistan</span>
            <div className="h-3 w-[1px] bg-white/10" />
            <span className="text-red-500 animate-pulse text-xs">❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}