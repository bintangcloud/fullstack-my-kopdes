import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useProducts } from "../../utils/ProductContext";
import { useAuth } from "../../utils/AuthContext";
import apiClient from "../../utils/apiClient";
import { getSafeImageUrl } from "../../utils/imageHelper";
import ConfirmModal from "../../components/ConfirmModal";
import {
  Package,
  Layers,
  Boxes,
  ShieldCheck,
  Search,
  SearchX,
  X,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  ArrowRight,
  Store,
  Truck,
  Wallet,
} from "lucide-react";

export default function AdminDashboard() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const { user } = useAuth();

  const { getProducts, getCategories, deleteProduct } = useProducts();

  // Ambil data kategori
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Ambil ringkasan pesanan masuk (5 terbaru + statistik)
  const { data: ordersData } = useQuery({
    queryKey: ["admin-orders-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/orders?limit=5");
      return res.data;
    },
  });

  const recentOrders = ordersData?.data || [];
  const orderStats = ordersData?.stats || {};

  // Ambil data produk
  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", page, selectedCategory, keyword],
    queryFn: () =>
      getProducts({
        page,
        limit: 10,
        category_id: selectedCategory,
        keyword,
      }),
  });

  const products = productsData?.data || [];
  const totalProducts = productsData?.total ?? products.length;
  const lastPage = productsData?.last_page || Math.ceil(totalProducts / 10) || 1;
  const totalStockOnPage = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success("Produk berhasil dihapus!");
      setProductToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat menghapus produk.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Top Welcome & Actions Header */}
      <div className="bg-gradient-to-r from-[#8B0000] via-red-800 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FFE600] text-[#8B0000] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Admin Control Panel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-xl">
            Selamat bekerja, <span className="font-bold text-white">{user?.name || "Administrator"}</span>. Kelola katalog barang, pantau sisa stok, dan perbarui data produk sembako secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/admin/add-product"
            className="flex items-center gap-2 bg-[#FFE600] hover:bg-yellow-400 text-[#8B0000] font-black px-5 py-3 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Tambah Produk Baru</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Total Produk */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#8B0000] flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Produk</p>
            <p className="text-2xl font-extrabold text-gray-800">{totalProducts} <span className="text-xs font-normal text-gray-500">item</span></p>
          </div>
        </div>

        {/* Card 2: Total Kategori */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Kategori</p>
            <p className="text-2xl font-extrabold text-gray-800">{categories.length} <span className="text-xs font-normal text-gray-500">kategori</span></p>
          </div>
        </div>

        {/* Card 3: Stok Fisik Halaman */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Stok (Halaman Ini)</p>
            <p className="text-2xl font-extrabold text-gray-800">{totalStockOnPage} <span className="text-xs font-normal text-gray-500">pcs</span></p>
          </div>
        </div>

        {/* Card 4: Pesanan Masuk */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pesanan Masuk</p>
            <p className="text-2xl font-extrabold text-gray-800">{orderStats.total ?? 0} <span className="text-xs font-normal text-gray-500">pesanan</span></p>
          </div>
        </div>

        {/* Card 5: Menunggu Konfirmasi */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Menunggu Konfirmasi</p>
            <p className="text-2xl font-extrabold text-gray-800">{orderStats.pending ?? 0} <span className="text-xs font-normal text-gray-500">pesanan</span></p>
          </div>
        </div>

        {/* Card 6: Saldo Pendapatan (Pesanan Selesai) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Saldo (Pesanan Selesai)</p>
            <p className="text-xl font-extrabold text-emerald-700">
              Rp {Number(orderStats.revenue ?? 0).toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Bertambah saat pesanan selesai</p>
          </div>
        </div>

      </div>

      {/* Pesanan Masuk Terbaru */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900">Pesanan Masuk Terbaru</h2>
              <p className="text-xs text-gray-500">
                {orderStats.pending ?? 0} pesanan menunggu konfirmasi
              </p>
            </div>
          </div>

          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8B0000] bg-red-50 hover:bg-red-100 border border-red-100 px-3.5 py-2 rounded-xl transition self-start sm:self-auto"
          >
            <span>Lihat Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="font-semibold text-gray-600 text-sm">
              Belum ada pesanan masuk.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">ID</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Pengiriman</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 text-center font-black text-gray-800">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {(order.items || []).length} item
                      <span className="block text-gray-400">
                        {(order.items || [])
                          .map((item) => `${item.product?.name || "Produk"} x${item.qty}`)
                          .join(", ")
                          .slice(0, 60)}
                        {(order.items || [])
                          .map((item) => `${item.product?.name || "Produk"} x${item.qty}`)
                          .join(", ").length > 60
                          ? "..."
                          : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          order.delivery_method === "pickup"
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {order.delivery_method === "pickup" ? (
                          <Store className="w-3.5 h-3.5" />
                        ) : (
                          <Truck className="w-3.5 h-3.5" />
                        )}
                        {order.delivery_method === "pickup" ? "Ambil di Toko" : "Dikirim"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#8B0000] whitespace-nowrap">
                      Rp {Number(order.total_price || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          order.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status === "pending"
                          ? "Menunggu"
                          : order.status === "processing"
                          ? "Diproses"
                          : order.status === "completed"
                          ? "Selesai"
                          : "Dibatalkan"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Table Filter Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 space-y-3">
          
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama produk sembako..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] shadow-xs transition"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Hapus kata kunci"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Stats & Reset Filter */}
            <div className="flex items-center gap-2 text-xs">
              {(selectedCategory || keyword) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("");
                    setKeyword("");
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
              <span className="text-gray-500 font-semibold hidden sm:inline">
                Total: <strong className="text-gray-900">{totalProducts} produk</strong>
              </span>
            </div>
          </div>

          {/* Filter Kategori Modern Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                !selectedCategory
                  ? "bg-[#8B0000] text-white shadow-sm ring-1 ring-red-900/30"
                  : "bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 shadow-2xs"
              }`}
            >
              Semua Kategori
            </button>

            {(Array.isArray(categories) ? categories : []).map((cat, idx) => {
              const catId = typeof cat === "object" ? (cat.id ?? cat.category_id) : cat;
              const catName = typeof cat === "object" ? (cat.name ?? cat.category) : cat;
              const isSelected = String(selectedCategory) === String(catId);

              return (
                <button
                  key={catId ?? idx}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(isSelected ? "" : String(catId));
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#8B0000] text-white shadow-sm ring-1 ring-red-900/30"
                      : "bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 shadow-2xs"
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

        </div>

        {/* Loading & Error States */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#8B0000] border-t-transparent rounded-full mb-3"></div>
            <p className="text-gray-500 font-semibold text-sm">Memuat data produk...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-600">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-red-500" />
            <p className="font-bold text-base">Gagal memuat data produk.</p>
            <p className="text-xs text-gray-500 mt-1">Pastikan backend server Laravel Anda sedang berjalan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 w-20">Foto</th>
                  <th className="py-3.5 px-4">Nama Produk & Kategori</th>
                  <th className="py-3.5 px-4 text-right">Harga</th>
                  <th className="py-3.5 px-4 text-center">Status Stok</th>
                  <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((p, index) => {
                  const stockNum = Number(p.stock || 0);
                  const isOutOfStock = stockNum <= 0;
                  const isLowStock = stockNum > 0 && stockNum <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Nomor urut */}
                      <td className="py-3 px-4 text-center text-xs font-semibold text-gray-400">
                        {index + 1 + (page - 1) * 10}
                      </td>

                      {/* Foto Produk */}
                      <td className="py-3 px-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 shadow-sm">
                          {p.img_url || p.img ? (
                            <img
                              src={getSafeImageUrl(p.img_url || p.img)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              No Img
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Nama Produk & Kategori */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#8B0000] border border-red-100">
                            {p.category_name || p.category?.name || p.category?.category || "Sembako"}
                          </span>
                          {p.description && (
                            <span className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                              {p.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Harga Produk */}
                      <td className="py-3 px-4 text-right font-extrabold text-[#8B0000] text-sm sm:text-base">
                        Rp {Number(p.price || 0).toLocaleString("id-ID")}
                      </td>

                      {/* Stok & Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Habis (0)</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Menipis ({stockNum})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{stockNum} pcs</span>
                          </span>
                        )}
                      </td>

                      {/* Tombol Aksi */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/admin/edit-product/${p.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition"
                            title="Edit Produk"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>

                          <button
                            onClick={() => setProductToDelete(p)}
                            disabled={deleteProduct.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition disabled:opacity-50"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Data Kosong */}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-gray-400">
                      <SearchX className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="font-semibold text-gray-600 text-sm">
                        Tidak ada produk yang cocok dengan pencarian / filter ini.
                      </p>
                      <button
                        onClick={() => {
                          setKeyword("");
                          setSelectedCategory("");
                        }}
                        className="mt-3 text-xs font-bold text-[#8B0000] underline"
                      >
                        Reset Semua Filter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500 font-medium">
            Menampilkan halaman <span className="font-bold text-gray-800">{page}</span> dari total <span className="font-bold text-gray-800">{lastPage}</span> halaman ({totalProducts} total produk)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="text-xs font-black px-3 py-1 bg-[#8B0000] text-white rounded-lg">
              {page}
            </span>

            <button
              onClick={() => setPage((prev) => (prev < lastPage ? prev + 1 : prev))}
              disabled={page >= lastPage}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Modal Konfirmasi Hapus Produk */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Produk?"
        message={`Apakah Anda yakin ingin menghapus produk "${productToDelete?.name}"? Tindakan ini akan menghapus produk secara permanen.`}
        confirmText="Ya, Hapus Produk"
        cancelText="Batal"
        confirmVariant="danger"
        icon="trash"
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
