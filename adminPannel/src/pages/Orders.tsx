import { useState, useEffect } from "react";
import { Trash2, Search, Eye, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

function authAxios() {
  const token = localStorage.getItem("admin_token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
}

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    authAxios().get(`${backendUrl}/api/admin/orders`)
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().post(`${backendUrl}/api/admin/orders`, { id, status: newStatus });
      toast.success("Status updated!");
      fetchOrders();
    } catch { toast.error("Failed to update."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().delete(`${backendUrl}/api/admin/orders/${id}`);
      toast.success("Order deleted!");
      fetchOrders();
    } catch { toast.error("Failed to delete."); }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL orders? This cannot be undone!")) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().delete(`${backendUrl}/api/admin/orders`);
      toast.success("All orders deleted!");
      fetchOrders();
    } catch { toast.error("Failed to delete all orders."); }
  };

  const filtered = orders.filter(o =>
    o.customer?.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.includes(search) ||
    o.city?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.includes(search)
  );

  if (loading) return <div className="p-10 text-slate-500">Loading Orders...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Order Details</h2>
                <p className="text-emerald-100 text-xs font-mono">#{selectedOrder.id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white hover:bg-white/20 p-1 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-slate-400">Name</p><p className="font-semibold text-slate-800">{selectedOrder.customer}</p></div>
                  <div><p className="text-xs text-slate-400">Phone</p><p className="font-semibold text-slate-800">{selectedOrder.phone}</p></div>
                  <div><p className="text-xs text-slate-400">City</p><p className="font-semibold text-slate-800">{selectedOrder.city}</p></div>
                  <div><p className="text-xs text-slate-400">Date</p><p className="font-semibold text-slate-800 text-xs">{selectedOrder.date}</p></div>
                  <div><p className="text-xs text-slate-400">Email</p><p className="font-semibold text-slate-800">{selectedOrder.email || "N/A"}</p></div>
                  <div><p className="text-xs text-slate-400">Postal Code</p><p className="font-semibold text-slate-800">{selectedOrder.postalCode || "N/A"}</p></div>
                </div>
                <div><p className="text-xs text-slate-400">Address</p><p className="font-semibold text-slate-800">{selectedOrder.address}</p></div>
                {selectedOrder.landmark && (
                  <div><p className="text-xs text-slate-400">Nearest Landmark</p><p className="font-semibold text-amber-700 text-xs">{selectedOrder.landmark}</p></div>
                )}
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-400">Map Location</p>
                  <div className="flex items-center justify-between mt-1 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    {selectedOrder.latitude && selectedOrder.longitude ? (
                      <>
                        <span className="font-mono text-xs text-slate-500">
                          {selectedOrder.latitude.toFixed(6)}, {selectedOrder.longitude.toFixed(6)}
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.latitude},${selectedOrder.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-md shadow-sm transition-all"
                        >
                          📍 Exact Pin
                        </a>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-amber-600 font-medium">No exact pin (old order)</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address + ", " + selectedOrder.city)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-500 hover:bg-slate-600 text-white text-[10px] font-bold uppercase rounded-md shadow-sm transition-all"
                        >
                          🔍 Search Address
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div><p className="text-xs text-slate-400">Tracking ID</p><p className="font-semibold text-slate-800 font-mono">{selectedOrder.trackingId || "Not assigned"}</p></div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Items</h3>
                <p className="text-slate-700 text-sm">{selectedOrder.items}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                <p className="text-emerald-700 font-bold">Total Amount</p>
                <p className="text-emerald-600 font-black text-xl">Rs {(selectedOrder.total || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Orders ({orders.length})</h1>
          <p className="text-slate-500 mt-1">Manage customer orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by name, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          {orders.length > 0 && (
            <button onClick={handleClearAll} className="flex items-center gap-2 h-10 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap">
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No orders found.</td></tr>
              )}
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-top">
                    <div className="font-mono text-slate-500 text-xs">{order.id.slice(-8)}</div>
                    <div className="mt-1 text-[10px] text-slate-400">{order.date}</div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="font-medium text-slate-900">{order.customer}</div>
                    <div className="text-slate-500 text-xs">{order.phone}</div>
                    <div className="text-slate-400 text-xs">{order.city}</div>
                  </td>
                  <td className="p-4 align-top text-slate-700 text-xs max-w-[200px] truncate">{order.items}</td>
                  <td className="p-4 align-top font-bold text-emerald-600">Rs {(order.total || 0).toLocaleString()}</td>
                  <td className="p-4 align-top">
                    <select
                      className={`h-8 px-2 text-xs font-bold uppercase tracking-wider rounded-lg border-none focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                        }`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}