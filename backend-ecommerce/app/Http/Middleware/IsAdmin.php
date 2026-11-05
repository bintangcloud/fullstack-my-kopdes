<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Periksa autentikasi
        if (!Auth::guard('sanctum')->check()) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Periksa role admin
        if (Auth::guard('sanctum')->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Akses ditolak. Rute ini hanya untuk Admin.'
            ], 403);
        }

        return $next($request);
    }
}