<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProductCategory extends Model
{
    protected $fillable = ['name', 'slug', 'parent_id', 'erp_name', 'tagline', 'image_path', 'color', 'display_order', 'is_featured'];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_featured'   => 'boolean',
        ];
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) return null;
        if (str_starts_with($this->image_path, 'http')) return $this->image_path;
        return Storage::disk('public')->url($this->image_path);
    }
}
