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

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "processing", label: "Processing", icon: Loader2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function OrderCard({ order }: { order: any }) {
  const currentStepIndex = statusSteps.findIndex((s) => s.key === order?.status) ?? 0;

  return (
    <div className="space-y-6 border border-slate-200 rounded-[2rem] overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Order ID</p>
          <p className="text-lg font-bold font-mono text-slate-900">#{order.short_id}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Status</p>
          <p className="text-lg font-bold uppercase text-[#00a859]">{order.status}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total</p>
          <p className="text-lg font-bold text-slate-900">Rs {order.total_amount.toLocaleString()}</p>
        </div>
        {order.created_at && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Date</p>
            <p className="text-sm font-semibold text-slate-700">
              {new Date(order.created_at).toLocaleDateString('en-PK')}
            </p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="px-6 pb-2 relative">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-8 left-8 right-8 h-1 bg-slate-100">
            <div
              className="h-full bg-[#00a859] transition-all duration-1000"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />
          </div>
          {statusSteps.map((step, idx) => {
            const isActive = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isActive ? 'bg-[#00a859] text-white' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
                  <step.icon className={`h-6 w-6 ${isCurrent && step.key === 'processing' ? 'animate-spin' : ''}`} />
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider text-center ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="px-6 pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-t border-slate-100 pt-4">Items</p>
        <div className="space-y-3">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-800">{item.name} <span className="text-slate-400">× {item.quantity}</span></span>
              <span className="text-sm font-bold text-slate-900">Rs {item.price.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: string; orders: any[] } | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 8) {
      toast.error("Please enter your Order ID, phone number, or email.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await trackOrder(query.trim());
      setResult(res);
    } catch (err: any) {
      toast.error(err.message || "Order not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 md:pt-40 pb-24">
      <Toaster richColors position="top-center" />

      <div className="mx-auto max-w-[1200px] px-4 md:px-[40px]">
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

          {result && (
            <div className="space-y-6">
              {result.orders.length > 1 && (
                <p className="text-sm font-semibold text-slate-500 text-center">
                  Found {result.orders.length} orders
                </p>
              )}
              {result.orders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}