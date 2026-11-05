import React, { createContext, useContext, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./apiClient";

// 1. Buat Context
const ProductContext = createContext();

// 2. Buat Provider
export const ProductProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // GET ALL PRODUCTS (Sudah mendukung Pagination & Pencarian)
  const getProducts = async ({ page = 1, limit = 10, category_id = "", keyword = "" } = {}) => {
    const res = await apiClient.get(
      `/products?page=${page}&limit=${limit}&category_id=${category_id}&keyword=${keyword}`
    );
    return res.data; 
  };

  // GET ALL CATEGORIES (Untuk Dropdown di Form & Filter)
  const getCategories = async () => {
    const res = await apiClient.get("/categories");
    return res.data;
  };

  // STORE CATEGORY (Tambah Kategori Baru)
  const addCategory = async (name) => {
    const res = await apiClient.post("/categories", { name });
    queryClient.invalidateQueries(["categories"]);
    return res.data?.data || res.data;
  };

  // SHOW PRODUCT DETAIL (Untuk Form Edit)
  const getProductById = useCallback(async (id) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data?.data || res.data;
  }, []);

  // STORE PRODUCT (Tambah Produk Baru)
  const addProduct = useMutation({
    mutationFn: async (formData) => {
      return await apiClient.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    // Refresh data otomatis setelah tambah berhasil
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  // UPDATE PRODUCT (Edit Produk)
  const updateProduct = async (id, formData) => {
    try {
      const response = await apiClient.post(`/admin/products/${id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Refresh data otomatis setelah edit berhasil
      queryClient.invalidateQueries(["products"]);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // DELETE PRODUCT (Hapus Produk)
  const deleteProduct = useMutation({
    mutationFn: async (id) => await apiClient.delete(`/admin/products/${id}`),
    // Refresh data otomatis setelah hapus berhasil
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  // 3. Export semua fungsi agar bisa dipakai di AdminDashboard maupun User Dashboard
  return (
    <ProductContext.Provider
      value={{
        getProducts,
        getCategories,
        addCategory,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// 4. Custom Hook untuk mempermudah pemanggilan di komponen
export const useProducts = () => useContext(ProductContext);
