
<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\OrderChatController;
use App\Http\Controllers\Api\NotificationController;


// ==========================================
// ROUTE PUBLIK
// ==========================================

// Autentikasi
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Produk & Kategori (Bisa diakses publik oleh pengunjung toko)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// ==========================================
// ROUTE USER TERAUTENTIKASI
// ==========================================
Route::middleware(['auth:sanctum'])->group(function () {
    // Review
    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
    Route::delete('/products/{id}/reviews', [ReviewController::class, 'destroy']);

    // Checkout
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // Riwayat pesanan milik user
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{id}/complete', [OrderController::class, 'complete']);

    // Chat Pesanan (Pelanggan & Admin)
    Route::get('/orders/{orderId}/chats', [OrderChatController::class, 'index']);
    Route::post('/orders/{orderId}/chats', [OrderChatController::class, 'store']);

    // Notifikasi Update Pesanan & Chat
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead']);
});

// ==========================================
// ROUTE KHUSUS ADMIN
// ==========================================
Route::middleware(['auth:sanctum', 'is_admin'])->group(function () {
    // Tambah Produk (dukung /admin/products dan /products)
    Route::post('/admin/products', [AdminController::class, 'store']);
    Route::post('/products', [AdminController::class, 'store']);

    // Edit Produk (dukung PUT dan POST method spoofing)
    Route::put('/admin/products/{id}', [AdminController::class, 'update']);
    Route::post('/admin/products/{id}', [AdminController::class, 'update']);
    Route::put('/products/{id}', [AdminController::class, 'update']);
    Route::post('/products/{id}', [AdminController::class, 'update']);

    // Hapus Produk
    Route::delete('/admin/products/{id}', [AdminController::class, 'destroy']);
    Route::delete('/products/{id}', [AdminController::class, 'destroy']);

    // Tambah Kategori
    Route::post('/admin/categories', [AdminController::class, 'storeCategory']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);

    // Pesanan masuk
    Route::get('/admin/orders', [AdminOrderController::class, 'index']);
    Route::patch('/admin/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::put('/admin/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

    // Balas Ulasan Pembeli
    Route::post('/admin/reviews/{id}/reply', [ReviewController::class, 'reply']);
    Route::delete('/admin/reviews/{id}/reply', [ReviewController::class, 'deleteReply']);
});
