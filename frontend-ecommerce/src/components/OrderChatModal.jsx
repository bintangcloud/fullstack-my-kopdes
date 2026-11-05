import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  MessageCircle, 
  Store, 
  User, 
  Clock, 
  Check, 
  CheckCheck,
  Sparkles,
  Loader2
} from "lucide-react";
import apiClient from "../utils/apiClient";
import toast from "react-hot-toast";

export default function OrderChatModal({
  isOpen,
  onClose,
  orderId,
  orderTitle = "",
  customerName = "",
  currentUserRole = "customer", // 'admin' atau 'customer'
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch riwayat chat
  const fetchChats = async (silent = false) => {
    if (!orderId) return;
    try {
      if (!silent) setIsLoading(true);
      const res = await apiClient.get(`/orders/${orderId}/chats`);
      setMessages(res.data.data || []);
    } catch (err) {
      if (!silent) {
        console.error("Gagal memuat chat:", err);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !orderId) return;

    fetchChats(false);

    // Polling setiap 3.5 detik saat modal terbuka agar pesan masuk otomatis
    const interval = setInterval(() => {
      fetchChats(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, orderId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    try {
      setIsSending(true);
      const res = await apiClient.post(`/orders/${orderId}/chats`, {
        message: text,
      });

      setInputText("");
      setMessages((prev) => [...prev, res.data.data]);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim pesan.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const quickTemplatesAdmin = [
    "Halo kak, pesanan masih tersedia dan sedang kami siapkan!",
    "Pesanan Anda sudah siap diambil di kantor koperasi ya kak.",
    "Kurir kami sedang menuju alamat pengantaran.",
    "Mohon maaf kak, salah satu stok barang sedang kosong.",
  ];

  const quickTemplatesUser = [
    "Halo kak, apakah pesanan saya sudah diproses?",
    "Kapan pesanannya bisa diambil/diantar ya kak?",
    "Terima kasih banyak kak!",
  ];

  const quickTemplates = currentUserRole === "admin" ? quickTemplatesAdmin : quickTemplatesUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden border border-gray-100">
        
        {/* Header Modal */}
        <div className="bg-[#8B0000] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
              <MessageCircle className="w-5 h-5 text-[#FFE600]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-base truncate flex items-center gap-2">
                <span>{orderTitle || `Chat Pesanan #${orderId}`}</span>
              </h2>
              <p className="text-xs text-red-100 truncate flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {currentUserRole === "admin"
                  ? `Pelanggan: ${customerName || "Pembeli"}`
                  : "Admin Koperasi Desa (MyKopDes)"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
            aria-label="Tutup percakapan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="line-clamp-1">
            Gunakan ruang chat ini untuk memastikan pesanan atau produk.
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/70">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#8B0000]" />
              <p className="text-xs">Memuat percakapan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#8B0000] flex items-center justify-center mb-3 border border-red-100">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Belum Ada Pesan</h3>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                {currentUserRole === "admin"
                  ? "Kirim pesan kepada pembeli untuk mengonfirmasi ketersediaan barang atau status pesanan."
                  : "Tanyakan kepada admin mengenai ketersediaan stok atau konfirmasi pesanan Anda."}
              </p>
            </div>
          ) : (
            messages.map((item) => {
              const isMine =
                (currentUserRole === "admin" && item.sender_role === "admin") ||
                (currentUserRole === "customer" && item.sender_role === "customer");

              const timeStr = item.created_at
                ? new Date(item.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={item.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-gray-400">
                      {item.sender_name}
                    </span>
                    {item.sender_role === "admin" && (
                      <span className="bg-[#8B0000] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words ${
                      isMine
                        ? "bg-[#8B0000] text-white rounded-br-xs"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{item.message}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                        isMine ? "text-red-200" : "text-gray-400"
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{timeStr}</span>
                      {isMine && (
                        <span>
                          {item.is_read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#FFE600] inline ml-0.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5 inline ml-0.5 opacity-80" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Templates */}
        <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickTemplates.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInputText(tpl)}
              className="text-[11px] whitespace-nowrap bg-gray-100 hover:bg-amber-100/70 hover:text-[#8B0000] text-gray-700 px-2.5 py-1 rounded-full transition shrink-0 border border-gray-200/60"
            >
              {tpl}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentUserRole === "admin"
                ? "Tulis pesan untuk pembeli..."
                : "Tulis pesan untuk admin toko..."
            }
            className="flex-1 bg-gray-100 focus:bg-white text-sm text-gray-800 px-4 py-3 rounded-full border border-gray-200 focus:border-[#8B0000] focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-11 h-11 rounded-full bg-[#8B0000] hover:bg-red-800 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition"
            aria-label="Kirim pesan"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
