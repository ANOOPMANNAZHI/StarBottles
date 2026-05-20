<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role'   => \App\Http\Middleware\CheckRole::class,
            'can'    => \App\Http\Middleware\CheckPermission::class,
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
        ]);
        $middleware->appendToGroup('api', \App\Http\Middleware\SecurityHeaders::class);

        // Prevent "Route [login] not defined" — this is an API-only app
        $middleware->redirectGuestsTo('/');
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('erp:sync')
            ->everySixHours()
            ->withoutOverlapping()
            ->onFailure(fn () => Log::error('Scheduled ERP sync failed'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        });
    })->create();
