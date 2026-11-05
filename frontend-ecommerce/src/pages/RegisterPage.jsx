import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft 
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const res = await register(formData);
    if (!res.success && res.errors) {
      setErrors(res.errors);
    }
    setIsLoading(false);
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
          <Link
            to="/login"
            className="flex-1 pb-3 text-center font-semibold text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Masuk Akun
          </Link>
          <button
            type="button"
            className="flex-1 pb-3 text-center font-bold text-sm text-[#8B0000] border-b-2 border-[#8B0000]"
          >
            Daftar Baru
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Buat Akun Pembeli Baru
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Daftar sekarang untuk mulai belanja kebutuhan sembako segar dan berkualitas langsung dari koperasi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="name"
                placeholder="Contoh: Budi Santoso"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition ${
                  errors.name ? "border-red-400 bg-red-50/50" : "border-gray-200"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-[11px] font-semibold mt-1">
                {errors.name[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition ${
                  errors.email ? "border-red-400 bg-red-50/50" : "border-gray-200"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-[11px] font-semibold mt-1">
                {errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
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
                name="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition ${
                  errors.password ? "border-red-400 bg-red-50/50" : "border-gray-200"
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-[11px] font-semibold mt-1">
                {errors.password[0]}
              </p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Ulangi password di atas"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#8B0000] to-red-800 hover:from-red-900 hover:to-[#8B0000] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <span>Daftar Sekarang</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch to login */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#8B0000] font-bold hover:underline">
            Masuk di sini
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
