<?php

namespace App\Jobs;

use App\Services\ErpSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncErpProductsJob implements ShouldQueue
{
    use Queueable;

    public function handle(ErpSyncService $service): void
    {
        $service->sync();
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ERP Sync Job Failed', ['error' => $exception->getMessage()]);
    }
}
