<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * Daftar seluruh pesanan untuk admin + ringkasan statistik.
     */
    public function index(Request $request)
    {
        $query = Order::with(['items.product', 'user:id,name,email'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('customer_name', 'like', "%{$keyword}%")
                    ->orWhere('phone', 'like', "%{$keyword}%")
                    ->orWhere('id', $keyword);
            });
        }

        $perPage = (int) $request->get('limit', 10);
        $orders = $query->paginate($perPage);

        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipping' => Order::where('status', 'shipping')->count(),
            'ready_for_pickup' => Order::where('status', 'ready_for_pickup')->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            // Saldo/omset hanya bertambah dari pesanan yang berstatus completed (selesai)
            'revenue' => (int) Order::where('status', 'completed')->sum('total_price'),
        ];

        return response()->json([
            'data' => $orders->items(),
            'current_page' => $orders->currentPage(),
            'last_page' => $orders->lastPage(),
            'per_page' => $orders->perPage(),
            'total' => $orders->total(),
            'stats' => $stats,
        ]);
    }

    /**
     * Ubah status pesanan (pending, processing, shipping, ready_for_pickup, completed, cancelled).
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipping,ready_for_pickup,completed,cancelled',
        ]);

        $order = Order::with('items.product')->findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        \Illuminate\Support\Facades\DB::transaction(function () use ($order, $oldStatus, $newStatus) {
            // Jika status diubah menjadi cancelled dan sebelumnya belum cancelled, kembalikan stok
            if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
                foreach ($order->items as $item) {
                    if ($item->product) {
                        $item->product->increment('stock', $item->qty);
                    }
                }
            }

            $order->update(['status' => $newStatus]);
        });

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui.',
            'data' => $order->fresh(),
        ]);
    }
}
