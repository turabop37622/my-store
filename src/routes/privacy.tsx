import { createFileRoute } from "@tanstack/react-router";
import { Shield, Lock, Eye, Server } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
  head: () => ({ meta: [{ title: "Privacy Policy — BreezyGo" }] }),
});

function PrivacyPolicy() {
  const policies = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: "When you visit our site, we automatically collect certain information about your device, including your web browser, IP address, and some of the cookies installed on your device. When you make a purchase, we collect your name, billing address, shipping address, and phone number."
    },
    {
      icon: Server,
      title: "How We Use Your Info",
      content: "We use the Order Information to fulfill any orders placed through the Site (including arranging for shipping, and providing you with invoices and order confirmations). We also use it to communicate with you and screen orders for potential fraud."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "Your data security is extremely important to us. We use industry-standard encryption protocols to protect your personal information during transit and storage. Your payment information is never stored on our servers."
    },
    {
      icon: Shield,
      title: "Sharing Your Information",
      content: "We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website."
    }
  ];

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 md:pt-40 pb-24">
      <div className="mx-auto max-w-4xl px-4 md:px-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 text-indigo-500 mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
            We value your privacy. This policy outlines how your personal information is collected, used, and shared.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {policies.map((policy, i) => (
            <div key={i} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6">
                <policy.icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">{policy.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{policy.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center">
           <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
           <p className="text-slate-400 max-w-2xl mx-auto mb-8">
             You have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted.
           </p>
           <a href="/contact" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors">
             Request Data Deletion
           </a>
        </div>

      </div>
    </main>
  );
}
