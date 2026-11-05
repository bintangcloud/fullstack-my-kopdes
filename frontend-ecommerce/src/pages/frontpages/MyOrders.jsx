import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Package,
  ReceiptText,
  Store,
  Truck,
  XCircle,
  MessageCircle,
  Ban,
  Check,
  Star,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import apiClient from "../../utils/apiClient";
import BackButton from "../../components/BackButton";
import OrderChatModal from "../../components/OrderChatModal";
import ConfirmModal from "../../components/ConfirmModal";

const STATUS_CONFIG = {
  pending: {
    label: "Menunggu Konfirmasi",
    icon: Clock,
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  processing: {
    label: "Sedang Diproses",
    icon: Loader2,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  shipping: {
    label: "Sedang Diantar Kurir",
    icon: Truck,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  ready_for_pickup: {
    label: "Bisa Diambil di Toko",
    icon: Store,
    className: "bg-teal-100 text-teal-800 border-teal-200",
  },
  completed: {
    label: "Pesanan Selesai",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Dibatalkan",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const formatRupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MyOrders() {
  const queryClient = useQueryClient();
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [completeOrderId, setCompleteOrderId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/orders");
      return res.data?.data || [];
    },
  });

  // Eksekusi pembatalan pesanan setelah konfirmasi modal
  const handleConfirmCancelOrder = async () => {
    if (!cancelOrderId) return;
    try {
      setActionLoadingId(cancelOrderId);
      const res = await apiClient.post(`/orders/${cancelOrderId}/cancel`);
      toast.success(res.data?.message || "Pesanan berhasil dibatalkan.");
      setCancelOrderId(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membatalkan pesanan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Eksekusi selesaikan pesanan setelah konfirmasi modal
  const handleConfirmCompleteOrder = async () => {
    if (!completeOrderId) return;
    try {
      setActionLoadingId(completeOrderId);
      const res = await apiClient.post(`/orders/${completeOrderId}/complete`);
      toast.success(res.data?.message || "Terima kasih! Pesanan telah selesai.");
      setCompleteOrderId(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyelesaikan pesanan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col items-start gap-3 mb-8">
        <BackButton to="/" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight ml-1">
          Pesanan <span className="text-[#8B0000]">Saya</span>
        </h1>
        <p className="text-sm text-gray-500 ml-1">
          Pantau status pesanan, hubungi toko untuk ketersediaan barang, batalkan, atau konfirmasi penerimaan pesanan.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#8B0000] border-t-transparent rounded-full mb-3"></div>
          <p className="text-gray-500 font-semibold text-sm">
            Memuat pesanan kamu...
          </p>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-16 text-center text-red-600">
          <XCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
          <p className="font-bold text-base">Gagal memuat pesanan.</p>
          <p className="text-xs text-gray-500 mt-1">
            {error?.response?.data?.message ||
              "Pastikan backend Laravel sedang berjalan, lalu coba lagi."}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <ReceiptText className="w-12 h-12 text-[#8B0000]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Belum ada pesanan
          </h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Kamu belum pernah menyelesaikan checkout. Yuk mulai belanja
            kebutuhan sembako di MyKopDes.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full font-bold text-sm text-white bg-[#8B0000] hover:bg-red-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, index) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            const isPickup = order.delivery_method === "pickup";
            const shippingCost = Number(order.shipping_cost || 0);
            const subtotal = Number(order.total_price || 0) - shippingCost;
            const userOrderNum = order.user_order_number || (orders.length - index);
            const isProcessingAction = actionLoadingId === order.id;

            const canCancel = order.status === "pending";
            const canComplete = ["processing", "shipping", "ready_for_pickup"].includes(order.status);
            const isCompleted = order.status === "completed";

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Header pesanan */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#8B0000] flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-gray-900 text-base">
                          Pesanan #{userOrderNum}
                        </p>
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-200/70 px-2 py-0.5 rounded-full">
                          Ref: #{order.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border self-start sm:self-auto ${status.className}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>

                {/* Status Notice Khusus */}
                {order.status === "ready_for_pickup" && (
                  <div className="bg-teal-50 border-b border-teal-100 px-5 py-3 flex items-center gap-2.5 text-xs text-teal-800">
                    <Store className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>
                      <strong>Barang siap diambil!</strong> Silakan datang ke kantor Koperasi Desa pada jam kerja dengan menunjukkan Ref: #{order.id}.
                    </span>
                  </div>
                )}

                {order.status === "shipping" && (
                  <div className="bg-purple-50 border-b border-purple-100 px-5 py-3 flex items-center gap-2.5 text-xs text-purple-800">
                    <Truck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>
                      <strong>Pesanan sedang diantar!</strong> Kurir kami sedang menuju alamat pengantaran Anda.
                    </span>
                  </div>
                )}

                {/* Daftar produk */}
                <div className="p-5 space-y-3">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-1"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                          {item.product?.name || "Produk sudah dihapus"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.qty} x {formatRupiah(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                          {formatRupiah(item.qty * item.price)}
                        </span>

                        {isCompleted && item.product && (
                          <Link
                            to={`/product/${item.product.id}`}
                            state={item.product}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                            title={`Beri rating untuk ${item.product.name}`}
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Beri Rating</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info pengiriman & pembayaran */}
                <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#8B0000] flex items-center justify-center flex-shrink-0 border border-gray-100">
                      {isPickup ? (
                        <Store className="w-4 h-4" />
                      ) : (
                        <Truck className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {isPickup ? "Ambil di Toko" : "Dikirim ke Alamat"}
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5 break-words">
                        {isPickup
                          ? "Gratis ongkir - silakan ambil di kantor Koperasi Desa."
                          : order.address}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#8B0000] flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Metode Pembayaran
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {order.payment_method === "cod"
                          ? "Bayar di Tempat (COD)"
                          : "Transfer Bank"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Penerima: {order.customer_name} ({order.phone})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ringkasan biaya & Tombol Aksi */}
                <div className="px-5 pb-5">
                  <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal Produk</span>
                      <span className="font-semibold text-gray-900">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Ongkos Kirim</span>
                      <span
                        className={`font-semibold ${
                          isPickup ? "text-green-600" : "text-gray-900"
                        }`}
                      >
                        {isPickup ? "Gratis (Ambil di Toko)" : formatRupiah(shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="font-bold text-gray-900">Total Bayar</span>
                      <span className="font-extrabold text-xl text-[#8B0000]">
                        {formatRupiah(order.total_price)}
                      </span>
                    </div>
                  </div>

                  {/* BARIS AKSI PESANAN */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Tombol Chat Toko */}
                    <button
                      type="button"
                      onClick={() => setActiveChatOrder(order)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition border border-gray-200"
                    >
                      <MessageCircle className="w-4 h-4 text-[#8B0000]" />
                      <span>Chat Toko (Tanya Stok/Pesanan)</span>
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                      {/* Tombol Batalkan Pesanan */}
                      {canCancel && (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => setCancelOrderId(order.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Batalkan Pesanan</span>
                        </button>
                      )}

                      {/* Tombol Selesaikan Pesanan (Konfirmasi Barang Diterima) */}
                      {canComplete && (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => setCompleteOrderId(order.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Selesaikan Pesanan (Diterima)</span>
                        </button>
                      )}

                      {/* Tombol Beri Ulasan jika sudah selesai */}
                      {isCompleted && order.items && order.items.length > 0 && (
                        order.items.length === 1 ? (
                          order.items[0]?.product && (
                            <Link
                              to={`/product/${order.items[0].product.id}`}
                              state={order.items[0].product}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                            >
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span>Beri Rating Produk</span>
                            </Link>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReviewModalOrder(order)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                          >
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>Beri Rating Produk ({order.items.length} item)</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Pilih Produk untuk Diulas (Jika 1 Pesanan Beli Banyak Produk) */}
      {reviewModalOrder && (
        <div
          onClick={() => setReviewModalOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Pilih Produk untuk Diulas</h3>
                <p className="text-xs text-gray-500">
                  Pesanan #{reviewModalOrder.user_order_number || reviewModalOrder.id} memiliki {reviewModalOrder.items?.length} produk
                </p>
              </div>
              <button
                onClick={() => setReviewModalOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(reviewModalOrder.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-200 transition"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-gray-800 text-xs line-clamp-1">
                      {item.product?.name || "Produk"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.qty} pcs • {formatRupiah(item.price)}
                    </p>
                  </div>
                  {item.product ? (
                    <Link
                      to={`/product/${item.product.id}`}
                      state={item.product}
                      onClick={() => setReviewModalOrder(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200/80 transition flex-shrink-0"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Beri Rating</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400">Tidak tersedia</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Chat dengan Toko */}
      {activeChatOrder && (
        <OrderChatModal
          isOpen={Boolean(activeChatOrder)}
          onClose={() => setActiveChatOrder(null)}
          orderId={activeChatOrder.id}
          orderTitle={`Chat Pesanan #${activeChatOrder.user_order_number || activeChatOrder.id} (Ref: #${activeChatOrder.id})`}
          customerName={activeChatOrder.customer_name}
          currentUserRole="customer"
        />
      )}

      {/* Modal Konfirmasi Batalkan Pesanan */}
      <ConfirmModal
        isOpen={Boolean(cancelOrderId)}
        onClose={() => setCancelOrderId(null)}
        onConfirm={handleConfirmCancelOrder}
        title="Batalkan Pesanan?"
        message="Apakah Anda yakin ingin membatalkan pesanan ini? Stok produk pesanan akan segera dikembalikan ke toko."
        confirmText="Ya, Batalkan"
        cancelText="Kembali"
        confirmVariant="danger"
        icon="alert"
        isLoading={actionLoadingId === cancelOrderId}
      />

      {/* Modal Konfirmasi Selesaikan Pesanan */}
      <ConfirmModal
        isOpen={Boolean(completeOrderId)}
        onClose={() => setCompleteOrderId(null)}
        onConfirm={handleConfirmCompleteOrder}
        title="Konfirmasi Pesanan Diterima"
        message="Pastikan Anda telah menerima barang pesanan dalam kondisi baik dan lengkap sebelum menyelesaikan pesanan."
        confirmText="Ya, Selesaikan"
        cancelText="Belum Diterima"
        confirmVariant="primary"
        icon="check"
        isLoading={actionLoadingId === completeOrderId}
      />
    </div>
  );
}
