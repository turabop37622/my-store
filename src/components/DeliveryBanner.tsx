import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { API_URL } from "@/lib/db";

interface Settings {
  homepage_banner_enabled?: boolean;
  homepage_banner_text?: string;
}

export default function DeliveryBanner() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data: Settings) => setSettings(data))
      .catch((err) => console.error("Error loading delivery banner:", err));
  }, []);

  if (!settings || !settings.homepage_banner_enabled) return null;

  return (
    <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-3 px-4 shadow-md overflow-hidden relative border-b border-emerald-500/10">
      <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-3 text-center text-xs md:text-sm font-black uppercase tracking-wider">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20 animate-pulse">
          <Truck className="h-4 w-4 text-white" />
        </span>
        <span className="leading-tight drop-shadow-sm select-none">
          {settings.homepage_banner_text || "🚀 24-48 Hour Delivery Anywhere in Lahore — No Extra Charges!"}
        </span>
      </div>
    </div>
  );
}
