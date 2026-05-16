import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const CATEGORIES = ["Earbuds", "Smart Watches", "Headphones", "Speakers", "Accessories"];

interface ProductForm {
  name: string; price: string; original_price: string; category: string;
  tagline: string; stock: string; image_url: string;
}

const emptyForm: ProductForm = { name: "", price: "", original_price: "", category: "Earbuds", tagline: "", stock: "100", image_url: "" };

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    axios.get(`${backendUrl}/api/admin/products`)
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name, price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
      category: p.category, tagline: p.tagline || "", stock: String(p.stock), image_url: p.image_url || ""
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error("Fill all required fields."); return; }
    setSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      if (editingId) {
        await axios.put(`${backendUrl}/api/admin/products/${editingId}`, {
          name: form.name, price: form.price, original_price: form.original_price || null,
          category: form.category, tagline: form.tagline, stock: form.stock, is_active: true
        });
        toast.success("Product updated!");
      } else {
        await axios.post(`${backendUrl}/api/admin/products`, {
          name: form.name, price: form.price, original_price: form.original_price || null,
          category: form.category, tagline: form.tagline, stock: form.stock, image_url: form.image_url
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
      await axios.delete(`${backendUrl}/api/admin/products/${id}`);
      toast.success("Product deleted!");
      fetchProducts();
    } catch { toast.error("Failed to delete."); }
  };

  if (loading) return <div className="p-10 text-slate-500">Loading Products...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Products ({products.length})</h1>
          <p className="text-slate-500 mt-1">Manage your inventory.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No products found.</td></tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{product.name}</div>
                    {product.tagline && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{product.tagline}</div>}
                  </td>
                  <td className="p-4 text-slate-500">{product.category}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">Rs {(product.price || 0).toLocaleString()}</div>
                    {product.original_price && <div className="text-xs text-slate-400 line-through">Rs {product.original_price.toLocaleString()}</div>}
                  </td>
                  <td className="p-4 text-slate-500">{product.stock}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>{product.status}</span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEdit(product)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="BreezyGo ProBuds X1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (Rs) *</label>
                  <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="2999" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original Price</label>
                  <input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="4999" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="100" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tagline</label>
                <input value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Premium wireless earbuds with ANC" />
              </div>

              {!editingId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                  <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="/assets/products/image.webp" />
                </div>
              )}

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
