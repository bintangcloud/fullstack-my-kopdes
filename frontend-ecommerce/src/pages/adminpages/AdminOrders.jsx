import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  Package,
  Search,
  Store,
  Truck,
  Wallet,
  X,
  MessageCircle,
} from "lucide-react";

import apiClient from "../../utils/apiClient";
import OrderChatModal from "../../components/OrderChatModal";

const STATUS_CONFIG_MAP = {
  pending: { label: "Menunggu", className: "bg-amber-100 text-amber-800" },
  processing: { label: "Diproses", className: "bg-blue-100 text-blue-800" },
  shipping: { label: "Sedang Diantar", className: "bg-purple-100 text-purple-800" },
  ready_for_pickup: { label: "Bisa Diambil", className: "bg-teal-100 text-teal-800" },
  completed: { label: "Selesai", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-800" },
};

const FILTER_STATUS_OPTIONS = [
  { value: "pending", label: "Menunggu Konfirmasi" },
  { value: "processing", label: "Sedang Diproses" },
  { value: "shipping", label: "Sedang Diantar Kurir" },
  { value: "ready_for_pickup", label: "Bisa Diambil di Toko" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const formatRupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeChatOrder, setActiveChatOrder] = useState(null);

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-orders", page, status, keyword],
    queryFn: async () => {
      const res = await apiClient.get(
        `/admin/orders?page=${page}&limit=10&status=${status}&keyword=${keyword}`
      );
      return res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status: newStatus }) =>
      apiClient.patch(`/admin/orders/${id}/status`, { status: newStatus }),
    onSuccess: () => {
      toast.success("Status pesanan berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-summary"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui status pesanan."
      );
    },
  });

  const orders = ordersData?.data || [];
  const stats = ordersData?.stats || {};
  const currentPage = ordersData?.current_page || page;
  const lastPage = ordersData?.last_page || 1;
  const totalOrders = ordersData?.total ?? orders.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B0000] via-red-800 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#FFE600] text-[#8B0000] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Pesanan Masuk
          </span>
          
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Manajemen Pesanan Pelanggan
        </h1>
        <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-2xl">
          Pantau pesanan masuk, perbarui status pengiriman/ambil di toko, dan kabari ketersediaan barang langsung kepada pembeli melalui fitur chat.
        </p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#8B0000] flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Pesanan
            </p>
            <p className="text-2xl font-extrabold text-gray-800">
              {stats.total ?? 0}{" "}
              <span className="text-xs font-normal text-gray-500">pesanan</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Menunggu Konfirmasi
            </p>
            <p className="text-2xl font-extrabold text-gray-800">
              {stats.pending ?? 0}{" "}
              <span className="text-xs font-normal text-gray-500">pesanan</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Diantar / Siap Diambil
            </p>
            <p className="text-2xl font-extrabold text-gray-800">
              {(stats.shipping ?? 0) + (stats.ready_for_pickup ?? 0)}{" "}
              <span className="text-xs font-normal text-gray-500">pesanan</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Saldo Pendapatan (Selesai)
            </p>
            <p className="text-xl font-extrabold text-green-700">
              {formatRupiah(stats.revenue ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabel pesanan */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <select
                className="bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B0000] font-medium shadow-sm cursor-pointer appearance-none pr-8"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Semua Status</option>
                {FILTER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {status && (
              <button
                onClick={() => {
                  setStatus("");
                  setPage(1);
                }}
                className="text-xs font-semibold text-gray-500 hover:text-red-700 underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari ID, nama, no HP..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-gray-200 text-gray-800 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B0000] shadow-sm font-medium"
            />
            {keyword && (
              <button
                onClick={() => {
                  setKeyword("");
                  setPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#8B0000] border-t-transparent rounded-full mb-3"></div>
            <p className="text-gray-500 font-semibold text-sm">
              Memuat pesanan...
            </p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-600">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-red-500" />
            <p className="font-bold text-base">Gagal memuat pesanan.</p>
            <p className="text-xs text-gray-500 mt-1">
              Pastikan backend server Laravel Anda sedang berjalan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">ID</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Produk</th>
                  <th className="py-3.5 px-4">Pengiriman</th>
                  <th className="py-3.5 px-4">Pembayaran</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center w-44">Status Pesanan</th>
                  <th className="py-3.5 px-4 text-center w-28">Hubungi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((order) => {
                  const currentStatus =
                    STATUS_CONFIG_MAP[order.status] || STATUS_CONFIG_MAP.pending;
                  const isPickup = order.delivery_method === "pickup";

                  // Opsi status disesuaikan berdasarkan metode pengiriman
                  const orderOptions = isPickup
                    ? [
                        { value: "pending", label: "Menunggu" },
                        { value: "processing", label: "Diproses" },
                        { value: "ready_for_pickup", label: "Bisa Diambil di Toko" },
                        { value: "completed", label: "Selesai" },
                        { value: "cancelled", label: "Dibatalkan" },
                      ]
                    : [
                        { value: "pending", label: "Menunggu" },
                        { value: "processing", label: "Diproses" },
                        { value: "shipping", label: "Sedang Diantar Kurir" },
                        { value: "completed", label: "Selesai" },
                        { value: "cancelled", label: "Dibatalkan" },
                      ];

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-amber-50/30 transition-colors align-top"
                    >
                      <td className="py-4 px-4 text-center">
                        <span className="font-black text-gray-800">
                          #{order.id}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-gray-900">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-gray-500">{order.phone}</p>
                        {order.user?.email && (
                          <p className="text-[11px] text-gray-400">
                            {order.user.email}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <ul className="space-y-1">
                          {(order.items || []).map((item) => (
                            <li
                              key={item.id}
                              className="text-xs text-gray-600"
                            >
                              <span className="font-semibold text-gray-800">
                                {item.product?.name || "Produk dihapus"}
                              </span>{" "}
                              <span className="text-gray-400">
                                x{item.qty}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPickup
                              ? "bg-green-50 text-green-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isPickup ? (
                            <Store className="w-3.5 h-3.5" />
                          ) : (
                            <Truck className="w-3.5 h-3.5" />
                          )}
                          {isPickup ? "Ambil di Toko" : "Dikirim"}
                        </span>
                        {!isPickup && order.address && (
                          <p className="text-[11px] text-gray-500 mt-1 max-w-[180px] line-clamp-2">
                            {order.address}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                          {order.payment_method === "cod"
                            ? "COD"
                            : "Transfer"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <p className="font-extrabold text-[#8B0000] whitespace-nowrap">
                          {formatRupiah(order.total_price)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Ongkir{" "}
                          {Number(order.shipping_cost || 0) === 0
                            ? "Gratis"
                            : formatRupiah(order.shipping_cost)}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <select
                          value={order.status}
                          disabled={updateStatus.isPending}
                          onChange={(e) =>
                            updateStatus.mutate({
                              id: order.id,
                              status: e.target.value,
                            })
                          }
                          className={`text-xs font-bold rounded-xl px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-[#8B0000] cursor-pointer disabled:opacity-60 shadow-sm ${currentStatus.className}`}
                        >
                          {orderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveChatOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#8B0000] bg-red-50 hover:bg-red-100 border border-red-200 transition shadow-sm"
                          title="Chat pembeli untuk konfirmasi ketersediaan barang"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-gray-400">
                      <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="font-semibold text-gray-600 text-sm">
                        Belum ada pesanan yang cocok dengan filter ini.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500 font-medium">
            Menampilkan halaman{" "}
            <span className="font-bold text-gray-800">{currentPage}</span> dari
            total <span className="font-bold text-gray-800">{lastPage}</span>{" "}
            halaman ({totalOrders} total pesanan)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs font-bold text-gray-800 px-2">
              {currentPage} / {lastPage}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, lastPage))}
              disabled={currentPage >= lastPage}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Chat dengan Pelanggan */}
      {activeChatOrder && (
        <OrderChatModal
          isOpen={Boolean(activeChatOrder)}
          onClose={() => setActiveChatOrder(null)}
          orderId={activeChatOrder.id}
          orderTitle={`Chat Pesanan #${activeChatOrder.id}`}
          customerName={activeChatOrder.customer_name}
          currentUserRole="admin"
        />
      )}
    </div>
  );
}
