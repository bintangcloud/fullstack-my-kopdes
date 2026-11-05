import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, token, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Jika belum login, arahkan ke halaman login dan simpan URL tujuan
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika halaman khusus admin tetapi yang login adalah pembeli/user biasa
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Jika lolos, izinkan akses
  return <Outlet />;
}
