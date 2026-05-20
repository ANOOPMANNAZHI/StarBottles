<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('color')->nullable()->after('shape_type');
            $table->string('weight')->nullable()->after('color');
            $table->string('total_height')->nullable()->after('weight');
            $table->string('box_quantity')->nullable()->after('total_height');
            $table->string('label_area')->nullable()->after('box_quantity');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['color', 'weight', 'total_height', 'box_quantity', 'label_area']);
        });
    }
};
