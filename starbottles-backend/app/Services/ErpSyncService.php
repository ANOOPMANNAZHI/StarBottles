<?php

namespace App\Services;

use App\Models\ErpSyncLog;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ErpSyncService
{
    private ?array $categoryMap = null;
    private ?array $settings = null;

    /**
     * Get an ERP setting from the database, falling back to config/env.
     */
    private function setting(string $key, mixed $default = null): mixed
    {
        if ($this->settings === null) {
            $this->settings = SiteSetting::where('group', 'erp')
                ->pluck('value', 'key')
                ->toArray();
        }

        $dbKey = "erp_{$key}";

        if (isset($this->settings[$dbKey]) && $this->settings[$dbKey] !== '') {
            return $this->settings[$dbKey];
        }

        return config("erp.{$key}", $default);
    }

    private function useMock(): bool
    {
        $val = $this->setting('use_mock');

        return filter_var($val, FILTER_VALIDATE_BOOLEAN);
    }

    private function buildAuthHeader(): array
    {
        $key = $this->setting('api_key');
        $secret = $this->setting('api_secret');

        return ['Authorization' => "token {$key}:{$secret}"];
    }

    private function fetchItemGroups(): array
    {
        if ($this->useMock()) {
            $content = file_get_contents(config('erp.mock_groups_file'));

            return json_decode($content, true);
        }

        $allGroups = [];
        $start = 0;
        $pageSize = (int) $this->setting('page_size', 100);

        do {
            $response = Http::timeout(30)
                ->withHeaders($this->buildAuthHeader())
                ->get($this->setting('base_url') . config('erp.endpoints.item_groups'), [
                    'company'           => $this->setting('company', 'Star Bottles'),
                    'limit_start'       => $start,
                    'limit_page_length' => $pageSize,
                ]);

            if ($response->failed()) {
                throw new \Exception(
                    "ERP Item Groups API error: {$response->status()} — {$response->body()}"
                );
            }

            $data = $response->json('message.data') ?? [];
            $totalCount = $response->json('message.total_count') ?? 0;
            $allGroups = array_merge($allGroups, $data);
            $start += $pageSize;
        } while (count($data) === $pageSize || ($totalCount > 0 && $start < $totalCount));

        return $allGroups;
    }

    private function fetchAllItems(): array
    {
        if ($this->useMock()) {
            $content = file_get_contents(config('erp.mock_file'));

            return json_decode($content, true);
        }

        $response = Http::timeout(60)
            ->withHeaders($this->buildAuthHeader())
            ->get($this->setting('base_url') . config('erp.endpoints.items'), [
                'company'           => $this->setting('company', 'Star Bottles'),
                'limit_page_length' => 0,
            ]);

        if ($response->failed()) {
            throw new \Exception(
                "ERP Items API error: {$response->status()} — {$response->body()}"
            );
        }

        return $response->json('message.data') ?? [];
    }

    public function syncItemGroups(): int
    {
        $groups = $this->fetchItemGroups();
        $count = 0;

        foreach ($groups as $groupName) {
            $slug = Str::slug($groupName);

            // Check if a category with this erp_name already exists
            $existing = ProductCategory::where('erp_name', $groupName)->first();

            if (! $existing) {
                // Check if a category with matching slug exists (pre-existing from old sync)
                $existing = ProductCategory::where('slug', $slug)->first();

                if ($existing) {
                    // Claim the existing category by setting its erp_name
                    $existing->update(['erp_name' => $groupName, 'name' => $groupName]);
                } else {
                    // Handle slug collisions by appending a suffix
                    $baseSlug = $slug;
                    $i = 2;
                    while (ProductCategory::where('slug', $slug)->exists()) {
                        $slug = "{$baseSlug}-{$i}";
                        $i++;
                    }

                    ProductCategory::create([
                        'erp_name' => $groupName,
                        'name'     => $groupName,
                        'slug'     => $slug,
                    ]);
                }
            } else {
                $existing->update(['name' => $groupName]);
            }

            $count++;
        }

        return $count;
    }

    private function resolveCategory(?string $itemGroup): ?int
    {
        if (! $itemGroup) {
            return null;
        }

        if ($this->categoryMap === null) {
            $this->categoryMap = ProductCategory::pluck('id', 'erp_name')->toArray();
        }

        return $this->categoryMap[$itemGroup] ?? null;
    }

    private function mapProduct(array $erpItem): array
    {
        $mapped = [];

        foreach (config('erp.field_map') as $localField => $erpField) {
            $mapped[$localField] = $erpItem[$erpField] ?? null;
        }

        // Strip HTML tags from description
        if (! empty($mapped['description'])) {
            $mapped['description'] = trim(strip_tags($mapped['description']));
        }

        $mapped['category_id'] = $this->resolveCategory($erpItem['item_group'] ?? null);
        $mapped['synced_at'] = now();
        $mapped['is_active'] = true;

        return $mapped;
    }

    private function setProgress(array $data): void
    {
        Cache::put('erp_sync_progress', $data, now()->addMinutes(15));
    }

    public function sync(): array
    {
        $this->setProgress([
            'status'    => 'syncing',
            'stage'     => 'categories',
            'current'   => 0,
            'total'     => 0,
            'cats_done' => false,
        ]);

        try {
            $categoriesSynced = $this->syncItemGroups();

            $this->setProgress([
                'status'    => 'syncing',
                'stage'     => 'products',
                'current'   => 0,
                'total'     => 0,
                'cats_done' => true,
            ]);

            $erpItems = $this->fetchAllItems();
        } catch (\Exception $e) {
            $this->setProgress([
                'status'    => 'failed',
                'stage'     => null,
                'current'   => 0,
                'total'     => 0,
                'cats_done' => false,
            ]);

            ErpSyncLog::create([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
                'synced_at'     => now(),
            ]);
            throw $e;
        }

        $total = count($erpItems);
        $this->setProgress([
            'status'    => 'syncing',
            'stage'     => 'products',
            'current'   => 0,
            'total'     => $total,
            'cats_done' => true,
        ]);

        $added = 0;
        $updated = 0;
        $incomingErpIds = [];
        $processed = 0;

        foreach ($erpItems as $erpItem) {
            $mapped = $this->mapProduct($erpItem);

            if (! $mapped['erp_id']) {
                continue;
            }

            // New products start hidden — admin decides what to show on the B2B frontend.
            // Existing products keep their current is_hidden state unchanged.
            $product = Product::firstOrCreate(
                ['erp_id' => $mapped['erp_id']],
                array_merge($mapped, ['is_hidden' => true])
            );

            if ($product->wasRecentlyCreated) {
                $added++;
            } else {
                $product->update($mapped);
                $updated++;
            }

            $incomingErpIds[] = $mapped['erp_id'];
            $processed++;

            // Update progress every 10 products to reduce cache writes
            if ($processed % 10 === 0 || $processed === $total) {
                $this->setProgress([
                    'status'    => 'syncing',
                    'stage'     => 'products',
                    'current'   => $processed,
                    'total'     => $total,
                    'cats_done' => true,
                ]);
            }
        }

        $deactivated = Product::whereNotIn('erp_id', $incomingErpIds)
            ->where('is_active', true)
            ->count();

        Product::whereNotIn('erp_id', $incomingErpIds)
            ->update(['is_active' => false]);

        ErpSyncLog::create([
            'status'            => 'success',
            'products_added'    => $added,
            'products_updated'  => $updated,
            'categories_synced' => $categoriesSynced,
            'synced_at'         => now(),
        ]);

        $this->setProgress([
            'status'    => 'completed',
            'stage'     => 'products',
            'current'   => $processed,
            'total'     => $total,
            'cats_done' => true,
        ]);

        return compact('added', 'updated', 'deactivated', 'categoriesSynced');
    }
}
