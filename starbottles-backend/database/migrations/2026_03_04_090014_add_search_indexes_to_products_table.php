<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Fast filter columns
            $table->index(['is_hidden', 'is_active'], 'products_visibility_idx');
            $table->index('is_featured', 'products_featured_idx');
            $table->index('material', 'products_material_idx');
            $table->index('shape_type', 'products_shape_idx');
            $table->index('category_id', 'products_category_idx');
            // B-tree on title for prefix LIKE queries on non-MySQL drivers
            $table->index('title', 'products_title_idx');
        });

        // FULLTEXT index only works on MySQL / MariaDB
        if (DB::getDriverName() === 'mysql') {
            DB::statement(
                'ALTER TABLE products ADD FULLTEXT INDEX products_search_ft (title, description)'
            );
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE products DROP INDEX products_search_ft');
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_visibility_idx');
            $table->dropIndex('products_featured_idx');
            $table->dropIndex('products_material_idx');
            $table->dropIndex('products_shape_idx');
            $table->dropIndex('products_category_idx');
            $table->dropIndex('products_title_idx');
        });
    }
};
