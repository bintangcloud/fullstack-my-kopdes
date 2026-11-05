import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ to = "/", label = "Kembali" }) {
  return (
    <Link 
      to={to} 
      className="inline-flex items-center gap-2 text-gray-500 hover:text-[#8B0000] font-semibold transition-colors mb-6 text-sm group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </Link>
  );
}
