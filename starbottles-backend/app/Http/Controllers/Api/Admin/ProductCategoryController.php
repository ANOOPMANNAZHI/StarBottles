<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ProductCategoryController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $categories = ProductCategory::withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'slug'           => $c->slug,
                'erp_name'       => $c->erp_name,
                'parent_id'      => $c->parent_id,
                'is_featured'    => $c->is_featured,
                'products_count' => $c->products_count,
                'created_at'     => $c->created_at,
            ]);

        return $this->successResponse($categories);
    }

    public function toggleFeatured(ProductCategory $productCategory): JsonResponse
    {
        $productCategory->update(['is_featured' => ! $productCategory->is_featured]);

        Cache::forget('product_categories_v2');
        Cache::forget('product_categories_featured');

        return $this->successResponse([
            'id'          => $productCategory->id,
            'is_featured' => $productCategory->is_featured,
        ]);
    }

    public function destroy(ProductCategory $productCategory): JsonResponse
    {
        $name = $productCategory->name;

        // Nullify category_id on associated products instead of deleting them
        $productCategory->products()->update(['category_id' => null]);
        $productCategory->delete();

        Cache::forget('product_categories');

        return $this->successResponse(null, "Category '{$name}' deleted");
    }
}
