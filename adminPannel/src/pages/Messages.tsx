import { useState, useEffect } from "react";
import { Mail, CheckCircle2, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    axios.get(`${backendUrl}/api/admin/messages`)
      .then(res => { setMessages(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchMessages(); }, []);

  const markAsRead = async (id: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await axios.post(`${backendUrl}/api/admin/messages`, { id });
      toast.success("Marked as read!");
      fetchMessages();
    } catch { toast.error("Failed to update."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      await axios.delete(`${backendUrl}/api/admin/messages/${id}`);
      toast.success("Message deleted!");
      fetchMessages();
    } catch { toast.error("Failed to delete."); }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) return <div className="p-10 text-slate-500">Loading Messages...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Messages 
          {unreadCount > 0 && <span className="ml-2 text-sm bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">{unreadCount} new</span>}
        </h1>
        <p className="text-slate-500 mt-1">Contact form messages from customers.</p>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 && (
          <div className="p-10 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No messages yet. Messages from your website's Contact form will appear here.
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`bg-white p-5 sm:p-6 rounded-2xl border ${msg.status === 'unread' ? 'border-emerald-200 shadow-md ring-1 ring-emerald-50' : 'border-slate-200 shadow-sm'} flex gap-4 sm:gap-6`}>
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0 ${msg.status === 'unread' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">{msg.subject}</h3>
                  <p className="text-sm text-slate-500">{msg.name} — <a href={`mailto:${msg.email}`} className="text-emerald-600 hover:underline">{msg.email}</a></p>
                </div>
                <div className="text-xs font-semibold text-slate-400 shrink-0">{msg.date}</div>
              </div>
              <p className="text-slate-700 text-sm mb-4 leading-relaxed">{msg.body}</p>
              <div className="flex gap-3">
                {msg.status === 'unread' && (
                  <button onClick={() => markAsRead(msg.id)}
                    className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                    <CheckCircle2 size={16} /> Mark as Read
                  </button>
                )}
                <button onClick={() => handleDelete(msg.id)}
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
