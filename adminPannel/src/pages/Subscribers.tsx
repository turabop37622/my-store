import { useState, useEffect } from "react";
import { CheckCircle, Search, Mail, Download } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

function authAxios() {
    const token = localStorage.getItem("admin_token");
    return axios.create({ headers: { Authorization: `Bearer ${token}` } });
}

export default function Subscribers() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const fetchSubscribers = () => {
        authAxios().get(`${backendUrl}/api/admin/subscribers`)
            .then(res => { setSubscribers(res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    };

    useEffect(() => { fetchSubscribers(); }, []);

    const handleApprove = async (id: string) => {
        try {
            await authAxios().post(`${backendUrl}/api/admin/subscribers/approve`, { id });
            toast.success("Approved! Promo code sent to user.");
            fetchSubscribers();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to approve.");
        }
    };

    const handleExportCSV = () => {
        const headers = ["Email", "Status", "Promo Code", "Date"];
        const csvRows = [headers.join(",")];
        subscribers.forEach(sub => {
          const row = [
            `"${(sub.email || "").replace(/"/g, '""')}"`,
            sub.status,
            `"${sub.promo_code || ""}"`,
            `"${sub.date || ""}"`
          ];
          csvRows.push(row.join(","));
        });
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filtered = subscribers.filter(s =>
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse">Loading Subscribers...</div>;

  return (
      <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                  <h1 className="text-3xl lg:text-4xl font-semibold tracking-tighter text-slate-900">
                      Subscribers ({subscribers.length})
                  </h1>
                  <p className="text-slate-500 mt-1 font-medium">Approve to send 5% OFF promo code.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                          placeholder="Search by email..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm"
                      />
                  </div>
                  <button onClick={handleExportCSV} className="flex items-center gap-2 h-12 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 whitespace-nowrap">
                    <Download size={18} strokeWidth={2.5} /> Export
                  </button>
              </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                              <th className="p-5 font-bold pl-8">Email</th>
                              <th className="p-5 font-bold">Status</th>
                              <th className="p-5 font-bold">Promo Code</th>
                              <th className="p-5 font-bold">Date</th>
                              <th className="p-5 font-bold text-right pr-8">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                          {filtered.length === 0 && (
                              <tr>
                                  <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">No subscribers yet.</td>
                              </tr>
                          )}
                          {filtered.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                                  <td className="p-5 pl-8">
                                      <div className="flex items-center gap-3">
                                          <div className="bg-slate-100 p-2 rounded-xl text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <Mail size={16} strokeWidth={2.5} />
                                          </div>
                                          <span className="font-bold text-slate-900">{s.email}</span>
                                      </div>
                                  </td>
                                  <td className="p-5">
                                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${s.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                          }`}>
                                          {s.status}
                                      </span>
                                  </td>
                                  <td className="p-5 font-mono text-slate-500 font-bold text-xs">{s.promo_code || '—'}</td>
                                  <td className="p-5 text-slate-400 font-medium text-xs">{s.date}</td>
                                  <td className="p-5 text-right pr-8">
                                      {s.status === 'pending' ? (
                                          <button onClick={() => handleApprove(s.id)}
                                              className="flex items-center gap-2 ml-auto px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:-translate-y-0.5">
                                              <CheckCircle size={16} strokeWidth={2.5} /> Approve
                                          </button>
                                      ) : (
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sent ✓</span>
                                      )}
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