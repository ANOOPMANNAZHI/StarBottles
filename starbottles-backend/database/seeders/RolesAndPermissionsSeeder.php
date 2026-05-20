<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create all permissions
        $allPerms = [
            'dashboard', 'users', 'enquiries', 'reports',
            'training-manage', 'training-view', 'quiz-view',
            'products', 'catalogue', 'erp-sync', 'roles', 'cms',
        ];
        foreach ($allPerms as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Create roles and assign permissions
        $admin = Role::firstOrCreate(['name' => 'admin']);

        $executive = Role::firstOrCreate(['name' => 'executive']);
        $executive->syncPermissions([
            'dashboard', 'enquiries', 'reports', 'training-view', 'quiz-view', 'products',
        ]);

        $trainee = Role::firstOrCreate(['name' => 'trainee']);
        $trainee->syncPermissions([
            'dashboard', 'training-view', 'quiz-view',
        ]);
    }
}
