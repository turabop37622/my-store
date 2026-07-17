import { useState, useEffect } from "react";
import { Eye, Layers, Timer, BarChart3, Plus, Trash2, Save, ToggleLeft, ToggleRight, Loader2, Calendar, Truck, MessageSquare } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

function authAxios() {
  const token = localStorage.getItem("admin_token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
}

export default function Features() {
  const [activeTab, setActiveTab] = useState<"viewers" | "stock" | "discounts" | "graph" | "delivery" | "support">("viewers");
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Settings states (Live Viewers, Sales Graph, Delivery & Support)
  const [settings, setSettings] = useState({
    live_viewers_enabled: true,
    live_viewers_min: 3,
    live_viewers_max: 30,
    live_viewers_interval_min: 15,
    live_viewers_interval_max: 45,
    sales_graph_enabled_global: true,
    sales_graph_disabled_products: [] as string[],
    lahore_delivery_hours: { min: 24, max: 48 },
    other_cities_processing_days: 2,
    other_cities_shipping_days: 2,
    homepage_banner_enabled: true,
    homepage_banner_text: "🚀 24-48 Hour Delivery Anywhere in Lahore — No Extra Charges!",
    whatsapp_number: "923001234567",
    ai_chat_enabled: true,
    ai_chat_system_prompt: "You are the AI assistant for BreezyGo Store. Delivery Times: Lahore 24-48 hours, Other Cities 4-6 days. Shipping is free. Keep responses short and in English/Roman Urdu."
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Stock Batches states
  const [selectedStockProduct, setSelectedStockProduct] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [newBatchLabel, setNewBatchLabel] = useState("");
  const [newBatchQty, setNewBatchQty] = useState("");
  const [addingBatch, setAddingBatch] = useState(false);

  // Timed Discounts states
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    product_id: "",
    discount_percent: "",
    start_time: "",
    end_time: ""
  });
  const [creatingDiscount, setCreatingDiscount] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Fetch all products
  const fetchProducts = () => {
    setLoadingProducts(true);
    authAxios().get(`${backendUrl}/api/admin/products`)
      .then(res => {
        setProducts(res.data);
        if (res.data.length > 0) {
          setSelectedStockProduct(res.data[0].id);
          setDiscountForm(f => ({ ...f, product_id: res.data[0].id }));
        }
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingProducts(false);
      });
  };

  // Fetch global settings
  const fetchSettings = () => {
    authAxios().get(`${backendUrl}/api/admin/settings`)
      .then(res => {
        const data = res.data || {};
        setSettings(s => ({
          ...s,
          ...data,
          lahore_delivery_hours: {
            min: data.lahore_delivery_hours?.min ?? s.lahore_delivery_hours.min,
            max: data.lahore_delivery_hours?.max ?? s.lahore_delivery_hours.max,
          },
          sales_graph_disabled_products: data.sales_graph_disabled_products ?? s.sales_graph_disabled_products,
        }));
      })
      .catch(err => console.error("Error loading settings:", err));
  };


  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  // Save Settings handler
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await authAxios().put(`${backendUrl}/api/admin/settings`, settings);
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Stock Batches Fetch & Management ---
  const fetchBatches = (prodId: string) => {
    if (!prodId) return;
    setLoadingBatches(true);
    authAxios().get(`${backendUrl}/api/admin/stock-batches/${prodId}`)
      .then(res => {
        setBatches(res.data);
        setLoadingBatches(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingBatches(false);
      });
  };

  useEffect(() => {
    if (selectedStockProduct) {
      fetchBatches(selectedStockProduct);
    }
  }, [selectedStockProduct]);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchQty || Number(newBatchQty) < 1) {
      toast.error("Enter a valid quantity");
      return;
    }
    setAddingBatch(true);
    try {
      await authAxios().post(`${backendUrl}/api/admin/stock-batches/${selectedStockProduct}`, {
        label: newBatchLabel || undefined,
        quantity: Number(newBatchQty)
      });
      toast.success("Stock batch added!");
      setNewBatchLabel("");
      setNewBatchQty("");
      fetchBatches(selectedStockProduct);
    } catch {
      toast.error("Failed to add stock batch.");
    } finally {
      setAddingBatch(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    try {
      await authAxios().delete(`${backendUrl}/api/admin/stock-batches/delete/${batchId}`);
      toast.success("Batch deleted!");
      fetchBatches(selectedStockProduct);
    } catch {
      toast.error("Failed to delete batch.");
    }
  };

  // --- Timed Discounts Fetch & Management ---
  const fetchDiscounts = () => {
    setLoadingDiscounts(true);
    authAxios().get(`${backendUrl}/api/admin/discounts`)
      .then(res => {
        setDiscounts(res.data);
        setLoadingDiscounts(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingDiscounts(false);
      });
  };

  useEffect(() => {
    if (activeTab === "discounts") {
      fetchDiscounts();
    }
  }, [activeTab]);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const { product_id, discount_percent, start_time, end_time } = discountForm;
    if (!product_id || !discount_percent || !start_time || !end_time) {
      toast.error("All fields are required");
      return;
    }
    setCreatingDiscount(true);
    try {
      await authAxios().post(`${backendUrl}/api/admin/discounts`, {
        product_id,
        discount_percent: Number(discount_percent),
        start_time,
        end_time
      });
      toast.success("Discount scheduled successfully!");
      setDiscountForm({
        product_id: products[0]?.id || "",
        discount_percent: "",
        start_time: "",
        end_time: ""
      });
      fetchDiscounts();
    } catch {
      toast.error("Failed to schedule discount.");
    } finally {
      setCreatingDiscount(false);
    }
  };

  const handleCancelDiscount = async (id: string) => {
    if (!confirm("Cancel this discount?")) return;
    try {
      await authAxios().delete(`${backendUrl}/api/admin/discounts/${id}`);
      toast.success("Discount cancelled!");
      fetchDiscounts();
    } catch {
      toast.error("Failed to cancel discount.");
    }
  };

  // --- Sales Graph Setting Helper ---
  const toggleProductGraphOverride = async (prodId: string) => {
    const isCurrentlyDisabled = settings.sales_graph_disabled_products.includes(prodId);
    let updatedDisabled = [...settings.sales_graph_disabled_products];
    if (isCurrentlyDisabled) {
      updatedDisabled = updatedDisabled.filter(id => id !== prodId);
    } else {
      updatedDisabled.push(prodId);
    }

    const updatedSettings = {
      ...settings,
      sales_graph_disabled_products: updatedDisabled
    };

    setSettings(updatedSettings);

    try {
      await authAxios().put(`${backendUrl}/api/admin/settings`, updatedSettings);
      toast.success("Sales graph override updated!");
    } catch {
      toast.error("Failed to update override.");
    }
  };

  const tabs = [
    { id: "viewers", label: "Live Viewers", icon: Eye },
    { id: "stock", label: "Stock Batches", icon: Layers },
    { id: "discounts", label: "Timed Discounts", icon: Timer },
    { id: "graph", label: "Sales Graph", icon: BarChart3 },
    { id: "delivery", label: "Delivery Settings", icon: Truck },
    { id: "support", label: "Support Settings", icon: MessageSquare }
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tighter text-slate-900">Features Management</h1>
        <p className="text-slate-500 mt-1 font-medium">Configure advanced settings, batches, discounts, and visual charts.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap border-b border-slate-200/60 gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all -mb-px ${isActive ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-900 hover:border-slate-300"}`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
        {/* --- SECTION 1: LIVE VIEWERS --- */}
        {activeTab === "viewers" && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3">Simulated Live Viewers Counter</h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="font-semibold text-slate-800 text-sm">Enable Live Viewers Counter</span>
                <p className="text-xs text-slate-500 mt-0.5">Show simulated audience badge on product pages.</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, live_viewers_enabled: !s.live_viewers_enabled }))}
                className="text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                {settings.live_viewers_enabled ? (
                  <ToggleRight className="h-10 w-10" />
                ) : (
                  <ToggleLeft className="h-10 w-10 text-slate-400" />
                )}
              </button>
            </div>

            {settings.live_viewers_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Min Viewers</label>
                  <input
                    type="number"
                    value={settings.live_viewers_min}
                    onChange={e => setSettings(s => ({ ...s, live_viewers_min: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Viewers</label>
                  <input
                    type="number"
                    value={settings.live_viewers_max}
                    onChange={e => setSettings(s => ({ ...s, live_viewers_max: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Min Interval (sec)</label>
                  <input
                    type="number"
                    value={settings.live_viewers_interval_min}
                    onChange={e => setSettings(s => ({ ...s, live_viewers_interval_min: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Interval (sec)</label>
                  <input
                    type="number"
                    value={settings.live_viewers_interval_max}
                    onChange={e => setSettings(s => ({ ...s, live_viewers_interval_max: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/20 text-sm disabled:opacity-50 hover:-translate-y-0.5 mt-8"
            >
              {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" strokeWidth={2.5} />}
              Save Settings
            </button>
          </div>
        )}

        {/* --- SECTION 2: STOCK BATCHES --- */}
        {activeTab === "stock" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3">Stock Batches Management</h3>
            
            {loadingProducts ? (
              <div className="text-slate-500">Loading products...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Product</label>
                  <select
                    value={selectedStockProduct}
                    onChange={e => setSelectedStockProduct(e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 pt-4">
                  {/* Left: Add Batch Form */}
                  <form onSubmit={handleAddBatch} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4 h-fit">
                    <span className="font-bold text-slate-800 text-sm block">Add New Batch</span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Batch Label (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Batch A"
                        value={newBatchLabel}
                        onChange={e => setNewBatchLabel(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quantity</label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={newBatchQty}
                        onChange={e => setNewBatchQty(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingBatch}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 text-sm"
                    >
                      {addingBatch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Add Batch
                    </button>
                  </form>

                  {/* Right: Batches Table */}
                  <div className="lg:col-span-2 space-y-3">
                    <span className="font-bold text-slate-800 text-sm block">Active & Scheduled Batches</span>
                    {loadingBatches ? (
                      <div className="text-slate-500 text-sm py-4">Loading batches...</div>
                    ) : batches.length === 0 ? (
                      <div className="text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center">
                        No active stock batches found for this product. Displays standard stock on frontend.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                        <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold">
                            <tr>
                              <th className="px-4 py-3">Batch</th>
                              <th className="px-4 py-3">Original Qty</th>
                              <th className="px-4 py-3">Remaining</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {batches.map((batch, index) => {
                              const isActive = index === 0 && batch.remaining > 0;
                              return (
                                <tr key={batch.id}>
                                  <td className="px-4 py-3 font-bold text-slate-900">{batch.label}</td>
                                  <td className="px-4 py-3">{batch.quantity}</td>
                                  <td className="px-4 py-3 font-bold text-emerald-600">{batch.remaining}</td>
                                  <td className="px-4 py-3">
                                    {isActive ? (
                                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">Active Display</span>
                                    ) : batch.remaining === 0 ? (
                                      <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-100">Used Up</span>
                                    ) : (
                                      <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-100">Upcoming</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => handleDeleteBatch(batch.id)}
                                      className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all inline-flex"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SECTION 3: TIMED DISCOUNTS --- */}
        {activeTab === "discounts" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3">Timed Promotional Discounts</h3>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Form */}
              <form onSubmit={handleCreateDiscount} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4 h-fit">
                <span className="font-bold text-slate-800 text-sm block">Schedule New Discount</span>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Product</label>
                  <select
                    value={discountForm.product_id}
                    onChange={e => setDiscountForm(f => ({ ...f, product_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Discount Percent (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={discountForm.discount_percent}
                    onChange={e => setDiscountForm(f => ({ ...f, discount_percent: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Start Time</label>
                  <input
                    type="datetime-local"
                    value={discountForm.start_time}
                    onChange={e => setDiscountForm(f => ({ ...f, start_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Time</label>
                  <input
                    type="datetime-local"
                    value={discountForm.end_time}
                    onChange={e => setDiscountForm(f => ({ ...f, end_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingDiscount}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 text-sm disabled:opacity-50"
                >
                  {creatingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                  Schedule Campaign
                </button>
              </form>

              {/* Right Table */}
              <div className="lg:col-span-2 space-y-3">
                <span className="font-bold text-slate-800 text-sm block">Active & Upcoming Campaigns</span>
                {loadingDiscounts ? (
                  <div className="text-slate-500 text-sm py-4">Loading discounts...</div>
                ) : discounts.length === 0 ? (
                  <div className="text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center">
                    No scheduled discounts found.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Discount</th>
                          <th className="px-4 py-3">Duration</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {discounts.map(disc => {
                          const start = new Date(disc.start_time).toLocaleString();
                          const end = new Date(disc.end_time).toLocaleString();
                          return (
                            <tr key={disc.id}>
                              <td className="px-4 py-3">
                                <span className="font-bold text-slate-900 block">{disc.product_name}</span>
                                <span className="text-xs text-slate-400">Orig. Price: Rs {disc.product_price}</span>
                              </td>
                              <td className="px-4 py-3 font-extrabold text-rose-600">{disc.discount_percent}% OFF</td>
                              <td className="px-4 py-3 text-xs leading-relaxed">
                                <div><strong className="text-slate-500">From:</strong> {start}</div>
                                <div><strong className="text-slate-500">To:</strong> {end}</div>
                              </td>
                              <td className="px-4 py-3">
                                {disc.status === "active" ? (
                                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100 uppercase tracking-wide">Active Now</span>
                                ) : disc.status === "expired" ? (
                                  <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-100 uppercase tracking-wide">Expired</span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-100 uppercase tracking-wide">Scheduled</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleCancelDiscount(disc.id)}
                                  className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all inline-flex"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION 4: SALES GRAPH --- */}
        {activeTab === "graph" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3">Sales Graph Visibility</h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-xl">
              <div>
                <span className="font-semibold text-slate-800 text-sm">Globally Enable Sales Charts</span>
                <p className="text-xs text-slate-500 mt-0.5">Toggle charts globally on all product detail pages.</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, sales_graph_enabled_global: !s.sales_graph_enabled_global }))}
                className="text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                {settings.sales_graph_enabled_global ? (
                  <ToggleRight className="h-10 w-10" />
                ) : (
                  <ToggleLeft className="h-10 w-10 text-slate-400" />
                )}
              </button>
            </div>

            <div className="space-y-3">
              <span className="font-bold text-slate-800 text-sm block">Per-Product Override Configuration</span>
              <p className="text-xs text-slate-500">Enable or disable graphs for individual items below.</p>
              
              {loadingProducts ? (
                <div className="text-slate-500 text-sm">Loading overrides...</div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl max-w-2xl">
                  <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                      <tr>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Graph Visibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {products.map(p => {
                        // Product is disabled if it IS in the disabled list
                        const isDisabled = settings.sales_graph_disabled_products.includes(p.id);
                        const isVisible = settings.sales_graph_enabled_global && !isDisabled;
                        return (
                          <tr key={p.id}>
                            <td className="px-4 py-3 font-bold text-slate-900">{p.name}</td>
                            <td className="px-4 py-3 text-slate-500">{p.category}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => toggleProductGraphOverride(p.id)}
                                className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                                  isVisible 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                }`}
                              >
                                {isVisible ? "Visible" : "Hidden"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 text-sm disabled:opacity-50"
            >
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        )}

        {/* --- SECTION 5: DELIVERY SETTINGS --- */}
        {activeTab === "delivery" && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3">Delivery Estimate Configuration</h3>

            {/* Lahore */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2"><span className="text-emerald-500">⚡</span> Lahore Local Delivery</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Min Hours</label>
                  <input
                    type="number"
                    value={settings.lahore_delivery_hours.min}
                    onChange={e => setSettings(s => ({ ...s, lahore_delivery_hours: { ...s.lahore_delivery_hours, min: Number(e.target.value) } }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Max Hours</label>
                  <input
                    type="number"
                    value={settings.lahore_delivery_hours.max}
                    onChange={e => setSettings(s => ({ ...s, lahore_delivery_hours: { ...s.lahore_delivery_hours, max: Number(e.target.value) } }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Other Cities */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2"><span className="text-blue-500">📦</span> Other Cities (TCS Courier)</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Processing Days</label>
                  <input
                    type="number"
                    value={settings.other_cities_processing_days}
                    onChange={e => setSettings(s => ({ ...s, other_cities_processing_days: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Shipping/Transit Days</label>
                  <input
                    type="number"
                    value={settings.other_cities_shipping_days}
                    onChange={e => setSettings(s => ({ ...s, other_cities_shipping_days: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Total estimated delivery: <strong className="text-slate-700">{settings.other_cities_processing_days + settings.other_cities_shipping_days} days</strong> from order date
              </p>
            </div>

            {/* Homepage Banner */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-2"><span className="text-orange-500">🚀</span> Homepage Delivery Banner</span>
                <button
                  onClick={() => setSettings(s => ({ ...s, homepage_banner_enabled: !s.homepage_banner_enabled }))}
                  className="text-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  {settings.homepage_banner_enabled ? (
                    <ToggleRight className="h-10 w-10" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-slate-400" />
                  )}
                </button>
              </div>

              {settings.homepage_banner_enabled && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Banner Text</label>
                  <textarea
                    rows={2}
                    value={settings.homepage_banner_text}
                    onChange={e => setSettings(s => ({ ...s, homepage_banner_text: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold resize-none"
                  />
                  {/* Preview */}
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold text-center">
                    {settings.homepage_banner_text || "Preview will appear here"}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 text-sm disabled:opacity-50"
            >
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Delivery Settings
            </button>
          </div>
        )}

        {/* --- SECTION 6: SUPPORT SETTINGS --- */}
        {activeTab === "support" && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3">Support & AI Chat Configuration</h3>

            {/* WhatsApp Contact */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2"><span className="text-[#25D366]">🟢</span> WhatsApp Click-to-Chat</span>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business WhatsApp Number</label>
                <input
                  type="text"
                  value={settings.whatsapp_number || ""}
                  onChange={e => setSettings(s => ({ ...s, whatsapp_number: e.target.value }))}
                  placeholder="e.g. 923001234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Include country code without any spaces or special characters (e.g. 92 for Pakistan).</p>
              </div>
            </div>

            {/* AI Customer Support Chat */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">🤖 AI Customer Support Chat</span>
                <button
                  onClick={() => setSettings(s => ({ ...s, ai_chat_enabled: !s.ai_chat_enabled }))}
                  className="text-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  {settings.ai_chat_enabled ? (
                    <ToggleRight className="h-10 w-10" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-slate-400" />
                  )}
                </button>
              </div>

              {settings.ai_chat_enabled && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">System Prompt & FAQs</label>
                  <textarea
                    rows={6}
                    value={settings.ai_chat_system_prompt || ""}
                    onChange={e => setSettings(s => ({ ...s, ai_chat_system_prompt: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Provide FAQs, rules, delivery policies, return guidelines, and tone instructions for the AI model.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 text-sm disabled:opacity-50"
            >
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Support Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
