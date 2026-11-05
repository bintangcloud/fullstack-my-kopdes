import { AlertTriangle } from "lucide-react";

export default function WarningAlert({ message, show }) {
  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 animate-fade-in-down border border-red-700">
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-white" />
      <span className="text-sm font-semibold">{message}</span>
    </div>
  );
}
