import { useEffect, useState } from "react";
import { TrendingUp, Flame } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { fetchFromApi } from "@/lib/db";

interface DailyData {
  date: string;
  label: string;
  units: number;
  revenue: number;
}

interface SalesDataResponse {
  enabled: boolean;
  today: {
    units: number;
    revenue: number;
  };
  week: DailyData[];
}

interface Props {
  productId: string;
}

export default function SalesGraph({ productId }: Props) {
  const [data, setData] = useState<SalesDataResponse | null>(null);
  const [animatedToday, setAnimatedToday] = useState(0);

  useEffect(() => {
    if (!productId) return;
    fetchFromApi(`/api/sales-data/${productId}`)
      .then((resData: SalesDataResponse) => {
        if (resData.enabled) {
          setData(resData);
          // Animated count-up for today's units
          const target = resData.today.units || 0;
          if (target > 0) {
            let start = 0;
            const duration = 1000;
            const stepTime = Math.max(Math.floor(duration / target), 30);
            const timer = setInterval(() => {
              start += 1;
              setAnimatedToday(start);
              if (start >= target) {
                clearInterval(timer);
              }
            }, stepTime);
            return () => clearInterval(timer);
          } else {
            setAnimatedToday(0);
          }
        }
      })
      .catch((err) => console.error("Error loading sales data:", err));
  }, [productId]);

  if (!data || !data.enabled) return null;

  return (
    <div className="w-full bg-white border border-slate-100/80 rounded-3xl p-6 shadow-xl shadow-slate-100/70 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00a651] animate-pulse" /> Product Demand Insights
          </h3>
          <p className="text-xs text-slate-500 mt-1">Real-time purchase trends for this product</p>
        </div>

        {/* Dynamic Count-Up Bubble */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#00a651]/10 border border-[#00a651]/20 text-[#00a651] font-extrabold text-sm shadow-sm animate-bounce">
          <Flame className="h-4 w-4 fill-current text-[#00a651]" />
          <span>{animatedToday} sold today</span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.week} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              {/* Vibrant orange/coral gradient for Today */}
              <linearGradient id="todayBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7e40" />
                <stop offset="100%" stopColor="#ff512f" />
              </linearGradient>
              {/* Teal/blue gradient for the rest of the week */}
              <linearGradient id="weekBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  const isToday = payload[0].payload.date === data.week[data.week.length - 1].date;
                  return (
                    <div className="bg-slate-950 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold shadow-xl border border-slate-900 leading-normal">
                      <p className="opacity-75">{payload[0].payload.date}</p>
                      <p className={`font-black mt-1 ${isToday ? 'text-orange-400' : 'text-teal-400'}`}>
                        {val} {val === 1 ? "Unit" : "Units"} Sold
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="units" radius={[8, 8, 0, 0]} maxBarSize={32}>
              {data.week.map((entry, index) => {
                const isToday = index === data.week.length - 1;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isToday ? "url(#todayBarGradient)" : "url(#weekBarGradient)"}
                    className="transition-opacity duration-300 hover:opacity-85 cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
