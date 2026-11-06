<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    // Tambah Produk Baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable',
            'category_name' => 'nullable|string',
        ]);

        // Cari atau buat kategori berdasarkan category_id atau category_name
        $categoryId = null;
        if ($request->filled('category_id')) {
            $cat = Category::find($request->category_id);
            if ($cat) {
                $categoryId = $cat->id;
            }
        }

        if (!$categoryId && $request->filled('category_name')) {
            $cat = Category::firstOrCreate(['name' => $request->category_name]);
            $categoryId = $cat->id;
            \Illuminate\Support\Facades\Cache::forget('api_categories_list_v3');
        }

        if (!$categoryId) {
            $defaultCat = Category::firstOrCreate(['name' => 'Umum']);
            $categoryId = $defaultCat->id;
        }

        // Handle gambar (file upload atau string URL/base64)
        $imgPath = 'https://via.placeholder.com/500';
        if ($request->hasFile('img')) {
            $file = $request->file('img');
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $destination = public_path('uploads');
            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }
            $file->move($destination, $filename);
            $imgPath = url('uploads/' . $filename);
            if (str_starts_with($imgPath, 'http://') && !str_contains($imgPath, 'localhost') && !str_contains($imgPath, '127.0.0.1')) {
                $imgPath = preg_replace('/^http:/i', 'https:', $imgPath);
            }
        } elseif ($request->filled('img') && is_string($request->img)) {
            $imgPath = $request->img;
        }

        $product = Product::create([
            'category_id' => $categoryId,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'description' => $request->description ?? '',
            'price' => $request->price,
            'stock' => $request->stock,
            'img' => $imgPath,
        ]);

        return response()->json(['message' => 'Produk berhasil ditambahkan', 'data' => $product], 201);
    }

    // Edit/Update Produk
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable',
            'category_name' => 'nullable|string',
        ]);

        $product = Product::findOrFail($id);

        $categoryId = $product->category_id;
        if ($request->filled('category_id')) {
            $cat = Category::find($request->category_id);
            if ($cat) {
                $categoryId = $cat->id;
            }
        } elseif ($request->filled('category_name')) {
            $cat = Category::firstOrCreate(['name' => $request->category_name]);
            $categoryId = $cat->id;
            \Illuminate\Support\Facades\Cache::forget('api_categories_list_v3');
        }

        // Handle gambar
        $imgPath = $product->img;
        if ($request->hasFile('img')) {
            $file = $request->file('img');
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $destination = public_path('uploads');
            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }
            $file->move($destination, $filename);
            $imgPath = url('uploads/' . $filename);
            if (str_starts_with($imgPath, 'http://') && !str_contains($imgPath, 'localhost') && !str_contains($imgPath, '127.0.0.1')) {
                $imgPath = preg_replace('/^http:/i', 'https:', $imgPath);
            }
        } elseif ($request->filled('img') && is_string($request->img)) {
            $imgPath = $request->img;
        }

        $product->update([
            'category_id' => $categoryId,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'description' => $request->description ?? $product->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'img' => $imgPath,
        ]);

        return response()->json(['message' => 'Produk berhasil diperbarui', 'data' => $product], 200);
    }

    // Hapus Produk
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus'], 200);
    }

    // Tambah Kategori (Opsional, untuk tombol "+ Tambah Kategori" di Admin)
    public function storeCategory(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:categories,name']);
        
        $category = Category::create(['name' => $request->name]);

        // Hapus semua cache kategori agar langsung muncul di dropdown katalog & admin
        \Illuminate\Support\Facades\Cache::forget('api_categories_list_v3');
        \Illuminate\Support\Facades\Cache::forget('api_categories_list');

        return response()->json([
            'message' => 'Kategori ditambahkan',
            'data' => [
                'id' => $category->id,
                'category_id' => $category->id,
                'name' => $category->name,
                'category' => $category->name,
            ]
        ], 201);
    }
}