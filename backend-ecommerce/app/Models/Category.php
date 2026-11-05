<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // Tambahkan baris ini agar Laravel mengizinkan penyimpanan data kategori
    protected $guarded = ['id'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}