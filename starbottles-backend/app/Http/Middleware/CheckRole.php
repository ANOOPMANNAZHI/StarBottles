<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole($roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You do not have the required role to access this resource.',
                'errors'  => [],
            ], 403);
        }

        return $next($request);
    }
}
