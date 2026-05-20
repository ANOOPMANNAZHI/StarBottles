<?php

namespace App\Providers;

use App\Models\Enquiry;
use App\Policies\EnquiryPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Enquiry::class, EnquiryPolicy::class);
    }
}
