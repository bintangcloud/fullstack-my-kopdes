import React, { createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "./apiClient";

// 1. Buat Context
const CategoryContext = createContext();

// 2. Buat Provider
export const CategoryProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // GET ALL CATEGORIES (Untuk Dropdown di Form & Filter)
  const getCategories = async () => {
    try {
      const res = await apiClient.get("/categories");
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.data)) return res.data.data;
      return [];
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
      return [];
    }
  };

  // STORE CATEGORY (Tambah Kategori Baru)
  const addCategory = async (name) => {
    const res = await apiClient.post("/categories", { name });
    // Refresh otomatis data kategori di seluruh form/halaman
    await queryClient.invalidateQueries({ queryKey: ["categories"], refetchType: "all" });
    await queryClient.refetchQueries({ queryKey: ["categories"] });
    return res.data?.data || res.data;
  };

  return (
    <CategoryContext.Provider
      value={{
        getCategories,
        addCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

// 3. Custom Hook
export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory harus digunakan di dalam CategoryProvider");
  }
  return context;
};