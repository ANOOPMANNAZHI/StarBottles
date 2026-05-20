<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Catalogue extends Model
{
    protected $fillable = ['file_path', 'version', 'uploaded_by', 'is_current'];

    public function getFileUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public static function current(): ?static
    {
        return static::where('is_current', true)->first();
    }
}
