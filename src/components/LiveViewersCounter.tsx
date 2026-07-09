import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { API_URL } from "@/lib/db";

interface Settings {
  live_viewers_enabled: boolean;
  live_viewers_min: number;
  live_viewers_max: number;
  live_viewers_interval_min: number;
  live_viewers_interval_max: number;
}

export default function LiveViewersCounter() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [viewers, setViewers] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data: Settings) => {
        setSettings(data);
        if (data.live_viewers_enabled) {
          // Initialize with a random value in range
          const min = data.live_viewers_min || 3;
          const max = data.live_viewers_max || 30;
          setViewers(Math.floor(Math.random() * (max - min + 1)) + min);
        }
      })
      .catch((err) => console.error("Error loading settings:", err));
  }, []);

  useEffect(() => {
    if (!settings || !settings.live_viewers_enabled || viewers === null) return;

    const min = settings.live_viewers_min || 3;
    const max = settings.live_viewers_max || 30;
    const intervalMin = (settings.live_viewers_interval_min || 15) * 1000;
    const intervalMax = (settings.live_viewers_interval_max || 45) * 1000;

    // Helper to trigger viewer fluctuations
    const tick = () => {
      setViewers((current) => {
        if (current === null) return null;
        const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
        let newVal = current + change;
        if (newVal < min) newVal = min;
        if (newVal > max) newVal = max;
        return newVal;
      });

      // Schedule next tick
      const nextInterval = Math.floor(Math.random() * (intervalMax - intervalMin + 1)) + intervalMin;
      timeoutId = setTimeout(tick, nextInterval);
    };

    const initialInterval = Math.floor(Math.random() * (intervalMax - intervalMin + 1)) + intervalMin;
    let timeoutId = setTimeout(tick, initialInterval);

    return () => clearTimeout(timeoutId);
  }, [settings, viewers]);

  if (!settings || !settings.live_viewers_enabled || viewers === null) return null;

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 backdrop-blur-sm text-emerald-800 text-sm font-medium shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <div className="flex items-center gap-1.5">
        <Eye className="h-4 w-4 text-emerald-600/80" />
        <span>
          <strong className="font-bold text-emerald-950">{viewers}</strong> people are viewing this product
        </span>
      </div>
    </div>
  );
}
