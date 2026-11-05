import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "../../utils/ProductContext";
import ProductCard from "../../components/ProductCard";
import { Package, X } from "lucide-react";

export default function Dashboard() {
  // State pagination
  const [page, setPage] = useState(1);

  // Context pencarian dan kategori dari MainLayout
  const {
    kataKunci = "",
    setKataKunci,
    kategori = "Semua Kategori",
    setKategori,
    daftarKategori = ["Semua Kategori"],
  } = useOutletContext();

  // Mengambil fungsi API dari ProductContext
  const { getProducts } = useProducts();

  // React Query dengan pagination
  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-products", page],
    queryFn: () => getProducts({ page }),
    staleTime: 0,
    refetchOnMount: true,
  });

  // Data produk dari Laravel paginate()
  const products = productsData?.data || [];

  // Filter produk berdasarkan pencarian dan kategori
  const produkTampil = products.filter((product) => {
    const cocokNama = product.name
      .toLowerCase()
      .includes((kataKunci || "").toLowerCase());

    const cocokKategori =
      kategori === "Semua Kategori" ||
      product.category_name === kategori;

    return cocokNama && cocokKategori;
  });

  // Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <h2 className="text-2xl font-bold text-[#8B0000] animate-pulse">
          Memuat Produk...
        </h2>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="text-center mt-20 text-red-600 font-bold">
        Gagal mengambil data produk!
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#8B0000] to-red-800 text-white p-8 rounded-3xl mb-8 shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="bg-[#FFE600] text-[#8B0000] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Koperasi Desa Terpercaya
          </span>

          <h1 className="text-3xl font-extrabold mt-2 tracking-tight">
            Belanja Kebutuhan Pokok Lebih Mudah dengan My Kopdes
          </h1>

          <p className="text-red-100 text-sm mt-1 max-w-xl">
            Penuhi stok sembako harian keluarga dengan kualitas terbaik,
            harga transparan, dan langsung diantar ke rumah.
          </p>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 text-center flex-shrink-0">
          <p className="text-xs text-red-100">Jam Operasional</p>
          <p className="text-lg font-black text-[#FFE600]">
            08:00 - 20:00 WITA
          </p>
        </div>
      </div>

      {/* Header Katalog Produk & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-[#8B0000] text-2xl font-black tracking-tight">
            Katalog Produk
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {kategori === "Semua Kategori" ? (
              <span>Menampilkan seluruh persediaan produk</span>
            ) : (
              <span>
                Kategori: <strong className="text-gray-900 font-bold">{kategori}</strong> • {produkTampil.length} produk siap dipesan
              </span>
            )}
          </p>
        </div>

        {(kataKunci || kategori !== "Semua Kategori") && (
          <div className="flex flex-wrap items-center gap-2">
            {kataKunci && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 text-xs font-bold rounded-full border border-amber-200 shadow-xs">
                <span>Pencarian: "{kataKunci}"</span>
                <button
                  type="button"
                  onClick={() => setKataKunci && setKataKunci("")}
                  className="hover:text-red-700 p-0.5"
                  aria-label="Hapus kata kunci"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {kategori !== "Semua Kategori" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#8B0000] text-xs font-bold rounded-full border border-red-200 shadow-xs">
                <span>{kategori}</span>
                <button
                  type="button"
                  onClick={() => setKategori("Semua Kategori")}
                  className="hover:text-red-950 p-0.5"
                  aria-label="Reset kategori"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid Produk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {produkTampil.map((item) => (
          <div
            key={item.id}
            className="transition-transform duration-300 hover:-translate-y-1"
          >
            <ProductCard p={item} />
          </div>
        ))}
      </div>

      {/* Jika produk tidak ditemukan */}
      {produkTampil.length === 0 && (
        <div className="text-center mt-10 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-50 text-[#8B0000] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#8B0000]" />
          </div>
          <h3 className="text-gray-900 font-extrabold text-base mb-1">
            Produk Tidak Ditemukan
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-5">
            Tidak ada produk sembako yang cocok dengan filter kategori atau pencarian saat ini.
          </p>
          <button
            type="button"
            onClick={() => {
              setKategori("Semua Kategori");
              if (setKataKunci) setKataKunci("");
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B0000] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <span>Reset Semua Filter</span>
          </button>
        </div>
      )}
    </div>
  );
}
