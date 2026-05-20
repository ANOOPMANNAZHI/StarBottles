<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductVisibilityController extends BaseApiController
{
    public function toggleHidden(Product $product): JsonResponse
    {
        $product->update(['is_hidden' => !$product->is_hidden]);
        $product->load(['category', 'variations']);

        return $this->successResponse(new ProductResource($product));
    }

    public function toggleFeatured(Product $product): JsonResponse
    {
        $product->update(['is_featured' => !$product->is_featured]);
        $product->load(['category', 'variations']);

        return $this->successResponse(new ProductResource($product));
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'required|integer|exists:products,id',
            'action' => 'required|in:show,hide,feature,unfeature',
        ]);

        $update = match ($data['action']) {
            'show'      => ['is_hidden' => false],
            'hide'      => ['is_hidden' => true],
            'feature'   => ['is_featured' => true],
            'unfeature' => ['is_featured' => false],
        };

        Product::whereIn('id', $data['ids'])->update($update);

        return $this->successResponse(
            ['updated' => count($data['ids'])],
            count($data['ids']) . ' products updated'
        );
    }
}
