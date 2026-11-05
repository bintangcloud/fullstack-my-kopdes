<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // User Biasa
        User::updateOrCreate(
            ['email' => 'user@gmail.com'],
            [
                'name' => 'Pengguna Toko',
                'password' => Hash::make('user123'),
                'role' => 'user',
            ]
        );
    }
}
