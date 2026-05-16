import { createFileRoute } from "@tanstack/react-router";
import { Truck, Clock, CreditCard, PackageCheck } from "lucide-react";

export const Route = createFileRoute("/shipping-policy")({
  component: ShippingPolicy,
  head: () => ({ meta: [{ title: "Shipping Policy — BreezyGo" }] }),
});

function ShippingPolicy() {
  const policies = [
    {
      icon: Clock,
      title: "Delivery Time",
      desc: "We process and dispatch all orders within 24 hours.",
      details: [
        "Karachi: 1-2 Working Days",
        "Rest of Pakistan: 3-5 Working Days"
      ]
    },
    {
      icon: CreditCard,
      title: "Shipping Charges",
      desc: "Enjoy premium delivery without the extra cost.",
      details: [
        "Standard Delivery: FREE (Limited Time)",
        "No hidden fees or extra taxes."
      ]
    },
    {
      icon: Truck,
      title: "Order Tracking",
      desc: "Stay updated on your package's journey.",
      details: [
        "Live tracking via our Track Order portal.",
        "SMS updates at every shipping stage."
      ]
    },
    {
      icon: PackageCheck,
      title: "Secure Packaging",
      desc: "Your tech is safe with us.",
      details: [
        "Multi-layered bubble wrap protection.",
        "Tamper-proof delivery seals."
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 md:pt-40 pb-24">
      <div className="mx-auto max-w-[1000px] px-4 md:px-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 mb-6">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Shipping Policy</h1>
          <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
            Fast, reliable, and free delivery across Pakistan. We ensure your favorite tech reaches you safely and on time.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {policies.map((policy, i) => (
            <div key={i} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mb-6">
                <policy.icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{policy.title}</h2>
              <p className="text-slate-500 text-sm mb-6">{policy.desc}</p>
              
              <ul className="space-y-3">
                {policy.details.map((detail, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                    <span className="text-sm font-medium text-slate-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
