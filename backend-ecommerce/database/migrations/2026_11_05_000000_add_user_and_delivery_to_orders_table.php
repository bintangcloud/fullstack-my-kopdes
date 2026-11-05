<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Pemilik pesanan (nullable agar pesanan lama tetap aman)
            $table->unsignedBigInteger('user_id')->nullable()->index();

            // delivery = dikirim ke alamat, pickup = diambil sendiri di toko
            $table->string('delivery_method')->default('delivery');

            // Ongkos kirim (0 untuk pickup)
            $table->integer('shipping_cost')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'delivery_method', 'shipping_cost']);
        });
    }
};
