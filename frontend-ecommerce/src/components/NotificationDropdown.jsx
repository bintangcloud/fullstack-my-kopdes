import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  Package,
  Truck,
  Store,
  CheckCircle2,
  Clock,
  CheckCheck,
} from "lucide-react";
import apiClient from "../utils/apiClient";
import { useAuth } from "../utils/AuthContext";

export default function NotificationDropdown({ isAdmin = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Polling data notifikasi setiap 6 detik
  const { data } = useQuery({
    queryKey: ["notifications", isAdmin],
    queryFn: async () => {
      const res = await apiClient.get("/notifications");
      return res.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 6000,
  });

  const unreadCount = data?.unread_count || 0;
  const notifications = data?.data || [];

  const markReadMutation = useMutation({
    mutationFn: () => apiClient.post("/notifications/mark-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markReadMutation.mutate();
  };

  const formatRelativeTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}j lalu`;
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Tombol Bell Notifikasi */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-gray-600 hover:text-[#8B0000] hover:bg-red-50 rounded-full transition flex items-center justify-center"
        aria-label="Notifikasi Pesanan & Chat"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#8B0000] text-white text-[10px] font-black min-w-4 h-4 px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down font-sans">
          {/* Header Dropdown */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 text-sm">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-[#8B0000] px-2 py-0.5 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markReadMutation.isPending}
                className="text-[11px] font-bold text-[#8B0000] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai dibaca</span>
              </button>
            )}
          </div>

          {/* List Notifikasi */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400 p-4">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
                <p className="font-semibold text-xs text-gray-600">Belum ada notifikasi baru</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Update pesanan dan pesan chat dari toko akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isChat = item.type === "chat";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3.5 sm:p-4 hover:bg-amber-50/40 cursor-pointer transition flex items-start gap-3 ${
                      item.is_unread ? "bg-red-50/30" : "bg-white"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isChat
                          ? "bg-red-50 text-[#8B0000]"
                          : item.status === "shipping"
                          ? "bg-purple-50 text-purple-700"
                          : item.status === "ready_for_pickup"
                          ? "bg-teal-50 text-teal-700"
                          : item.status === "completed"
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {isChat ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : item.status === "shipping" ? (
                        <Truck className="w-4 h-4" />
                      ) : item.status === "ready_for_pickup" ? (
                        <Store className="w-4 h-4" />
                      ) : item.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatRelativeTime(item.time)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {item.is_unread && (
                      <span className="w-2 h-2 rounded-full bg-[#8B0000] flex-shrink-0 mt-2"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Dropdown */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(isAdmin ? "/admin/orders" : "/orders");
              }}
              className="text-xs font-bold text-[#8B0000] hover:underline"
            >
              {isAdmin ? "Buka Kelola Pesanan Masuk " : "Buka Halaman Pesanan Saya "}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
