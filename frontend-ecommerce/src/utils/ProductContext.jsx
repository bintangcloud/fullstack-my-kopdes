import React, { createContext, useContext, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./apiClient";

// 1. Buat Context
const ProductContext = createContext();

// 2. Buat Provider
export const ProductProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // GET ALL PRODUCTS (Mendukung Pagination, Kategori, & Pencarian)
  const getProducts = async ({ page = 1, limit = 10, category_id = "", keyword = "" } = {}) => {
    const res = await apiClient.get(
      `/products?page=${page}&limit=${limit}&category_id=${category_id}&keyword=${keyword}`
    );
    return res.data; 
  };

  // SHOW PRODUCT DETAIL (Untuk Form Edit & Halaman Detail)
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  // UPDATE PRODUCT (Edit Produk)
  const updateProduct = async (id, formData) => {
    try {
      const response = await apiClient.post(`/admin/products/${id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // DELETE PRODUCT (Hapus Produk)
  const deleteProduct = useMutation({
    mutationFn: async (id) => await apiClient.delete(`/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  return (
    <ProductContext.Provider
      value={{
        getProducts,
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

// 3. Custom Hook
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts harus digunakan di dalam ProductProvider");
  }
  return context;
};