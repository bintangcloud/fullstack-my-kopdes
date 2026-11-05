import React from "react";
import { AlertTriangle, Trash2, X, CheckCircle2, HelpCircle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Tindakan",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  confirmVariant = "danger", // 'danger', 'primary', 'warning'
  icon = "alert", // 'trash', 'alert', 'check', 'help'
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case "trash":
        return <Trash2 className="w-7 h-7 text-red-600" />;
      case "check":
        return <CheckCircle2 className="w-7 h-7 text-green-600" />;
      case "help":
        return <HelpCircle className="w-7 h-7 text-blue-600" />;
      case "alert":
      default:
        return <AlertTriangle className="w-7 h-7 text-amber-600" />;
    }
  };

  const getIconBg = () => {
    switch (confirmVariant) {
      case "danger":
        return "bg-red-50 border-red-100";
      case "primary":
        return "bg-green-50 border-green-100";
      case "warning":
      default:
        return "bg-amber-50 border-amber-100";
    }
  };

  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case "danger":
        return "bg-[#8B0000] hover:bg-red-800 text-white shadow-md hover:shadow-lg";
      case "primary":
        return "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg";
      case "warning":
      default:
        return "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg";
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-7 relative animate-scale-up"
      >
        {/* Tombol Tutup Silang */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Ikon Modal */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${getIconBg()}`}
          >
            {getIcon()}
          </div>

          {/* Judul & Pesan */}
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
            {message}
          </p>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 ${getConfirmButtonClass()}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
