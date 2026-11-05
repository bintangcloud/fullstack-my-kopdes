
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import apiClient from "../utils/apiClient";

export default function MainLayout() {
  const [kataKunci, setKataKunci] = useState("");
  const [kategori, setKategori] = useState("Semua Kategori");
  const [daftarKategori, setDaftarKategori] = useState(["Semua Kategori"]);

  const location = useLocation();
  const isDashboard = location.pathname === "/";

  // Mengambil daftar kategori dari API Laravel
 useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        const raw = Array.isArray(response.data)
          ? response.data
          : (Array.isArray(response.data?.data) ? response.data.data : []);
        const categoryNames = raw.map((c) => (typeof c === 'object' ? (c.name || c.category) : c));
        setDaftarKategori(["Semua Kategori", ...categoryNames]);
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <div className="bg-[#F8F9FA] flex flex-col min-h-screen font-sans">

      {/* Oper data ke Navbar */}
      <Navbar
        kataKunci={kataKunci}
        setKataKunci={setKataKunci}
        kategori={kategori}
        setKategori={setKategori}
        daftarKategori={daftarKategori}
        isDashboard={isDashboard}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">

        {/* Oper data ke Dashboard */}
        <Outlet context={{ kataKunci, setKataKunci, kategori, setKategori, daftarKategori }} />

      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-auto border-t-4 border-[#8B0000]">

        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="text-center md:text-left">

            <h3 className="text-2xl font-extrabold text-white tracking-tight mb-1 flex items-center justify-center md:justify-start gap-2">

              <span className="bg-[#8B0000] text-white rounded-lg w-8 h-8 flex items-center justify-center text-lg">
                K
              </span>

              <span>
                My<span className="text-[#8B0000]">KopDes</span>
              </span>

            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Pusat belanja kebutuhan pokok tepercaya di desa.
            </p>

          </div>

          <div className="text-center md:text-right text-xs text-gray-500">
            © 2026 My-Kopdes App | Version 1.0
          </div>

        </div>

      </footer>

    </div>
  );
}
