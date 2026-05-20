<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('item_code')->nullable()->after('erp_id');
            $table->string('brand')->nullable()->after('shape_type');
            $table->string('stock_uom')->nullable()->after('brand');
            $table->string('classification')->nullable()->after('stock_uom');
            $table->string('image_url')->nullable()->after('classification');
        });

        Schema::table('product_categories', function (Blueprint $table) {
            $table->string('erp_name')->nullable()->unique()->after('slug');
        });

        Schema::table('erp_sync_logs', function (Blueprint $table) {
            $table->unsignedInteger('categories_synced')->default(0)->after('products_updated');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['item_code', 'brand', 'stock_uom', 'classification', 'image_url']);
        });

        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropColumn('erp_name');
        });

        Schema::table('erp_sync_logs', function (Blueprint $table) {
            $table->dropColumn('categories_synced');
        });
    }
};
