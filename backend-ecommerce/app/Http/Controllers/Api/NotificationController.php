<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderChat;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Ambil daftar notifikasi untuk pengguna yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $notifications = [];
        $unreadCount = 0;

        if ($user->role === 'admin') {
            // 1. Pesan chat baru dari pelanggan yang belum dibaca admin
            $unreadChats = OrderChat::where('sender_role', 'customer')
                ->where('is_read', false)
                ->with('order')
                ->latest()
                ->take(10)
                ->get();

            $unreadCount += $unreadChats->count();

            foreach ($unreadChats as $chat) {
                $notifications[] = [
                    'id' => 'chat_' . $chat->id,
                    'type' => 'chat',
                    'order_id' => $chat->order_id,
                    'title' => 'Pesan dari ' . ($chat->sender_name ?: 'Pelanggan'),
                    'message' => $chat->message,
                    'time' => $chat->created_at,
                    'is_unread' => true,
                    'link' => '/admin/orders',
                ];
            }

            // 2. Pesanan baru yang berstatus pending (menunggu konfirmasi)
            $pendingOrders = Order::where('status', 'pending')
                ->latest()
                ->take(5)
                ->get();

            $unreadCount += $pendingOrders->count();

            foreach ($pendingOrders as $order) {
                $notifications[] = [
                    'id' => 'order_pending_' . $order->id,
                    'type' => 'order',
                    'order_id' => $order->id,
                    'title' => 'Pesanan Baru Masuk #' . $order->id,
                    'message' => $order->customer_name . ' (' . ($order->delivery_method === 'pickup' ? 'Ambil di Toko' : 'Diantar') . ') - Total Rp ' . number_format($order->total_price, 0, ',', '.'),
                    'time' => $order->created_at,
                    'is_unread' => true,
                    'link' => '/admin/orders',
                ];
            }
        } else {
            // NOTIFIKASI PELANGGAN / USER
            // 1. Pesan chat dari admin yang belum dibaca pembeli
            $unreadChats = OrderChat::where('sender_role', 'admin')
                ->where('is_read', false)
                ->whereHas('order', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->with('order')
                ->latest()
                ->take(10)
                ->get();

            $unreadCount += $unreadChats->count();

            foreach ($unreadChats as $chat) {
                $notifications[] = [
                    'id' => 'chat_' . $chat->id,
                    'type' => 'chat',
                    'order_id' => $chat->order_id,
                    'title' => 'Pesan dari Admin Toko',
                    'message' => $chat->message,
                    'time' => $chat->created_at,
                    'is_unread' => true,
                    'link' => '/orders',
                ];
            }

            // 2. Pembaruan status pesanan milik pengguna
            $activeOrders = Order::where('user_id', $user->id)
                ->whereIn('status', ['processing', 'shipping', 'ready_for_pickup', 'completed'])
                ->latest('updated_at')
                ->take(6)
                ->get();

            $statusLabels = [
                'processing' => 'Sedang Diproses oleh Koperasi',
                'shipping' => 'Sedang Diantar Kurir ke Alamat Anda',
                'ready_for_pickup' => 'Barang Siap Diambil di Kantor Koperasi',
                'completed' => 'Pesanan Telah Selesai',
            ];

            foreach ($activeOrders as $order) {
                $label = $statusLabels[$order->status] ?? $order->status;
                $notifications[] = [
                    'id' => 'order_status_' . $order->id . '_' . $order->status,
                    'type' => 'order',
                    'order_id' => $order->id,
                    'title' => 'Update Pesanan #' . ($order->user_order_number ?: $order->id),
                    'message' => $label,
                    'status' => $order->status,
                    'time' => $order->updated_at,
                    'is_unread' => in_array($order->status, ['shipping', 'ready_for_pickup']),
                    'link' => '/orders',
                ];
            }
        }

        // Urutkan notifikasi berdasarkan waktu terbaru
        usort($notifications, function ($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });

        return response()->json([
            'unread_count' => $unreadCount,
            'data' => $notifications,
        ]);
    }

    /**
     * Tandai notifikasi chat sebagai sudah dibaca.
     */
    public function markAllRead(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            OrderChat::where('sender_role', 'customer')
                ->where('is_read', false)
                ->update(['is_read' => true]);
        } else {
            OrderChat::where('sender_role', 'admin')
                ->where('is_read', false)
                ->whereHas('order', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->update(['is_read' => true]);
        }

        return response()->json([
            'message' => 'Semua pesan ditandai telah dibaca.',
        ]);
    }
}
