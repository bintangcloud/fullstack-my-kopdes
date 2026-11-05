import axios from "axios";

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.startsWith("http") ? `https://${import.meta.env.VITE_API_BASE_URL}` : (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api")),
  headers: {
    Accept: "application/json",
  },
});

// Ambil token setiap kali request dikirim
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;