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
    return <div className="p-10 text-slate-500">Loading Reviews data...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Reviews Moderation ({reviews.length})
          </h1>
          <p className="text-slate-500 mt-1">Approve, reject, or toggle visibility of customer reviews.</p>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search by customer or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto md:ml-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm max-w-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Rating</th>
                <th className="p-4 font-semibold">Comment</th>
                <th className="p-4 font-semibold">Images</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Live Active</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No reviews found matching the filters.</td>
                </tr>
              )}
              {filteredReviews.map((r) => {
                const isPending = r.status === "pending";
                const isApproved = r.status === "approved";
                const isRejected = r.status === "rejected";

                return (
                  <tr 
                    key={r.id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      isPending ? "bg-amber-50/30 font-medium" : ""
                    }`}
                  >
                    {/* Product Name */}
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block max-w-[150px] truncate" title={r.product_name}>
                        {r.product_name}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">ID: {r.product_id}</span>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{r.customer_name}</div>
                      <div className="text-xs text-slate-400">{r.date}</div>
                    </td>

                    {/* Rating */}
                    <td className="p-4">
                      <div className="flex items-center text-amber-500 gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`h-4 w-4 ${
                              idx < r.rating ? "fill-current" : "text-slate-200"
                            }`} 
                          />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">({r.rating})</span>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="p-4">
                      <div className="max-w-[200px] text-slate-700 whitespace-pre-line truncate" title={r.comment}>
                        {r.comment || <span className="italic text-slate-400 text-xs">No text comment</span>}
                      </div>
                    </td>

                    {/* Images thumbnails */}
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap max-w-[120px]">
                        {r.images && r.images.length > 0 ? (
                          r.images.map((img: string, imgIdx: number) => (
                            <div 
                              key={imgIdx} 
                              onClick={() => setSelectedImage(img)}
                              className="relative h-10 w-10 border border-slate-200 rounded-lg overflow-hidden cursor-pointer group bg-slate-50"
                            >
                              <img src={img} alt="review image" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Maximize2 size={10} />
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isApproved ? "bg-emerald-100 text-emerald-700" :
                        isRejected ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700 border border-amber-200 animate-pulse"
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    {/* Active toggle switch */}
                    <td className="p-4">
                      {isApproved ? (
                        <button
                          onClick={() => handleToggleActive(r.id)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            r.is_active ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              r.is_active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not approved yet</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              title="Approve review"
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              title="Reject review"
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Delete review permanently"
                          className="p-1.5 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden bg-white border border-slate-800 rounded-2xl shadow-2xl p-2 animate-in zoom-in duration-300">
            <button 
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-1.5 hover:bg-black transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle size={20} />
            </button>
            <img 
              src={selectedImage} 
              alt="expanded review image" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl select-none" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
