<?php

namespace App\Imports;

use App\Models\Product;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductDisplayNameImport implements ToCollection, WithHeadingRow
{
    public int $updated  = 0;
    public int $notFound = 0;
    public int $skipped  = 0;
    public array $rows   = [];

    private bool $dryRun;

    public function __construct(bool $dryRun = false)
    {
        $this->dryRun = $dryRun;
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $sku  = $this->pick($row, ['sku', 'item_code', 'item code', 'itemcode', 'code']);
            $name = $this->pick($row, ['display_name', 'display name', 'displayname', 'name', 'product name', 'product_name']);

            if (! $sku) {
                $this->skipped++;
                continue;
            }

            // Normalise SKU — remove all whitespace so "SB- 01677" → "SB-01677"
            $sku = preg_replace('/\s+/', '', $sku);

            $product = Product::where('item_code', $sku)->first();

            if (! $product) {
                $this->notFound++;
                $this->rows[] = [
                    'sku'          => $sku,
                    'display_name' => $name,
                    'current_name' => null,
                    'status'       => 'not_found',
                ];
                continue;
            }

            $newValue = ($name !== null && trim($name) !== '') ? trim($name) : null;

            $this->rows[] = [
                'sku'          => $sku,
                'display_name' => $newValue,
                'current_name' => $product->display_name,
                'erp_title'    => $product->title,
                'status'       => 'found',
            ];

            if (! $this->dryRun) {
                $product->update(['display_name' => $newValue, 'is_hidden' => false]);
                $this->updated++;
            }
        }
    }

    /** Pick the first matching key from a row (case-insensitive). */
    private function pick(mixed $row, array $keys): ?string
    {
        $normalised = collect($row->toArray())
            ->mapWithKeys(fn($v, $k) => [strtolower(trim((string) $k)) => $v]);

        foreach ($keys as $key) {
            if ($normalised->has($key) && $normalised[$key] !== null && $normalised[$key] !== '') {
                return trim((string) $normalised[$key]);
            }
        }

        return null;
    }
}
