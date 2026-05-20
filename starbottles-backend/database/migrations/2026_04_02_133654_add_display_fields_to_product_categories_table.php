<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->string('tagline', 255)->nullable()->after('erp_name');
            $table->string('image_path', 255)->nullable()->after('tagline');
            $table->string('color', 20)->nullable()->after('image_path');
            $table->unsignedInteger('display_order')->default(0)->after('color');
        });
    }

    public function down(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropColumn(['tagline', 'image_path', 'color', 'display_order']);
        });
    }
};
