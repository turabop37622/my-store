import { useState, useEffect } from "react";
import { Mail, CheckCircle2, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

function authAxios() {
  const token = localStorage.getItem("admin_token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
}

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    authAxios().get(`${backendUrl}/api/admin/messages`)
      .then(res => { setMessages(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchMessages(); }, []);

  const markAsRead = async (id: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().post(`${backendUrl}/api/admin/messages`, { id });
      toast.success("Marked as read!");
      fetchMessages();
    } catch { toast.error("Failed to update."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await authAxios().delete(`${backendUrl}/api/admin/messages/${id}`);
      toast.success("Message deleted!");
      fetchMessages();
    } catch { toast.error("Failed to delete."); }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse">Loading Messages...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tighter text-slate-900 flex items-center gap-3">
          Messages
          {unreadCount > 0 && <span className="text-[11px] bg-emerald-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-md shadow-emerald-500/20">{unreadCount} new</span>}
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Contact form messages from customers.</p>
      </div>

      <div className="grid gap-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
        {messages.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-sm">
            No messages yet. Messages from your website's Contact form will appear here.
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-lg ${msg.status === 'unread' ? 'border-emerald-200 shadow-md ring-1 ring-emerald-100 hover:-translate-y-0.5' : 'border-slate-200/60 shadow-sm'} flex gap-4 sm:gap-6 group`}>
            <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${msg.status === 'unread' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
              <Mail size={24} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 truncate tracking-tight">{msg.subject}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    <span className="font-bold text-slate-700">{msg.name}</span> <span className="text-slate-300 mx-1">•</span> <a href={`mailto:${msg.email}`} className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">{msg.email}</a>
                  </p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{msg.date}</div>
              </div>
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
                <p className="text-slate-700 text-sm mb-4 leading-relaxed font-medium">{msg.body}</p>
                <div className="flex gap-4 pt-4 border-t border-slate-200/60">
                  {msg.status === 'unread' && (
                    <button onClick={() => markAsRead(msg.id)}
                      className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-black text-emerald-600 hover:text-emerald-700 transition-all hover:translate-x-1">
                      <CheckCircle2 size={16} strokeWidth={2.5} /> Mark as Read
                    </button>
                  )}
                  <button onClick={() => handleDelete(msg.id)}
                    className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-black text-slate-400 hover:text-red-500 transition-all hover:translate-x-1">
                    <Trash2 size={16} strokeWidth={2.5} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}