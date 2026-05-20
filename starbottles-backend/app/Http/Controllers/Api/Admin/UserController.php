<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 20);

        $users = User::with('roles')
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role, fn ($q, $role) =>
                $q->whereHas('roles', fn ($q) => $q->where('name', $role))
            )
            ->when($request->has('is_active'), fn ($q) =>
                $q->where('is_active', (bool) $request->integer('is_active'))
            )
            ->paginate($perPage);

        return $this->paginatedResponse(
            $users->through(fn ($user) => new UserResource($user))
        );
    }

    private function generateCompliantPassword(): string
    {
        // Guarantee: min 8 chars, 1 uppercase, 1 digit
        return 'Temp' . rand(10, 99) . Str::random(4);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $temp = $request->filled('password')
            ? $request->password
            : $this->generateCompliantPassword();

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'phone'     => preg_replace('/\D/', '', $request->phone),
            'role'      => $request->role,
            'password'  => Hash::make($temp),
            'is_active' => true,
        ]);

        $user->assignRole($request->role);

        return $this->successResponse([
            'user'               => new UserResource($user),
            'temporary_password' => $temp,
        ], 'User created successfully.', 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        if (auth()->id() === $user->id && $request->has('role')) {
            return $this->errorResponse('You cannot change your own role.', 403);
        }

        $user->update($request->only(['name', 'phone']));

        if ($request->has('role') && $request->role !== $user->getRoleNames()->first()) {
            $user->syncRoles([$request->role]);
        }

        return $this->successResponse(new UserResource($user->fresh('roles')));
    }

    public function toggleActive(User $user): JsonResponse
    {
        if (auth()->id() === $user->id) {
            return $this->errorResponse('You cannot deactivate your own account.', 403);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return $this->successResponse(new UserResource($user->fresh('roles')));
    }

    public function resetPassword(User $user): JsonResponse
    {
        $temp = $this->generateCompliantPassword();

        $user->update(['password' => Hash::make($temp)]);

        return $this->successResponse([
            'message'            => 'Password reset successfully.',
            'temporary_password' => $temp,
        ]);
    }
}
