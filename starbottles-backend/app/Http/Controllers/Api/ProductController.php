<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\B2bProductResource;
use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variations']);

        // Authenticated users with admin or training-view can see hidden products
        // Use Sanctum guard directly — route is public so $request->user() is always null
        $user    = auth('sanctum')->user();
        $isAdmin = $user?->hasRole('admin');
        $canViewAll = $isAdmin || $user?->hasPermissionTo('training-view');
        if ($canViewAll && $request->boolean('include_hidden')) {
            $query->where('is_active', true);
        } else {
            $query->visible();
        }

        if ($request->filled('search')) {
            $q = trim($request->input('search'));
            $query->where(function ($sub) use ($q) {
                $sub->where(function ($titleDesc) use ($q) {
                    // Every word must appear in title, display_name, or description
                    $words = preg_split('/\s+/', $q, -1, PREG_SPLIT_NO_EMPTY);
                    foreach ($words as $word) {
                        $titleDesc->where(function ($w) use ($word) {
                            $w->where('title', 'like', "%{$word}%")
                              ->orWhere('display_name', 'like', "%{$word}%")
                              ->orWhere('description', 'like', "%{$word}%");
                        });
                    }
                })
                ->orWhere('item_code', 'like', "%{$q}%")
                ->orWhere('brand', 'like', "%{$q}%");
            });
        }

        if ($canViewAll && $request->boolean('is_hidden')) {
            $query->where('is_hidden', true);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('material')) {
            $query->where('material', $request->input('material'));
        }

        if ($request->filled('capacity')) {
            $query->where('capacity', 'like', '%' . $request->input('capacity') . '%');
        }

        if ($request->filled('shape_type')) {
            $query->where('shape_type', $request->input('shape_type'));
        }

        if ($request->filled('brand')) {
            $query->where('brand', $request->input('brand'));
        }

        if ($request->filled('classification')) {
            $query->where('classification', $request->input('classification'));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        $perPage = min((int) $request->input('per_page', 24), 96);
        $products = $query->paginate($perPage);

        // Track view for the listing (first page only to avoid spam)
        if ($products->currentPage() === 1) {
            $this->trackView(null, $request);
        }

        return $this->paginatedResponse(
            $products->through(fn($p) => new ProductListResource($p))
        );
    }

    public function show(Request $request, string $product): JsonResponse
    {
        $model = is_numeric($product)
            ? Product::findOrFail($product)
            : Product::where('slug', $product)->firstOrFail();

        $viewer = auth('sanctum')->user();
        $canViewHidden = $viewer?->hasRole('admin') || $viewer?->hasPermissionTo('training-view');
        if ($model->is_hidden && !$canViewHidden) {
            abort(404);
        }

        $model->load(['category', 'variations']);

        $this->trackView($model, $request);

        return $this->successResponse(new ProductResource($model));
    }

    public function categories(): JsonResponse
    {
        $tree = Cache::remember('product_categories_v2', 3600, function () {
            return ProductCategory::with('children')
                ->withCount('products')
                ->whereNull('parent_id')
                ->ordered()
                ->get()
                ->map(fn($cat) => [
                    'id'            => $cat->id,
                    'name'          => $cat->name,
                    'slug'          => $cat->slug,
                    'tagline'       => $cat->tagline,
                    'image_url'     => $cat->image_url,
                    'color'         => $cat->color,
                    'is_featured'   => $cat->is_featured,
                    'product_count' => $cat->products_count,
                    'children'      => $cat->children->map(fn($child) => [
                        'id'   => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                    ])->values(),
                ])
                ->values()
                ->toArray();
        });

        return $this->successResponse($tree);
    }

    public function featuredCategories(): JsonResponse
    {
        $featured = Cache::remember('product_categories_featured', 3600, function () {
            return ProductCategory::with('children')
                ->withCount('products')
                ->whereNull('parent_id')
                ->where('is_featured', true)
                ->ordered()
                ->get()
                ->map(fn($cat) => [
                    'id'            => $cat->id,
                    'name'          => $cat->name,
                    'slug'          => $cat->slug,
                    'tagline'       => $cat->tagline,
                    'image_url'     => $cat->image_url,
                    'color'         => $cat->color,
                    'is_featured'   => true,
                    'product_count' => $cat->products_count,
                    'children'      => $cat->children->map(fn($child) => [
                        'id'   => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                    ])->values(),
                ])
                ->values()
                ->toArray();
        });

        return $this->successResponse($featured);
    }

    public function b2bIndex(Request $request): JsonResponse
    {
        $products = Product::with(['category', 'variations'])
            ->visible()
            ->get()
            ->map(fn($p) => new B2bProductResource($p));

        return $this->successResponse($products->values());
    }

    public function b2bShow(Request $request, Product $product): JsonResponse
    {
        if ($product->is_hidden) {
            abort(404);
        }

        $product->load(['category', 'variations']);

        return $this->successResponse(new B2bProductResource($product));
    }

    private function trackView(?Product $product, Request $request): void
    {
        if ($product === null) {
            return;
        }

        ProductView::create([
            'product_id' => $product->id,
            'user_id'    => $request->user()?->id,
            'viewer_ip'  => $request->ip(),
            'viewed_at'  => now(),
        ]);
    }
}
