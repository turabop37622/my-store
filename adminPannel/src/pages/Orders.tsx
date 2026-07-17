import { useState, useEffect } from "react";
import { Trash2, Search, Eye, X, Download, Calendar as CalendarIcon, List, CheckSquare } from "lucide-react";
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
  
  // New States for Features
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrderIds.length === 0) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await Promise.all(selectedOrderIds.map(id => authAxios().post(`${backendUrl}/api/admin/orders`, { id, status: newStatus })));
      toast.success(`${selectedOrderIds.length} orders updated!`);
      setSelectedOrderIds([]);
      fetchOrders();
    } catch {
      toast.error("Failed to update some orders.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().delete(`${backendUrl}/api/admin/orders/${id}`);
      toast.success("Order deleted!");
      setSelectedOrderIds(prev => prev.filter(x => x !== id));
      fetchOrders();
    } catch { toast.error("Failed to delete."); }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL orders? This cannot be undone!")) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().delete(`${backendUrl}/api/admin/orders`);
      toast.success("All orders deleted!");
      setSelectedOrderIds([]);
      fetchOrders();
    } catch { toast.error("Failed to delete all orders."); }
  };

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Phone", "Email", "City", "Address", "Postal Code", "Items", "Total", "Status", "Date"];
    const csvRows = [headers.join(",")];
    orders.forEach(order => {
      const row = [
        order.id,
        `"${(order.customer || "").replace(/"/g, '""')}"`,
        `"${(order.phone || "").replace(/"/g, '""')}"`,
        `"${(order.email || "").replace(/"/g, '""')}"`,
        `"${(order.city || "").replace(/"/g, '""')}"`,
        `"${(order.address || "").replace(/"/g, '""')}"`,
        `"${(order.postalCode || "").replace(/"/g, '""')}"`,
        `"${(order.items || "").replace(/"/g, '""')}"`,
        order.total,
        order.status,
        `"${order.date || ""}"`
      ];
      csvRows.push(row.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = orders.filter(o =>
    o.customer?.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.includes(search) ||
    o.city?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.includes(search) ||
    o.date?.includes(search)
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedOrderIds(filtered.map(o => o.id));
    else setSelectedOrderIds([]);
  };

  const handleSelectOne = (id: string) => {
    setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse">Loading Orders...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-xl tracking-tight">Order Details</h2>
                <p className="text-slate-400 text-xs font-mono mt-1 tracking-widest uppercase">#{selectedOrder.id.slice(-8)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50/80 rounded-2xl p-5 space-y-3 border border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Name</p><p className="font-semibold text-slate-900">{selectedOrder.customer}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Phone</p><p className="font-semibold text-slate-900">{selectedOrder.phone}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">City</p><p className="font-semibold text-slate-900">{selectedOrder.city}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Date</p><p className="font-semibold text-slate-900 text-xs">{selectedOrder.date}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Email</p><p className="font-semibold text-slate-900">{selectedOrder.email || "N/A"}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Postal Code</p><p className="font-semibold text-slate-900">{selectedOrder.postalCode || "N/A"}</p></div>
                </div>
                <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5 mt-2">Address</p><p className="font-semibold text-slate-900">{selectedOrder.address}</p></div>
                {selectedOrder.landmark && (
                  <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Nearest Landmark</p><p className="font-bold text-amber-600 text-sm">{selectedOrder.landmark}</p></div>
                )}
                <div className="pt-3 mt-1 border-t border-slate-200/60">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Map Location</p>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                    {selectedOrder.latitude && selectedOrder.longitude ? (
                      <>
                        <span className="font-mono text-xs text-slate-500 font-medium">
                          {selectedOrder.latitude.toFixed(6)}, {selectedOrder.longitude.toFixed(6)}
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.latitude},${selectedOrder.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          📍 Exact Pin
                        </a>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-amber-600 font-semibold">No exact pin (old order)</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address + ", " + selectedOrder.city)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-all"
                        >
                          🔍 Search
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5 mt-2">Tracking ID</p><p className="font-semibold text-slate-900 font-mono">{selectedOrder.trackingId || "Not assigned"}</p></div>
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Items</h3>
                <p className="text-slate-900 font-medium text-sm leading-relaxed">{selectedOrder.items}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-5 flex items-center justify-between border border-emerald-100">
                <p className="text-emerald-800 font-black tracking-tight">Total Amount</p>
                <p className="text-emerald-600 font-black text-2xl tracking-tighter">Rs {(selectedOrder.total || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tighter text-slate-900">Orders ({orders.length})</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage customer orders and calendar.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center mr-2 border border-slate-200/60 shadow-inner">
              <button onClick={() => setViewMode("list")} className={`flex items-center gap-2 p-2 px-4 rounded-xl transition-all ${viewMode === "list" ? "bg-white shadow-sm text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700 font-semibold"}`}><List size={16} strokeWidth={2.5} /> List</button>
              <button onClick={() => setViewMode("calendar")} className={`flex items-center gap-2 p-2 px-4 rounded-xl transition-all ${viewMode === "calendar" ? "bg-white shadow-sm text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700 font-semibold"}`}><CalendarIcon size={16} strokeWidth={2.5} /> Calendar</button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              placeholder="Search or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm"
            />
          </div>

          <button onClick={handleExportCSV} className="flex items-center gap-2 h-12 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 whitespace-nowrap">
            <Download size={18} strokeWidth={2.5} /> Export
          </button>
          
          {orders.length > 0 && (
            <button onClick={handleClearAll} className="flex items-center gap-2 h-12 px-5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold rounded-2xl transition-all shadow-sm whitespace-nowrap hover:-translate-y-0.5">
              <Trash2 size={18} strokeWidth={2.5} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrderIds.length > 0 && viewMode === "list" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 px-5 flex flex-wrap items-center justify-between shadow-sm animate-in fade-in zoom-in-95 gap-4">
              <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-emerald-600" />
                  <span className="font-bold text-emerald-900">{selectedOrderIds.length} orders selected</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mr-2">Mark as:</span>
                  {['processing', 'shipped', 'delivered'].map(status => (
                      <button 
                        key={status}
                        onClick={() => handleBulkStatusChange(status)}
                        className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
                      >
                          {status}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Content Area */}
      {viewMode === "calendar" ? (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-lg overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="px-4 py-2 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors text-slate-600">Prev</button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors text-slate-900 bg-slate-50 border border-slate-200/60 shadow-sm">Today</button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="px-4 py-2 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors text-slate-600">Next</button>
                </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-200/60 bg-slate-50/80">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-200/60 last:border-r-0">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 border-slate-200/60 bg-white/40">
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`blank-${i}`} className="p-4 border-b border-r border-slate-100 bg-slate-50/30 h-32 md:h-40"></div>
                ))}
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const dateNum = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                    
                    const dayOrders = orders.filter(o => {
                        if (!o.date) return false;
                        const parts = o.date.split(',')[0].split('/'); // DD/MM/YYYY
                        if (parts.length === 3) {
                            const oDateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                            return oDateStr === dateStr;
                        }
                        return false;
                    });
                    
                    const totalRev = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                    
                    return (
                        <div 
                            key={`day-${dateNum}`} 
                            className="p-3 md:p-4 border-b border-r border-slate-200/60 hover:bg-slate-50/80 transition-colors bg-white/60 h-32 md:h-40 flex flex-col group cursor-pointer" 
                            onClick={() => {
                                if(dayOrders.length > 0) {
                                    const formattedSearchDate = `${String(dateNum).padStart(2, '0')}/${String(currentMonth.getMonth() + 1).padStart(2, '0')}/${currentMonth.getFullYear()}`;
                                    setSearch(formattedSearchDate);
                                    setViewMode("list");
                                }
                            }}
                        >
                        <div className={`font-black text-sm mb-2 w-8 h-8 flex items-center justify-center rounded-full ${dateStr === new Date().toISOString().split('T')[0] ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors'}`}>{dateNum}</div>
                        {dayOrders.length > 0 ? (
                            <div className="mt-auto space-y-1.5 w-full">
                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50/80 px-2 py-1.5 rounded-lg border border-blue-100/50 shadow-sm truncate">{dayOrders.length} Orders</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50/80 px-2 py-1.5 rounded-lg border border-emerald-100/50 shadow-sm truncate">Rs {(totalRev/1000).toFixed(1)}k</div>
                            </div>
                        ) : null}
                        </div>
                    );
                })}
            </div>
          </div>
      ) : (
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="p-5 font-bold pl-8 w-16">
                    <input type="checkbox" onChange={handleSelectAll} checked={filtered.length > 0 && selectedOrderIds.length === filtered.length} className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300" />
                </th>
                <th className="p-5 font-bold">Order ID</th>
                <th className="p-5 font-bold">Customer</th>
                <th className="p-5 font-bold">Items</th>
                <th className="p-5 font-bold">Total</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500 font-medium">No orders found.</td></tr>
              )}
              {filtered.map((order) => (
                <tr key={order.id} className={`transition-colors group ${selectedOrderIds.includes(order.id) ? 'bg-slate-50' : 'hover:bg-slate-50/80'}`}>
                  <td className="p-5 align-top pl-8">
                      <input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => handleSelectOne(order.id)} className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 mt-1" />
                  </td>
                  <td className="p-5 align-top">
                    <div className="font-mono font-bold text-slate-500 text-xs group-hover:text-slate-700 transition-colors">{order.id.slice(-8)}</div>
                    <div className="mt-1 text-[10px] font-bold tracking-widest uppercase text-slate-400">{order.date}</div>
                  </td>
                  <td className="p-5 align-top">
                    <div className="font-bold text-slate-900">{order.customer}</div>
                    <div className="text-slate-500 font-medium text-[11px] mt-0.5">{order.phone}</div>
                    <div className="text-slate-400 font-medium text-[11px]">{order.city}</div>
                  </td>
                  <td className="p-5 align-top text-slate-600 font-medium text-xs max-w-[200px] leading-relaxed">{order.items}</td>
                  <td className="p-5 align-top font-black text-emerald-600">Rs {(order.total || 0).toLocaleString()}</td>
                  <td className="p-5 align-top">
                    <select
                      className={`h-9 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer shadow-sm transition-all hover:-translate-y-0.5 ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            order.status === 'processing' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
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
                  <td className="p-5 align-top text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="p-2 text-slate-400 hover:text-emerald-600 transition-all bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <Eye size={16} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-red-200">
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}