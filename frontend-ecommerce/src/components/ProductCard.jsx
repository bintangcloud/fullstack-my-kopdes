import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../utils/CartContext";
import { useAuth } from "../utils/AuthContext";
import toast from "react-hot-toast";
import { Star, Plus } from "lucide-react";
import Button from "./Button";
import WarningAlert from "./WarningAlert";

export default function ProductCard({ p }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [warningMsg, setWarningMsg] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  const avgRating = p.avg_rating || 0;
  const totalReviews = p.reviews_count || 0;
  const totalSold = p.sold_count || 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Silakan masuk (login) terlebih dahulu untuk mulai belanja!");
      navigate("/login");
      return;
    }

    const success = addToCart(p, 1);
    
    if (success) {
      toast.success(`${p.name} ditambahkan ke keranjang!`);
    } else {
      setWarningMsg("Stok produk ini sudah maksimal di keranjang belanjaanmu!");
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group">
      <WarningAlert message={warningMsg} show={showWarning} />

      <div>
        <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-50 h-48">
          <img src={p.img || p.img_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#8B0000] text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
            {p.category_name || p.category?.name || "Sembako"}
          </span>
        </div>

        <h2 className="text-gray-800 text-lg font-bold line-clamp-1">{p.name}</h2>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-700">{avgRating > 0 ? avgRating : "Belum ada"}</span>
            {totalReviews > 0 && <span className="text-gray-400">({totalReviews})</span>}
          </div>
          <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-600">
            Terjual {totalSold}
          </span>
        </div>
      </div>
      
      <div className="mt-2 pt-3 border-t border-gray-50">
        <p className="text-[#8B0000] font-extrabold text-xl mb-3">
          Rp {Number(p.price || 0).toLocaleString("id-ID")}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => navigate(`/product/${p.slug || p.id}`, { state: p })}>
            Detail
          </Button>
          <Button variant="primary" onClick={handleAddToCart} disabled={p.stock === 0} className="inline-flex items-center justify-center">
            {p.stock === 0 ? "Habis" : (
              <>
                <Plus className="w-4 h-4 mr-0.5 inline-block" />
                <span>Keranjang</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
