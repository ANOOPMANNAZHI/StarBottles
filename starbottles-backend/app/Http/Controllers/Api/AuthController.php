<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends BaseApiController
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $key = 'login.' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return $this->errorResponse('Too many login attempts. Please try again later.', 429, [
                'retry_after' => $seconds,
            ]);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            RateLimiter::hit($key, 60 * 15);

            return $this->errorResponse('Invalid credentials.', 422);
        }

        if (! $user->is_active) {
            return $this->errorResponse(
                'Your account has been deactivated. Contact your administrator.',
                403
            );
        }

        if (! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60 * 15);

            return $this->errorResponse('Invalid credentials.', 422);
        }

        RateLimiter::clear($key);

        $token = $user->createToken('auth-token')->plainTextToken;

        $user->update(['last_login_at' => now()]);

        return $this->successResponse([
            'token'      => $token,
            'token_type' => 'Bearer',
            'user'       => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        $request->user()->update(['last_activity_at' => now()]);

        return $this->successResponse(new UserResource($request->user()));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $request->user()->update($request->only('name', 'phone'));

        return $this->successResponse(
            new UserResource($request->user()->fresh()),
            'Profile updated successfully.'
        );
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($request->current_password, $request->user()->password)) {
            return $this->errorResponse('Current password is incorrect.', 422);
        }

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return $this->successResponse(null, 'Password changed successfully.');
    }
}
