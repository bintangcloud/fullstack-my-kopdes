<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Simpan / perbarui ulasan produk dari user yang sudah membeli.
     */
    public function store(Request $request, $productId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $product = Product::findOrFail($productId);
        $user = $request->user();

        // Pastikan user benar-benar pernah membeli produk ini.
        $orderItem = OrderItem::where('product_id', $product->id)
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('status', '!=', 'cancelled');
            })
            ->latest('id')
            ->first();

        if (! $orderItem) {
            return response()->json([
                'message' => 'Kamu hanya bisa memberi ulasan setelah membeli produk ini.',
            ], 403);
        }

        $existing = Review::where('user_id', $user->id)->where('product_id', $product->id)->first();
        $imagePath = $existing?->image;

        if ($request->hasFile('image')) {
            $destDir = public_path('uploads/reviews');
            if (! file_exists($destDir)) {
                mkdir($destDir, 0755, true);
            }
            $fileName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
            $request->file('image')->move($destDir, $fileName);
            $imagePath = url('uploads/reviews/' . $fileName);
            if (str_starts_with($imagePath, 'http://') && !str_contains($imagePath, 'localhost') && !str_contains($imagePath, '127.0.0.1')) {
                $imagePath = preg_replace('/^http:/i', 'https:', $imagePath);
            }
        } elseif ($request->boolean('remove_image')) {
            $imagePath = null;
        }

        // Satu user hanya punya satu ulasan per produk (update jika sudah ada).
        $review = Review::updateOrCreate(
            [
                'user_id' => $user->id,
                'product_id' => $product->id,
            ],
            [
                'order_id' => $orderItem->order_id,
                'rating' => $validated['rating'],
                'review' => $validated['review'] ?? null,
                'image' => $imagePath,
                'reviewer_name' => $user->name,
            ]
        );

        return response()->json([
            'message' => 'Ulasan berhasil disimpan.',
            'data' => $review->load('user:id,name'),
        ], 200);
    }

    /**
     * Hapus ulasan milik user.
     */
    public function destroy(Request $request, $productId)
    {
        $review = Review::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        if (! $review) {
            return response()->json(['message' => 'Ulasan tidak ditemukan.'], 404);
        }

        $review->delete();

        return response()->json(['message' => 'Ulasan berhasil dihapus.']);
    }

    /**
     * Admin membalas ulasan pembeli.
     */
    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        $review = Review::findOrFail($id);
        $review->update([
            'admin_reply' => $validated['reply'],
            'admin_replied_at' => now(),
        ]);

        return response()->json([
            'message' => 'Balasan berhasil dikirim.',
            'data' => $review,
        ]);
    }

    /**
     * Admin menghapus balasan ulasan.
     */
    public function deleteReply($id)
    {
        $review = Review::findOrFail($id);
        $review->update([
            'admin_reply' => null,
            'admin_replied_at' => null,
        ]);

        return response()->json([
            'message' => 'Balasan berhasil dihapus.',
            'data' => $review,
        ]);
    }
}
