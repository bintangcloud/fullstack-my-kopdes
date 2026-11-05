import React, { useState } from "react";
import { useProducts } from "../../utils/ProductContext";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderPlus, X, Check, Loader2 } from "lucide-react";

export default function ProductForm() {
  const { addProduct, getCategories, addCategory } = useProducts();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    description: "",
    img: null,
  });
  
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Ambil data kategori untuk selectbox
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Nama kategori tidak boleh kosong!");
      return;
    }

    try {
      setIsAddingCategory(true);
      const res = await addCategory(newCategoryName.trim());
      const createdId = res?.id || res?.data?.id || res?.category_id;

      toast.success(`Kategori "${newCategoryName.trim()}" berhasil ditambahkan!`);

      // Refresh list kategori
      await queryClient.invalidateQueries({ queryKey: ["categories"] });

      // Otomatis pilih kategori yang baru dibuat
      if (createdId) {
        setFormData((prev) => ({ ...prev, category_id: String(createdId) }));
      }

      setNewCategoryName("");
      setShowAddCategory(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Gagal menambahkan kategori baru.");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    try {
      await addProduct.mutateAsync(data);
      toast.success("Produk berhasil ditambahkan!");
      navigate("/admin/dashboard");
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        toast.error("Periksa kembali data yang dimasukkan.");
      } else {
        toast.error(error.response?.data?.message || "Gagal menyimpan produk.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      
      {/* Header Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/admin/dashboard"
            className="text-xs font-bold text-gray-400 hover:text-[#8B0000] transition flex items-center gap-1 mb-1"
          >
            &larr; Kembali ke Daftar Produk
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Tambah Produk <span className="text-[#8B0000]"> Baru</span>
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5"
      >
        {/* Nama Produk */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            placeholder="Contoh: Beras Raja Lele 5kg"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition ${
              errors.name ? "border-red-400 bg-red-50/50" : "border-gray-200"
            }`}
          />
          {errors.name && <p className="text-red-500 text-xs font-semibold mt-1">{errors.name[0]}</p>}
        </div>

        {/* Kategori */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Kategori Sembako <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#8B0000] hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition"
            >
              {showAddCategory ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Batal Kategori</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Kategori Baru</span>
                </>
              )}
            </button>
          </div>

          {/* Kotak Input Kategori Baru */}
          {showAddCategory && (
            <div className="mb-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl animate-fade-in space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <FolderPlus className="w-4 h-4 text-[#8B0000]" />
                <span>Tambah Kategori Baru</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Frozen Food, Bumbu Racik, Minuman..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory(e);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isAddingCategory || !newCategoryName.trim()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#8B0000] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                >
                  {isAddingCategory ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan & Pilih</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-amber-800">
                Kategori ini akan langsung tersimpan di sistem dan dapat dipilih pada katalog produk.
              </p>
            </div>
          )}

          <select
            name="category_id"
            onChange={handleChange}
            value={formData.category_id}
            required
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition cursor-pointer ${
              errors.category_id ? "border-red-400 bg-red-50/50" : "border-gray-200"
            }`}
          >
            <option value="">-- Pilih Kategori Sembako --</option>
            {(Array.isArray(categories) ? categories : []).map((cat, idx) => {
              const catId = typeof cat === "object" ? (cat.id ?? cat.category_id) : cat;
              const catName = typeof cat === "object" ? (cat.name ?? cat.category) : cat;
              return (
                <option key={catId ?? idx} value={catId}>
                  {catName}
                </option>
              );
            })}
          </select>
          {errors.category_id && <p className="text-red-500 text-xs font-semibold mt-1">{errors.category_id[0]}</p>}
        </div>

        {/* Harga & Stok Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Harga Satuan (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              name="price"
              type="number"
              min="0"
              placeholder="Contoh: 65000"
              value={formData.price}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition ${
                errors.price ? "border-red-400 bg-red-50/50" : "border-gray-200"
              }`}
            />
            {errors.price && <p className="text-red-500 text-xs font-semibold mt-1">{errors.price[0]}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Jumlah Stok <span className="text-red-500">*</span>
            </label>
            <input
              name="stock"
              type="number"
              min="0"
              placeholder="Contoh: 50"
              value={formData.stock}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition ${
                errors.stock ? "border-red-400 bg-red-50/50" : "border-gray-200"
              }`}
            />
            {errors.stock && <p className="text-red-500 text-xs font-semibold mt-1">{errors.stock[0]}</p>}
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Deskripsi Produk
          </label>
          <textarea
            name="description"
            placeholder="Jelaskan kualitas, kemasan, atau catatan khusus sembako..."
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition resize-none"
          />
        </div>

        {/* Foto Produk */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Unggah Foto Produk
          </label>
          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Pratinjau Foto"
                className="w-24 h-24 object-cover rounded-2xl border border-gray-200 shadow-sm"
              />
            </div>
          )}
          <input
            name="img"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-[#8B0000] hover:file:bg-red-100 transition cursor-pointer"
          />
          {errors.img && <p className="text-red-500 text-xs font-semibold mt-1">{errors.img[0]}</p>}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={addProduct.isPending}
            className="flex-1 py-3 bg-gradient-to-r from-[#8B0000] to-red-800 hover:from-red-900 hover:to-[#8B0000] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 text-sm"
          >
            {addProduct.isPending ? "Menyimpan ke Database..." : "Simpan Produk Sembako"}
          </button>
          
          <Link
            to="/admin/dashboard"
            className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition"
          >
            Batal
          </Link>
        </div>

      </form>
    </div>
  );
}
