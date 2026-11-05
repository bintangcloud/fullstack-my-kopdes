<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'category_id' => 1,
                'name' => 'Beras Premium 5kg',
                'slug' => 'beras-premium-5kg',
                'price' => 75000,
                'stock' => 45,
                'description' => 'Beras premium berkualitas dengan tekstur pulen dan cocok untuk konsumsi sehari-hari.',
                'img' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
            ], //[cite: 16]
            [
                'category_id' => 1,
                'name' => 'Minyak Goreng 2L',
                'slug' => 'minyak-goreng-2l',
                'price' => 34000,
                'stock' => 20,
                'description' => 'Minyak goreng berkualitas untuk kebutuhan memasak sehari-hari.',
                'img' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
            ], //[cite: 16]
            [
                'category_id' => 1,
                'name' => 'Gula Pasir Lokal 1kg',
                'slug' => 'gula-pasir-lokal-1kg',
                'price' => 16500,
                'stock' => 150,
                'description' => 'Gula pasir lokal berkualitas dengan rasa manis yang cocok untuk berbagai kebutuhan.',
                'img' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
            ], //[cite: 16]
            [
                'category_id' => 2,
                'name' => 'Teh SariWangi',
                'slug' => 'teh-sariwangi',
                'price' => 5000,
                'stock' => 50,
                'description' => 'Teh celup SariWangi dengan aroma dan rasa yang nikmat untuk menemani waktu santai.',
                'img' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
            ], //[cite: 16]
            [
                'category_id' => 3,
                'name' => 'Pengepel Lantai',
                'slug' => 'pengepel-lantai',
                'price' => 70000,
                'stock' => 30,
                'description' => 'Pengepel lantai praktis untuk membantu membersihkan lantai rumah dengan mudah.',
                'img' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
            ], //[cite: 16]
            [
                'category_id' => 1,
                'name' => 'Telur Ayam',
                'slug' => 'telur-ayam',
                'price' => 2000,
                'stock' => 100,
                'description' => 'Telur ayam segar yang cocok untuk berbagai kebutuhan memasak sehari-hari.',
                'img' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
            ], //[cite: 16]
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['slug' => $product['slug']], $product);
        }
    }
}