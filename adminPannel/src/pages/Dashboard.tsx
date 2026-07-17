import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, MessageSquare, TrendingUp, CalendarDays } from "lucide-react";
import axios from "axios";

// ─── Axios helper with auth token ─────────────────
function authAxios() {
  const token = localStorage.getItem("admin_token");
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    
    Promise.all([
      authAxios().get(`${backendUrl}/api/admin/stats`),
      authAxios().get(`${backendUrl}/api/admin/orders`)
    ])
    .then(([statsRes, ordersRes]) => {
      setData({
        ...statsRes.data,
        orders: ordersRes.data
      });
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse">Loading Dashboard...</div>;
  if (!data)
    return (
      <div className="p-10 text-red-500 font-medium">
        Failed to load stats. Ensure backend server is running.
      </div>
    );

  const stats = [
    {
      label: "Total Revenue",
      value: `Rs ${(data.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Total Orders",
      value: data.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Products",
      value: data.totalProducts.toString(),
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      label: "Messages",
      value: data.totalMessages.toString(),
      icon: MessageSquare,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tighter text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 font-medium">Live data from your MongoDB database.</p>
      </div>

      {/* Today's Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-[2rem] shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-slate-700/50">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
              <CalendarDays className="h-6 w-6 text-emerald-400" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-300">
              Today's Revenue
            </span>
          </div>
          <p className="text-4xl md:text-5xl font-black tracking-tighter relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
            Rs {(data.todayRevenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 text-slate-900 p-6 md:p-8 rounded-[2rem] shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-slate-200/60">
          <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Today's Orders
            </span>
          </div>
          <p className="text-4xl md:text-5xl font-black tracking-tighter relative z-10">
            {data.todayOrders || 0}
          </p>
        </div>
      </div>

      {/* All-time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/80 backdrop-blur-xl p-6 rounded-[1.5rem] border border-slate-200/60 shadow-sm flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} ${stat.border} border shadow-inner`}
            >
              <stat.icon className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 mt-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 7-Day Revenue Chart */}
      <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-slate-200/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">7-Day Revenue Trend</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Daily revenue comparison for the last week.</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                Live Data
            </div>
        </div>
        
        <div className="h-48 md:h-64 flex items-end justify-between gap-2 sm:gap-4 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map(i => <div key={i} className="w-full border-t border-slate-100/50"></div>)}
            </div>

            {/* Chart Bars */}
            {(() => {
                const last7Days = Array.from({length: 7}).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                });
                
                const chartData = last7Days.map(dateObj => {
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const dayOrders = (data.orders || []).filter((o: any) => {
                        if (!o.date) return false;
                        const parts = o.date.split(',')[0].split('/');
                        if (parts.length === 3) {
                            const oDateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                            return oDateStr === dateStr;
                        }
                        return false;
                    });
                    const revenue = dayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
                    return { date: dateObj, revenue };
                });

                const maxRev = Math.max(...chartData.map(d => d.revenue), 1000);

                return chartData.map((d, i) => {
                    const heightPct = (d.revenue / maxRev) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10 h-full justify-end">
                            {/* Tooltip */}
                            <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap pointer-events-none">
                                Rs {d.revenue.toLocaleString()}
                            </div>
                            {/* Bar */}
                            <div 
                                className="w-full max-w-[3rem] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl group-hover:from-emerald-400 group-hover:to-emerald-300 transition-all shadow-md relative overflow-hidden" 
                                style={{ height: `${Math.max(heightPct, 2)}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                                {d.date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                        </div>
                    );
                });
            })()}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="p-5 font-bold pl-8">Order ID</th>
                <th className="p-5 font-bold">Customer</th>
                <th className="p-5 font-bold">Amount</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {(!data.recentOrders || data.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                    No orders yet.
                  </td>
                </tr>
              )}
              {(data.recentOrders || []).map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 font-mono text-slate-400 text-xs pl-8 group-hover:text-slate-600 transition-colors">{order.id.slice(-8)}</td>
                  <td className="p-5 font-semibold text-slate-900">{order.customer}</td>
                  <td className="p-5 font-black text-emerald-600">{order.amount}</td>
                  <td className="p-5">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : order.status === "processing"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-5 text-slate-400 font-medium">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}