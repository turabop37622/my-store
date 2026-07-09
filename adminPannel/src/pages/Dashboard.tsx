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
    authAxios()
      .get(`${backendUrl}/api/admin/stats`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-slate-500">Loading Dashboard...</div>;
  if (!data)
    return (
      <div className="p-10 text-red-500">
        Failed to load stats. Ensure backend server is running.
      </div>
    );

  const stats = [
    {
      label: "Total Revenue",
      value: `Rs ${(data.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: data.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Products",
      value: data.totalProducts.toString(),
      icon: Package,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Messages",
      value: data.totalMessages.toString(),
      icon: MessageSquare,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Live data from your MongoDB database.</p>
      </div>

      {/* Today's Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays className="h-5 w-5 opacity-70" />
            <span className="text-sm font-bold uppercase tracking-wider opacity-70">
              Today's Revenue
            </span>
          </div>
          <p className="text-3xl font-black">Rs {(data.todayRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 opacity-70" />
            <span className="text-sm font-bold uppercase tracking-wider opacity-70">
              Today's Orders
            </span>
          </div>
          <p className="text-3xl font-black">{data.todayOrders || 0}</p>
        </div>
      </div>

      {/* All-time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
          >
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {stat.label}
              </p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {(!data.recentOrders || data.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No orders yet.
                  </td>
                </tr>
              )}
              {(data.recentOrders || []).map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-slate-500 text-xs">{order.id.slice(-8)}</td>
                  <td className="p-4 font-medium text-slate-900">{order.customer}</td>
                  <td className="p-4 font-bold text-emerald-600">{order.amount}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "processing"
                              ? "bg-amber-100 text-amber-700"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}