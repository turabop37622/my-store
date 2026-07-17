import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, Search, Filter, Star, Eye, EyeOff, Maximize2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

function authAxios() {
  const token = localStorage.getItem("admin_token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
}

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchReviewsAndProducts = async () => {
    try {
      setLoading(true);
      const [reviewsRes, productsRes] = await Promise.all([
        authAxios().get(`${backendUrl}/api/admin/reviews`),
        authAxios().get(`${backendUrl}/api/admin/products`)
      ]);
      setReviews(reviewsRes.data);
      setProducts(productsRes.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to load reviews data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndProducts();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await authAxios().put(`${backendUrl}/api/admin/reviews/${id}/approve`);
      toast.success("Review approved successfully!");
      fetchReviewsAndProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to approve review.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await authAxios().put(`${backendUrl}/api/admin/reviews/${id}/reject`);
      toast.success("Review rejected.");
      fetchReviewsAndProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to reject review.");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await authAxios().put(`${backendUrl}/api/admin/reviews/${id}/toggle-active`);
      const newStatus = res.data.is_active ? "active" : "hidden";
      toast.success(`Review is now ${newStatus} on the site.`);
      fetchReviewsAndProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to toggle active status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this review? This action cannot be undone.")) {
      return;
    }
    try {
      await authAxios().delete(`${backendUrl}/api/admin/reviews/${id}`);
      toast.success("Review deleted permanently.");
      fetchReviewsAndProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete review.");
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesProduct = !productFilter || r.product_id === productFilter;
    const matchesSearch = !searchTerm || 
      r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesProduct && matchesSearch;
  });

  if (loading) {
    return <div className="p-10 text-slate-500 font-medium animate-pulse">Loading Reviews data...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tighter text-slate-900">
            Reviews Moderation ({reviews.length})
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Approve, reject, or toggle visibility of customer reviews.</p>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            placeholder="Search by customer or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto md:ml-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500">
              <Filter className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold max-w-xs focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm cursor-pointer"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="p-5 font-bold pl-8">Product</th>
                <th className="p-5 font-bold">Customer</th>
                <th className="p-5 font-bold">Rating</th>
                <th className="p-5 font-bold">Comment</th>
                <th className="p-5 font-bold">Images</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold">Live Active</th>
                <th className="p-5 font-bold text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-medium">No reviews found matching the filters.</td>
                </tr>
              )}
              {filteredReviews.map((r) => {
                const isPending = r.status === "pending";
                const isApproved = r.status === "approved";
                const isRejected = r.status === "rejected";

                return (
                  <tr 
                    key={r.id} 
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      isPending ? "bg-amber-50/20" : ""
                    }`}
                  >
                    {/* Product Name */}
                    <td className="p-5 pl-8 align-top">
                      <span className="font-bold text-slate-900 block max-w-[150px] truncate" title={r.product_name}>
                        {r.product_name}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono font-bold tracking-widest mt-0.5">ID: {r.product_id}</span>
                    </td>

                    {/* Customer */}
                    <td className="p-5 align-top">
                      <div className="font-bold text-slate-900">{r.customer_name}</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">{r.date}</div>
                    </td>

                    {/* Rating */}
                    <td className="p-5 align-top">
                      <div className="flex items-center text-amber-500 gap-0.5 bg-amber-50 px-2.5 py-1 rounded-full w-fit">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`h-3 w-3 ${
                              idx < r.rating ? "fill-current" : "text-amber-200"
                            }`} 
                          />
                        ))}
                        <span className="text-[10px] font-black text-amber-700 ml-1">({r.rating})</span>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="p-5 align-top">
                      <div className="max-w-[200px] text-slate-600 font-medium whitespace-pre-line truncate leading-relaxed" title={r.comment}>
                        {r.comment || <span className="italic text-slate-400 text-[11px]">No text comment</span>}
                      </div>
                    </td>

                    {/* Images thumbnails */}
                    <td className="p-5 align-top">
                      <div className="flex gap-1.5 flex-wrap max-w-[120px]">
                        {r.images && r.images.length > 0 ? (
                          r.images.map((img: string, imgIdx: number) => (
                            <div 
                              key={imgIdx} 
                              onClick={() => setSelectedImage(img)}
                              className="relative h-12 w-12 border border-slate-200 rounded-xl overflow-hidden cursor-pointer group/img shadow-sm"
                            >
                              <img src={img} alt="review image" className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Maximize2 size={12} strokeWidth={2.5} />
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] font-bold text-slate-300">—</span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-5 align-top">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        isApproved ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                        isRejected ? "bg-red-100 text-red-700 border border-red-200" :
                        "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    {/* Active toggle switch */}
                    <td className="p-5 align-top">
                      {isApproved ? (
                        <button
                          onClick={() => handleToggleActive(r.id)}
                          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${
                            r.is_active ? "bg-slate-900" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                              r.is_active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">Not approved</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-5 align-top text-right pr-8">
                      <div className="flex gap-2 justify-end items-center">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              title="Approve review"
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:-translate-y-0.5 rounded-xl transition-all"
                            >
                              <CheckCircle size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              title="Reject review"
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-md hover:-translate-y-0.5 rounded-xl transition-all"
                            >
                              <XCircle size={16} strokeWidth={2.5} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Delete review permanently"
                          className="p-2 bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md hover:-translate-y-0.5 rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl p-2 animate-in zoom-in duration-300">
            <button 
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle size={20} strokeWidth={2.5} />
            </button>
            <img 
              src={selectedImage} 
              alt="expanded review image" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl select-none" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
