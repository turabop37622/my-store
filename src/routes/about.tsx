import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Users, Globe2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({ meta: [{ title: "About Us — BreezyGo" }] }),
});

function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Customer First",
      desc: "Every decision we make starts with you. From product selection to after-sales support, your satisfaction drives us."
    },
    {
      icon: Zap,
      title: "Quality Obsessed",
      desc: "We rigorously test every product before it reaches you. No compromise on quality, ever."
    },
    {
      icon: Globe2,
      title: "Pakistan Proud",
      desc: "Built by Pakistanis, for Pakistanis. We understand local needs and deliver with local soul."
    },
    {
      icon: Users,
      title: "Community Driven",
      desc: "Over 10,000+ happy customers across Pakistan. We grow together as a tech-loving family."
    }
  ];

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 md:pt-40 pb-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10">

        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
            Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            We Bring <span className="text-emerald-500">Premium Tech</span><br />To Every Pakistani
          </h1>
          <p className="text-slate-500 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            BreezyGo started with a simple mission: make world-class audio and wearable technology accessible to everyone in Pakistan — at prices that make sense.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "50+", label: "Products" },
            { number: "100+", label: "Cities Covered" },
            { number: "4.8★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
              <p className="text-3xl md:text-4xl font-bold text-slate-900">{stat.number}</p>
              <p className="text-sm font-medium text-slate-500 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-14 shadow-sm mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              BreezyGo was born in 2024 when a group of tech enthusiasts noticed a gap in the Pakistani market — premium audio and wearable tech was either overpriced or low quality. We decided to change that.
            </p>
            <p>
              We partner directly with top manufacturers to bring you products that rival international brands at a fraction of the cost. Every product goes through our rigorous 7-point quality check before it earns the BreezyGo badge.
            </p>
            <p>
              Today, we proudly serve customers across 100+ cities in Pakistan with free shipping and Cash on Delivery. Our 7-day replacement warranty means you shop with complete peace of mind.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-12">What We Stand For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <div key={i} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-14 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to experience BreezyGo?</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8">
              Explore our collection and join 10,000+ happy customers across Pakistan.
            </p>
            <Button asChild className="bg-[#00a859] hover:bg-[#00904a] text-white rounded-full h-14 px-10 font-bold text-lg shadow-xl">
              <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square bg-gradient-to-tr from-emerald-500/20 to-blue-500/10 blur-[100px] pointer-events-none"></div>
        </div>

      </div>
    </main>
  );
}
