import React from 'react';
import { Plus, X, Upload } from 'lucide-react';

interface BuilderProps {
  form: any;
  setForm: (form: any) => void;
}

export function TestimonialsBuilder({ form, setForm }: BuilderProps) {
  const addTestimonial = () => setForm({ ...form, testimonials: [...form.testimonials, { name: "", handle: "", text: "", rating: 5, image: "" }] });
  const update = (idx: number, field: string, val: any) => {
    const arr = [...form.testimonials];
    arr[idx][field] = val;
    setForm({ ...form, testimonials: arr });
  };
  const remove = (idx: number) => setForm({ ...form, testimonials: form.testimonials.filter((_: any, i: number) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Testimonials</h3>
        <button type="button" onClick={addTestimonial} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md text-xs font-bold">+ Add</button>
      </div>
      {form.testimonials.map((t: any, idx: number) => (
        <div key={idx} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50 relative">
          <button type="button" onClick={() => remove(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><X size={16}/></button>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name (e.g. Ahmed R.)" value={t.name} onChange={e => update(idx, 'name', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <input placeholder="Handle (e.g. @ahmed_r)" value={t.handle} onChange={e => update(idx, 'handle', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <textarea placeholder="Review text..." value={t.text} onChange={e => update(idx, 'text', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none" />
          <div className="flex gap-3">
            <input type="number" min="1" max="5" placeholder="Rating (1-5)" value={t.rating} onChange={e => update(idx, 'rating', Number(e.target.value))} className="w-24 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <input placeholder="Image URL" value={t.image} onChange={e => update(idx, 'image', e.target.value)} className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SoundTabsBuilder({ form, setForm }: BuilderProps) {
  const addTab = () => setForm({ ...form, sound_tabs: [...form.sound_tabs, { title: "", img: "" }] });
  const update = (idx: number, field: string, val: any) => {
    const arr = [...form.sound_tabs];
    arr[idx][field] = val;
    setForm({ ...form, sound_tabs: arr });
  };
  const remove = (idx: number) => setForm({ ...form, sound_tabs: form.sound_tabs.filter((_: any, i: number) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Sound Tabs Slider</h3>
        <button type="button" onClick={addTab} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md text-xs font-bold">+ Add Tab</button>
      </div>
      {form.sound_tabs.map((t: any, idx: number) => (
        <div key={idx} className="flex gap-3 items-center">
          <input placeholder="Title" value={t.title} onChange={e => update(idx, 'title', e.target.value)} className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
          <input placeholder="Image URL" value={t.img} onChange={e => update(idx, 'img', e.target.value)} className="flex-[2] px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
          <button type="button" onClick={() => remove(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><X size={16}/></button>
        </div>
      ))}
    </div>
  );
}

export function FeaturesBuilder({ form, setForm }: BuilderProps) {
  const addFeature = () => setForm({ ...form, features: [...form.features, { title: "", subtitle: "", image: "" }] });
  const update = (idx: number, field: string, val: any) => {
    const arr = [...form.features];
    arr[idx][field] = val;
    setForm({ ...form, features: arr });
  };
  const remove = (idx: number) => setForm({ ...form, features: form.features.filter((_: any, i: number) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Feature Sections</h3>
        <button type="button" onClick={addFeature} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md text-xs font-bold">+ Add Feature</button>
      </div>
      {form.features.map((f: any, idx: number) => (
        <div key={idx} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50 relative">
          <button type="button" onClick={() => remove(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><X size={16}/></button>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Title (e.g. HD Display)" value={f.title} onChange={e => update(idx, 'title', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <input placeholder="Subtitle (e.g. 1.39 IPS)" value={f.subtitle} onChange={e => update(idx, 'subtitle', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <input placeholder="Full-width Image URL" value={f.image} onChange={e => update(idx, 'image', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      ))}
    </div>
  );
}

export function SpecsBuilder({ form, setForm }: BuilderProps) {
  const addCategory = () => setForm({ ...form, specs: [...form.specs, { categoryName: "", attributes: [] }] });
  const removeCategory = (idx: number) => setForm({ ...form, specs: form.specs.filter((_: any, i: number) => i !== idx) });
  const updateCategory = (idx: number, field: string, val: string) => {
    const arr = [...form.specs];
    arr[idx][field] = val;
    setForm({ ...form, specs: arr });
  };

  const addAttribute = (catIdx: number) => {
    const arr = [...form.specs];
    arr[catIdx].attributes.push({ label: "", value: "" });
    setForm({ ...form, specs: arr });
  };
  const updateAttribute = (catIdx: number, attrIdx: number, field: string, val: string) => {
    const arr = [...form.specs];
    arr[catIdx].attributes[attrIdx][field] = val;
    setForm({ ...form, specs: arr });
  };
  const removeAttribute = (catIdx: number, attrIdx: number) => {
    const arr = [...form.specs];
    arr[catIdx].attributes = arr[catIdx].attributes.filter((_: any, i: number) => i !== attrIdx);
    setForm({ ...form, specs: arr });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Detailed Specifications</h3>
        <button type="button" onClick={addCategory} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md text-xs font-bold">+ Add Category</button>
      </div>
      {form.specs.map((cat: any, cIdx: number) => (
        <div key={cIdx} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50 relative">
          <button type="button" onClick={() => removeCategory(cIdx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><X size={16}/></button>
          <div className="flex items-center gap-3">
            <input placeholder="Category Name (e.g. Battery)" value={cat.categoryName} onChange={e => updateCategory(cIdx, 'categoryName', e.target.value)} className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
            <input placeholder="Icon Image URL (Optional)" value={cat.iconImage || ''} onChange={e => updateCategory(cIdx, 'iconImage', e.target.value)} className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="button" onClick={() => addAttribute(cIdx)} className="text-emerald-600 text-xs font-bold hover:underline">+ Add Row</button>
          </div>
          <div className="space-y-2 mt-2">
            {cat.attributes.map((attr: any, aIdx: number) => (
              <div key={aIdx} className="flex gap-2 items-center">
                <input placeholder="Label (e.g. Playtime)" value={attr.label} onChange={e => updateAttribute(cIdx, aIdx, 'label', e.target.value)} className="flex-1 px-3 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                <input placeholder="Value (e.g. 40 Hours)" value={attr.value} onChange={e => updateAttribute(cIdx, aIdx, 'value', e.target.value)} className="flex-1 px-3 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                <button type="button" onClick={() => removeAttribute(cIdx, aIdx)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
