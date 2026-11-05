/**
 * Memastikan URL gambar aman (HTTPS) dan valid.
 * Mencegah error 'Mixed Content' ketika website diakses via HTTPS.
 */
export const getSafeImageUrl = (img) => {
  if (!img) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80";

  let url = String(img).trim();

  // Jika berupa path lokal (contoh: '/uploads/abc.jpg' atau 'uploads/abc.jpg')
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    const rawBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
    const baseUrl = rawBase.replace(/\/api\/?$/, "");
    url = `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  // Jika halaman web dibuka di HTTPS, paksa gambar non-localhost menggunakan HTTPS
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    url.startsWith("http://") &&
    !url.includes("localhost") &&
    !url.includes("127.0.0.1")
  ) {
    url = url.replace(/^http:\/\//i, "https://");
  }

  return url;
};
