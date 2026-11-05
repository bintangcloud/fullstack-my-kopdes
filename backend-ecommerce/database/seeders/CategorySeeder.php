<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Sembako'], // ID 1
            ['name' => 'Bahan Dapur'], // ID 2[cite: 16]
            ['name' => 'Kebutuhan Rumah'], // ID 3[cite: 16]
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}