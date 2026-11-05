<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Daftar pesanan milik user yang sedang login.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Ambil riwayat pesanan user dari yang paling awal (oldest) untuk penomoran urut per user
        $orders = Order::with(['items.product'])
            ->where('user_id', $userId)
            ->oldest()
            ->get();

        // Berikan nomor urut pesanan khusus user (Pesanan #1, Pesanan #2, dst)
        $mapped = $orders->values()->map(function ($order, $index) {
            $order->user_order_number = $index + 1;
            $order->order_code = 'KOP-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);
            return $order;
        });

        // Urutkan kembali pesanan terbaru di paling atas
        $latestOrders = $mapped->reverse()->values();

        return response()->json([
            'data' => $latestOrders,
            'total' => $latestOrders->count(),
        ]);
    }

    /**
     * Detail satu pesanan milik user yang sedang login.
     */
    public function show(Request $request, $id)
    {
        $userId = $request->user()->id;

        $order = Order::with(['items.product'])
            ->where('user_id', $userId)
            ->findOrFail($id);

        $userOrderNumber = Order::where('user_id', $userId)
            ->where('id', '<=', $order->id)
            ->count();

        $order->user_order_number = $userOrderNumber;
        $order->order_code = 'KOP-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);

        return response()->json(['data' => $order]);
    }

    /**
     * Pengguna membatalkan pesanan (hanya bisa jika status masih pending).
     */
    public function cancel(Request $request, $id)
    {
        $userId = $request->user()->id;
        $order = Order::with('items.product')
            ->where('user_id', $userId)
            ->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Pesanan tidak dapat dibatalkan karena sudah diproses atau selesai.',
            ], 422);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($order) {
            // Kembalikan stok produk
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->qty);
                }
            }

            $order->update(['status' => 'cancelled']);
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibatalkan dan stok produk telah dikembalikan.',
            'data' => $order->fresh(),
        ]);
    }

    /**
     * Pengguna menyelesaikan pesanan (konfirmasi barang telah diterima/diambil).
     */
    public function complete(Request $request, $id)
    {
        $userId = $request->user()->id;
        $order = Order::where('user_id', $userId)->findOrFail($id);

        if ($order->status === 'cancelled') {
            return response()->json([
                'message' => 'Pesanan yang telah dibatalkan tidak dapat diselesaikan.',
            ], 422);
        }

        if ($order->status === 'completed') {
            return response()->json([
                'message' => 'Pesanan sudah diselesaikan sebelumnya.',
            ], 200);
        }

        $order->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Terima kasih! Pesanan telah selesai.',
            'data' => $order->fresh(),
        ]);
    }
}
