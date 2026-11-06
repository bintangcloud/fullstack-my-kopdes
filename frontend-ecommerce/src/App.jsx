import { Routes, Route } from "react-router-dom";

// ==========================================
// IMPORT LAYOUTS & COMPONENTS
// ==========================================
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// IMPORT HALAMAN PENGUNJUNG
import Dashboard from "./pages/frontpages/Dashboard";
import ProductDetail from "./pages/frontpages/ProductDetail";
import Cart from "./pages/frontpages/Cart";
import Checkout from "./pages/frontpages/Checkout";
import MyOrders from "./pages/frontpages/MyOrders";

// ==========================================
// IMPORT HALAMAN AUTHENTICATION
// ==========================================
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// ==========================================
// IMPORT HALAMAN ADMIN
// ==========================================
import AdminDashboard from "./pages/adminpages/AdminDashboard";
import ProductForm from "./pages/adminpages/ProductForm";
import ProductEdit from "./pages/adminpages/ProductEdit";
import AdminOrders from "./pages/adminpages/AdminOrders";

export default function App() {
  return (
    <Routes>
      {/* ================================== */}
      {/* ROUTE AUTENTIKASI */}
      {/* ================================== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ROUTE TOKO DEPAN */}
      <Route path="/" element={<MainLayout />}>
        {/* Halaman Katalog Produk (Publik) */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="product/:id" element={<ProductDetail />} />

        {/* Halaman Transaksi/Belanja (Wajib Login/Register) */}
        <Route element={<ProtectedRoute adminOnly={false} />}>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<MyOrders />} />
        </Route>
      </Route>

      {/* ================================== */}
      {/* ROUTE KHUSUS ADMIN (Wajib Login & Admin) */}
      {/* ================================== */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="add-product" element={<ProductForm />} />
          <Route path="edit-product/:id" element={<ProductEdit />} />
        </Route>
      </Route>
    </Routes>
  );
}
