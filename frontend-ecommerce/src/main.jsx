
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./utils/AuthContext";
import { CartProvider } from "./utils/CartContext";
import { ProductProvider } from "./utils/ProductContext";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { Toaster } from "react-hot-toast";

// Membuat Query Client dengan konfigurasi caching optimal
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // Data disimpan 3 menit tanpa re-fetch berulang
      gcTime: 1000 * 60 * 10, // Cache bertahan di memori hingga 10 menit
      refetchOnWindowFocus: false, // Jangan re-fetch otomatis saat tab browser dibuka kembali
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <App />
              {/* Notifikasi Toast */}
              <Toaster
                position="top-right"
                reverseOrder={false}
              />
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
