# 🌾 MyKopDes – Platform E-Commerce Koperasi Desa

Platform e-commerce berbasis web yang dirancang untuk memodernisasi layanan penjualan bahan pokok (sembako) pada Koperasi Desa. Sistem ini mengintegrasikan arsitektur **RESTful API** menggunakan Laravel 11 dengan antarmuka **Single Page Application (SPA)** berbasis React 19 dan Tailwind CSS.

---

## 📌 Daftar Isi

1. [Tentang Proyek](#-tentang-proyek)
2. [Fitur Utama](#-fitur-utama)
3. [Teknologi yang Digunakan](#️-teknologi-yang-digunakan)
4. [Struktur Direktori](#-struktur-direktori)
5. [Panduan Instalasi dan Menjalankan Proyek](#-panduan-instalasi-dan-menjalankan-proyek)
6. [Kredensial Akun Demo](#-kredensial-akun-demo)
7. [Dokumentasi Endpoint API](#-dokumentasi-endpoint-api)

---

## 📖 Tentang Proyek

**MyKopDes** merupakan platform digital yang dikembangkan untuk mengatasi keterbatasan transaksi manual pada koperasi desa. Melalui sistem ini, masyarakat dapat melakukan pembelian kebutuhan pokok secara online dengan lebih mudah dan transparan.

Pelanggan dapat melihat ketersediaan stok produk, memilih metode pengambilan pesanan berupa pengantaran ke rumah atau pengambilan langsung di toko (*store pickup*), berkomunikasi dengan pengelola koperasi melalui fitur chat, serta memberikan ulasan dan foto produk.

Di sisi lain, pengelola koperasi memiliki akses untuk mengelola produk, kategori, stok, pesanan, ulasan pelanggan, serta memantau rekapitulasi penjualan melalui dashboard admin.

---

## ✨ Fitur Utama

### 🛒 Sisi Pelanggan (Customer)

- **Autentikasi dan Manajemen Akun**
  - Registrasi akun pelanggan.
  - Login menggunakan token Laravel Sanctum.
  - Proteksi halaman berdasarkan status autentikasi.
  - Fitur Demo Login untuk masuk menggunakan akun demo.

- **Katalog dan Pencarian Produk**
  - Menampilkan daftar produk sembako.
  - Pencarian produk berdasarkan kata kunci.
  - Filter produk berdasarkan kategori.
  - Tampilan dropdown kategori yang interaktif.

- **Keranjang Belanja**
  - Penyimpanan keranjang berdasarkan akun pengguna.
  - Data keranjang terpisah untuk setiap pengguna.
  - Pembatasan jumlah pembelian berdasarkan ketersediaan stok.

- **Checkout dan Pembayaran**
  - Pilihan pengantaran ke rumah atau pengambilan langsung di koperasi (*store pickup*).
  - Metode pembayaran Cash on Delivery (COD).

- **Manajemen Pesanan**
  - Menampilkan status pesanan, meliputi:
    - Menunggu Konfirmasi.
    - Sedang Diproses.
    - Sedang Diantar.
    - Bisa Diambil.
    - Pesanan Selesai.
    - Dibatalkan.
  - Pembatalan pesanan oleh pelanggan dengan pengembalian stok otomatis.
  - Konfirmasi pesanan diterima untuk menyelesaikan transaksi.

- **Interaksi dan Ulasan**
  - Live Chat antara pelanggan dan admin berdasarkan pesanan.
  - Pemberian rating dan ulasan produk.
  - Unggah foto sebagai bukti atau dokumentasi produk yang diterima.
  - Dukungan ulasan untuk beberapa produk dalam satu pesanan.

### 🛡️ Sisi Pengelola Koperasi (Admin)

- **Dashboard Admin**
  - Menampilkan ringkasan statistik toko.
  - Menampilkan rekapitulasi saldo penjualan.
  - Menampilkan daftar pesanan terbaru.

- **Manajemen Produk (CRUD)**
  - Menambahkan produk.
  - Menampilkan daftar produk.
  - Mengubah informasi produk.
  - Menghapus produk.
  - Mengunggah gambar produk.

- **Manajemen Kategori**
  - Menambahkan kategori baru melalui formulir produk.
  - Mengelola kategori produk.
  - Memfilter produk berdasarkan kategori.

- **Manajemen Pesanan**
  - Melihat pesanan pelanggan.
  - Memperbarui status pemrosesan pesanan.

- **Manajemen Ulasan**
  - Melihat rating dan ulasan pelanggan.
  - Memberikan balasan terhadap ulasan pelanggan.

- **Konfirmasi Aksi**
  - Menggunakan modal konfirmasi khusus untuk tindakan penting, seperti menghapus produk, menghapus ulasan, dan membatalkan pesanan.
  - Menghindari penggunaan dialog konfirmasi bawaan browser.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi | Deskripsi |
|---|---|---|
| Backend | Laravel 11 (PHP 8.2+) | Framework untuk pengembangan RESTful API. |
| Database | MySQL | Sistem manajemen basis data relasional. |
| Autentikasi | Laravel Sanctum | Autentikasi pengguna menggunakan API token. |
| Frontend | React 19 + Vite | Library antarmuka pengguna berbasis SPA. |
| Styling | Tailwind CSS v4 | Framework CSS dengan pendekatan utility-first. |
| Ikon | Lucide React | Library ikon untuk antarmuka aplikasi. |
| State Management | React Context API | Pengelolaan state global aplikasi. |
| Server State | TanStack React Query v5 | Pengelolaan cache, refetching, dan sinkronisasi data API. |
| HTTP Client | Axios | Komunikasi antara frontend dan backend. |
| Notifikasi | React Hot Toast | Menampilkan notifikasi interaktif kepada pengguna. |

**Palet warna utama:** Maroon (`#8B0000`) dan Emas (`#FFE600`).

---

## 📂 Struktur Direktori

```text
Integrasi/
├── backend-ecommerce/
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/
│   │   │           ├── AuthController.php
│   │   │           ├── ProductController.php
│   │   │           ├── OrderController.php
│   │   │           └── ...
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Product.php
│   │       ├── Category.php
│   │       ├── Order.php
│   │       ├── Review.php
│   │       └── Chat.php
│   ├── routes/
│   │   └── api.php
│   ├── database/
│   │   └── migrations/
│   └── public/
│       └── uploads/
│
└── frontend-ecommerce/
    ├── src/
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   │   └── adminpages/
    │   └── utils/
    └── package.json
```

---

## 🚀 Panduan Instalasi dan Menjalankan Proyek

### 1. Prasyarat Sistem

Pastikan perangkat telah memiliki beberapa perangkat lunak berikut:

- PHP >= 8.2.
- Composer.
- Node.js >= 18.x.
- npm.
- MySQL Database Server (XAMPP, Laragon, atau MySQL).

### 2. Menjalankan Backend (Laravel API)

1. Buka terminal dan masuk ke direktori backend:

   ```bash
   cd backend-ecommerce
   ```

2. Salin file konfigurasi lingkungan:

   ```bash
   cp .env.example .env
   ```

3. Buat database MySQL dengan nama `ecommerce_db` melalui phpMyAdmin atau MySQL.

4. Sesuaikan konfigurasi database pada file `.env`:

   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=ecommerce_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. Instal dependensi PHP:

   ```bash
   composer install
   ```

6. Generate application key:

   ```bash
   php artisan key:generate
   ```

7. Jalankan migrasi database beserta seeder:

   ```bash
   php artisan migrate:fresh --seed
   ```

8. Buat symbolic link untuk penyimpanan file:

   ```bash
   php artisan storage:link
   ```

9. Jalankan server Laravel:

   ```bash
   php artisan serve --port=8000
   ```

Backend dapat diakses melalui:

```text
http://127.0.0.1:8000
```

### 3. Menjalankan Frontend (React + Vite)

Buka terminal baru, kemudian ikuti langkah berikut:

1. Masuk ke direktori frontend:

   ```bash
   cd frontend-ecommerce
   ```

2. Instal dependensi Node.js:

   ```bash
   npm install
   ```

3. Jalankan development server:

   ```bash
   npm run dev
   ```

4. Buka aplikasi melalui browser:

   ```text
   http://localhost:5173
   ```

**Catatan:** Pastikan backend Laravel dan frontend React berjalan secara bersamaan agar aplikasi dapat berkomunikasi dengan RESTful API.

---

## 🔑 Kredensial Akun Demo

Untuk mempermudah proses pengujian, tersedia akun demo yang dapat digunakan untuk mengakses sistem berdasarkan peran pengguna.

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| Admin Toko | `admin@gmail.com` | `admin123` | Mengelola dashboard, produk, kategori, pesanan, dan ulasan. |
| Pelanggan | `user@gmail.com` | `user123` | Melakukan pembelian, checkout, mengelola pesanan, chat, dan memberikan ulasan. |

Selain menggunakan kredensial di atas, pengguna juga dapat memanfaatkan fitur **Demo Login** pada halaman login.

---

## 📡 Dokumentasi Endpoint API

Berikut merupakan daftar endpoint utama yang digunakan dalam sistem MyKopDes.

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| POST | `/api/register` | Mendaftarkan akun pelanggan baru. | Publik |
| POST | `/api/login` | Autentikasi pengguna dan penerbitan token Sanctum. | Publik |
| GET | `/api/products` | Menampilkan katalog produk, pencarian, filter, dan paginasi. | Publik |
| GET | `/api/categories` | Menampilkan daftar kategori produk. | Publik |
| POST | `/api/categories` | Menambahkan kategori baru. | Admin |
| POST | `/api/admin/products` | Menambahkan produk beserta gambar. | Admin |
| PUT | `/api/admin/products/{id}` | Memperbarui informasi produk. | Admin |
| DELETE | `/api/admin/products/{id}` | Menghapus produk. | Admin |
| GET | `/api/orders` | Menampilkan riwayat pesanan pelanggan. | Customer |
| POST | `/api/orders` | Membuat pesanan baru. | Customer |
| POST | `/api/orders/{id}/cancel` | Membatalkan pesanan dan mengembalikan stok. | Customer |
| POST | `/api/orders/{id}/complete` | Mengonfirmasi penyelesaian pesanan. | Customer |
| POST | `/api/reviews` | Mengirim rating dan ulasan produk beserta foto. | Customer |
| POST | `/api/reviews/{id}/replies` | Memberikan balasan terhadap ulasan. | Admin |
| GET | `/api/orders/{id}/chats` | Mengambil riwayat chat berdasarkan pesanan. | User/Admin |
| POST | `/api/orders/{id}/chats` | Mengirim pesan chat berdasarkan pesanan. | User/Admin |

---

## 👩‍💻 Pengembangan

Proyek **MyKopDes – Platform E-Commerce Koperasi Desa** dikembangkan sebagai pemenuhan tugas mata kuliah **Teknologi Web**.

Proyek ini menerapkan integrasi teknologi backend dan frontend melalui komunikasi RESTful API untuk membangun aplikasi e-commerce yang responsif, interaktif, dan terstruktur.
