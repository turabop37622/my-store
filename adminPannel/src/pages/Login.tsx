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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-white">Breezy<span className="text-emerald-400">Admin</span></h1>
          <p className="text-slate-500 mt-2">Enter your admin password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full h-14 px-5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
            required
          />
          
          {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-8">
          Default password: <code className="text-slate-400">breezy2026</code>
        </p>
      </div>
    </div>
  );
}
