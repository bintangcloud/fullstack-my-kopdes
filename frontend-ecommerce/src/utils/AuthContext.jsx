import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "./apiClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Ambil token dan data user dari localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Sinkronkan Authorization header Axios setiap kali token berubah
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // LOGIN
  const login = async (email, password, redirectTo = null) => {
    try {
      const res = await apiClient.post("/login", { email, password });

      const receivedToken = res.data.token;
      const userData = res.data.user;

      if (!receivedToken) {
     throw new Error("Token tidak ditemukan dari response API.");
    }

    setToken(receivedToken);
    setUser(userData);

    // Simpan token
    localStorage.setItem("token", receivedToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Pasang token langsung ke Axios
    apiClient.defaults.headers.common["Authorization"] =
    `Bearer ${receivedToken}`;

      toast.success(`Selamat datang kembali, ${userData.name}!`);

      if (userData.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (redirectTo && redirectTo !== "/login") {
        navigate(redirectTo, { replace: true });
      } else {
        navigate("/", { replace: true });
      }

      return { success: true, user: userData };
    } catch (error) {
      const msg = error.response?.data?.message || "Login gagal, periksa email dan password Anda.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // REGISTER
  const register = async ({ name, email, password, password_confirmation }) => {
    try {
      const res = await apiClient.post("/register", {
        name,
        email,
        password,
        password_confirmation,
      });

      const receivedToken = res.data.token;
      const userData = res.data.user;

      if (!receivedToken) {
        throw new Error("Token tidak ditemukan dari response API.");
      }

      setToken(receivedToken);
      setUser(userData);

      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Akun berhasil dibuat! Selamat berbelanja di MyKopDes.");
      navigate("/", { replace: true });

      return { success: true, user: userData };
    } catch (error) {
      const msg = error.response?.data?.message || "Registrasi gagal, silakan periksa data.";
      const errors = error.response?.data?.errors || {};
      toast.error(msg);
      return { success: false, message: msg, errors };
    }
  };

  // LOGOUT
  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete apiClient.defaults.headers.common["Authorization"];
    toast.success("Anda telah berhasil logout.");
    navigate("/login", { replace: true });
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user && user.role === "admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
