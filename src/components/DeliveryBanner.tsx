import { Zap } from "lucide-react";

export default function DeliveryBanner() {
  const marqueeItems = [
    "CASH ON DELIVERY",
    "24-48 HOUR DELIVERY LAHORE | OTHER CITIES 4-6 DAYS",
    "1 YEAR OFFICIAL WARRANTY",
    "PREMIUM LIFESTYLE TECH",
    "NATIONWIDE SHIPPING"
  ];

  return (
    <div className="w-full bg-[#00a651] text-white py-1.5 md:py-2.5 overflow-hidden flex border-b border-white/10 relative z-40">
      <div className="w-full inline-flex flex-nowrap whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center shrink-0">
            {marqueeItems.map((item, idx) => (
              <div key={idx} className="flex items-center mx-6">
                <Zap className="h-3 w-3 mr-2 text-yellow-300" />
                <span className="text-[10px] md:text-xs font-normal tracking-[0.15em] uppercase">{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
