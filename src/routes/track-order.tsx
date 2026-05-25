import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { trackOrder } from "@/lib/orders.functions";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Truck, CheckCircle2, Search } from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/track-order")({
  component: TrackOrderPage,
  head: () => ({
    meta: [{ title: "Track Your Order — BreezyGo" }],
  }),
});

function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 8) {
      toast.error("Please enter your Order ID, phone number, or email.");
      return;
    }

    setLoading(true);
    setOrder(null);
    try {
      const res = await trackOrder(query.trim());
      setOrder(res);
    } catch (err: any) {
      toast.error(err.message || "Order not found.");
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "processing", label: "Processing", icon: Loader2 },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order?.status) ?? 0;

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 md:pt-40 pb-24">
      <Toaster richColors position="top-center" />

      <div className="mx-auto max-w-[1200px] px-4 md:px-10">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
            Enter your Order ID (8 or 24 characters), phone number, or email address.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 p-2 bg-white border border-slate-200 shadow-sm rounded-3xl md:rounded-full focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50 transition-all duration-300 mb-16">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                placeholder="Order ID, phone number, or email..."
                className="w-full h-14 pl-14 pr-6 rounded-full bg-transparent border-none focus:ring-0 text-slate-900 font-medium outline-none placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="h-14 px-10 rounded-full bg-[#00a859] hover:bg-[#00904a] text-white font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-emerald-500/20 w-full md:w-auto"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Track Live"}
            </Button>
          </form>

          {order && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

              <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Status</p>
                  <p className="text-2xl font-bold uppercase text-[#00a859]">{order.status}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Customer Name</p>
                  <p className="text-lg font-semibold text-slate-900">{order.customer_name}</p>
                </div>
                {order.short_id && (
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Order ID</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">#{order.short_id}</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-8 md:p-12 border border-slate-200 rounded-[2rem] shadow-sm relative">
                <div className="absolute top-[80px] left-[10%] right-[10%] h-1 bg-slate-100 hidden md:block">
                  <div
                    className="h-full bg-[#00a859] transition-all duration-1000 ease-out"
                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                  {statusSteps.map((step, idx) => {
                    const isActive = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-row md:flex-col items-center gap-4 group">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${isActive ? 'bg-[#00a859] text-white' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
                          <step.icon className={`h-6 w-6 ${isCurrent && step.key === 'processing' ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="text-left md:text-center">
                          <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 border-b border-slate-100 pb-4">Order Details</h3>

                <div className="space-y-4 mb-8">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <span className="text-sm font-semibold text-slate-800">{item.name} <span className="text-slate-400 ml-1">× {item.quantity}</span></span>
                      <span className="text-sm font-bold text-slate-900">Rs {item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Amount (COD)</p>
                    <span className="text-2xl font-bold text-slate-900">Rs {order.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Payment Method</p>
                    <p className="text-sm font-semibold text-slate-800">Cash on Delivery</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}