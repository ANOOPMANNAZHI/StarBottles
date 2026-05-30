<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ProductResource;
use App\Imports\ProductDisplayNameImport;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ProductDisplayNameController extends BaseApiController
{
    /**
     * Set or clear the display name for a single product.
     * Passing null or empty string resets it (falls back to ERP title).
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'display_name' => 'nullable|string|max:255',
        ]);

        $value = isset($data['display_name']) && $data['display_name'] !== ''
            ? $data['display_name']
            : null;

        $product->update(['display_name' => $value]);
        $product->load(['category', 'variations']);

        return $this->successResponse(new ProductResource($product));
    }

    /**
     * Reset display_name to null for multiple products at once.
     * They will fall back to showing their ERP title on B2B.
     */
    public function bulkReset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:products,id',
        ]);

        Product::whereIn('id', $data['ids'])->update(['display_name' => null]);

        return $this->successResponse(
            ['updated' => count($data['ids'])],
            count($data['ids']) . ' display names reset'
        );
    }

    /**
     * Import display names from an Excel/CSV file.
     * Pass dry_run=true to preview without saving.
     * Expected columns: SKU (item_code / sku) + Display Name (display_name / name).
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file'    => 'required|file|mimes:xlsx,xls,csv|max:10240',
            'dry_run' => 'boolean',
        ]);

        $dryRun = $request->boolean('dry_run', false);
        $import = new ProductDisplayNameImport($dryRun);

        Excel::import($import, $request->file('file'));

        return $this->successResponse([
            'dry_run'   => $dryRun,
            'updated'   => $import->updated,
            'not_found' => $import->notFound,
            'skipped'   => $import->skipped,
            'rows'      => $import->rows,
        ], $dryRun ? 'Preview ready' : "{$import->updated} display names updated");
    }

    /**
     * Set or clear the custom description for a single product.
     * Passing null or empty string resets it (falls back to ERP description).
     * ERP sync never touches custom_description.
     */
    public function updateDescription(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'custom_description' => 'nullable|string|max:5000',
        ]);

        $value = isset($data['custom_description']) && $data['custom_description'] !== ''
            ? $data['custom_description']
            : null;

        $product->update(['custom_description' => $value]);
        $product->load(['category', 'variations']);

        return $this->successResponse(new ProductResource($product));
    }
}
