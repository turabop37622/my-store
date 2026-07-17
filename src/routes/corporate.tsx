import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Users, Rocket, Trophy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/corporate")({
  component: CorporatePage,
  head: () => ({
    meta: [{ title: "Corporate Solutions — BreezyGo" }],
  }),
});

function CorporatePage() {
  return (
    <main className="min-h-screen bg-background pt-32 md:pt-40 pb-20">
      <div className="mx-auto max-w-[1920px] px-4 md:px-[40px]">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto mb-20">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-2 rounded-full">B2B Solutions</span>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-none">
            Corporate & Bulk <br /> <span className="text-primary/80">Partnerships</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            BreezyGo's premium gadgets now for your business. Best deals for bulk orders and corporate gifting.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-bold uppercase tracking-widest shadow-xl">
              <Link to="/contact">Contact Sales</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-2xl font-bold uppercase tracking-widest border-2">
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: Building2, title: "Custom Branding", desc: "Your company logo on products and packaging." },
            { icon: Users, title: "Bulk Pricing", desc: "Exclusive discounts and flexible payments on large orders." },
            { icon: Rocket, title: "Fast Delivery", desc: "Dedicated logistics support across Pakistan." },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border p-10 rounded-[2.5rem] hover:border-primary/50 transition-all group">
              <div className="h-16 w-16 rounded-3xl bg-secondary flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <f.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Why Partner With Us */}
        <div className="bg-[#0f0f0f] text-white rounded-[3rem] p-10 md:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 blur-[120px] rounded-full"></div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Why Partner <br /> with BreezyGo?</h2>
              <ul className="space-y-6">
                {[
                  "Pakistan's leading digital lifestyle brand",
                  "Dedicated relationship manager for each account",
                  "7-day warranty and post-sales support",
                  "Flexible credit terms for recurring clients"
                ].map((text) => (
                  <li key={text} className="flex items-center gap-4">
                    <CheckCircle2 className="text-primary h-6 w-6 shrink-0" />
                    <span className="text-lg font-medium text-white/80">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 aspect-video flex items-center justify-center">
              <Trophy className="h-32 w-32 text-primary opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
