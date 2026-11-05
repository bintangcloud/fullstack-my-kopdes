<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel reviews sebelumnya memiliki struktur yang salah (menyalin kolom
     * order_items sehingga tidak punya rating/review/user_id). Karena data
     * ulasan masih kosong, tabel dibangun ulang dengan struktur yang benar.
     */
    public function up(): void
    {
        Schema::dropIfExists('reviews');

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('order_id')->nullable()->index();
            $table->unsignedTinyInteger('rating');
            $table->text('review')->nullable();
            $table->string('reviewer_name')->nullable();
            $table->timestamps();

            // Satu user hanya punya satu ulasan per produk.
            $table->unique(['user_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
