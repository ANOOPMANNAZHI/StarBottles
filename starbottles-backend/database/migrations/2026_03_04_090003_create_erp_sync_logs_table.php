<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('status', ['success', 'failed']);
            $table->integer('products_added')->default(0);
            $table->integer('products_updated')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('synced_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_sync_logs');
    }
};
