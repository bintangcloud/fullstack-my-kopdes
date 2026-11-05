<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // Izinkan kolom-kolom ini diisi secara massal
    protected $fillable = [
        'user_id',
        'customer_name',
        'phone',
        'address',
        'payment_method',
        'delivery_method',
        'shipping_cost',
        'total_price',
        'status',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chats()
    {
        return $this->hasMany(OrderChat::class);
    }
}