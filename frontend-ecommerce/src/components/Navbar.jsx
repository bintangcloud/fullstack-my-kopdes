
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../utils/CartContext";
import { useAuth } from "../utils/AuthContext";
import {
  Search,
  ShoppingCart,
  ShieldCheck,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Package,
  ChevronDown,
  X,
  LayoutGrid,
  Coffee,
  UtensilsCrossed,
  Sparkles,
  Tag,
  Check,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

// Helper ikon kategori
const getCategoryIcon = (name) => {
  const lower = (name || "").toLowerCase();

  if (lower.includes("semua")) return LayoutGrid;
  if (lower.includes("beras") || lower.includes("pokok") || lower.includes("sembako")) return Package;
  if (lower.includes("minum") || lower.includes("teh") || lower.includes("kopi")) return Coffee;
  if (lower.includes("makan") || lower.includes("snack") || lower.includes("mie") || lower.includes("dapur") || lower.includes("bumbu")) return UtensilsCrossed;
  if (lower.includes("bersih") || lower.includes("sabun") || lower.includes("cuci") || lower.includes("rumah")) return Sparkles;

  return Tag;
};

// Komponen Dropdown Kategori
function CategoryDropdown({ kategori, setKategori, daftarKategori = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const SelectedIcon = getCategoryIcon(kategori);

  return (
    <div className="relative w-full sm:w-auto flex-shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full sm:w-auto inline-flex items-center justify-between gap-2.5 pl-3.5 pr-3 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all shadow-xs cursor-pointer ${
          isOpen
            ? "bg-white border-[#8B0000] ring-2 ring-red-100 text-[#8B0000]"
            : kategori !== "Semua Kategori"
            ? "bg-red-50/80 border-red-200 text-[#8B0000] hover:bg-red-100/80"
            : "bg-gray-50 hover:bg-white border-gray-200 text-gray-700 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <SelectedIcon
            className={`w-4 h-4 flex-shrink-0 ${
              kategori !== "Semua Kategori" ? "text-[#8B0000]" : "text-gray-500"
            }`}
          />
          <span className="truncate max-w-[120px] sm:max-w-[150px] text-left">
            {kategori}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#8B0000]" : "text-gray-400"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-60 sm:w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-gray-100">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
              Pilih Kategori
            </span>

            {kategori !== "Semua Kategori" && (
              <button
                type="button"
                onClick={() => {
                  setKategori("Semua Kategori");
                  setIsOpen(false);
                }}
                className="text-[11px] font-bold text-[#8B0000] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
            {daftarKategori.map((kat, idx) => {
              const isSelected = kategori === kat;
              const Icon = getCategoryIcon(kat);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setKategori(kat);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-red-50 text-[#8B0000] font-bold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1 rounded-lg ${
                        isSelected
                          ? "bg-red-100 text-[#8B0000]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <span className="truncate">{kat}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#8B0000] flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({
  kataKunci,
  setKataKunci,
  kategori,
  setKategori,
  daftarKategori,
  isDashboard
}) {
  const { totalQty } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Deteksi halaman aktif
  const location = useLocation();
  const currentPath = location.pathname;

  const isHomeActive = currentPath === "/";
  const isCartActive = currentPath === "/cart";
  const isOrdersActive = currentPath.startsWith("/orders");
  const isAdminActive = currentPath.startsWith("/admin");
  const isLoginActive = currentPath === "/login";
  const isRegisterActive = currentPath === "/register";

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap md:flex-nowrap justify-between items-center gap-3">

        {/* Logo */}
        <Link
          to="/"
          className={`flex items-center gap-2 group flex-shrink-0 rounded-xl transition ${
            isHomeActive ? "opacity-100" : ""
          }`}
        >
          <div className="bg-[#8B0000] text-white font-black text-xl w-10 h-10 flex items-center justify-center rounded-xl shadow-md group-hover:rotate-12 transition-transform">
            K
          </div>

          <span className="font-extrabold text-xl text-gray-800 tracking-tight hidden sm:block">
            My<span className="text-[#8B0000]">KopDes</span>
          </span>
        </Link>

        {/* Search and Filter */}
        {isDashboard && (
          <div className="order-last md:order-none w-full md:w-auto flex-1 flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto">

            {/* Search Bar */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </div>

              <input
                type="text"
                placeholder="Cari produk..."
                value={kataKunci}
                onChange={(e) => setKataKunci(e.target.value)}
                className="block w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all shadow-xs"
              />

              {kataKunci && (
                <button
                  type="button"
                  onClick={() => setKataKunci("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Kategori */}
            <CategoryDropdown
              kategori={kategori}
              setKategori={setKategori}
              daftarKategori={daftarKategori}
            />
          </div>
        )}

        {/* Area Autentikasi & Keranjang */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* Notifikasi */}
          {isAuthenticated && (
            <NotificationDropdown isAdmin={isAdmin} />
          )}

          {/* Keranjang Belanja */}
          <Link
            to="/cart"
            title="Keranjang Belanja"
            className={`relative p-2 rounded-full transition ${
              isCartActive
                ? "bg-red-50 text-[#8B0000]"
                : "text-gray-700 hover:text-[#8B0000] hover:bg-red-50"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />

            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FFE600] text-[#8B0000] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {totalQty}
              </span>
            )}
          </Link>

          {/* User Auth Status */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">

              {/* Admin Panel */}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition shadow-sm ${
                    isAdminActive
                      ? "bg-red-50 text-[#8B0000] border border-red-200"
                      : "text-white bg-gray-900 hover:bg-black"
                  }`}
                >
                  <LayoutDashboard className={`w-3.5 h-3.5 ${
                    isAdminActive ? "text-[#8B0000]" : "text-amber-400"
                  }`} />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Riwayat Pesanan */}
              {!isAdmin && (
                <Link
                  to="/orders"
                  title="Pesanan Saya"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition ${
                    isOrdersActive
                      ? "text-[#8B0000] bg-red-100 border border-red-200"
                      : "text-[#8B0000] bg-red-50 hover:bg-red-100 border border-red-100"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pesanan Saya</span>
                </Link>
              )}

              {/* Tombol Logout */}
              <button
                onClick={logout}
                title="Keluar / Logout"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 rounded-full transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>

              {/* Informasi User */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-gray-800 leading-tight">
                  {user?.name}
                </span>

                <span className="text-[10px] text-gray-500 inline-flex items-center gap-1 justify-end">
                  {user?.role === "admin" ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-red-600" />
                      <span>Administrator</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3 h-3 text-amber-600" />
                      <span>Pembeli</span>
                    </>
                  )}
                </span>
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Masuk */}
              <Link
                to="/login"
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-full transition ${
                  isLoginActive
                    ? "text-[#8B0000] bg-red-50"
                    : "text-gray-700 hover:text-[#8B0000] hover:bg-gray-50"
                }`}
              >
                Masuk
              </Link>

              {/* Daftar */}
              <Link
                to="/register"
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-full transition ${
                  isRegisterActive
                    ? "text-[#8B0000] bg-red-50 border border-red-200"
                    : "text-white bg-gradient-to-r from-[#8B0000] to-red-800 hover:from-red-900 hover:to-[#8B0000] shadow-sm hover:shadow"
                }`}
              >
                Daftar
              </Link>

            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
