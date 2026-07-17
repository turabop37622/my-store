import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Phone, Clock, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { submitContactForm } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [{ title: "Contact Us — BreezyGo" }],
  }),
});

function ContactPage() {
  const submitFn = useServerFn(submitContactForm);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitFn({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
      });
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-32 md:pt-40 pb-20">
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-[1920px] px-4 md:px-[40px]">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side: Info */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-medium tracking-tighter">Get in <span className="text-primary">Touch</span></h1>
              <p className="text-muted-foreground text-lg max-w-md">
                Get in touch with us. Your questions and feedback are very important to us.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: Phone, label: "Phone", value: "+92 300 1234567", sub: "Mon-Sat, 10am-7pm" },
                { icon: Mail, label: "Email", value: "support@breezygo.pk", sub: "24/7 Support" },
                { icon: Clock, label: "Response Time", value: "Within 24 Hours", sub: "Fastest response" },
              ].map((item) => (
                <div key={item.label} className="group">
                  <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground mb-1">{item.label}</h3>
                  <p className="text-lg font-medium">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* WhatsApp Button */}
            <a 
              href="https://wa.me/923001234567" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-medium py-4 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </a>

            <div className="bg-secondary/30 rounded-3xl p-8 flex items-center gap-6 border border-border">
              <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-black font-medium text-xl shadow-lg">B</div>
              <div>
                <h4 className="font-medium">BreezyGo Support Team</h4>
                <p className="text-sm text-muted-foreground">Always ready to assist you.</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-muted-foreground">Full Name</label>
                  <Input 
                    required
                    placeholder="Ahmed Khan" 
                    className="h-14 rounded-2xl bg-secondary/50" 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-muted-foreground">Email Address</label>
                  <Input 
                    required
                    type="email"
                    placeholder="ahmed@example.com" 
                    className="h-14 rounded-2xl bg-secondary/50" 
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-muted-foreground">Subject</label>
                <Input 
                  required
                  placeholder="Order related query" 
                  className="h-14 rounded-2xl bg-secondary/50" 
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-muted-foreground">Message</label>
                <Textarea 
                  required
                  placeholder="Write your message here..." 
                  className="min-h-[150px] rounded-2xl bg-secondary/50 pt-4" 
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <Button 
                type="submit"
                disabled={submitting}
                className="w-full h-16 rounded-2xl text-lg font-medium tracking-wide transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
