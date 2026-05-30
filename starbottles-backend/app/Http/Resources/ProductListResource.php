<?php

namespace App\Http\Resources;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'erp_id'         => $this->erp_id,
            'item_code'      => $this->item_code,
            'title'          => $this->title,
            'display_name'   => $this->display_name,
            'category'       => $this->whenLoaded('category', fn() => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
            ]),
            'material'       => $this->material,
            'capacity'       => $this->capacity,
            'brand'          => $this->brand,
            'stock_uom'      => $this->stock_uom,
            'classification' => $this->classification,
            'is_featured'    => $this->is_featured,
            'is_hidden'      => $this->is_hidden,
            'first_image'    => $this->first_image ?? $this->cloudflareImage(1),
            'share_url'      => rtrim(SiteSetting::getValue('b2b_base_url', url('')), '/') . '/products/' . ($this->slug ?? $this->id),
        ];
    }
}
