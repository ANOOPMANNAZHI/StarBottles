<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\ImageProcessingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportProductImages extends Command
{
    protected $signature = 'products:import-images {path : Path to folder containing ERP ID subfolders} {--dry-run : Preview what would happen without processing}';

    protected $description = 'Bulk import product images from a folder organized by ERP ID';

    public function handle(ImageProcessingService $service): int
    {
        $sourcePath = $this->argument('path');
        $dryRun = $this->option('dry-run');

        if (!File::isDirectory($sourcePath)) {
            $this->error("Directory not found: {$sourcePath}");
            return self::FAILURE;
        }

        $directories = File::directories($sourcePath);

        if (empty($directories)) {
            $this->warn('No subdirectories found in the source path.');
            return self::SUCCESS;
        }

        $stats = ['matched' => 0, 'processed' => 0, 'unmatched' => 0, 'errors' => 0];
        $maxImages = config('product-images.max_images_per_product', 4);

        if ($dryRun) {
            $this->info('=== DRY RUN — no files will be processed ===');
            $this->newLine();
        }

        $bar = $this->output->createProgressBar(count($directories));
        $bar->start();

        foreach ($directories as $dir) {
            $erpId = basename($dir);
            $product = Product::where('erp_id', $erpId)->first();

            if (!$product) {
                $stats['unmatched']++;
                $this->newLine();
                $this->warn("  No product found for ERP ID: {$erpId}");
                $bar->advance();
                continue;
            }

            $stats['matched']++;

            $imageFiles = $this->getImageFiles($dir, $maxImages);

            if (empty($imageFiles)) {
                $this->newLine();
                $this->warn("  No image files found in: {$erpId}/");
                $bar->advance();
                continue;
            }

            if ($dryRun) {
                $this->newLine();
                $this->line("  Would process {$erpId}: " . count($imageFiles) . " image(s) → {$product->title}");
                $bar->advance();
                continue;
            }

            try {
                $service->deleteProductImages($erpId);

                foreach ($imageFiles as $index => $filePath) {
                    $service->processAndStore($filePath, $erpId, $index + 1);
                }

                $stats['processed']++;
            } catch (\Exception $e) {
                $stats['errors']++;
                $this->newLine();
                $this->error("  Error processing {$erpId}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info('Import Summary:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Folders scanned', count($directories)],
                ['Matched to products', $stats['matched']],
                ['Successfully processed', $stats['processed']],
                ['Unmatched ERP IDs', $stats['unmatched']],
                ['Errors', $stats['errors']],
            ]
        );

        return $stats['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Get sorted image files from a directory, limited to max count.
     */
    private function getImageFiles(string $directory, int $maxImages): array
    {
        $extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        $files = [];

        foreach (File::files($directory) as $file) {
            if (in_array(strtolower($file->getExtension()), $extensions)) {
                $files[] = $file->getPathname();
            }
        }

        sort($files);

        return array_slice($files, 0, $maxImages);
    }
}
