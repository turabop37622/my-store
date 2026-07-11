import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { placeOrder } from "@/lib/orders.functions";
import { useCart } from "@/lib/cart-store";
import { getProductImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Trash2, Banknote, Minus, Plus, Loader2, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAKISTAN_CITIES = [
  "Abbottabad", "Ahmadpur East", "Arif Wala", "Attock", "Badin", "Bahawalnagar",
  "Bahawalpur", "Bhakkar", "Bhalwal", "Burewala", "Chakwal", "Chaman", "Charsadda",
  "Chiniot", "Chishtian", "Dadu", "Daska", "Dera Ghazi Khan", "Dera Ismail Khan",
  "Faisalabad", "Ferozwala", "Ghotki", "Gojra", "Gujranwala", "Gujranwala Cantonment",
  "Gujrat", "Hafizabad", "Haroonabad", "Hasilpur", "Hub", "Hyderabad", "Islamabad",
  "Jacobabad", "Jaranwala", "Jatoi", "Jhang", "Jhelum", "Kabal", "Kamalia", "Kamber Ali Khan",
  "Kāmoke", "Kandhkot", "Karachi", "Kasur", "Khairpur", "Khanewal", "Khanpur", "Khushab",
  "Khuzdar", "Kohat", "Kot Abdul Malik", "Kot Addu", "Kotri", "Lahore", "Larkana",
  "Layyah", "Lodhran", "Mandi Bahauddin", "Mansehra", "Mardan", "Mianwali", "Mingora",
  "Mirpur", "Mirpur Khas", "Mirpur Mathelo", "Multan", "Muridke", "Muzaffarabad",
  "Muzaffargarh", "Narowal", "Nawabshah", "Nowshera", "Okara", "Pakpattan", "Peshawar",
  "Quetta", "Rahim Yar Khan", "Rawalpindi", "Sadiqabad", "Sahiwal", "Sambrial", "Samundri",
  "Sargodha", "Shahdadkot", "Sheikhupura", "Shikarpur", "Shorkot", "Sialkot", "Sukkur",
  "Swabi", "Tando Adam", "Tando Allahyar", "Tando Muhammad Khan", "Taxila", "Turbat",
  "Umerkot", "Vehari", "Wah Cantonment", "Wazirabad"
];

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Checkout — BreezyGo" }] }),
});

