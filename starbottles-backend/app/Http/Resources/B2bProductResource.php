<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Maps the internal Product model to the shape expected by the starbottles-b2b
 * Next.js frontend. Uses product ID as the URL slug identifier.
 */
class B2bProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Build image URLs from Cloudflare R2 using SKU-based folder structure:
        // {CLOUDFLARE_IMAGES_URL}/{item_code}/1.jpg, /2.jpg, /3.jpg
        $cfBase = rtrim(config('services.cloudflare_images_url', ''), '/');
        $sku    = $this->item_code ?? '';

        if ($cfBase && $sku) {
            $mainImage = "{$cfBase}/{$sku}/1.jpg";
            $gallery   = [
                "{$cfBase}/{$sku}/1.jpg",
                "{$cfBase}/{$sku}/2.jpg",
                "{$cfBase}/{$sku}/3.jpg",
            ];
        } else {
            // Fallback: local filesystem images (admin-uploaded)
            $images    = $this->images ?? [];
            $allUrls   = array_filter(array_map(fn($img) => $img['card'] ?? $img['full'] ?? null, $images));
            $mainImage = $this->first_image ?? array_shift($allUrls) ?? '';
            $gallery   = array_values(array_filter($allUrls));
        }

        // Map variations to specs [{label, value}]
        $specs = $this->whenLoaded('variations', fn() =>
            $this->variations->map(fn($v) => [
                'label' => $v->attribute_name,
                'value' => $v->attribute_value,
            ])->values()->all()
        , []);

        return [
            'id'              => $this->id,
            'slug'            => $this->slug ?? (string) $this->id,
            'name'            => $this->display_name ?? $this->title ?? '',
            'item_code'       => $this->item_code ?? '',
            'category'        => $this->whenLoaded('category', fn() => $this->category->name ?? '', ''),
            'description'     => $this->description ?? '',
            'longDescription' => $this->description ?? '',
            'material'        => $this->material ?? '',
            'capacity'        => $this->capacity ?? '',
            'sizes'           => $this->capacity ? [$this->capacity] : [],
            'neck_size'       => $this->neck_size ?? '',
            'shape'           => $this->shape_type ?? '',
            'color'           => $this->color ?? '',
            'weight'          => $this->weight ?? '',
            'total_height'    => $this->total_height ?? '',
            'label_area'      => $this->label_area ?? '',
            'moq'             => '',
            'tag'             => $this->is_featured ? 'Best Seller' : '',
            'featured'        => (bool) $this->is_featured,
            'image'           => $mainImage,
            'gallery'         => $gallery,
            'features'        => [],
            'applications'    => [],
            'specs'           => $specs,
        ];
    }
}
