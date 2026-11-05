// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { 
  LayoutDashboard, 
  PlusCircle, 
  X, 
  ShieldCheck, 
  Store, 
  LogOut,
  ClipboardList
} from "lucide-react";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard Produk", icon: LayoutDashboard },
    { to: "/admin/orders", label: "Pesanan Masuk", icon: ClipboardList },
    { to: "/admin/add-product", label: "Tambah Produk Baru", icon: PlusCircle },
  ];

  return (
    <div
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-[#8B0000] text-white font-black text-lg w-9 h-9 flex items-center justify-center rounded-xl shadow-md group-hover:rotate-12 transition-transform">
              K
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                My<span className="text-red-400">KopDes</span>
              </span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-3 my-3 bg-gray-800/80 rounded-2xl border border-gray-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B0000] to-red-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-amber-400 flex items-center gap-1 font-medium mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator</span>
              </p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="px-3 pt-2">
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#8B0000] text-white shadow-md shadow-red-950/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Storefront Link */}
        <div className="px-3 pt-6">
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Akses Publik
          </p>
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>Lihat Toko Depan</span>
          </Link>
        </div>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-950/30 hover:bg-red-900/40 border border-red-900/40 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
