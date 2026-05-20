<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DemoProductImageSeeder extends Seeder
{
    /**
     * Color palettes per material for visual distinction in demo.
     */
    private array $materialColors = [
        'pet'   => [
            ['bg' => [0, 152, 187], 'accent' => [0, 120, 155]],   // brand teal
            ['bg' => [0, 130, 170], 'accent' => [0, 100, 140]],
            ['bg' => [0, 170, 200], 'accent' => [0, 140, 170]],
        ],
        'hdpe'  => [
            ['bg' => [76, 140, 80], 'accent' => [55, 110, 60]],   // green
            ['bg' => [60, 130, 70], 'accent' => [40, 100, 50]],
            ['bg' => [90, 160, 95], 'accent' => [70, 130, 75]],
        ],
        'glass' => [
            ['bg' => [139, 92, 246], 'accent' => [110, 70, 200]],  // purple
            ['bg' => [120, 80, 220], 'accent' => [95, 60, 185]],
            ['bg' => [155, 105, 255], 'accent' => [130, 85, 220]],
        ],
        'pp'    => [
            ['bg' => [245, 158, 11], 'accent' => [200, 130, 10]],  // amber
            ['bg' => [230, 145, 10], 'accent' => [190, 120, 10]],
            ['bg' => [250, 175, 30], 'accent' => [210, 145, 20]],
        ],
    ];

    private array $defaultColors = [
        ['bg' => [100, 116, 139], 'accent' => [71, 85, 105]],
        ['bg' => [80, 100, 125], 'accent' => [60, 80, 105]],
        ['bg' => [120, 130, 150], 'accent' => [90, 100, 120]],
    ];

    public function run(): void
    {
        $sizes = config('product-images.sizes');
        $storagePath = config('product-images.storage_path');

        $products = Product::all();

        foreach ($products as $product) {
            if (!$product->erp_id) {
                continue;
            }

            $dir = "{$storagePath}/{$product->erp_id}";
            Storage::disk('public')->makeDirectory($dir);

            $colors = $this->materialColors[$product->material] ?? $this->defaultColors;

            // Generate 3 images per product
            for ($i = 0; $i < 3; $i++) {
                $color = $colors[$i % count($colors)];

                foreach ($sizes as $sizeName => $dimensions) {
                    $img = $this->createPlaceholderImage(
                        $dimensions['width'],
                        $dimensions['height'],
                        $color['bg'],
                        $color['accent'],
                        $product->title,
                        $product->material,
                        $i + 1,
                    );

                    $path = "{$dir}/{$sizeName}_{$i}.webp";
                    Storage::disk('public')->put($path, $img);
                }
            }

            // Activate product for demo
            $product->update([
                'is_active' => true,
                'is_hidden' => false,
            ]);
        }

        $this->command->info("Generated demo images for {$products->count()} products (3 images each).");
    }

    private function createPlaceholderImage(
        int $width,
        int $height,
        array $bgColor,
        array $accentColor,
        string $title,
        string $material,
        int $imageNum,
    ): string {
        $img = imagecreatetruecolor($width, $height);

        // Background gradient (top to bottom)
        $bg = imagecolorallocate($img, $bgColor[0], $bgColor[1], $bgColor[2]);
        $accent = imagecolorallocate($img, $accentColor[0], $accentColor[1], $accentColor[2]);
        imagefill($img, 0, 0, $bg);

        // Bottom half darker
        imagefilledrectangle($img, 0, (int) ($height * 0.6), $width, $height, $accent);

        // Draw a simple bottle silhouette in center
        $this->drawBottleSilhouette($img, $width, $height);

        // Text overlay
        $white = imagecolorallocate($img, 255, 255, 255);
        $lightGray = imagecolorallocatealpha($img, 255, 255, 255, 60);

        // Material badge (top-left)
        $materialLabel = strtoupper($material);
        $fontSize = max(2, min(4, (int) ($width / 120)));
        imagestring($img, $fontSize, 10, 8, $materialLabel, $white);

        // Image number badge (top-right)
        $numLabel = "IMG {$imageNum}/3";
        $numWidth = imagefontwidth($fontSize) * strlen($numLabel);
        imagestring($img, $fontSize, $width - $numWidth - 10, 8, $numLabel, $lightGray);

        // Product title (bottom center)
        $titleFontSize = max(2, min(5, (int) ($width / 90)));
        $lines = $this->wrapText($title, (int) ($width / (imagefontwidth($titleFontSize) + 1)));
        $lineHeight = imagefontheight($titleFontSize) + 3;
        $startY = $height - (count($lines) * $lineHeight) - 15;

        foreach ($lines as $idx => $line) {
            $lineWidth = imagefontwidth($titleFontSize) * strlen($line);
            $x = (int) (($width - $lineWidth) / 2);
            $y = $startY + ($idx * $lineHeight);
            imagestring($img, $titleFontSize, $x, $y, $line, $white);
        }

        // "DEMO" watermark (center, semi-transparent)
        $demoColor = imagecolorallocatealpha($img, 255, 255, 255, 90);
        $demoText = "DEMO";
        $demoFontSize = 5;
        $demoWidth = imagefontwidth($demoFontSize) * strlen($demoText);
        imagestring($img, $demoFontSize, (int) (($width - $demoWidth) / 2), (int) ($height / 2) - 8, $demoText, $demoColor);

        // Encode to WebP
        ob_start();
        imagewebp($img, null, 80);
        $data = ob_get_clean();
        imagedestroy($img);

        return $data;
    }

    private function drawBottleSilhouette(\GdImage $img, int $width, int $height): void
    {
        $white = imagecolorallocatealpha($img, 255, 255, 255, 100);

        // Simple bottle shape
        $cx = (int) ($width / 2);
        $bodyW = (int) ($width * 0.22);
        $bodyH = (int) ($height * 0.35);
        $bodyTop = (int) ($height * 0.32);
        $neckW = (int) ($width * 0.08);
        $neckH = (int) ($height * 0.12);

        // Body (rounded rectangle approximation)
        imagefilledrectangle(
            $img,
            $cx - $bodyW,
            $bodyTop,
            $cx + $bodyW,
            $bodyTop + $bodyH,
            $white
        );

        // Neck
        imagefilledrectangle(
            $img,
            $cx - $neckW,
            $bodyTop - $neckH,
            $cx + $neckW,
            $bodyTop,
            $white
        );

        // Cap
        $capW = (int) ($neckW * 1.3);
        $capH = (int) ($neckH * 0.35);
        imagefilledrectangle(
            $img,
            $cx - $capW,
            $bodyTop - $neckH - $capH,
            $cx + $capW,
            $bodyTop - $neckH,
            $white
        );
    }

    private function wrapText(string $text, int $maxChars): array
    {
        if (strlen($text) <= $maxChars) {
            return [$text];
        }

        $words = explode(' ', $text);
        $lines = [];
        $current = '';

        foreach ($words as $word) {
            if ($current === '') {
                $current = $word;
            } elseif (strlen($current . ' ' . $word) <= $maxChars) {
                $current .= ' ' . $word;
            } else {
                $lines[] = $current;
                $current = $word;
            }
        }

        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines;
    }
}
