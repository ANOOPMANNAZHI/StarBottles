<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('title');
        });

        // Generate slugs for existing products
        $products = DB::table('products')->select('id', 'title')->get();
        $usedSlugs = [];

        foreach ($products as $product) {
            $base = Str::slug($product->title ?: 'product');
            $slug = $base;
            $i = 2;
            while (in_array($slug, $usedSlugs)) {
                $slug = "{$base}-{$i}";
                $i++;
            }
            $usedSlugs[] = $slug;
            DB::table('products')->where('id', $product->id)->update(['slug' => $slug]);
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
