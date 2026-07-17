import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Save, ArrowLeft, Loader2, Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown, Upload, X, Monitor, Smartphone, Eye, Edit2, Palette, Sparkles, Wifi, Phone, Activity, Zap, Battery, Droplets, Info, Watch, Headphones, Speaker, Bluetooth, Heart, Clock, Shield, Settings, Camera, Music, HelpCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const AVAILABLE_ICONS: Record<string, any> = {
  Smartphone, Palette, Sparkles, Wifi, Phone, Activity, Zap, Battery, Droplets, Info, Watch, Headphones, Speaker, Bluetooth, Heart, Clock, Shield, Settings, Camera, Music, HelpCircle
};

function authAxios() {
  const token = localStorage.getItem("admin_token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
}

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "desktop" | "mobile">("edit");
  const [form, setForm] = useState<any>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState<number | null>(null);

  useEffect(() => {
    if (location.state?.product) {
      initForm(location.state.product);
      setLoading(false);
    } else {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      authAxios().get(`${backendUrl}/api/admin/products`)
        .then(res => {
          const p = res.data.find((x: any) => x.id === id);
          if (p) initForm(p);
          else { toast.error("Product not found"); navigate("/products"); }
          setLoading(false);
        })
        .catch(() => { toast.error("Failed to fetch product"); navigate("/products"); });
    }
  }, [id, location.state, navigate]);

  const initForm = (p: any) => {
    setForm({
      id: p.id,
      slug: p.slug,
      name: p.name, price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
      category: p.category, tagline: p.tagline || "", stock: String(p.stock), image_url: p.image_url || "",
      images: p.images || (p.image_url ? [p.image_url] : []),

      sound_tabs: p.sound_tabs?.length ? p.sound_tabs : [
        { title: "Exceptional Call Clarity", desc: "Crystal-clear calls powered by advanced dual microphones.", img: "https://placehold.co/500x700/2d2d2d/999999?text=Call+Clarity" },
      ],
      features: p.features?.length ? p.features : [
        { title: "HD Display", subtitle: "1.39\" Full Touch", image: "https://placehold.co/400x400/eeeeee/888888?text=Display" }
      ],
      specs: p.specs?.length ? p.specs : [
        { categoryName: "Model", iconName: "Smartphone", attributes: [{ label: "Name", value: "Luna" }, { label: "Category", value: "Smart Watch" }] },
        { categoryName: "Colors", iconName: "Palette", attributes: [{ label: "Available", value: "Black, Grey, Rose Gold" }] },
        { categoryName: "Look and Feel", iconName: "Sparkles", attributes: [{ label: "Build", value: "Full Metal Body" }, { label: "Display", value: '1.39" IPS Full Touch HD Screen' }] },
        { categoryName: "Connectivity", iconName: "Wifi", attributes: [{ label: "Bluetooth Version", value: "V5.2" }] },
        { categoryName: "Calling", iconName: "Phone", attributes: [{ label: "BT Calling", value: "HD Built-in Speaker & Microphone" }] },
        { categoryName: "Health Monitoring", iconName: "Activity", attributes: [{ label: "Heart Rate", value: "24/7 Continuous Monitoring" }, { label: "SpO2", value: "Blood Oxygen Tracking" }] },
        { categoryName: "Charging", iconName: "Zap", attributes: [{ label: "Type", value: "Magnetic Charging Cable" }] },
        { categoryName: "Battery", iconName: "Battery", attributes: [{ label: "Standby", value: "Up to 7 Days" }] },
        { categoryName: "Water Resistance", iconName: "Droplets", attributes: [{ label: "Rating", value: "IP67 Certified" }] },
      ],
      faqs: p.faqs?.length ? p.faqs : [
        { q: "What is the warranty policy?", a: "All products come with a 7-day replacement warranty." },
      ],
      hero_text: p.hero_text || p.name,
      hero_subtitle: p.hero_subtitle || "Premium Smart Watch Collection",
      hero_image: p.hero_image || "",
      hero_image_mobile: p.hero_image_mobile || "",
      overview_text: p.overview_text || "Exclusive premium product featuring stunning design and performance...",
      watermark_title: p.watermark_title || "Feature-Packed Smart Watch",
      watermark_text: p.watermark_text || (p.name ? p.name.split(" ")[0] : "LUNA"),
      watermark_image: p.watermark_image || "",
      qty2_discount_percent: p.qty2_discount_percent !== undefined ? String(p.qty2_discount_percent) : "3",
      qty3_discount_percent: p.qty3_discount_percent !== undefined ? String(p.qty3_discount_percent) : "5",
    });
  };

  const qty2Discount = Number(form?.qty2_discount_percent) || 3;
  const qty3Discount = Number(form?.qty3_discount_percent) || 5;
  const price1 = Number(form?.price) || 0;
  const price2 = Math.round(price1 * (1 - qty2Discount / 100));
  const price3 = Math.round(price1 * (1 - qty3Discount / 100));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) { toast.error("Name, Price, Category required"); return; }
    setSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().put(`${backendUrl}/api/admin/products/${form.id}`, {
        ...form,
        image_url: form.images[0] || form.image_url,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        hero_image: form.hero_image,
        hero_image_mobile: form.hero_image_mobile,
        hero_subtitle: form.hero_subtitle,
        watermark_title: form.watermark_title,
        watermark_text: form.watermark_text,
        watermark_image: form.watermark_image,
        qty2_discount_percent: Number(form.qty2_discount_percent),
        qty3_discount_percent: Number(form.qty3_discount_percent),
      });
      toast.success("Saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File, callback: (url: string) => void) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary setup missing in .env!");
      return;
    }

    const toastId = toast.loading("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("cloud_name", cloudName);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (data.secure_url) {
        callback(data.secure_url);
        toast.success("Image uploaded!", { id: toastId });
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed", { id: toastId });
    }
  };

  if (loading || !form) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 h-10 w-10" /></div>;

  return (
    <div className={`min-h-screen bg-[#f5f5f5] text-neutral-800 pb-32 ${previewMode !== 'edit' ? 'preview-mode' : ''}`}>
      {/* ── Admin Toolbar ── */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/products")} className="p-2.5 hover:bg-slate-100/80 rounded-full transition-colors group">
            <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Visual Editor: <span className="font-medium text-slate-500">{form.name}</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          {previewMode !== "edit" && (
            <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center mr-2">
              <button onClick={() => setPreviewMode("desktop")} className={`p-2 rounded-xl transition-all ${previewMode === "desktop" ? "bg-white shadow-sm text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"}`}><Monitor size={18} strokeWidth={2.5} /></button>
              <button onClick={() => setPreviewMode("mobile")} className={`p-2 rounded-xl transition-all ${previewMode === "mobile" ? "bg-white shadow-sm text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"}`}><Smartphone size={18} strokeWidth={2.5} /></button>
            </div>
          )}
          
          <button onClick={() => setPreviewMode(previewMode === "edit" ? "desktop" : "edit")} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
            {previewMode === "edit" ? <><Eye size={18} strokeWidth={2.5} /> Preview</> : <><Edit2 size={18} strokeWidth={2.5} /> Edit</>}
          </button>

          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
            Save Changes
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .preview-mode input, .preview-mode textarea { pointer-events: none; border-color: transparent !important; }
        .preview-mode button.bg-red-500, .preview-mode button.text-red-400 { display: none !important; }
        .preview-mode button.bg-emerald-500 { display: none !important; }
        .preview-mode .group-hover\\:opacity-100 { opacity: 0 !important; }
        .preview-mode label.cursor-pointer { display: none !important; }
        .preview-mode .border-dashed { border-style: solid !important; border-color: transparent !important; }
        
        .mobile-wrapper { width: 375px; margin: 0 auto; height: 812px; overflow-y: auto; border: 12px solid #0f172a; border-radius: 3rem; background: #fff; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; margin-top: 2rem; }
        .mobile-wrapper::-webkit-scrollbar { display: none; }
        
        /* Force single column for grids when inside mobile wrapper */
        .mobile-wrapper .grid { display: flex !important; flex-direction: column !important; }
        .mobile-wrapper .lg\\:col-span-7, .mobile-wrapper .lg\\:col-span-5, .mobile-wrapper .lg\\:col-span-4, .mobile-wrapper .lg\\:col-span-8, .mobile-wrapper .col-span-4, .mobile-wrapper .col-span-8 { width: 100% !important; max-width: 100% !important; }
        .mobile-wrapper .md\\:w-\\[350px\\] { width: 100% !important; }
      `}} />

      <div className={previewMode === "mobile" ? "mobile-wrapper" : ""}>
        <div className="pt-28 mx-auto max-w-[1600px] px-4 md:px-10">
        
        {/* ── TOP SECTION: Gallery & Info ── */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-white aspect-square border-4 border-dashed border-emerald-200 hover:border-emerald-400 transition-colors group flex items-center justify-center">
              {form.images[0] ? (
                <img src={form.images[0]} alt="Product" className="w-full h-full object-cover" />
              ) : (
                <div className="text-emerald-500 flex flex-col items-center">
                  <Upload size={40} className="mb-2" />
                  <span className="font-bold">Upload Main Image</span>
                </div>
              )}
              <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  if (e.target.files?.[0]) uploadImage(e.target.files[0], res => setForm({...form, images: [res, ...form.images.slice(1)]}));
                }} />
              </label>
            </div>
            
            {/* Thumbnail Row */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {form.images.map((img: string, i: number) => (
                <div key={i} className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden border-2 border-emerald-200 group/thumb">
                  <img src={img} className="w-full h-full object-cover" />
                  {i !== 0 && (
                     <button onClick={() => setForm({...form, images: form.images.filter((_: any, idx: number) => idx !== i)})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/thumb:opacity-100"><Trash2 size={10} /></button>
                  )}
                </div>
              ))}
              <label className="h-24 w-24 shrink-0 rounded-xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-500 cursor-pointer hover:bg-emerald-50 transition-colors">
                <Plus size={20} />
                <span className="text-[10px] font-bold mt-1">Add Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  if (e.target.files?.[0]) uploadImage(e.target.files[0], res => setForm({...form, images: [...form.images, res]}));
                }} />
              </label>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 space-y-5">
            <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 bg-transparent outline-none border-b border-dashed border-emerald-300 w-full pb-1" placeholder="CATEGORY" />
            <textarea value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="text-3xl md:text-4xl font-extrabold text-neutral-900 leading-[1.1] uppercase tracking-tight bg-transparent outline-none w-full resize-none border-b border-dashed border-emerald-300" placeholder="Product Name" rows={2} />
            <textarea value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} className="text-sm text-neutral-500 bg-transparent outline-none w-full resize-none border-b border-dashed border-emerald-300" placeholder="Tagline..." rows={2} />
            
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-neutral-900 flex items-center gap-1">Rs.<input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-32 bg-transparent outline-none border-b border-dashed border-emerald-300" /></span>
              <span className="text-lg text-neutral-400 line-through flex items-center gap-1">Rs.<input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} className="w-24 bg-transparent outline-none border-b border-dashed border-emerald-300" placeholder="0" /></span>
            </div>
            
            <div className="opacity-50 pointer-events-none mt-4 space-y-3">
               <div className="w-full h-14 rounded-xl bg-[#00a651] text-white flex items-center justify-center font-bold uppercase tracking-widest shadow-md">🛒 Buy Now</div>
               <div className="w-full h-14 rounded-xl border border-neutral-300 bg-white flex items-center justify-center font-bold uppercase tracking-widest shadow-md mt-3">➕ Add to Cart</div>
               <div className="w-full h-14 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center font-bold uppercase tracking-widest mt-3">💬 Order via WhatsApp</div>
            </div>

            {/* Bundle Deal Selector */}
            <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white mt-8">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-1">Limited Time Offer</div>
                  <div className="text-2xl font-black text-neutral-900 leading-none">
                    Rs {price1.toLocaleString()} <span className="text-sm font-bold text-neutral-400 ml-2">total</span>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-5 space-y-2">
                <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-2">Configure Discounts</div>
                
                {/* Qty 1 */}
                <div className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl border-2 border-[#00a651] bg-gradient-to-r from-[#00a651] to-[#008a44] text-white shadow-lg shadow-[#00a651]/20">
                  <div className="flex items-center gap-3.5">
                    <div className="h-5 w-5 rounded-full border-2 border-white bg-white/20 flex items-center justify-center"><div className="h-2.5 w-2.5 rounded-full bg-white" /></div>
                    <div>
                      <div className="text-xs font-extrabold">Buy 1 — Single Pack</div>
                      <div className="text-[10px] font-semibold mt-0.5 text-white/80">Standard price</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-sm font-black">Rs {price1.toLocaleString()}<span className="text-[10px] font-semibold ml-0.5 text-white/80">/unit</span></div>
                </div>

                {/* Qty 2 */}
                <div className="w-full flex flex-col gap-2 px-5 py-4 rounded-xl border-2 border-neutral-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-5 w-5 rounded-full border-2 border-neutral-300 bg-white" />
                      <div>
                        <div className="text-xs font-extrabold text-neutral-900">Buy 2 — Double Saver</div>
                        <div className="text-[10px] font-semibold mt-0.5 text-neutral-400">Discount: <input type="number" value={form.qty2_discount_percent} onChange={e => setForm({...form, qty2_discount_percent: e.target.value})} className="w-12 bg-neutral-100 outline-none border-b border-dashed border-emerald-300 px-1 text-center" /> %</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-sm font-black text-neutral-900">Rs {price2.toLocaleString()}<span className="text-[10px] font-semibold ml-0.5 text-neutral-400">/unit</span></div>
                  </div>
                </div>

                {/* Qty 3 */}
                <div className="w-full flex flex-col gap-2 px-5 py-4 rounded-xl border-2 border-neutral-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-5 w-5 rounded-full border-2 border-neutral-300 bg-white" />
                      <div>
                        <div className="text-xs font-extrabold text-neutral-900">Buy 3+ — Mega Value</div>
                        <div className="text-[10px] font-semibold mt-0.5 text-neutral-400">Discount: <input type="number" value={form.qty3_discount_percent} onChange={e => setForm({...form, qty3_discount_percent: e.target.value})} className="w-12 bg-neutral-100 outline-none border-b border-dashed border-emerald-300 px-1 text-center" /> %</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-sm font-black text-neutral-900">Rs {price3.toLocaleString()}<span className="text-[10px] font-semibold ml-0.5 text-neutral-400">/unit</span></div>
                  </div>
                </div>

              </div>
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-100 rounded-xl text-sm mx-4 mb-4">
                <span className="text-neutral-600 font-medium">Corporate Gifting | Bulk Order</span>
                <span className="text-[#00a651] font-bold text-xs">Click Here</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="relative w-full overflow-hidden bg-neutral-900 mt-20 group/hero" style={{ minHeight: "100vh" }}>
        {form.hero_image ? <img src={form.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 hidden md:block" /> : <div className="absolute inset-0 bg-neutral-800 hidden md:block" />}
        {form.hero_image_mobile ? <img src={form.hero_image_mobile} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 block md:hidden" /> : (form.hero_image ? <img src={form.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 block md:hidden" /> : <div className="absolute inset-0 bg-neutral-800 block md:hidden" />)}
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-30">
          <label className="cursor-pointer bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
             <Upload size={18} /> <span className="text-sm font-bold">Upload Desktop Banner</span>
             <input type="file" accept="image/*" className="hidden" onChange={e => {
               if (e.target.files?.[0]) uploadImage(e.target.files[0], res => {
                 setForm({...form, hero_image: res});
               });
             }} />
          </label>
          <label className="cursor-pointer bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
             <Smartphone size={18} /> <span className="text-sm font-bold">Upload Mobile Banner</span>
             <input type="file" accept="image/*" className="hidden" onChange={e => {
               if (e.target.files?.[0]) uploadImage(e.target.files[0], res => {
                 setForm({...form, hero_image_mobile: res});
               });
             }} />
          </label>
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          <textarea value={form.hero_text} onChange={e => setForm({...form, hero_text: e.target.value})} className="text-[clamp(4rem,12vw,10rem)] font-black text-white/40 leading-none tracking-tighter uppercase select-none bg-transparent outline-none w-full text-center resize-none border-b border-dashed border-white/20" rows={2} placeholder="HERO TEXT" />
          <input value={form.hero_subtitle} onChange={e => setForm({...form, hero_subtitle: e.target.value})} className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-neutral-400 mt-4 bg-transparent outline-none w-full text-center border-b border-dashed border-white/20" placeholder="HERO SUBTITLE" />
          <button className="mt-8 px-8 py-3 bg-[#00a651] text-white rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-2 opacity-50 cursor-not-allowed">
            Explore <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      <div className="bg-[#f5f5f5] py-16">
        <div className="mx-auto max-w-[1600px] w-full px-4 md:px-10">
          <h2 className="text-3xl font-semibold text-neutral-900 uppercase tracking-tight mb-6">Overview</h2>
          <textarea value={form.overview_text} onChange={e => setForm({...form, overview_text: e.target.value})} className="text-base text-neutral-600 leading-relaxed bg-transparent outline-none w-full resize-none border-b border-dashed border-emerald-300" rows={5} placeholder="Write your product overview here..." />
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <div className="bg-white py-16 mt-16 relative group">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => setForm({...form, features: [...form.features, { title: "New Feature", subtitle: "Subtitle", image: "" }]})} className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm font-bold">+ Add Feature</button>
        </div>
        <div className="mx-auto max-w-[1600px] w-full px-4 md:px-10 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            {form.features.map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-4 bg-neutral-50 rounded-2xl px-6 py-5 border border-neutral-100 hover:shadow-md transition-shadow relative group/feat">
                <button onClick={() => setForm({...form, features: form.features.filter((_: any, idx: number) => idx !== i)})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/feat:opacity-100 z-10"><Trash2 size={12} /></button>
                <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0 relative overflow-hidden group/img">
                  {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <Upload className="text-neutral-400" size={20} />}
                  <label className="absolute inset-0 cursor-pointer bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      if (e.target.files?.[0]) uploadImage(e.target.files[0], res => {
                        const arr = [...form.features]; arr[i].image = res; setForm({...form, features: arr});
                      });
                    }} />
                  </label>
                </div>
                <div className="flex-1">
                  <input value={f.title} onChange={e => { const arr = [...form.features]; arr[i].title = e.target.value; setForm({...form, features: arr}); }} className="text-sm font-bold text-neutral-900 bg-transparent outline-none w-full border-b border-dashed border-emerald-300" placeholder="Title" />
                  <input value={f.subtitle} onChange={e => { const arr = [...form.features]; arr[i].subtitle = e.target.value; setForm({...form, features: arr}); }} className="text-xs text-neutral-400 font-medium bg-transparent outline-none w-full border-b border-dashed border-emerald-300 mt-1" placeholder="Subtitle" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-8 bg-neutral-50 rounded-3xl border border-neutral-100 flex flex-col items-center justify-center py-20 px-8 text-center relative group/watermark" style={{ minHeight: "450px" }}>
            {form.watermark_image && <img src={form.watermark_image} alt="Watermark" className="absolute inset-0 w-full h-full object-cover opacity-80 rounded-3xl z-0" />}
            
            <div className="absolute top-4 right-4 z-50 opacity-0 group-hover/watermark:opacity-100 transition-opacity">
               <label className="bg-white/80 backdrop-blur text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm cursor-pointer hover:bg-white flex items-center gap-2">
                 <Upload size={14} /> Upload Image
                 <input type="file" accept="image/*" className="hidden" onChange={e => {
                   if (e.target.files?.[0]) uploadImage(e.target.files[0], res => setForm({...form, watermark_image: res}));
                 }} />
               </label>
               {form.watermark_image && (
                 <button onClick={() => setForm({...form, watermark_image: ""})} className="mt-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                   Remove Image
                 </button>
               )}
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <input value={form.watermark_title} onChange={e => setForm({...form, watermark_title: e.target.value})} className={`text-base md:text-lg font-medium tracking-wide bg-transparent outline-none border-b border-dashed border-emerald-300 text-center w-full z-10 ${form.watermark_image ? 'text-white' : 'text-neutral-400'}`} placeholder="Watermark Title" />
              <textarea value={form.watermark_text} onChange={e => setForm({...form, watermark_text: e.target.value})} className={`text-[clamp(5rem,10vw,9rem)] font-black leading-none tracking-tight select-none italic bg-transparent outline-none w-full text-center resize-none border-b border-dashed border-emerald-300 z-10 ${form.watermark_image ? 'text-white/30' : 'text-neutral-200'}`} style={{ fontFamily: "Georgia, serif" }} rows={1} placeholder="WATERMARK" />
            </div>
          </div>
        </div>
      </div>


      {/* ── SOUND TABS SECTION ── */}
      <div className="bg-[#f5f5f5] py-20 relative group">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
           <button onClick={() => setForm({...form, sound_tabs: [...form.sound_tabs, { title: "Title", desc: "Description", img: "" }]})} className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm font-bold">+ Add Sound Tab</button>
        </div>
        <div className="mx-auto max-w-[1600px] w-full px-4 md:px-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="w-full md:w-[350px] space-y-6 shrink-0 relative z-10">
            {form.sound_tabs.map((tab: any, i: number) => (
              <div key={i} className="border-l-[3px] border-neutral-900 pl-5 py-1 relative group/tab">
                <button onClick={() => setForm({...form, sound_tabs: form.sound_tabs.filter((_: any, idx: number) => idx !== i)})} className="absolute top-0 -left-10 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/tab:opacity-100"><Trash2 size={14} /></button>
                <textarea value={tab.title} onChange={e => { const arr = [...form.sound_tabs]; arr[i].title = e.target.value; setForm({...form, sound_tabs: arr}); }} className="text-xl md:text-2xl font-black text-neutral-900 leading-tight mb-2 uppercase tracking-tight bg-transparent outline-none w-full resize-none border-b border-dashed border-emerald-300" rows={2} placeholder="Tab Title" />
                <textarea value={tab.desc} onChange={e => { const arr = [...form.sound_tabs]; arr[i].desc = e.target.value; setForm({...form, sound_tabs: arr}); }} className="text-neutral-600 text-sm leading-relaxed bg-transparent outline-none w-full resize-none border-b border-dashed border-emerald-300 mt-2" rows={4} placeholder="Tab Description" />
                
                {/* Image upload per tab directly under the text since we don't have the slider logic here */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-16 w-16 bg-neutral-200 rounded-lg overflow-hidden relative group/simg flex items-center justify-center border-2 border-dashed border-emerald-300">
                    {tab.img ? <img src={tab.img} alt="" className="w-full h-full object-cover" /> : <Upload size={16} className="text-emerald-500" />}
                    <label className="absolute inset-0 cursor-pointer bg-black/0 group-hover/simg:bg-black/20 flex items-center justify-center">
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                          if (e.target.files?.[0]) uploadImage(e.target.files[0], res => {
                            const arr = [...form.sound_tabs]; arr[i].img = res; setForm({...form, sound_tabs: arr});
                          });
                      }} />
                    </label>
                  </div>
                  <span className="text-xs text-neutral-500 font-bold">Slider Image</span>
                </div>
              </div>
            ))}
          </div>
          <div className="relative w-full max-w-[650px] aspect-[4/5] md:aspect-auto md:h-[625px] mx-auto overflow-hidden rounded-2xl bg-neutral-200 flex items-center justify-center">
             <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg relative z-20">
               <p className="font-bold text-slate-800 text-lg">Slider Preview Area</p>
               <p className="text-sm text-slate-500">Upload images for each tab on the left.</p>
             </div>
             {form.sound_tabs[0]?.img && <img src={form.sound_tabs[0].img} alt="" className="absolute inset-0 w-full h-full object-cover z-10 opacity-50" />}
          </div>
        </div>
      </div>

      {/* ── SPECS SECTION ── */}
      <div className="bg-white py-16 relative group">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => setForm({...form, specs: [...form.specs, { categoryName: "New Category", attributes: [{label: "Label", value: "Value"}] }]})} className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm font-bold">+ Add Spec Category</button>
        </div>
        <div className="mx-auto max-w-[1600px] w-full px-4 md:px-10">
          <h2 className="text-3xl font-semibold text-neutral-900 uppercase tracking-tight mb-8">Explore The Specs</h2>
          <div className="divide-y divide-neutral-100">
            {form.specs.map((cat: any, i: number) => (
              <div key={i} className="grid grid-cols-12 gap-6 py-8 items-start relative group/cat">
                <button onClick={() => setForm({...form, specs: form.specs.filter((_: any, idx: number) => idx !== i)})} className="absolute top-8 right-0 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover/cat:opacity-100"><Trash2 size={16} /></button>
                <div className="col-span-4 flex items-center gap-3 relative">
                  <button onClick={() => setIconPickerOpen(iconPickerOpen === i ? null : i)} className="h-10 w-10 flex items-center justify-center border border-dashed border-neutral-300 rounded hover:bg-neutral-50 shrink-0">
                    {(() => {
                      const IconComp = AVAILABLE_ICONS[cat.iconName || "HelpCircle"] || HelpCircle;
                      return <IconComp className="h-6 w-6 text-neutral-600 stroke-[1.5]" />;
                    })()}
                  </button>
                  {iconPickerOpen === i && (
                    <div className="absolute top-12 left-0 w-64 bg-white border border-neutral-200 shadow-xl rounded-xl p-3 z-50 grid grid-cols-5 gap-2">
                      {Object.keys(AVAILABLE_ICONS).map(iconName => {
                        const IconComp = AVAILABLE_ICONS[iconName];
                        return (
                          <button key={iconName} onClick={() => { const arr = [...form.specs]; arr[i].iconName = iconName; setForm({...form, specs: arr}); setIconPickerOpen(null); }} className={`p-2 rounded hover:bg-emerald-50 flex items-center justify-center ${cat.iconName === iconName ? 'bg-emerald-100 text-emerald-600' : 'text-neutral-600'}`}>
                            <IconComp className="h-5 w-5 stroke-[1.5]" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <input value={cat.categoryName} onChange={e => { const arr = [...form.specs]; arr[i].categoryName = e.target.value; setForm({...form, specs: arr}); }} className="text-base font-bold text-neutral-900 bg-transparent outline-none border-b border-dashed border-emerald-300 w-full" placeholder="Category Name" />
                </div>
                <div className="col-span-8 space-y-2">
                  {cat.attributes?.map((attr: any, j: number) => (
                    <div key={j} className="flex gap-4 items-center group/attr">
                      <input value={attr.label} onChange={e => { const arr = [...form.specs]; arr[i].attributes[j].label = e.target.value; setForm({...form, specs: arr}); }} className="text-sm font-bold text-neutral-800 bg-transparent outline-none w-1/3 border-b border-dashed border-emerald-300" placeholder="Label" />
                      <input value={attr.value} onChange={e => { const arr = [...form.specs]; arr[i].attributes[j].value = e.target.value; setForm({...form, specs: arr}); }} className="text-sm text-neutral-600 bg-transparent outline-none flex-1 border-b border-dashed border-emerald-300" placeholder="Value" />
                      <button onClick={() => { const arr = [...form.specs]; arr[i].attributes = arr[i].attributes.filter((_: any, idx: number) => idx !== j); setForm({...form, specs: arr}); }} className="text-red-400 opacity-0 group-hover/attr:opacity-100"><X size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => { const arr = [...form.specs]; arr[i].attributes.push({label: "", value: ""}); setForm({...form, specs: arr}); }} className="text-xs font-bold text-emerald-500 mt-2">+ Add Row</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ SECTION ── */}
      <div className="bg-[#f5f5f5] py-16 relative group">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => setForm({...form, faqs: [...form.faqs, { q: "New Question?", a: "Answer here" }]})} className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm font-bold">+ Add FAQ</button>
        </div>
        <div className="mx-auto max-w-[1600px] w-full px-4 md:px-10">
          <h2 className="text-3xl font-semibold text-neutral-900 uppercase tracking-tight mb-8">FAQ's</h2>
          <div className="space-y-4">
            {form.faqs.map((faq: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4 relative group/faq">
                <button onClick={() => setForm({...form, faqs: form.faqs.filter((_: any, idx: number) => idx !== i)})} className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/faq:opacity-100 z-10"><Trash2 size={12} /></button>
                <input value={faq.q} onChange={e => { const arr = [...form.faqs]; arr[i].q = e.target.value; setForm({...form, faqs: arr}); }} className="text-sm font-bold text-neutral-800 bg-transparent outline-none w-full border-b border-dashed border-emerald-300 mb-2 pr-8" placeholder="Question?" />
                <textarea value={faq.a} onChange={e => { const arr = [...form.faqs]; arr[i].a = e.target.value; setForm({...form, faqs: arr}); }} className="text-sm text-neutral-500 leading-relaxed bg-transparent outline-none w-full resize-none border-b border-dashed border-emerald-300" rows={2} placeholder="Answer..." />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ── SALES GRAPH (Dummy for visual) ── */}
      <div className="bg-white py-16 relative group">
        <div className="mx-auto max-w-[1600px] w-full px-4 md:px-10">
          <div className="bg-white border-2 border-dashed border-emerald-300 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
            <h3 className="text-xl font-black text-neutral-800 uppercase tracking-tight mb-8">Sales Performance (Live Data placeholder)</h3>
            <div className="w-full h-[250px] flex items-end justify-center gap-2 md:gap-4">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <div key={i} className="w-8 md:w-16 bg-emerald-100 rounded-t-lg relative flex flex-col justify-end h-full">
                   <div className="bg-emerald-500 w-full rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-500 font-bold mt-6">Graph data will be fetched automatically on the live site based on real orders.</p>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
