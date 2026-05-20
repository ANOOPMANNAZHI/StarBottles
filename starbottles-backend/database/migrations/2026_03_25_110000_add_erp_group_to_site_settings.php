<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            // MySQL: expand the group enum to include 'erp'
            DB::statement("ALTER TABLE site_settings MODIFY COLUMN `group` ENUM('general','contact','social','footer','erp') DEFAULT 'general'");
        } else {
            // SQLite: recreate column without enum constraint (SQLite doesn't support ALTER COLUMN)
            Schema::table('site_settings', function (Blueprint $table) {
                $table->string('group_new')->default('general')->after('group');
            });

            DB::table('site_settings')->update(['group_new' => DB::raw('`group`')]);

            Schema::table('site_settings', function (Blueprint $table) {
                $table->dropColumn('group');
            });

            Schema::table('site_settings', function (Blueprint $table) {
                $table->renameColumn('group_new', 'group');
            });
        }

        // Seed ERP settings with values from current .env
        $settings = [
            ['key' => 'erp_base_url',       'value' => env('ERP_BASE_URL', ''),              'type' => 'text',  'group' => 'erp'],
            ['key' => 'erp_api_key',         'value' => env('ERP_API_KEY', ''),               'type' => 'text',  'group' => 'erp'],
            ['key' => 'erp_api_secret',      'value' => env('ERP_API_SECRET', ''),            'type' => 'text',  'group' => 'erp'],
            ['key' => 'erp_company',         'value' => env('ERP_COMPANY', 'Star Bottles'),   'type' => 'text',  'group' => 'erp'],
            ['key' => 'erp_use_mock',        'value' => env('ERP_USE_MOCK', true) ? '1' : '0', 'type' => 'text', 'group' => 'erp'],
            ['key' => 'erp_page_size',       'value' => (string) env('ERP_PAGE_SIZE', 100),   'type' => 'text',  'group' => 'erp'],
            ['key' => 'erp_sync_interval',   'value' => (string) env('ERP_SYNC_INTERVAL', 6), 'type' => 'text',  'group' => 'erp'],
        ];

        $now = now();
        foreach ($settings as &$s) {
            $s['created_at'] = $now;
            $s['updated_at'] = $now;
        }

        DB::table('site_settings')->insert($settings);
    }

    public function down(): void
    {
        DB::table('site_settings')->where('group', 'erp')->delete();

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE site_settings MODIFY COLUMN `group` ENUM('general','contact','social','footer') DEFAULT 'general'");
        }
    }
};
