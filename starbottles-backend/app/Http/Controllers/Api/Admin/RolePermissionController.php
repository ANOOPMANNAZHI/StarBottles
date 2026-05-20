<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionController extends BaseApiController
{
    /**
     * List all permissions, grouped by module.
     */
    public function permissions(): JsonResponse
    {
        $groups = [
            'Overview'   => ['dashboard'],
            'Management' => ['users', 'enquiries', 'roles'],
            'Products'   => ['products', 'erp-sync'],
            'Analytics'  => ['reports'],
            'Training'   => ['training-manage', 'training-view'],
            'Quiz'       => ['quiz-manage', 'quiz-view'],
            'Content'    => ['cms'],
        ];

        $labels = [
            'dashboard'       => 'Dashboard',
            'users'           => 'User Management',
            'enquiries'       => 'Enquiry Management',
            'products'        => 'Product Management',
            'erp-sync'        => 'ERP Synchronization',
            'reports'         => 'Reports & Analytics',
            'training-manage' => 'Manage Training Materials',
            'training-view'   => 'View Training Materials',
            'quiz-manage'     => 'Manage Quizzes',
            'quiz-view'       => 'View & Attempt Quizzes',
            'cms'             => 'Website CMS',
            'roles'           => 'Roles & Access',
        ];

        $result = [];
        foreach ($groups as $group => $perms) {
            $result[] = [
                'group'       => $group,
                'permissions' => array_map(fn($p) => [
                    'name'  => $p,
                    'label' => $labels[$p] ?? $p,
                ], $perms),
            ];
        }

        return $this->successResponse($result);
    }

    /**
     * List all roles with their permissions and user counts.
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')
            ->orderBy('name')
            ->get()
            ->sortBy(function ($role) {
                $order = ['admin' => 0, 'executive' => 1, 'trainee' => 2];
                return $order[$role->name] ?? 3;
            })
            ->values();

        $data = $roles->map(function (Role $role) {
            return [
                'id'          => $role->id,
                'name'        => $role->name,
                'is_default'  => in_array($role->name, ['admin', 'executive', 'trainee']),
                'permissions' => $role->permissions->pluck('name')->values(),
                'users_count' => User::where('role', $role->name)->count(),
            ];
        });

        return $this->successResponse($data);
    }

    /**
     * Create a new role.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:50', 'regex:/^[a-z][a-z0-9-]*$/', Rule::unique('roles', 'name')],
            'permissions'   => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ], [
            'name.regex' => 'Role name must be lowercase with hyphens only (e.g. sales-manager).',
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($data['permissions']);

        return $this->successResponse([
            'id'          => $role->id,
            'name'        => $role->name,
            'is_default'  => false,
            'permissions' => $role->permissions->pluck('name')->values(),
            'users_count' => 0,
        ], 'Role created', 201);
    }

    /**
     * Update a role's permissions (and optionally name for custom roles).
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $isDefault = in_array($role->name, ['admin', 'executive', 'trainee']);

        $rules = [
            'permissions'   => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];

        // Only custom roles can be renamed
        if (!$isDefault) {
            $rules['name'] = [
                'sometimes', 'string', 'max:50', 'regex:/^[a-z][a-z0-9-]*$/',
                Rule::unique('roles', 'name')->ignore($role->id),
            ];
        }

        $data = $request->validate($rules);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Admin always keeps all permissions
        if ($role->name === 'admin') {
            $allPerms = Permission::pluck('name')->toArray();
            $role->syncPermissions($allPerms);

            return $this->successResponse([
                'id'          => $role->id,
                'name'        => $role->name,
                'is_default'  => true,
                'permissions' => $role->permissions->pluck('name')->values(),
                'users_count' => User::where('role', $role->name)->count(),
            ], 'Admin role always has all permissions.');
        }

        if (!$isDefault && isset($data['name'])) {
            // Update user role column for all users with old role name
            User::where('role', $role->name)->update(['role' => $data['name']]);
            $role->update(['name' => $data['name']]);
        }

        $role->syncPermissions($data['permissions']);

        return $this->successResponse([
            'id'          => $role->id,
            'name'        => $role->name,
            'is_default'  => $isDefault,
            'permissions' => $role->permissions->pluck('name')->values(),
            'users_count' => User::where('role', $role->name)->count(),
        ], 'Role updated');
    }

    /**
     * Delete a custom role (only if no users are assigned).
     */
    public function destroy(Role $role): JsonResponse
    {
        if (in_array($role->name, ['admin', 'executive', 'trainee'])) {
            return $this->errorResponse('Default roles cannot be deleted.', 422);
        }

        $usersCount = User::where('role', $role->name)->count();
        if ($usersCount > 0) {
            return $this->errorResponse(
                "Cannot delete role — {$usersCount} user(s) still assigned.",
                422
            );
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $role->syncPermissions([]);
        $role->delete();

        return $this->successResponse(null, 'Role deleted');
    }
}
