<?php

namespace Tests\Traits;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

trait SeedsRolesAndPermissions
{
    protected function seedRolesAndPermissions(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'dashboard', 'users', 'enquiries', 'products', 'erp-sync',
            'reports', 'training-manage', 'training-view', 'quiz-manage',
            'quiz-view', 'cms', 'roles', 'catalogue',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions($permissions);

        $executive = Role::firstOrCreate(['name' => 'executive', 'guard_name' => 'web']);
        $executive->syncPermissions(['dashboard', 'enquiries', 'training-view', 'quiz-view']);

        $trainee = Role::firstOrCreate(['name' => 'trainee', 'guard_name' => 'web']);
        $trainee->syncPermissions(['dashboard', 'training-view', 'quiz-view']);
    }
}
