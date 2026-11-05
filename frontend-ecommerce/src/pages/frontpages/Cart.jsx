import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../utils/CartContext";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import { getSafeImageUrl } from "../../utils/imageHelper";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeFromCart } = useCart();
  
  // Ambil state id barang yang di-ceklis
  const [selectedItems, setSelectedItems] = useState(() => cart.map(item => item.id));

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Langsung cek stok dari data yang tersimpan di cart lokal
  const inStockItems = cart.filter(item => item.stock > 0);

  const handleSelectAll = () => {
    if (selectedItems.length === inStockItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inStockItems.map(item => item.id));
    }
  };

  const checkedItems = inStockItems.filter(item => selectedItems.includes(item.id));
  const totalPrice = checkedItems.reduce((total, item) => total + item.price * item.qty, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col items-start gap-3 mb-8">
        <BackButton to="/" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight ml-1">
          Keranjang <span className="text-[#8B0000]">Belanja</span>
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-[#8B0000]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjangmu masih kosong!</h2>
          <Button onClick={() => navigate("/")} className="px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            Mulai Belanja Sekarang
          </Button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === inStockItems.length && inStockItems.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 accent-[#8B0000] rounded cursor-pointer"
                />
                <span className="font-bold text-gray-800">Pilih Semua ({cart.length})</span>
              </label>
            </div>

            <div className="space-y-4">
              {cart.map((item) => {
                const currentStock = Number(item.stock ?? 999);
                const isOutOrStock = currentStock === 0;      

                return (
                  <div key={item.id} className="group bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="flex items-center gap-4 shrink-0">
                      <input 
                        type="checkbox" 
                        disabled={isOutOrStock}
                        checked={selectedItems.includes(item.id) && !isOutOrStock}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-5 h-5 accent-[#8B0000] rounded cursor-pointer disabled:opacity-40"
                      />
                      <div className="relative">
                        <img 
                          src={getSafeImageUrl(item.img)} 
                          alt={item.name} 
                          className={`w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl transition-transform duration-300 ${isOutOrStock ? 'opacity-50 grayscale' : 'group-hover:scale-105'}`} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between w-full">
                      <div className="flex justify-between items-start w-full gap-4">
                        <div className="space-y-1">
                          <h2 className="font-bold text-lg text-gray-900 line-clamp-2">
                            {item.name}
                          </h2>
                          <p className="text-[#8B0000] font-extrabold text-lg">Rp {item.price?.toLocaleString("id-ID")}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Hapus dari keranjang"
                          aria-label="Hapus dari keranjang"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-4 sm:mt-0 flex flex-col sm:items-end items-start w-full">
                        <div className={`flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 ${isOutOrStock ? 'opacity-50 pointer-events-none' : ''}`}>
                          <button 
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          
                          <input 
                            type="number" 
                            value={item.qty} 
                            min="1"
                            max={currentStock}
                            onChange={(e) => {
                              let val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < 1) val = 1;
                              if (val > currentStock) {
                                val = currentStock;
                                toast.error(`Maksimal pembelian untuk ${item.name} adalah ${currentStock} pcs (sesuai stok).`, {
                                  id: `cart-max-${item.id}`,
                                });
                              }
                              updateQty(item.id, val);
                            }}
                            className="w-12 bg-transparent text-center text-sm font-bold text-gray-800 focus:outline-none"
                          />

                          <button 
                            type="button"
                            onClick={() => {
                              if (item.qty >= currentStock) {
                                toast.error(`Maksimal pembelian untuk ${item.name} adalah ${currentStock} pcs (sesuai stok).`, {
                                  id: `cart-max-${item.id}`,
                                });
                                return;
                              }
                              updateQty(item.id, item.qty + 1);
                            }}
                            disabled={item.qty >= currentStock}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm hover:text-[#8B0000] disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Tambah jumlah"
                            title={item.qty >= currentStock ? `Maksimal stok tercapai (${currentStock} pcs)` : "Tambah jumlah"}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.qty >= currentStock && currentStock > 0 && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full mt-1.5 border border-amber-200">
                            Stok maks: {currentStock} pcs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-bold text-xl text-gray-900 mb-6">Ringkasan Belanja</h2>
              
              <div className="flex justify-between items-end mb-8 border-t border-gray-100 pt-4">
                <span className="font-bold text-gray-900">Total Tagihan</span>
                <span className="font-extrabold text-2xl text-[#8B0000]">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>

              <Button 
                onClick={() => navigate("/checkout", { state: { selectedItemsForCheckout: checkedItems } })} 
                disabled={checkedItems.length === 0}
                className="w-full py-4 text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                Lanjut ke Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}