import { createFileRoute } from "@tanstack/react-router";
import { FileText, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsOfService,
  head: () => ({ meta: [{ title: "Terms of Service — BreezyGo" }] }),
});

function TermsOfService() {
  const sections = [
    {
      title: "1. General Conditions",
      content: "By accessing and using BreezyGo, you accept and agree to be bound by the terms and provisions of this agreement. We reserve the right to refuse service to anyone for any reason at any time."
    },
    {
      title: "2. Products & Services",
      content: "Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy."
    },
    {
      title: "3. Pricing & Modifications",
      content: "Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time."
    },
    {
      title: "4. Accuracy of Billing",
      content: "We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made."
    },
    {
      title: "5. User Comments & Feedback",
      content: "If you send certain specific submissions or creative ideas, suggestions, proposals, or other materials, you agree that we may, at any time, without restriction, edit, copy, publish, distribute, and otherwise use in any medium any comments that you forward to us."
    }
  ];

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 md:pt-40 pb-24">
      <div className="mx-auto max-w-3xl px-4 md:px-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 text-slate-700 mb-6">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 text-lg mt-4">
            Last updated: May 2026. Please read these terms carefully before using our website.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-3xl shadow-sm space-y-10">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                 <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                 {section.title}
              </h2>
              <p className="text-slate-600 leading-relaxed pl-8">
                {section.content}
              </p>
            </div>
          ))}
          
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
             <p className="text-slate-500 font-medium">Questions about the Terms of Service?</p>
             <a href="/contact" className="text-primary font-bold hover:underline mt-2 inline-block">Contact us here</a>
          </div>
        </div>

      </div>
    </main>
  );
}
