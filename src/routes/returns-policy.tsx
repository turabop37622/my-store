import { createFileRoute, Link } from "@tanstack/react-router";
import { RotateCcw, ShieldCheck, Banknote, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/returns-policy")({
  component: ReturnsPolicy,
  head: () => ({ meta: [{ title: "Returns & Refund — BreezyGo" }] }),
});

function ReturnsPolicy() {
  const policies = [
    {
      icon: ShieldCheck,
      title: "7-Day Warranty",
      desc: "Your peace of mind is our priority.",
      details: [
        "7 days checking & replacement warranty.",
        "Covers manufacturing faults and defects."
      ]
    },
    {
      icon: RotateCcw,
      title: "How to Return?",
      desc: "A hassle-free return process.",
      details: [
        "Contact support via email or WhatsApp.",
        "Keep the product in its original, undamaged packaging."
      ]
    },
    {
      icon: Banknote,
      title: "Refund Process",
      desc: "Quick and secure money-back guarantee.",
      details: [
        "Approved refunds transferred within 5-7 working days.",
        "Sent directly to your Bank Account or JazzCash/Easypaisa."
      ]
    },
    {
      icon: HelpCircle,
      title: "Conditions",
      desc: "Important things to keep in mind.",
      details: [
        "Physical damage by user is not covered.",
        "Missing accessories will void the return policy."
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 md:pt-40 pb-24">
      <div className="mx-auto max-w-[1000px] px-4 md:px-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-blue-500 mb-6">
            <RotateCcw className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Returns & Refund</h1>
          <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
            Our goal is your complete satisfaction. If you face any issues, we are here to make it right.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
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
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                    <span className="text-sm font-medium text-slate-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Support Banner */}
        <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Need to file a return request?</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Our support team is available 24/7. Reach out to us with your Order ID and we'll process your request instantly.
              </p>
              <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 rounded-full h-12 px-8 font-bold">
                 <Link to="/contact">Contact Support</Link>
              </Button>
           </div>
           {/* Background Decoration */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-[100px] pointer-events-none"></div>
        </div>

      </div>
    </main>
  );
}
