import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Target, Zap, Globe2 } from "lucide-react";

export const Route = createFileRoute("/vision-2026")({
  component: VisionPage,
  head: () => ({
    meta: [{ title: "Vision 2026 — BreezyGo" }],
  }),
});

function VisionPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-32 md:pt-40 pb-20">
      <div className="mx-auto max-w-[1600px] px-4 md:px-10">
        {/* Intro */}
        <div className="max-w-4xl space-y-8 mb-24">
          <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">The Future is Now</span>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tight leading-none">
            Vision <br /> <span className="text-white/40">2026</span>
          </h1>
          <p className="text-white/60 text-xl md:text-2xl font-medium leading-relaxed">
            Humara maqsad sirf gadgets bechna nahi, balki Pakistan mein aik digital lifestyle revolution lana hai. 2026 tak hum chahte hain ke har Pakistani ke pas affordable aur world-class technology ho.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Sparkles, title: "Innovation", desc: "Latest technology ko local zarooriyat ke mutabiq customize karna." },
            { icon: Target, title: "Accessibility", desc: "Pakistan ke har kone tak tech ko asani se pahunchana." },
            { icon: Zap, title: "Quality", desc: "International standards se behtar quality aur durability faraham karna." },
            { icon: Globe2, title: "Community", desc: "Aik aisi digital community banana jo technology se empower ho." },
          ].map((item) => (
            <div key={item.title} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Big Statement */}
        <div className="mt-32 py-20 border-t border-white/10 text-center">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">
            Pakistan's Next <br /> Tech Giant.
          </h2>
          <div className="inline-flex items-center gap-4 text-primary font-black text-xl italic">
             <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center not-italic font-black text-xl">B</div>
             BreezyGo Lifestyle
          </div>
        </div>
      </div>
    </main>
  );
}
