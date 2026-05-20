<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index('brand', 'products_brand_idx');
            $table->index('classification', 'products_classification_idx');
            $table->index('item_code', 'products_item_code_idx');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_brand_idx');
            $table->dropIndex('products_classification_idx');
            $table->dropIndex('products_item_code_idx');
        });
    }
};
