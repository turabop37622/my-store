import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  HelpCircle, 
  MessageSquare, 
  Truck, 
  RotateCcw, 
  PackageSearch, 
  ShieldCheck, 
  ArrowRight,
  Headphones
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({
    meta: [{ title: "Support Center — BreezyGo" }],
  }),
});

function SupportPage() {
  const faqs = [
    { q: "What is the warranty on BreezyGo products?", a: "All our products come with a 7-day replacement warranty. If there is any technical issue with the product, we will replace it for you." },
    { q: "How long does delivery take?", a: "24-48 hours in Lahore and 4-6 working days for the rest of Pakistan." },
    { q: "Is Cash on Delivery (COD) available in every city?", a: "Yes, we provide COD service across Pakistan." },
    { q: "How to cancel an order?", a: "As long as the order is not shipped, you can cancel it by contacting us via WhatsApp or email." }
  ];

  const quickActions = [
    {
      icon: Truck,
      label: "Shipping Policy",
      sub: "Delivery times & rates",
      href: "/shipping-policy",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: RotateCcw,
      label: "Return & Refund",
      sub: "Hassle-free exchange",
      href: "/returns-policy",
      color: "bg-red-500/10 text-red-600",
    },
    {
      icon: PackageSearch,
      label: "Track Order",
      sub: "Check status live",
      href: "/track-order",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: MessageSquare,
      label: "Contact Us",
      sub: "24/7 WhatsApp help",
      href: "/contact",
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <main className="min-h-screen bg-background pt-32 md:pt-40 pb-24 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/5 blur-[120px] -z-10 pointer-events-none" />
      
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        {/* Hero Section */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-border">
            <Headphones className="h-3 w-3" /> Customer Care
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6">
            How can we <br />
            <span className="text-primary italic">help you?</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            From order status to technical support, we are here for you at all times. Select from the options below.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-24">
          {quickActions.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="group relative bg-card border border-border p-8 rounded-[2.5rem] hover:bg-secondary transition-all duration-500 overflow-hidden"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">{item.label}</h3>
              <p className="text-sm text-muted-foreground mb-8">{item.sub}</p>
              
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                View Details <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Decorative Element */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 space-y-4 sticky top-40">
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" /> 
              Common <br />Questions
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              If your question is not listed here, feel free to contact us. Our team will respond immediately.
            </p>
            <div className="pt-6">
              <Link 
                to="/contact" 
                className="inline-flex h-12 items-center px-6 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Ask a specific question
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`item-${i}`} 
                  className="bg-card border border-border rounded-3xl px-8 transition-all hover:border-primary/30 data-[state=open]:border-primary/50 data-[state=open]:shadow-2xl data-[state=open]:shadow-primary/5"
                >
                  <AccordionTrigger className="hover:no-underline font-bold text-left py-7 text-lg group">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-8 text-base leading-relaxed border-t border-border/50 pt-4 mt-1">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </main>
  );
}
