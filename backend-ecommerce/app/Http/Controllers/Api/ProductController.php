<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    // Mengambil semua data produk untuk halaman Dashboard
    public function index(Request $request)
    {
        $query = Product::with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->withSum([
                'orderItems as sold_count' => function ($query) {
                    $query->whereHas('order', function ($orderQuery) {
                        $orderQuery->where('status', '!=', 'cancelled');
                    });
                },
            ], 'qty')
            ->orderBy('id', 'desc');

        if ($request->filled('keyword')) {
            $query->where('name', 'like', '%' . $request->keyword . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $perPage = (int) $request->get('limit', 10);
        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $product->price,
                'stock' => $product->stock,
                'description' => $product->description,
                'img' => $product->img,
                'img_url' => $product->img,
                'category_id' => $product->category_id,
                'category_name' => $product->category->name ?? 'Tanpa Kategori',
                'category' => [
                    'id' => $product->category->id ?? null,
                    'category_id' => $product->category->id ?? null,
                    'name' => $product->category->name ?? 'Tanpa Kategori',
                    'category' => $product->category->name ?? 'Tanpa Kategori',
                ],
                'avg_rating' => round((float) ($product->reviews_avg_rating ?? 0), 1),
                'reviews_count' => (int) ($product->reviews_count ?? 0),
                'sold_count' => (int) ($product->sold_count ?? 0),
            ];
        });

        return response()->json($products);
    }

    // Mengambil satu data spesifik untuk halaman ProductDetail
    public function show(Request $request, $id)
    {
        $product = Product::with(['category', 'reviews'])->findOrFail($id);

        // Guard sanctum bisa dibaca manual meski route ini publik,
        // supaya status "sudah membeli" dan ulasan saya tetap terdeteksi.
        $user = Auth::guard('sanctum')->user();

        $soldCount = (int) $product->orderItems()
            ->whereHas('order', function ($query) {
                $query->where('status', '!=', 'cancelled');
            })
            ->sum('qty');

        $userHasPurchased = false;
        $myReview = null;

        if ($user) {
            $userHasPurchased = $product->orderItems()
                ->whereHas('order', function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->where('status', '!=', 'cancelled');
                })
                ->exists();

            $myReview = Review::where('product_id', $product->id)
                ->where('user_id', $user->id)
                ->first();

            if ($myReview && $myReview->image && !str_starts_with($myReview->image, 'http')) {
                $myReview->image = url(ltrim($myReview->image, '/'));
            }
        }

        $reviews = $product->reviews()
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(function ($review) use ($user) {
                $imgUrl = null;
                if ($review->image) {
                    $imgUrl = str_starts_with($review->image, 'http')
                        ? $review->image
                        : url(ltrim($review->image, '/'));
                }

                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'review' => $review->review,
                    'image' => $imgUrl,
                    'admin_reply' => $review->admin_reply,
                    'admin_replied_at' => $review->admin_replied_at,
                    'reviewer_name' => $review->user->name ?? $review->reviewer_name ?? 'Pengguna',
                    'user_id' => $review->user_id,
                    'is_mine' => $user ? $review->user_id === $user->id : false,
                    'created_at' => $review->created_at,
                ];
            });

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => $product->price,
            'stock' => $product->stock,
            'description' => $product->description,
            'img' => $product->img,
            'img_url' => $product->img,
            'category_id' => $product->category_id,
            'category_name' => $product->category->name ?? 'Tanpa Kategori',
            'category' => [
                'id' => $product->category->id ?? null,
                'category_id' => $product->category->id ?? null,
                'name' => $product->category->name ?? 'Tanpa Kategori',
                'category' => $product->category->name ?? 'Tanpa Kategori',
            ],
            'avg_rating' => round($product->reviews()->avg('rating') ?? 0, 1),
            'reviews_count' => $reviews->count(),
            'sold_count' => $soldCount,
            'user_has_purchased' => $userHasPurchased,
            'my_review' => $myReview,
            'reviews' => $reviews,
        ]);
    }
}
