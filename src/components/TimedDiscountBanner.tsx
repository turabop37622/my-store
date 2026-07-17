import { useEffect, useState, useRef } from "react";
import { Sparkles, Timer, PartyPopper } from "lucide-react";
import { fetchFromApi } from "@/lib/db";

interface DiscountInfo {
  active: boolean;
  id?: string;
  discount_percent?: number;
  start_time?: string;
  end_time?: string;
}

interface Props {
  productId: string;
  onDiscountChange: (percent: number) => void;
}

export default function TimedDiscountBanner({ productId, onDiscountChange }: Props) {
  const [discount, setDiscount] = useState<DiscountInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!productId) return;
    fetchFromApi(`/api/discounts/${productId}`)
      .then((data: DiscountInfo) => {
        setDiscount(data);
        if (data.active && data.discount_percent) {
          onDiscountChange(data.discount_percent);
        } else {
          onDiscountChange(0);
        }
      })
      .catch((err) => {
        console.error("Error fetching timed discount:", err);
        onDiscountChange(0);
      });
  }, [productId]);

  useEffect(() => {
    if (!discount || !discount.active || !discount.end_time) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const endTime = new Date(discount.end_time).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setDiscount({ active: false });
        onDiscountChange(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = [
        String(hrs).padStart(2, "0"),
        String(mins).padStart(2, "0"),
        String(secs).padStart(2, "0"),
      ].join(":");

      setTimeLeft(formatted);
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [discount]);

  if (!discount || !discount.active || !discount.discount_percent) return null;

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white shadow-xl shadow-rose-500/10 border border-white/10 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white animate-pulse" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm md:text-base tracking-wide uppercase flex items-center gap-2">
            <PartyPopper className="w-5 h-5" /> Limited Time Offer!
          </h4>
          <p className="text-xs text-white/95 font-medium mt-0.5">
            Get an extra <strong className="font-black text-white">{discount.discount_percent}% OFF</strong> on this product!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/10">
        <Timer className="h-5 w-5 text-white/90" />
        <span className="font-mono text-lg font-black tracking-widest">{timeLeft}</span>
      </div>
    </div>
  );
}
