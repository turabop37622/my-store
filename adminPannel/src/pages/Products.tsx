import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, X, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { TestimonialsBuilder, SoundTabsBuilder, FeaturesBuilder, SpecsBuilder } from "../components/ProductBuilders";

function authAxios() {
  const token = localStorage.getItem("admin_token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
}

const CATEGORIES = ["Earbuds", "Smart Watches", "Headphones", "Speakers", "Accessories"];

interface Testimonial { name: string; handle: string; text: string; rating: number; image: string; }
interface SoundTab { title: string; img: string; }
interface FeatureCard { title: string; subtitle: string; image: string; }
interface SpecCategory { categoryName: string; attributes: { label: string; value: string; }[]; }

interface ProductDetail { key: string; value: string; }
interface ProductForm {
  name: string; price: string; original_price: string; category: string;
  tagline: string; stock: string; image_url: string;
  details: ProductDetail[]; images: string[];
  qty2_discount_percent: string;
  qty3_discount_percent: string;
  sales_baseline: string;
  testimonials: Testimonial[];
  sound_tabs: SoundTab[];
  features: FeatureCard[];
  specs: SpecCategory[];
}

const emptyForm: ProductForm = { 
  name: "", price: "", original_price: "", category: "Earbuds", tagline: "", stock: "100", image_url: "", details: [], images: [],
  qty2_discount_percent: "3",
  qty3_discount_percent: "5",
  sales_baseline: "10,15,8,12,9,14,18",
  testimonials: [], sound_tabs: [], features: [], specs: []
};

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Basic");

  const fetchProducts = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    authAxios().get(`${backendUrl}/api/admin/products`)
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setActiveTab("Basic"); setShowModal(true); };
  const openVisualEdit = (p: any) => {
    navigate(`/products/edit/${p.id}`, { state: { product: p } });
  };
  const openBasicEdit = (p: any) => {
    setForm({
      ...emptyForm,
      ...p,
      qty2_discount_percent: p.qty2_discount_percent !== undefined ? String(p.qty2_discount_percent) : "3",
      qty3_discount_percent: p.qty3_discount_percent !== undefined ? String(p.qty3_discount_percent) : "5",
      sales_baseline: String(p.sales_baseline || "0,0,0,0,0,0,0")
    });
    setEditingId(p.id);
    setActiveTab("Basic");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error("Fill all required fields."); return; }
    setSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      if (editingId) {
        await authAxios().put(`${backendUrl}/api/admin/products/${editingId}`, {
          name: form.name, price: form.price, original_price: form.original_price || null,
          category: form.category, tagline: form.tagline, stock: form.stock,
          image_url: form.images[0] || form.image_url, is_active: true,
          details: form.details, images: form.images,
          qty2_discount_percent: Number(form.qty2_discount_percent),
          qty3_discount_percent: Number(form.qty3_discount_percent),
          sales_baseline: String(form.sales_baseline || "0,0,0,0,0,0,0"),
          testimonials: form.testimonials, sound_tabs: form.sound_tabs, features: form.features, specs: form.specs
        });
        toast.success("Product updated!");
      } else {
        await authAxios().post(`${backendUrl}/api/admin/products`, {
          name: form.name, price: form.price, original_price: form.original_price || null,
          category: form.category, tagline: form.tagline, stock: form.stock,
          image_url: form.images[0] || form.image_url, details: form.details, images: form.images,
          qty2_discount_percent: Number(form.qty2_discount_percent),
          qty3_discount_percent: Number(form.qty3_discount_percent),
          sales_baseline: String(form.sales_baseline || "0,0,0,0,0,0,0"),
          testimonials: form.testimonials, sound_tabs: form.sound_tabs, features: form.features, specs: form.specs
        });
        toast.success("Product added!");
      }
      setShowModal(false);
      fetchProducts();
    } catch { toast.error("Failed to save product."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().delete(`${backendUrl}/api/admin/products/${id}`);
      toast.success("Product deleted!");
      fetchProducts();
    } catch { toast.error("Failed to delete."); }
  };

  const handleToggleActive = async (product: any) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().put(`${backendUrl}/api/admin/products/${product.id}`, {
        name: product.name, price: product.price,
        original_price: product.original_price || null,
        category: product.category, tagline: product.tagline || "",
        stock: product.stock, image_url: product.image_url,
        details: product.details || [], images: product.images || [],
        is_active: !product.is_active,
        qty2_discount_percent: product.qty2_discount_percent !== undefined ? Number(product.qty2_discount_percent) : 3,
        qty3_discount_percent: product.qty3_discount_percent !== undefined ? Number(product.qty3_discount_percent) : 5,
        sales_baseline: String(product.sales_baseline || "0,0,0,0,0,0,0")
      });
      toast.success(product.is_active ? "Product deactivated!" : "Product activated!");
      fetchProducts();
    } catch { toast.error("Failed to update status."); }
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse">Loading Products...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tighter text-slate-900">Products ({products.length})</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your inventory.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
          <Plus size={18} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="p-5 font-bold pl-8">Product</th>
                <th className="p-5 font-bold">Category</th>
                <th className="p-5 font-bold">Price</th>
                <th className="p-5 font-bold">Stock</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-medium">No products found.</td></tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 pl-8">
                    <div className="font-bold text-slate-900 text-base">{product.name}</div>
                    {product.tagline && <div className="text-[11px] text-slate-400 mt-1 truncate max-w-[200px] font-medium">{product.tagline}</div>}
                  </td>
                  <td className="p-5 text-slate-500 font-medium">{product.category}</td>
                  <td className="p-5">
                    <div className="font-black text-slate-900">Rs {(product.price || 0).toLocaleString()}</div>
                    {product.original_price && <div className="text-[10px] font-bold text-slate-400 line-through mt-0.5">Rs {product.original_price.toLocaleString()}</div>}
                  </td>
                  <td className="p-5 text-slate-500 font-medium">{product.stock}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>{product.status}</span>
                  </td>
                  <td className="p-5 text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggleActive(product)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] uppercase tracking-widest font-black transition-all shadow-sm hover:-translate-y-0.5 ${product.is_active
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}>
                        {product.is_active ? <><ToggleRight size={16} strokeWidth={2.5} /> Active</> : <><ToggleLeft size={16} strokeWidth={2.5} /> Inactive</>}
                      </button>
                      <button onClick={() => openBasicEdit(product)} title="Basic Edit" className="p-2 text-slate-400 hover:text-blue-600 transition-all bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => openVisualEdit(product)} title="Visual Edit" className="p-2 px-3 text-slate-600 hover:text-white hover:bg-slate-900 transition-all bg-slate-50 border border-slate-200 rounded-xl shadow-sm font-bold text-xs flex items-center gap-1 hover:shadow-md hover:-translate-y-0.5">
                        Visual Editor
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-red-200">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
              {["Basic", "Testimonials", "Sound Tabs", "Features", "Specs"].map(tab => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className={activeTab === "Basic" ? "space-y-4" : "hidden"}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="BreezyGo ProBuds X1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (Rs) *</label>
                  <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="2999" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original Price</label>
                  <input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="4999" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category *</label>
                  <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock *</label>
                  <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qty 2 Discount % *</label>
                  <input required type="number" min="0" max="100" value={form.qty2_discount_percent} onChange={e => setForm({ ...form, qty2_discount_percent: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qty 3+ Discount % *</label>
                  <input required type="number" min="0" max="100" value={form.qty3_discount_percent} onChange={e => setForm({ ...form, qty3_discount_percent: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Graph Sales Baselines (7 Days Comma-Separated)</label>
                <input type="text" value={form.sales_baseline} onChange={e => setForm({ ...form, sales_baseline: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="10,15,8,12,9,14,18" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tagline</label>
                <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Premium wireless earbuds with ANC" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Images</label>
                <div className="flex flex-col gap-2">
                  <input type="file" multiple accept="image/*" onChange={e => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          let width = img.width; let height = img.height;
                          const MAX_SIZE = 800;
                          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
                          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                          canvas.width = width; canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            setForm(prev => ({ ...prev, images: [...prev.images, canvas.toDataURL('image/webp', 0.8)] }));
                          }
                        };
                        img.src = reader.result as string;
                      };
                      reader.readAsDataURL(file);
                    });
                  }} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-slate-200" />
                          <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.images.length === 0 && form.image_url && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="relative group">
                        <img src={form.image_url} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-slate-200" />
                        <button type="button" onClick={() => setForm({ ...form, image_url: "" })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Details</label>
                  <button type="button" onClick={() => setForm({ ...form, details: [...form.details, { key: "", value: "" }] })}
                    className="text-xs text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Plus size={14} /> Add Detail
                  </button>
                </div>
                {form.details.map((detail, index) => (
                  <div key={index} className="flex gap-2">
                    <input value={detail.key} onChange={e => { const d = [...form.details]; d[index].key = e.target.value; setForm({ ...form, details: d }); }}
                      className="w-1/3 h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Battery" />
                    <input value={detail.value} onChange={e => { const d = [...form.details]; d[index].value = e.target.value; setForm({ ...form, details: d }); }}
                      className="w-2/3 h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Up to 30 hrs" />
                    <button type="button" onClick={() => setForm({ ...form, details: form.details.filter((_, i) => i !== index) })}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              </div>

              {/* Advanced Builders */}
              <div className={activeTab === "Testimonials" ? "block" : "hidden"}>
                <TestimonialsBuilder form={form} setForm={setForm} />
              </div>
              <div className={activeTab === "Sound Tabs" ? "block" : "hidden"}>
                <SoundTabsBuilder form={form} setForm={setForm} />
              </div>
              <div className={activeTab === "Features" ? "block" : "hidden"}>
                <FeaturesBuilder form={form} setForm={setForm} />
              </div>
              <div className={activeTab === "Specs" ? "block" : "hidden"}>
                <SpecsBuilder form={form} setForm={setForm} />
              </div>

              <button type="submit" disabled={saving}
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}