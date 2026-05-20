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
        Schema::table('banners', function (Blueprint $table) {
            $table->string('eyebrow', 255)->nullable()->after('subtitle');
            $table->string('cta_secondary_text', 100)->nullable()->after('cta_url');
            $table->string('cta_secondary_url', 255)->nullable()->after('cta_secondary_text');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['eyebrow', 'cta_secondary_text', 'cta_secondary_url']);
        });
    }
};
