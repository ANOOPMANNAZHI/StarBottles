<?php

namespace App\Http\Resources;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'erp_id'         => $this->erp_id,
            'item_code'      => $this->item_code,
            'title'          => $this->title,
            'display_name'   => $this->display_name,
            'slug'           => $this->slug,
            'description'        => $this->description,
            'custom_description' => $this->custom_description,
            'category'       => $this->whenLoaded('category', fn() => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'material'       => $this->material,
            'capacity'       => $this->capacity,
            'neck_size'      => $this->neck_size,
            'shape_type'     => $this->shape_type,
            'brand'          => $this->brand,
            'stock_uom'      => $this->stock_uom,
            'classification' => $this->classification,
            'color'          => $this->color,
            'weight'         => $this->weight,
            'total_height'   => $this->total_height,
            'box_quantity'   => $this->box_quantity,
            'label_area'      => $this->label_area,
            'retail_price'    => $this->retail_price ? (float) $this->retail_price : null,
            'wholesale_price' => $this->wholesale_price ? (float) $this->wholesale_price : null,
            'image_url'       => $this->image_url,
            'is_featured'    => $this->is_featured,
            'is_hidden'      => $this->is_hidden,
            'is_active'      => $this->is_active,
            'first_image'    => $this->first_image ?? $this->cloudflareImage(1),
            'images'         => $this->images ?: $this->cloudflareImages(),
            'video_url'      => $this->video_url,
            'synced_at'      => $this->synced_at?->toIso8601String(),
            'created_at'     => $this->created_at?->toIso8601String(),
            'updated_at'     => $this->updated_at?->toIso8601String(),
            'variations'     => $this->whenLoaded('variations', fn() =>
                $this->variations->map(fn($v) => [
                    'attribute_name'  => $v->attribute_name,
                    'attribute_value' => $v->attribute_value,
                ])
            ),
            'share_url'      => rtrim(SiteSetting::getValue('b2b_base_url', url('')), '/') . '/products/' . ($this->slug ?? $this->id),
        ];
    }
}
