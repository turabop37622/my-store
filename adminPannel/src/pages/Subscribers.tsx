import { useState, useEffect } from "react";
import { CheckCircle, Search, Mail } from "lucide-react";
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

    const filtered = subscribers.filter(s =>
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-10 text-slate-500">Loading Subscribers...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                        Subscribers ({subscribers.length})
                    </h1>
                    <p className="text-slate-500 mt-1">Approve to send 5% OFF promo code.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Promo Code</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No subscribers yet.</td>
                                </tr>
                            )}
                            {filtered.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="font-medium text-slate-800">{s.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-600 text-xs">{s.promo_code || '—'}</td>
                                    <td className="p-4 text-slate-400 text-xs">{s.date}</td>
                                    <td className="p-4 text-right">
                                        {s.status === 'pending' ? (
                                            <button onClick={() => handleApprove(s.id)}
                                                className="flex items-center gap-2 ml-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors">
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">Sent ✓</span>
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