function Checkout() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const baseSubtotal = items.reduce((s, i) => {
    const qty2 = i.qty2_discount_percent !== undefined ? i.qty2_discount_percent : 3;
    const qty3 = i.qty3_discount_percent !== undefined ? i.qty3_discount_percent : 5;
    let disc = 0;
    if (i.quantity === 2) disc = qty2;
    else if (i.quantity >= 3) disc = qty3;
    const finalPrice = Math.round(i.price * (1 - disc / 100));
    return s + finalPrice * i.quantity;
  }, 0);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applyingCode, setApplyingCode] = useState(false);

  const discountAmount = discountApplied ? Math.round(baseSubtotal * (discountPercent / 100)) : 0;
  const subtotal = baseSubtotal - discountAmount;

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    notes: "",
  });
  const [locating, setLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let fullAddress = "";
        let finalCity = "";
        let postcode = "";

        // Method 1: Try OpenStreetMap Nominatim first (very detailed, exact street address)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const cityVal = addr.city || addr.town || addr.village || addr.state || "";
            
            // Use display_name directly if available for the most precise address details
            fullAddress = data.display_name || "";
            finalCity = cityVal;
            postcode = addr.postcode || "";
          }
        } catch (err) {
          console.warn("Nominatim lookup failed, trying BigDataCloud...", err);
        }

        // Method 2: Fallback to BigDataCloud reverse geocode API (simpler locality details)
        if (!fullAddress) {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (response.ok) {
              const data = await response.json();
              const parts = [
                data.locality || "",
                data.principalSubdivision || "",
                data.countryName || ""
              ].filter(Boolean);
              fullAddress = parts.join(", ");
              finalCity = data.city || data.locality || "";
              postcode = data.postcode || "";
            }
          } catch (e) {
            console.error("BigDataCloud lookup failed too", e);
          }
        }

        if (fullAddress) {
          const cleanCity = finalCity.replace(" Cantonment", "").trim();
          const matchedCity = PAKISTAN_CITIES.find(
            c => c.toLowerCase() === cleanCity.toLowerCase() || 
                 c.toLowerCase().includes(cleanCity.toLowerCase()) ||
                 cleanCity.toLowerCase().includes(c.toLowerCase())
          ) || "";

          setForm(prev => ({
            ...prev,
            address: fullAddress,
            city: matchedCity || prev.city,
            postal_code: postcode || prev.postal_code || ""
          }));

          toast.success("Location auto-filled! Please review and complete your details.");
        } else {
          toast.error("Unable to resolve address. Please enter your address manually.");
        }
        setLocating(false);
      },
      (error) => {
        console.error("Geolocation Error details:", error);
        if (error.code === 1) {
          toast.error("Location permission denied. Please enter address manually.");
        } else if (error.code === 2) {
          toast.error("Location position unavailable. Please enter address manually.");
        } else {
          toast.error("Location request timed out. Please enter address manually.");
        }
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-48 pb-24 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Your cart is empty</h1>
        <Button asChild className="rounded-full mt-10 h-14 px-12 text-xs font-black uppercase tracking-widest">
          <Link to="/shop">Explore Shop</Link>
        </Button>
      </div>
    );
  }

  const handleApplyCode = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;
    if (discountApplied) {
      setDiscountApplied(false);
      setDiscountCode("");
      setDiscountPercent(0);
      toast.info("Discount removed");
      return;
    }
    setApplyingCode(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid promo code");
        return;
      }
      setDiscountPercent(data.discount_percent);
      setDiscountApplied(true);
      toast.success(`${data.discount_percent}% discount applied! 🎉`);
    } catch {
      toast.error("Could not validate code. Try again.");
    } finally {
      setApplyingCode(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city) {
      toast.error("Please select a city.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await placeOrder({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postal_code: form.postal_code.trim() || null,
        notes: form.notes.trim() || null,
        discount_code: discountApplied ? discountCode.trim() : null,
        items: items.map((i) => {
          const qty2 = i.qty2_discount_percent !== undefined ? i.qty2_discount_percent : 3;
          const qty3 = i.qty3_discount_percent !== undefined ? i.qty3_discount_percent : 5;
          let disc = 0;
          if (i.quantity === 2) disc = qty2;
          else if (i.quantity >= 3) disc = qty3;
          const finalPrice = Math.round(i.price * (1 - disc / 100));
          return {
            product_id: i.product_id,
            slug: i.slug,
            name: i.name,
            price: finalPrice,
            quantity: i.quantity,
            image_url: i.image_url,
          };
        }),
      });
      toast.success("Order successful!");
      clear();
      router.navigate({
        to: "/order-success",
        search: { id: res.id, total: res.total_amount },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // Order Summary block - reused on both mobile (top) and desktop (sidebar)
  const renderOrderSummary = () => (
    <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 sm:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
        {items.map(i => (
          <div key={i.product_id} className="flex gap-3 items-start">
            <div className="h-14 w-14 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
              <img src={getProductImage(i.image_url)} alt={i.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col py-0.5">
              <div className="flex justify-between items-start gap-2 mb-0.5">
                <div className="text-sm font-bold text-slate-800 line-clamp-1">{i.name}</div>
                <button type="button" onClick={() => remove(i.product_id)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-slate-500 mb-2">
                Rs {(() => {
                  const qty2 = i.qty2_discount_percent !== undefined ? i.qty2_discount_percent : 3;
                  const qty3 = i.qty3_discount_percent !== undefined ? i.qty3_discount_percent : 5;
                  let disc = 0;
                  if (i.quantity === 2) disc = qty2;
                  else if (i.quantity >= 3) disc = qty3;
                  const finalPrice = Math.round(i.price * (1 - disc / 100));
                  return finalPrice.toLocaleString();
                })()}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center bg-white rounded-full p-0.5 border border-slate-200 shadow-sm w-fit">
                  <button type="button" onClick={() => setQty(i.product_id, i.quantity - 1)} className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-slate-600">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-medium text-slate-700">{i.quantity}</span>
                  <button type="button" onClick={() => setQty(i.product_id, i.quantity + 1)} className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-slate-600">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Rs {(() => {
                    const qty2 = i.qty2_discount_percent !== undefined ? i.qty2_discount_percent : 3;
                    const qty3 = i.qty3_discount_percent !== undefined ? i.qty3_discount_percent : 5;
                    let disc = 0;
                    if (i.quantity === 2) disc = qty2;
                    else if (i.quantity >= 3) disc = qty3;
                    const finalPrice = Math.round(i.price * (1 - disc / 100));
                    return (finalPrice * i.quantity).toLocaleString();
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Discount Code */}
      <div className="mb-5">
        <div className="flex gap-2">
          <Input
            placeholder="Discount code"
            className="h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            disabled={discountApplied || applyingCode}
          />
          <Button
            type="button"
            variant={discountApplied || discountCode.trim().length === 0 ? "outline" : "default"}
            disabled={applyingCode}
            className={`h-11 px-5 rounded-xl font-bold transition-all ${discountApplied
              ? "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-500"
              : discountCode.trim().length === 0
                ? "border-slate-200 text-slate-400 bg-transparent"
                : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            onClick={handleApplyCode}
          >
            {applyingCode ? <Loader2 className="animate-spin h-4 w-4" /> : discountApplied ? "Remove" : "Apply"}
          </Button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="text-slate-500">Rs {baseSubtotal.toLocaleString()}</span>
        </div>
        {discountApplied && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount ({discountPercent}%)</span>
            <span className="text-red-500 font-medium">- Rs {discountAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Shipping</span>
          <span className="text-emerald-500 font-medium">Free</span>
        </div>
        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xl font-bold text-slate-900">Total</span>
          <span className="text-xl font-bold text-slate-900">Rs {subtotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-28 md:pt-40 pb-24">
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-[1200px] px-4 md:px-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your details — payment on delivery.</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">

          {/* LEFT SIDE - Form */}
          <div className="lg:col-span-7 space-y-5 w-full">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Full Name</Label>
                <Input required className="h-12 rounded-xl border-slate-200 bg-white shadow-sm" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Phone Number</Label>
                <Input required className="h-12 rounded-xl border-slate-200 bg-white shadow-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="03XX-XXXXXXX" />
              </div>
            </div>

            {/* Email - NOW REQUIRED */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                type="email"
                className="h-12 rounded-xl border-slate-200 bg-white shadow-sm"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="yourname@email.com"
              />
              <p className="text-xs text-slate-400">Order confirmation will be sent to this email.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Complete Address</Label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors bg-transparent border-0 cursor-pointer"
                >
                  {locating ? (
                    <>
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                      <span>Fetching Location...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Use My Current Location</span>
                    </>
                  )}
                </button>
              </div>
              <Textarea required className="min-h-[90px] rounded-xl border-slate-200 bg-white shadow-sm pt-3" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House #, Street, Area" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">City</Label>
                <Select required value={form.city} onValueChange={(val) => setForm({ ...form, city: val })}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white shadow-sm">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAKISTAN_CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Postal Code (optional)</Label>
                <Input className="h-12 rounded-xl border-slate-200 bg-white shadow-sm" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} placeholder="e.g. 54000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Notes (optional)</Label>
              <Textarea className="min-h-[70px] rounded-xl border-slate-200 bg-white shadow-sm pt-3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Landmark or delivery instructions" />
            </div>

            {/* ORDER SUMMARY — shown BELOW form on mobile, hidden on desktop */}
            <div className="lg:hidden w-full mt-6">
              {renderOrderSummary()}
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Cash on Delivery</p>
                <p className="text-xs text-slate-500">Pay in cash upon receiving your order.</p>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl bg-[#52b788] hover:bg-[#40916c] text-white font-bold text-base shadow-lg shadow-emerald-500/20 transition-all">
              {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : `Place Order — Rs ${subtotal.toLocaleString()}`}
            </Button>
          </div>

          {/* RIGHT SIDE - Order Summary, only on desktop */}
          <aside className="hidden lg:block lg:col-span-5">
            <div className="sticky top-32">
              {renderOrderSummary()}
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}