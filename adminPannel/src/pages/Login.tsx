import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import axios from "axios";

export default function Login() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const res = await axios.post(`${backendUrl}/api/admin/login`, { password });
      localStorage.setItem("admin_token", res.data.token);
      window.location.href = "/";
    } catch (err: any) {
      setError("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 shadow-2xl p-10 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white mb-6 shadow-xl shadow-slate-900/20">
              <Lock className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Breezy<span className="text-slate-400">Admin</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Enter your admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-lg font-bold shadow-inner"
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:-translate-y-1"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Secure Login"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-10">
            Password: <code className="text-slate-600 bg-slate-100 px-2 py-1 rounded">Ahlegand5712@</code>
          </p>
        </div>
      </div>
    </div>
  );
}
