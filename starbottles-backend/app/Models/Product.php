<?php

namespace App\Models;

use App\Services\ImageProcessingService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'erp_id',
        'item_code',
        'title',
        'display_name',
        'slug',
        'description',
        'custom_description',
        'category_id',
        'material',
        'capacity',
        'neck_size',
        'shape_type',
        'brand',
        'stock_uom',
        'classification',
        'image_url',
        'color',
        'weight',
        'total_height',
        'box_quantity',
        'label_area',
        'is_active',
        'is_featured',
        'is_hidden',
        'video_url',
        'synced_at',
    ];

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (empty($product->slug) && $product->title) {
                $base = Str::slug($product->title);
                $slug = $base;
                $i = 2;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$i}";
                    $i++;
                }
                $product->slug = $slug;
            }
        });

        static::updating(function (Product $product) {
            if ($product->isDirty('title') && $product->title) {
                $base = Str::slug($product->title);
                $slug = $base;
                $i = 2;
                while (static::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                    $slug = "{$base}-{$i}";
                    $i++;
                }
                $product->slug = $slug;
            }
        });
    }

    /**
     * Returns display_name if set, otherwise falls back to title.
     * Sync never touches display_name, so it's always preserved across re-syncs.
     */
    public function getResolvedDisplayNameAttribute(): string
    {
        return $this->display_name ?? $this->title ?? '';
    }

    /**
     * Returns custom_description if set, otherwise falls back to ERP description.
     * Sync never touches custom_description, so it's always preserved across re-syncs.
     */
    public function getResolvedDescriptionAttribute(): ?string
    {
        return $this->custom_description ?? $this->description;
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_hidden' => 'boolean',
            'synced_at' => 'datetime',
        ];
    }

    private ?array $cachedImages = null;

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function variations()
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function enquiries()
    {
        return $this->hasMany(Enquiry::class);
    }

    public function views()
    {
        return $this->hasMany(ProductView::class);
    }

    public function scopeVisible($query)
    {
        return $query->where('is_hidden', false)->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Get structured image data from filesystem.
     */
    public function getImagesAttribute(): array
    {
        if ($this->cachedImages !== null) {
            return $this->cachedImages;
        }

        if (!$this->erp_id) {
            return $this->cachedImages = [];
        }

        $service = app(ImageProcessingService::class);
        return $this->cachedImages = $service->getProductImages($this->erp_id);
    }

    /**
     * Get the card-size URL of the first image.
     */
    public function getFirstImageAttribute(): ?string
    {
        $images = $this->images;
        return $images[0]['card'] ?? null;
    }

    /**
     * Build a Cloudflare R2 image URL for this product.
     */
    public function cloudflareImage(int $index = 1): ?string
    {
        $base = rtrim(config('services.cloudflare_images_url', ''), '/');
        $sku  = $this->item_code ?? '';
        return ($base && $sku) ? "{$base}/{$sku}/{$index}.jpg" : null;
    }

    /**
     * Return all 3 Cloudflare images in the same shape as ImageProcessingService.
     */
    public function cloudflareImages(): array
    {
        $base = rtrim(config('services.cloudflare_images_url', ''), '/');
        $sku  = $this->item_code ?? '';
        if (!$base || !$sku) return [];
        return array_map(fn($i) => [
            'thumb'    => "{$base}/{$sku}/{$i}.jpg",
            'card'     => "{$base}/{$sku}/{$i}.jpg",
            'detail'   => "{$base}/{$sku}/{$i}.jpg",
            'original' => "{$base}/{$sku}/{$i}.jpg",
        ], [1, 2, 3]);
    }
}
