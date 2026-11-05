<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderChat;
use Illuminate\Http\Request;

class OrderChatController extends Controller
{
    /**
     * Ambil riwayat percakapan untuk sebuah pesanan.
     */
    public function index(Request $request, $orderId)
    {
        $user = $request->user();
        $order = Order::with(['items.product'])->findOrFail($orderId);

        // Hanya pemilik pesanan atau admin yang boleh mengakses percakapan
        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke percakapan pesanan ini.',
            ], 403);
        }

        // Tandai pesan dari pihak lawan sebagai sudah dibaca
        $targetRole = $user->role === 'admin' ? 'customer' : 'admin';
        OrderChat::where('order_id', $orderId)
            ->where('sender_role', $targetRole)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $chats = OrderChat::where('order_id', $orderId)
            ->oldest()
            ->get();

        return response()->json([
            'order' => [
                'id' => $order->id,
                'customer_name' => $order->customer_name,
                'phone' => $order->phone,
                'status' => $order->status,
                'delivery_method' => $order->delivery_method,
                'items_count' => $order->items->count(),
            ],
            'data' => $chats,
        ]);
    }

    /**
     * Kirim pesan baru dalam pesanan.
     */
    public function store(Request $request, $orderId)
    {
        $user = $request->user();
        $order = Order::findOrFail($orderId);

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak berhak mengirim pesan di pesanan ini.',
            ], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $senderRole = $user->role === 'admin' ? 'admin' : 'customer';

        $chat = OrderChat::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'sender_name' => $user->role === 'admin' ? 'Admin Toko (Koperasi)' : $user->name,
            'sender_role' => $senderRole,
            'message' => $validated['message'],
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Pesan terkirim.',
            'data' => $chat,
        ], 201);
    }
}
