<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyInfoSection extends Model
{
    protected $fillable = ['section_key', 'title', 'content', 'display_order'];
}
