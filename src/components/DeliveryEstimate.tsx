import { useEffect, useState } from "react";
import { Truck, MapPin } from "lucide-react";
import { API_URL } from "@/lib/db";

interface Settings {
  lahore_delivery_hours?: { min: number; max: number };
  other_cities_processing_days?: number;
  other_cities_shipping_days?: number;
}

export default function DeliveryEstimate() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [cityType, setCityType] = useState<"lahore" | "other">("lahore");

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data: Settings) => setSettings(data))
      .catch((err) => console.error("Error loading settings:", err));
  }, []);

  if (!settings) return null;

  const lahoreMin = settings.lahore_delivery_hours?.min || 24;
  const lahoreMax = settings.lahore_delivery_hours?.max || 48;
  const processing = settings.other_cities_processing_days ?? 2;
  const shipping = settings.other_cities_shipping_days ?? 2;

  // Calculate dynamic delivery range for other cities
  const today = new Date();
  const deliveryMinDate = new Date(today);
  deliveryMinDate.setDate(today.getDate() + processing + shipping);
  
  const deliveryMaxDate = new Date(deliveryMinDate);
  deliveryMaxDate.setDate(deliveryMinDate.getDate() + 1);

  const formatDateRange = (d1: Date, d2: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const f1 = d1.toLocaleDateString("en-US", options);
    const f2 = d2.toLocaleDateString("en-US", options);
    return `${f1} - ${f2}`;
  };

  const deliveryRange = formatDateRange(deliveryMinDate, deliveryMaxDate);

  return (
    <div className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-5 shadow-sm">
      {/* City Switcher */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400" /> Delivery To
        </span>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
          <button
            type="button"
            onClick={() => setCityType("lahore")}
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
              cityType === "lahore" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
            }`}
          >
            Lahore
          </button>
          <button
            type="button"
            onClick={() => setCityType("other")}
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
              cityType === "other" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
            }`}
          >
            Other Cities
          </button>
        </div>
      </div>

      {/* Estimate Message */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">Estimated Delivery</span>
          <span className="font-extrabold text-sm text-slate-900 mt-0.5 block">
            {cityType === "lahore" ? (
              `⚡ Within ${lahoreMin}-${lahoreMax} Hours`
            ) : (
              `📦 Expected: ${deliveryRange}`
            )}
          </span>
        </div>
      </div>

      {/* 3-Stage Progress Tracker */}
      <div className="pt-2 border-t border-slate-100/80">
        <div className="flex items-center justify-between gap-1">
          {/* Stage 1 */}
          <div className="flex flex-col items-center flex-1 text-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white dark:bg-slate-900 text-black dark:text-white mb-1.5 shadow-sm">
              <svg className="w-5.5 h-5.5 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Order Packed</span>
          </div>

          {/* Arrow 1 */}
          <div className="text-slate-300 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Stage 2 */}
          <div className="flex flex-col items-center flex-1 text-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white dark:bg-slate-900 text-black dark:text-white mb-1.5 shadow-sm">
              <svg className="w-5.5 h-5.5 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.321-5.138a3.375 3.375 0 00-3.375-3.162h-1.5m-3.75 9.75V11.25m-.75 0H7.5m3 0H21m-9.75 4.5H12m4.5 0H18M9.375 6H12m0 0v5.25m0-5.25h1.5A2.25 2.25 0 0115.75 8.25v2.25" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">On The Way</span>
          </div>

          {/* Arrow 2 */}
          <div className="text-slate-300 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Stage 3 */}
          <div className="flex flex-col items-center flex-1 text-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white dark:bg-slate-900 text-black dark:text-white mb-1.5 shadow-sm">
              <svg className="w-5.5 h-5.5 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                <circle cx="12" cy="11" r="1.2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 15.5a2.5 2.5 0 015 0" />
                <rect x="11.2" y="13.2" width="1.6" height="1.2" rx="0.1" strokeWidth="1" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Delivered Home</span>
          </div>
        </div>

        {/* Dynamic Details */}
        <div className="mt-4 text-center bg-slate-100/50 rounded-xl p-2 border border-slate-200/30">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
            🚀 Lahore: {lahoreMin}-{lahoreMax} Hours | Other Cities: {processing + shipping}-{processing + shipping + 2} Days
          </p>
        </div>
      </div>
    </div>
  );
}
