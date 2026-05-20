<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class TestRoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (['admin', 'executive', 'trainee'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $users = [
            ['name' => 'Test Admin',     'email' => 'admin@test.com',   'password' => 'Admin@123',   'role' => 'admin'],
            ['name' => 'Test Exec 1',    'email' => 'exec1@test.com',   'password' => 'Exec@123',    'role' => 'executive'],
            ['name' => 'Test Exec 2',    'email' => 'exec2@test.com',   'password' => 'Exec@123',    'role' => 'executive'],
            ['name' => 'Test Trainee',   'email' => 'trainee@test.com', 'password' => 'Trainee@123', 'role' => 'trainee'],
        ];

        foreach ($users as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'      => $data['name'],
                    'password'  => Hash::make($data['password']),
                    'role'      => $data['role'],
                    'is_active' => true,
                ]
            );
            $user->syncRoles([$data['role']]);
        }
    }
}
