<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Cache::remember('api_categories_list', 600, function () {
            return Category::select('id', 'name')->get()->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'category_id' => $cat->id,
                    'name' => $cat->name,
                    'category' => $cat->name,
                ];
            });
        });

        return response()->json($categories);
    }
}