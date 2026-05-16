import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShoppingBag, MapPin, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const SuccessSchema = z.object({
  id: z.string().optional(),
  total: z.any().optional(),
});

export const Route = createFileRoute("/order-success")({
  validateSearch: (s) => SuccessSchema.parse(s),
  component: OrderSuccessPage,
  head: () => ({
    meta: [{ title: "Order Successful! — BreezyGo" }],
  }),
});

function OrderSuccessPage() {
  const { id, total } = Route.useSearch();

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 md:pt-40 pb-20 relative overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background Creative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-300/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-1000" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-2xl px-4 w-full animate-in fade-in zoom-in-95 duration-1000 z-10 relative">
        
        {/* Receipt Card */}
        <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,168,89,0.1)] overflow-hidden text-center">
          
          {/* Top Edge Decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />

          {/* Animated Check */}
          <div className="relative mx-auto w-24 h-24 mb-10">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20 duration-[3000ms]" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <Check className="h-12 w-12 text-white drop-shadow-md" strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-slate-900 mb-4 drop-shadow-sm">
            Order Secured
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg mb-12">
            Your premium gear is being prepared for dispatch.
          </p>

          {/* Details Ticket */}
          <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-100 text-left mb-12 relative">
            {/* Cutouts to look like a ticket */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 bg-[#fcfcfc] rounded-full border-r border-slate-200 shadow-inner" />
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 bg-[#fcfcfc] rounded-full border-l border-slate-200 shadow-inner" />
            
            <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-dashed border-slate-200 pb-6 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Order ID</p>
                <p className="font-mono text-xs sm:text-sm text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-100 inline-block break-all shadow-sm">
                  {id || "N/A"}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total (COD)</p>
                <p className="text-3xl font-black text-emerald-500">
                  Rs {Number(total || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center text-xs md:text-sm font-medium text-slate-500 justify-center text-center">
              <PackageOpen className="h-5 w-5 text-emerald-500 hidden sm:block" /> 
              We'll contact you shortly to confirm delivery details.
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-14 sm:h-16 px-8 rounded-full bg-[#00a859] hover:bg-[#00904a] text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
              <Link to="/track-order">
                <MapPin className="mr-2 h-5 w-5" /> Track Live
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 sm:h-16 px-8 rounded-full border-slate-200 text-slate-900 hover:bg-slate-50 font-bold uppercase tracking-widest transition-all w-full sm:w-auto">
              <Link to="/shop">
                <ShoppingBag className="mr-2 h-5 w-5" /> Keep Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
