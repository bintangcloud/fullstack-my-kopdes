<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'phone' => 'required|string',
            'address' => 'nullable|string|required_if:delivery_method,delivery',
            'payment_method' => 'required|in:cod,transfer',
            'delivery_method' => 'nullable|in:delivery,pickup',
            'items' => 'required|array',
            'items.*.id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        // Pickup tidak dikenakan ongkir
        $deliveryMethod = $validated['delivery_method'] ?? 'delivery';
        $shippingCost = $deliveryMethod === 'pickup' ? 0 : 10000;

        $address = $validated['address'] ?? null;
        if ($deliveryMethod === 'pickup' && empty($address)) {
            $address = 'Ambil di toko (Koperasi Desa)';
        }

        try {
            DB::beginTransaction();

            $totalPrice = 0;

            // Buat draft Order
            $order = Order::create([
                'user_id' => $request->user()?->id,
                'customer_name' => $validated['customer_name'],
                'phone' => $validated['phone'],
                'address' => $address,
                'payment_method' => $validated['payment_method'],
                'delivery_method' => $deliveryMethod,
                'shipping_cost' => $shippingCost,
                'total_price' => 0, // Akan diupdate nanti
                'status' => 'pending',
            ]);

            // Proses setiap item
            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->find($item['id']);

                if (! $product) {
                    throw new \Exception('Produk tidak ditemukan.');
                }

                if ($product->stock < $item['qty']) {
                    throw new \Exception("Stok {$product->name} tidak mencukupi. Sisa stok: {$product->stock}");
                }

                // Kurangi stok produk
                $product->decrement('stock', $item['qty']);

                // Catat di Order Item
                $order->items()->create([
                    'product_id' => $product->id,
                    'qty' => $item['qty'],
                    'price' => $product->price,
                ]);

                $totalPrice += ($product->price * $item['qty']);
            }

            // Update total harga akhir (termasuk ongkir)
            $order->update(['total_price' => $totalPrice + $shippingCost]);

            DB::commit();

            if ($order->user_id) {
                $userOrderNumber = Order::where('user_id', $order->user_id)
                    ->where('id', '<=', $order->id)
                    ->count();
                $order->user_order_number = $userOrderNumber;
            } else {
                $order->user_order_number = 1;
            }
            $order->order_code = 'KOP-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);

            return response()->json([
                'message' => 'Pesanan berhasil dibuat!',
                'order_id' => $order->id,
                'user_order_number' => $order->user_order_number,
                'order_code' => $order->order_code,
                'data' => $order->load('items.product'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
