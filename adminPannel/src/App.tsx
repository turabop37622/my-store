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
    // Poll every 30s to keep it updated
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Toaster richColors position="top-right" />

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            Breezy<span className="text-emerald-400">Admin</span>
          </Link>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-2 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.label} to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? "bg-emerald-500/10 text-emerald-400 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
              >
                <item.icon className="h-5 w-5" /> 
                <span>{item.label}</span>
                {item.label === "Reviews" && pendingReviews > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {pendingReviews}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all font-medium">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white h-16 flex items-center justify-between px-4">
        <Link to="/" className="text-lg font-black">Breezy<span className="text-emerald-400">Admin</span></Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.label} to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? "bg-emerald-500/10 text-emerald-400 font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  <item.icon className="h-5 w-5" /> 
                  <span>{item.label}</span>
                  {item.label === "Reviews" && pendingReviews > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {pendingReviews}
                    </span>
                  )}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 font-medium">
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
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
  )
}