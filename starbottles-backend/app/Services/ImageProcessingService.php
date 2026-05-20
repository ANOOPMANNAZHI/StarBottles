<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Interfaces\ImageInterface;

class ImageProcessingService
{
    private ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new GdDriver());
    }

    /**
     * Process a source image into all configured size variants and store them.
     *
     * @return array<string, string> Map of size name => relative storage path
     */
    public function processAndStore(string $sourcePath, string $erpId, int $index): array
    {
        $image = $this->manager->read($sourcePath);
        $sizes = config('product-images.sizes');
        $quality = config('product-images.quality', 80);
        $basePath = config('product-images.storage_path') . '/' . $erpId;
        $paths = [];

        foreach ($sizes as $sizeName => $dimensions) {
            $variant = clone $image;
            $variant = $this->resizeImage($variant, $dimensions);

            $filename = "{$sizeName}_{$index}.webp";
            $relativePath = "{$basePath}/{$filename}";

            $encoded = $variant->toWebp($quality);

            Storage::disk('public')->put($relativePath, (string) $encoded);

            $paths[$sizeName] = $relativePath;
        }

        return $paths;
    }

    /**
     * Get structured image data for a product by scanning the filesystem.
     *
     * @return array<int, array<string, string>> Array of image sets, each with size => URL
     */
    public function getProductImages(string $erpId): array
    {
        $basePath = config('product-images.storage_path') . '/' . $erpId;

        if (!Storage::disk('public')->exists($basePath)) {
            return [];
        }

        $files = Storage::disk('public')->files($basePath);
        $sizes = array_keys(config('product-images.sizes'));
        $imagesByIndex = [];

        foreach ($files as $file) {
            $filename = basename($file);
            if (!str_ends_with($filename, '.webp')) {
                continue;
            }

            $name = pathinfo($filename, PATHINFO_FILENAME);
            $parts = explode('_', $name, 2);

            if (count($parts) !== 2 || !in_array($parts[0], $sizes) || !is_numeric($parts[1])) {
                continue;
            }

            $sizeName = $parts[0];
            $index = (int) $parts[1];

            $imagesByIndex[$index][$sizeName] = Storage::disk('public')->url($file);
        }

        ksort($imagesByIndex);

        return array_values($imagesByIndex);
    }

    /**
     * Delete all processed images for a product.
     */
    public function deleteProductImages(string $erpId): void
    {
        $basePath = config('product-images.storage_path') . '/' . $erpId;

        if (Storage::disk('public')->exists($basePath)) {
            Storage::disk('public')->deleteDirectory($basePath);
        }
    }

    /**
     * Delete a specific image index (all size variants) for a product.
     */
    public function deleteImageByIndex(string $erpId, int $index): void
    {
        $basePath = config('product-images.storage_path') . '/' . $erpId;
        $sizes = array_keys(config('product-images.sizes'));

        foreach ($sizes as $sizeName) {
            $path = "{$basePath}/{$sizeName}_{$index}.webp";
            Storage::disk('public')->delete($path);
        }
    }

    private function resizeImage(ImageInterface $image, array $dimensions): ImageInterface
    {
        if ($dimensions['fit'] === 'cover') {
            return $image->cover($dimensions['width'], $dimensions['height']);
        }

        return $image->scaleDown($dimensions['width'], $dimensions['height']);
    }
}
