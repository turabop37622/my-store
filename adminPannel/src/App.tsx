import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom"
import { LayoutDashboard, ShoppingCart, Package, MessageSquare, LogOut, Menu, X, Users, Settings, Star } from "lucide-react"
import { Toaster } from "sonner"
import { useState, useEffect } from "react"
import axios from "axios";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Subscribers from "./pages/Subscribers";
import Features from "./pages/Features";
import Reviews from "./pages/Reviews";
import ProductEditor from "./pages/ProductEditor";

function isLoggedIn() {
  return !!localStorage.getItem("admin_token");
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function authAxios() {
  const token = localStorage.getItem("admin_token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/" },
    { label: "Orders", icon: ShoppingCart, to: "/orders" },
    { label: "Products", icon: Package, to: "/products" },
    { label: "Reviews", icon: Star, to: "/reviews" },
    { label: "Messages", icon: MessageSquare, to: "/messages" },
    { label: "Subscribers", icon: Users, to: "/subscribers" },
    { label: "Features", icon: Settings, to: "/features" },
  ];

  const fetchPendingCount = () => {
    if (!isLoggedIn()) return;
    authAxios().get(`${backendUrl}/api/admin/reviews/pending-count`)
      .then(res => {
        setPendingReviews(res.data.pending_count || 0);
      })
      .catch(err => console.error("Error fetching pending reviews count", err));
  };

  useEffect(() => {
    setMobileOpen(false);
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex bg-[#f5f7f9] text-slate-900 font-sans selection:bg-black selection:text-white">
      <Toaster richColors position="top-right" />

      {/* Desktop Sidebar (Glassmorphism Light) */}
      <aside className="w-72 bg-white/60 backdrop-blur-3xl fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col border-r border-slate-200/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-4">
          <Link to="/" className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2">
            Breezy<span className="text-slate-400">Admin</span>
          </Link>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-1.5 px-6 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.label} to={item.to}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group ${isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-1" : "text-slate-500 hover:text-slate-900 hover:bg-white/80 hover:shadow-sm"}`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-white/10' : 'bg-slate-100 group-hover:bg-white'}`}>
                  <item.icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} /> 
                </div>
                <span>{item.label}</span>
                {item.label === "Reviews" && pendingReviews > 0 && (
                  <span className="ml-auto bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                    {pendingReviews}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="p-6">
          <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-sm border border-transparent hover:border-red-100 hover:shadow-sm">
            <LogOut className="h-4 w-4" strokeWidth={2.5} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header (Glassmorphism Light) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 text-slate-900 h-20 flex items-center justify-between px-6 shadow-sm">
        <Link to="/" className="text-xl font-black tracking-tight">Breezy<span className="text-slate-400">Admin</span></Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-600 p-2 hover:bg-slate-100/80 rounded-full transition-colors">
          {mobileOpen ? <X className="h-6 w-6" strokeWidth={2.5} /> : <Menu className="h-6 w-6" strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-20 left-0 right-0 bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 p-6 space-y-2 shadow-2xl rounded-b-[2rem]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.label} to={item.to}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"}`}
                >
                  <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} /> 
                  <span>{item.label}</span>
                  {item.label === "Reviews" && pendingReviews > 0 && (
                    <span className="ml-auto bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                      {pendingReviews}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-200/60">
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-3 px-4 py-4 rounded-2xl text-red-600 hover:bg-red-50 font-bold text-sm transition-colors border border-transparent hover:border-red-100">
                <LogOut className="h-5 w-5" strokeWidth={2.5} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-72 p-4 md:p-8 pt-24 lg:pt-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <>
    <Toaster position="top-right" richColors />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/products/edit/:id" element={
          <ProtectedRoute>
            <ProductEditor />
          </ProtectedRoute>
        } />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/products" element={<Products />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/subscribers" element={<Subscribers />} />
                <Route path="/features" element={<Features />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
    </>
  )
}