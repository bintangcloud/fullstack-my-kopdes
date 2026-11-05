<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ubah kolom status pada tabel orders agar mendukung status baru:
        // pending, processing, shipping, ready_for_pickup, completed, cancelled
        // Menggunakan DB statement untuk mengubah ENUM menjadi VARCHAR agar aman dan fleksibel di MySQL
        DB::statement("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'");

        // 2. Tambah kolom image, admin_reply, dan admin_replied_at pada tabel reviews
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'image')) {
                $table->string('image')->nullable()->after('review');
            }
            if (!Schema::hasColumn('reviews', 'admin_reply')) {
                $table->text('admin_reply')->nullable()->after('image');
            }
            if (!Schema::hasColumn('reviews', 'admin_replied_at')) {
                $table->timestamp('admin_replied_at')->nullable()->after('admin_reply');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['image', 'admin_reply', 'admin_replied_at']);
        });

        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'");
    }
};
