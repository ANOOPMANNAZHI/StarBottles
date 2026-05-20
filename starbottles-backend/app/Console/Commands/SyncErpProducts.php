<?php

namespace App\Console\Commands;

use App\Services\ErpSyncService;
use Illuminate\Console\Command;

class SyncErpProducts extends Command
{
    protected $signature = 'erp:sync';
    protected $description = 'Sync products from ERP system';

    public function handle(ErpSyncService $service): int
    {
        $this->info('Starting ERP product sync…');

        try {
            $result = $service->sync();
            $this->info(
                "Sync complete. Added: {$result['added']}, " .
                "Updated: {$result['updated']}, " .
                "Deactivated: {$result['deactivated']}"
            );
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Sync failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
