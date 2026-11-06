import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  ShoppingBag, 
  Info, 
  ArrowRight, 
  ArrowLeft 
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil URL asal jika ada redirect dari protected route
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password, from);
    if (res && res.success) {
      if (res.user?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (from && from !== "/login") {
        navigate(from, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail, demoPass, targetRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setLoadingRole(targetRole);

    try {
      const res = await login(demoEmail, demoPass, from);
      if (res && res.success) {
        if (res.user?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (from && from !== "/login") {
          navigate(from, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B0000]/10 via-amber-50/40 to-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group mb-2">
          <div className="bg-[#8B0000] text-white font-black text-2xl w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg group-hover:rotate-6 transition-transform">
            K
          </div>
          <span className="font-extrabold text-3xl text-gray-800 tracking-tight">
            My<span className="text-[#8B0000]">KopDes</span>
          </span>
        </Link>
        <div className="flex justify-center mt-1">
          <span className="bg-[#FFE600] text-[#8B0000] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Koperasi Desa Terpercaya
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 backdrop-blur-sm">
        
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 mb-6">
          <button
            type="button"
            className="flex-1 pb-3 text-center font-bold text-sm text-[#8B0000] border-b-2 border-[#8B0000]"
          >
            Masuk Akun
          </button>
          <Link
            to="/register"
            className="flex-1 pb-3 text-center font-semibold text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Daftar Baru
          </Link>
        </div>

        {from && (
          <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>Silakan masuk terlebih dahulu untuk melanjutkan belanjaan Anda.</span>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Selamat Datang Kembali
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Gunakan akun MyKopDes Anda untuk belanja kebutuhan sembako atau mengelola toko.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#8B0000] to-red-800 hover:from-red-900 hover:to-[#8B0000] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 text-center">
            Akun Demo:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin("admin@gmail.com", "admin123", "admin")}
              className="px-2.5 py-2 text-xs rounded-xl border border-red-200 bg-red-50/80 text-[#8B0000] hover:bg-red-100 font-bold text-center transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
              <span>{loadingRole === "admin" ? "Masuk..." : "Login Admin"}</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin("user@gmail.com", "user123", "user")}
              className="px-2.5 py-2 text-xs rounded-xl border border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100 font-bold text-center transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
              <span>{loadingRole === "user" ? "Masuk..." : "Login Pembeli"}</span>
            </button>
          </div>
        </div>

        {/* Footer switch to register */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#8B0000] font-bold hover:underline">
            Daftar Akun Baru
          </Link>
        </div>

      </div>

      {/* Back to Home Link */}
      <div className="mt-6 text-center">
        <Link to="/" className="text-xs text-gray-500 hover:text-[#8B0000] font-medium inline-flex items-center justify-center gap-1.5 transition group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda Belanja</span>
        </Link>
      </div>

    </div>
  );
}
