<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ImageProcessingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductImageController extends Controller
{
    public function __construct(private ImageProcessingService $imageService) {}

    /**
     * List all images for a product.
     */
    public function index(Product $product): JsonResponse
    {
        return response()->json([
            'data' => $this->imageService->getProductImages($product->erp_id),
        ]);
    }

    /**
     * Upload images for a product.
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'images'   => 'required|array|min:1',
            'images.*' => 'image|max:10240', // 10MB per image
        ]);

        $maxImages = config('product-images.max_images_per_product', 4);
        $existing = $this->imageService->getProductImages($product->erp_id);
        $nextIndex = count($existing) + 1;

        $uploaded = [];

        foreach ($request->file('images') as $file) {
            if ($nextIndex > $maxImages) {
                break;
            }

            $paths = $this->imageService->processAndStore(
                $file->getPathname(),
                $product->erp_id,
                $nextIndex
            );

            $uploaded[] = $paths;
            $nextIndex++;
        }

        return response()->json([
            'message' => count($uploaded) . ' image(s) uploaded successfully.',
            'data'    => $this->imageService->getProductImages($product->erp_id),
        ], 201);
    }

    /**
     * Delete a specific image by index.
     */
    public function destroy(Product $product, int $index): JsonResponse
    {
        $this->imageService->deleteImageByIndex($product->erp_id, $index);

        return response()->json([
            'message' => 'Image deleted successfully.',
            'data'    => $this->imageService->getProductImages($product->erp_id),
        ]);
    }
}
