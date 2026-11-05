<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::select('id', 'name')->get()->map(function ($cat) {
            return [
                'id' => $cat->id,
                'category_id' => $cat->id,
                'name' => $cat->name,
                'category' => $cat->name,
            ];
        });

        return response()->json($categories);
    }
}