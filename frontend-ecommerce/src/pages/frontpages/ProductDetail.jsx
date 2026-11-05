import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "../../utils/CartContext";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import { useAuth } from "../../utils/AuthContext";
import toast from "react-hot-toast";
import WarningAlert from "../../components/WarningAlert";
import { Star, Lock, CheckCircle2, Camera, MessageSquare, Store, X } from "lucide-react";
import apiClient from "../../utils/apiClient";
import ConfirmModal from "../../components/ConfirmModal";
import { getSafeImageUrl } from "../../utils/imageHelper";

const resolveImageUrl = (img) => {
  return getSafeImageUrl(img);
};

export default function ProductDetail() {
const location = useLocation();
const p = location.state; 
const navigate = useNavigate();
const queryClient = useQueryClient();
const { cart, addToCart } = useCart();
const { isAuthenticated, user } = useAuth();
const [rating, setRating] = useState(0);
const [review, setReview] = useState("");
const [reviewImage, setReviewImage] = useState(null);
const [reviewImagePreview, setReviewImagePreview] = useState(null);
const [zoomImage, setZoomImage] = useState(null);
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [deleteReplyConfirmId, setDeleteReplyConfirmId] = useState(null);
const [isDeleting, setIsDeleting] = useState(false);
const [replyingReviewId, setReplyingReviewId] = useState(null);
const [replyText, setReplyText] = useState("");
const [isSubmittingReply, setIsSubmittingReply] = useState(false);
const [showNotif, setShowNotif] = useState(false);
const [hasPurchased, setHasPurchased] = useState(false);
const [myReview, setMyReview] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [reloadKey, setReloadKey] = useState(0);
const [avgRating, setAvgRating] = useState(0);
const [totalSold, setTotalSold] = useState(0);
const [qty, setQty] = useState(1);
const cartItem = cart.find((item) => item.id === p.id);
const qtyInCart = cartItem ? cartItem.qty : 0;
const remainingStock = Math.max(0, p.stock - qtyInCart);
const [warningMsg, setWarningMsg] = useState("");
const [showWarning, setShowWarning] = useState(false);

const [reviews, setReviews] = useState([]);

  // Ambil detail produk, daftar ulasan, dan status pembelian user
  const fetchProductDetail = useCallback(async () => {
    if (!p?.id) return;

    try {
      const response = await apiClient.get(`/products/${p.id}`);
      const data = response.data;

      setReviews(data.reviews || []);
      setMyReview(data.my_review || null);
      setAvgRating(Number(data.avg_rating) || 0);
      setTotalSold(Number(data.sold_count) || 0);
      setHasPurchased(Boolean(data.user_has_purchased));
    } catch (error) {
      console.error("Gagal memuat detail ulasan:", error);
    }
  }, [p?.id]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail, reloadKey]);


  // Tambah ke keranjang
  const handleAddToCart = () => {
  if (!isAuthenticated) {
    toast.error("Silakan masuk (login) terlebih dahulu untuk mulai belanja!");
    navigate("/login");
    return;
  }
  const success = addToCart(p, qty);

  if (success) {
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2000);
  } else {
    setWarningMsg("Jumlah yang ingin kamu masukkan melebihi sisa stok yang tersedia di keranjang!");
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  }
};


  // Beli sekarang
  const handleBeliSekarang = () => {
  if (!isAuthenticated) {
    toast.error("Silakan masuk (login) terlebih dahulu untuk membeli produk!");
    navigate("/login");
    return;
  }
  const itemToBuy = { ...p, qty: qty };
  navigate("/checkout", {
    state: {
      directBuyItem: itemToBuy
    }
  });
};


  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB.");
      return;
    }
    setReviewImage(file);
    setReviewImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setReviewImage(null);
    setReviewImagePreview(null);
  };

  // Submit ulasan
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error("Mohon berikan bintang (rating) terlebih dahulu!");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("rating", rating);
      if (review) formData.append("review", review);
      if (reviewImage) {
        formData.append("image", reviewImage);
      } else if (!reviewImagePreview && isEditing) {
        formData.append("remove_image", "1");
      }

      await apiClient.post(`/products/${p.id}/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        isEditing ? "Ulasan berhasil diperbarui." : "Ulasan berhasil dikirim!"
      );

      setRating(0);
      setReview("");
      setReviewImage(null);
      setReviewImagePreview(null);
      setIsEditing(false);
      setReloadKey((prev) => prev + 1);

      // Ambil ulang data agar rating rata-rata & daftar ulasan ikut update
      await fetchProductDetail();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan ulasan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit ulasan
  const handleEdit = () => {
    setRating(myReview.rating);
    setReview(myReview.review || "");
    setReviewImagePreview(myReview.image || null);
    setIsEditing(true);
  };

  // Hapus ulasan
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete(`/products/${p.id}/reviews`);
      toast.success("Ulasan berhasil dihapus.");

      setMyReview(null);
      setReviewImage(null);
      setReviewImagePreview(null);
      setIsEditing(false);
      setDeleteConfirmOpen(false);
      setReloadKey((prev) => prev + 1);

      await fetchProductDetail();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus ulasan."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Admin balas ulasan
  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      setIsSubmittingReply(true);
      await apiClient.post(`/admin/reviews/${reviewId}/reply`, { reply: replyText });
      toast.success("Balasan resmi toko berhasil dikirim.");
      setReplyingReviewId(null);
      setReplyText("");
      await fetchProductDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim balasan.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Admin hapus balasan
  const handleConfirmDeleteReply = async () => {
    if (!deleteReplyConfirmId) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/admin/reviews/${deleteReplyConfirmId}/reply`);
      toast.success("Balasan admin berhasil dihapus.");
      setDeleteReplyConfirmId(null);
      await fetchProductDetail();
    } catch (err) {
      toast.error("Gagal menghapus balasan.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Jika produk tidak ditemukan, tampilkan pesan
  if (!p) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600">
          Produk Tidak Ditemukan
        </h1>

        <BackButton to="/" />

      </div>
    );
  }


  return (
    <>
      {/* NOTIFIKASI BESAR DI TENGAH LAYAR */}

      {showNotif && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-sm transition-all">
          <div className="bg-[#424242]/95 text-white w-80 md:w-96 p-10 flex flex-col items-center justify-center gap-6 shadow-2xl rounded-xl animate-fade-in-up">
            <div className="bg-[#00c49a] rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="4"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-center">
              Produk telah ditambahkan ke keranjang
            </p>
          </div>
        </div>
      )}
      <WarningAlert message={warningMsg} show={showWarning} />


      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
        <BackButton to="/" />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight ml-1">
          Detail <span className="text-[#8B0000]">Produk</span>
        </h1>
        <div className="border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm bg-white">
          <div className="flex flex-col md:flex-row gap-8">
            <img 
              src={getSafeImageUrl(p.img || p.img_url)} 
              alt={p.name} 
              className="w-full md:w-1/2 h-72 object-cover rounded-2xl border border-gray-100" 
            />
            
            <div className="flex-1 flex flex-col justify-center">

              <span className="text-xs font-bold bg-red-50 text-[#8B0000] px-3 py-1.5 rounded-full w-max mb-3">
                {p.category_name}
              </span>

              <h1 className="text-3xl font-extrabold text-gray-800">
                {p.name}
              </h1>

              <p className="text-3xl font-black text-[#8B0000] mt-3">
                Rp {p.price.toLocaleString("id-ID")}
              </p>

              <p className="text-gray-500 mt-2 font-medium">
                Stok Tersedia: {p.stock}
              </p>


              {/* RATING & TERJUAL DI DETAIL PRODUK */}
              <div className="flex items-center gap-4 my-3 text-sm">
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-800">
                    {avgRating > 0 ? avgRating : "0.0"}
                  </span>
                  <span className="text-gray-500">
                    ({reviews.length} ulasan)
                  </span>
                </div>

                <div className="text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-lg">

                  Terjual{" "}
                  <span className="font-bold text-gray-800">
                    {totalSold}
                  </span>{" "}
                  pcs
                </div>
              </div>


              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-800 mb-1 text-sm">
                  Deskripsi Produk:
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {p.description || "Admin belum menambahkan detail spesifik untuk produk ini."}
                </p>
              </div>

              {/* Kuantitas yg masuk keranjang */}
              <div className="flex items-center gap-4 my-4">
                <span className="text-sm font-bold text-gray-700">Jumlah:</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-1.5 text-xs"
                >
                  -
                </Button>
                
                <input 
                  type="number" 
                  value={qty} 
                  min="1" 
                  max={remainingStock} // Batasi sesuai sisa stok yang belum masuk keranjang
                  onChange={(e) => setQty(Math.max(1, Math.min(remainingStock, parseInt(e.target.value) || 1)))}
                  className="w-14 border border-gray-200 rounded-xl p-2 text-center text-sm font-bold focus:outline-none focus:border-[#8B0000]"
                />

                <Button 
                  variant="secondary"
                  onClick={() => setQty(Math.min(remainingStock, qty + 1))}
                  disabled={qty >= remainingStock || remainingStock === 0}
                  className="px-3 py-1.5 text-xs"
                >
                  +
                </Button>
              </div>
              <span className="text-xs text-gray-500">
                {remainingStock === 0 ? "Sudah maksimal di keranjang" : `Sisa bisa ditambah ke keranjang: ${remainingStock}`}
              </span>
            </div>


              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={handleAddToCart} 
                  disabled={p.stock === 0}
                  className="flex-1"
                >
                  + Keranjang
                </Button>

                <Button 
                  variant="primary"
                  onClick={handleBeliSekarang} 
                  disabled={p.stock === 0}
                  className="flex-1"
                >
                  {p.stock === 0 ? "Stok Habis" : "Beli Sekarang"}
                </Button>
              </div>
            </div>
          </div>
        </div>


        {/* BAGIAN BAWAH: ULASAN & FORM TULIS ULASAN YANG LEBIH RAPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/*Daftar Ulasan */}
          <div className="md:col-span-2 bg-white p-6 md:p-8 border border-gray-100 rounded-3xl shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Ulasan Pembeli ({reviews.length})
            </h2>

            {reviews.length === 0 ? (

              <p className="text-gray-500 italic">
                Belum ada ulasan untuk produk ini.
              </p>
            ) : (

              <ul className="space-y-6">
                {reviews.map((r) => (
                  <li 
                    key={r.id} 
                    className="border-b border-gray-100 pb-5 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex gap-1">
                        {[...Array(r.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />))}

                        {[...Array(5 - r.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 text-gray-200" />))}

                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">
                          {r.reviewer_name || "Pengguna"}
                        </span>

                        {r.is_mine && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
                            Ulasan Anda
                          </span>
                        )}
                      </div>

                    </div>

                    {r.review && (
                      <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                        {r.review}
                      </p>
                    )}

                    {/* Foto Ulasan dari Pembeli */}
                    {r.image && (
                      <div className="mt-3">
                        <img
                          src={resolveImageUrl(r.image)}
                          alt="Foto dari pembeli"
                          onClick={() => setZoomImage(r.image)}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-gray-200 cursor-pointer hover:opacity-90 hover:scale-105 transition shadow-sm"
                          title="Klik untuk memperbesar foto"
                        />
                      </div>
                    )}

                    {/* Balasan Resmi dari Admin / Toko */}
                    {r.admin_reply && (
                      <div className="mt-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#8B0000] flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-[#8B0000]" />
                            Respon Koperasi Desa (Admin)
                          </span>
                          {r.admin_replied_at && (
                            <span className="text-[10px] text-gray-400">
                              {new Date(r.admin_replied_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed pl-5">
                          {r.admin_reply}
                        </p>
                      </div>
                    )}

                    {/* Tombol Balas untuk Admin */}
                    {user?.role === "admin" && (
                      <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(replyingReviewId === r.id ? null : r.id);
                            setReplyText(r.admin_reply || "");
                          }}
                          className="text-xs font-bold text-[#8B0000] hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{r.admin_reply ? "Edit Balasan Toko" : "Balas Ulasan Ini"}</span>
                        </button>

                        {r.admin_reply && (
                          <button
                            type="button"
                            onClick={() => setDeleteReplyConfirmId(r.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline"
                          >
                            Hapus Balasan
                          </button>
                        )}
                      </div>
                    )}

                    {/* Form Input Balasan Admin */}
                    {replyingReviewId === r.id && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                        <p className="text-xs font-bold text-gray-700">Tulis Balasan Toko:</p>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows="2"
                          placeholder="Terima kasih atas ulasan dan kepercayaannya kak..."
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B0000] bg-white"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={isSubmittingReply || !replyText.trim()}
                            onClick={() => handleSendReply(r.id)}
                            className="px-4 py-1 text-xs font-bold text-white bg-[#8B0000] hover:bg-red-800 rounded-lg transition disabled:opacity-50"
                          >
                            {isSubmittingReply ? "Mengirim..." : "Kirim Balasan"}
                          </button>
                        </div>
                      </div>
                    )}

                  </li>

                ))}

              </ul>

            )}

          </div>


          {/* Form Ulasan */}
          <div className="bg-white p-6 md:p-8 border border-gray-100 rounded-3xl shadow-sm h-fit space-y-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3">
              Ulasan Anda
            </h3>

            {!hasPurchased ? (

              //Belum Pernah Beli 

              <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 px-4">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />

                <p className="text-xs text-gray-600 font-medium">
                  Selesaikan pembelian produk ini terlebih dahulu untuk menulis ulasan.
                </p>
              </div>
            ) : myReview && !isEditing ? (

              //Sudah Pernah Ulas & Tidak Sedang Diedit 
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">

                  <p className="text-sm font-bold text-green-800 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600 inline-block mr-1.5 align-middle" /><span>Anda sudah mengulas produk ini</span>
                  </p>

                  <div className="flex justify-center gap-1 my-2">

                    {[...Array(myReview.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />))}

                  </div>

                  {myReview.review && (
                    <p className="text-xs text-gray-600 italic">
                      "{myReview.review}"
                    </p>
                  )}

                  {myReview.image && (
                    <div className="mt-3 flex justify-center">
                      <img
                        src={resolveImageUrl(myReview.image)}
                        alt="Foto ulasan Anda"
                        onClick={() => setZoomImage(myReview.image)}
                        className="w-16 h-16 object-cover rounded-xl border border-green-200 cursor-pointer hover:scale-105 transition"
                      />
                    </div>
                  )}

                  {myReview.admin_reply && (
                    <div className="mt-3 bg-white/80 border border-green-200 rounded-xl p-2.5 text-left space-y-1">
                      <span className="text-[11px] font-bold text-[#8B0000] flex items-center gap-1">
                        <Store className="w-3 h-3 text-[#8B0000]" />
                        Balasan Toko:
                      </span>
                      <p className="text-xs text-gray-700">
                        {myReview.admin_reply}
                      </p>
                    </div>
                  )}

                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleEdit} className="flex-1 text-xs">
                    Edit Ulasan
                  </Button>
                  <Button variant="danger" onClick={() => setDeleteConfirmOpen(true)} className="flex-1 text-xs">
                    Hapus
                  </Button>
                </div>

              </div>

            ) : (

              //Form Input (Muncul jika Belum Ulas ATAU Sedang Edit)
              <form 
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Beri Rating Bintang *
                  </label>

                  <div className="flex gap-1">

                    {[1, 2, 3, 4, 5].map((star) => (

                      <button type="button" key={star} onClick={() => setRating(star)} className="p-1 hover:scale-125 transition-transform"><Star className={`w-6 h-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 hover:text-amber-300"}`} /></button>
                    ))}
                  </div>
                </div>


                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Tulis Komentar (Opsional)
                  </label>
                  <textarea
                    value={review} 
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#8B0000] bg-gray-50" 
                    rows="3" 
                    placeholder="Ceritakan pengalamanmu..."
                  >
                  </textarea>

                </div>

                {/* Upload Foto Ulasan */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Foto Produk (Opsional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer border border-gray-200 transition">
                      <Camera className="w-4 h-4 text-[#8B0000]" />
                      <span>{reviewImagePreview ? "Ganti Foto" : "Unggah Foto"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    {reviewImagePreview && (
                      <div className="relative group">
                        <img
                          src={reviewImagePreview}
                          alt="Preview foto ulasan"
                          className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow"
                          title="Hapus foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                {isEditing && (
                  <Button variant="secondary" onClick={() => setIsEditing(false)} className="w-1/3 text-xs">
                    Batal
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="text-xs">
                  {isSubmitting
                    ? "Menyimpan..."
                    : isEditing
                    ? "Simpan Perubahan"
                    : "Kirim Ulasan"}
                </Button>
              </div>

              </form>

            )}

          </div>
        </div>
      </div>

      {/* Modal Zoom Foto Ulasan */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl"
          >
            <img
              src={resolveImageUrl(zoomImage)}
              alt="Foto ulasan diperbesar"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2 transition"
              aria-label="Tutup foto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Ulasan Pengguna */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Ulasan?"
        message="Apakah Anda yakin ingin menghapus ulasan ini? Anda dapat menulis ulasan baru setelahnya."
        confirmText="Ya, Hapus Ulasan"
        cancelText="Batal"
        icon="trash"
        confirmVariant="danger"
      />

      {/* Modal Konfirmasi Hapus Balasan Admin */}
      <ConfirmModal
        isOpen={Boolean(deleteReplyConfirmId)}
        onClose={() => setDeleteReplyConfirmId(null)}
        onConfirm={handleConfirmDeleteReply}
        isLoading={isDeleting}
        title="Hapus Balasan Toko?"
        message="Apakah Anda yakin ingin menghapus balasan resmi toko dari ulasan pembeli ini?"
        confirmText="Ya, Hapus Balasan"
        cancelText="Batal"
        icon="trash"
        confirmVariant="danger"
      />
    </>
  );
}