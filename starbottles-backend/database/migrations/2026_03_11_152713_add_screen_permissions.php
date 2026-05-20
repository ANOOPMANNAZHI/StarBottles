<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        // Change role column from enum to varchar so custom roles can be created
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role VARCHAR(50) NOT NULL");
        } else {
            // SQLite: recreate table without the CHECK constraint
            DB::statement('CREATE TABLE users_temp AS SELECT * FROM users');
            DB::statement('DROP TABLE users');
            DB::statement('CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL,
                email VARCHAR NOT NULL UNIQUE,
                phone VARCHAR,
                password VARCHAR NOT NULL,
                role VARCHAR(50) NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                last_login_at TIMESTAMP,
                last_activity_at TIMESTAMP,
                remember_token VARCHAR(100),
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )');
            DB::statement('INSERT INTO users SELECT * FROM users_temp');
            DB::statement('DROP TABLE users_temp');
        }

        // Clear Spatie cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create screen permissions
        $permissions = [
            'dashboard',
            'users',
            'enquiries',
            'products',
            'erp-sync',
            'reports',
            'training-manage',
            'training-view',
            'quiz-manage',
            'quiz-view',
            'cms',
            'roles',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Assign defaults to existing roles
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions($permissions);

        $executive = Role::firstOrCreate(['name' => 'executive', 'guard_name' => 'web']);
        $executive->syncPermissions(['dashboard', 'enquiries', 'training-view', 'quiz-view']);

        $trainee = Role::firstOrCreate(['name' => 'trainee', 'guard_name' => 'web']);
        $trainee->syncPermissions(['dashboard', 'training-view', 'quiz-view']);
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin','executive','trainee') NOT NULL");
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::whereIn('name', [
            'dashboard', 'users', 'enquiries', 'products', 'erp-sync',
            'reports', 'training-manage', 'training-view', 'quiz-manage',
            'quiz-view', 'cms', 'roles',
        ])->delete();
    }
};
