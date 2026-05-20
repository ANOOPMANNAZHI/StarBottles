<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Jobs\SyncErpCategoriesJob;
use App\Jobs\SyncErpProductsJob;
use App\Models\ErpSyncLog;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SiteSetting;
use App\Services\ErpSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ErpSyncController extends BaseApiController
{
    public function status(): JsonResponse
    {
        $logs     = ErpSyncLog::orderByDesc('synced_at')->limit(10)->get();
        $lastSync = $logs->first();

        return $this->successResponse([
            'logs'           => $logs,
            'total_products' => Product::count(),
            'total_categories' => ProductCategory::count(),
            'last_sync'      => $lastSync,
        ]);
    }

    public function trigger(): JsonResponse
    {
        SyncErpProductsJob::dispatch();

        return $this->successResponse(
            ['message' => 'Sync job has been queued'],
            'Sync job has been queued',
            202
        );
    }

    public function syncCategories(): JsonResponse
    {
        SyncErpCategoriesJob::dispatch();

        return $this->successResponse(
            ['message' => 'Category sync job has been queued'],
            'Category sync job has been queued',
            202
        );
    }

    public function syncProgress(): JsonResponse
    {
        $progress = Cache::get('erp_sync_progress', [
            'status'    => 'idle',
            'stage'     => null,
            'current'   => 0,
            'total'     => 0,
            'cats_done' => false,
        ]);

        return $this->successResponse($progress);
    }

    public function settings(): JsonResponse
    {
        $settings = SiteSetting::where('group', 'erp')->get()->map(fn ($s) => [
            'key'   => $s->key,
            'value' => $s->key === 'erp_api_secret' ? '' : $s->value,
            'type'  => $s->type,
        ]);

        return $this->successResponse($settings);
    }

    public function fullResync(): JsonResponse
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Product::truncate();
        ProductCategory::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        Cache::forget('erp_sync_progress');

        SyncErpProductsJob::dispatch();

        return $this->successResponse(
            ['message' => 'All product data cleared. Full resync job has been queued.'],
            'Full resync queued',
            202
        );
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings'         => 'required|array',
            'settings.*.key'   => 'required|string|exists:site_settings,key',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($data['settings'] as $item) {
            // Only update secret if a new value was provided
            if ($item['key'] === 'erp_api_secret' && empty($item['value'])) {
                continue;
            }

            SiteSetting::where('key', $item['key'])->update(['value' => $item['value']]);
        }

        return $this->successResponse(null, 'ERP settings updated');
    }
}
