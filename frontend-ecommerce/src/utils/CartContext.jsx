import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  
  // Pisahkan penyimpanan keranjang per user ID agar keranjang user lain tidak tercampur
  const userId = user?.id ? `user_${user.id}` : "guest";
  const storageKey = `kopdes_cart_${userId}`;
  const activeKeyRef = useRef(storageKey);

  // Ambil keranjang milik user yang sedang aktif
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Saat akun berganti (login akun lain atau logout), muat ulang keranjang milik akun tersebut
  useEffect(() => {
    activeKeyRef.current = storageKey;
    try {
      const saved = localStorage.getItem(storageKey);
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, [storageKey]);

  // Simpan perubahan keranjang ke storage key HANYA jika key aktif sinkron
  useEffect(() => {
    if (activeKeyRef.current === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, storageKey]);

  const parseStock = (val) => {
    if (val === undefined || val === null || val === "") return 999;
    const num = Number(val);
    return isNaN(num) ? 999 : num;
  };

  // Tambah produk ke keranjang dengan validasi batas stok
  const addToCart = (product, qtyToAdd = 1) => {
    let success = true;
    const maxStock = parseStock(product.stock);

    if (maxStock <= 0) {
      toast.error(`Maaf, stok produk "${product.name}" sedang habis!`);
      return false;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentQty = existing ? existing.qty : 0;
      const targetQty = currentQty + qtyToAdd;

      if (targetQty > maxStock) {
        success = false;
        toast.error(
          `Jumlah ${product.name} di keranjang sudah mencapai batas maksimal stok (${maxStock} pcs).`,
          { id: `stock-limit-${product.id}` }
        );
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, qty: maxStock } : item
          );
        } else {
          return [...prev, { ...product, qty: maxStock }];
        }
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: targetQty } : item
        );
      } else {
        return [...prev, { ...product, qty: targetQty }];
      }
    });

    return success;
  };

  // Update jumlah produk di keranjang (tidak boleh melebihi stok yang ada)
  const updateQty = (id, newQty) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxStock = parseStock(item.stock);

          if (newQty > maxStock) {
            toast.error(
              `Maksimal pembelian untuk ${item.name} adalah ${maxStock} pcs (sesuai stok tersedia).`,
              { id: `stock-limit-${id}` }
            );
            return { ...item, qty: maxStock };
          }

          if (newQty < 1) {
            return { ...item, qty: 1 };
          }

          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeFromCart, clearCart, totalQty }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
