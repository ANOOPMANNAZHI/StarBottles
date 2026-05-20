<?php

namespace App\Jobs;

use App\Services\ErpSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SyncErpCategoriesJob implements ShouldQueue
{
    use Queueable;

    public function handle(ErpSyncService $service): void
    {
        Cache::put('erp_sync_progress', [
            'status'    => 'syncing',
            'stage'     => 'categories',
            'current'   => 0,
            'total'     => 0,
            'cats_done' => false,
        ], now()->addMinutes(15));

        $count = $service->syncItemGroups();

        Cache::put('erp_sync_progress', [
            'status'    => 'completed',
            'stage'     => 'categories',
            'current'   => $count,
            'total'     => $count,
            'cats_done' => true,
        ], now()->addMinutes(15));
    }

    public function failed(\Throwable $exception): void
    {
        Cache::put('erp_sync_progress', [
            'status'    => 'failed',
            'stage'     => 'categories',
            'current'   => 0,
            'total'     => 0,
            'cats_done' => false,
        ], now()->addMinutes(15));

        Log::error('ERP Categories Sync Job Failed', ['error' => $exception->getMessage()]);
    }
}
