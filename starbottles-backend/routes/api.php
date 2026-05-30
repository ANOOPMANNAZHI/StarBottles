<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EnquiryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\TrainingController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\Admin\CmsBannerController;
use App\Http\Controllers\Api\Admin\CmsMediaController;
use App\Http\Controllers\Api\Admin\CmsMilestoneController;
use App\Http\Controllers\Api\Admin\CmsPageContentController;
use App\Http\Controllers\Api\Admin\CmsSeoController;
use App\Http\Controllers\Api\Admin\CmsSiteSettingController;
use App\Http\Controllers\Api\Admin\CmsTestimonialController;
use App\Http\Controllers\Api\Admin\CatalogueController;
use App\Http\Controllers\Api\Admin\ErpSyncController;
use App\Http\Controllers\Api\Admin\ProductCategoryController;
use App\Http\Controllers\Api\Admin\ProductDisplayNameController;
use App\Http\Controllers\Api\Admin\ProductImageController;
use App\Http\Controllers\Api\Admin\ProductVisibilityController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\RolePermissionController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\WebsiteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — /api/v1/...
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Public routes (no auth) ──────────────────────────────────────────
    Route::middleware('throttle:6,1')->post('/auth/login', [AuthController::class, 'login']);

    // Products (public)
    Route::get('/products',                        [ProductController::class, 'index']);
    Route::get('/products/categories',             [ProductController::class, 'categories']);
    Route::get('/products/categories/featured',    [ProductController::class, 'featuredCategories']);
    Route::get('/products/{product}',              [ProductController::class, 'show']);

    // Catalogue (public)
    Route::get('/catalogue/current',  [CatalogueController::class, 'current']);
    Route::get('/catalogues/active',  [CatalogueController::class, 'active']);

    // Enquiry submission (public)
    Route::post('/enquiries', [EnquiryController::class, 'store']);

    // WhatsApp webhooks (public, outside all auth/CSRF)
    Route::get('/webhooks/whatsapp',  [WebhookController::class, 'verify']);
    Route::post('/webhooks/whatsapp', [WebhookController::class, 'receive']);

    // Public website CMS endpoints
    Route::prefix('website')->group(function () {
        Route::get('/banners',        [WebsiteController::class, 'banners']);
        Route::get('/settings',       [WebsiteController::class, 'settings']);
        Route::get('/pages/{slug}',   [WebsiteController::class, 'page']);
        Route::get('/seo/{slug}',     [WebsiteController::class, 'seo']);
        Route::get('/testimonials',   [WebsiteController::class, 'testimonials']);
        Route::get('/company-stats',  [WebsiteController::class, 'companyStats']);
        Route::get('/milestones',     [WebsiteController::class, 'milestones']);
    });

    // B2B website product endpoints (full field mapping for public website)
    Route::prefix('b2b')->group(function () {
        Route::get('/products',              [ProductController::class, 'b2bIndex']);
        Route::get('/products/{product:slug}', [ProductController::class, 'b2bShow']);
    });

    // ── Authenticated routes ─────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'active', 'throttle:60,1'])->group(function () {

        Route::post('/auth/logout',          [AuthController::class, 'logout']);
        Route::get('/auth/me',              [AuthController::class, 'me']);
        Route::put('/auth/profile',         [AuthController::class, 'updateProfile']);
        Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

        // ── Notifications ─────────────────────────────────────────────
        Route::get('/notifications',                [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count',   [NotificationController::class, 'unreadCount']);
        Route::patch('/notifications/{id}/read',    [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}',        [NotificationController::class, 'destroy']);

        // ── User management (permission: users) ────────────────────────
        Route::middleware('can:users')->group(function () {
            Route::get('/users',                         [UserController::class, 'index']);
            Route::post('/users',                        [UserController::class, 'store']);
            Route::put('/users/{user}',                  [UserController::class, 'update']);
            Route::patch('/users/{user}/toggle-active',  [UserController::class, 'toggleActive']);
            Route::post('/users/{user}/reset-password',  [UserController::class, 'resetPassword']);
        });

        // ── Catalogue management (permission: catalogue) ──────────────
        Route::middleware('can:catalogue')->group(function () {
            Route::get('/catalogues',                              [CatalogueController::class, 'index']);
            Route::post('/catalogues',                             [CatalogueController::class, 'store']);
            Route::patch('/catalogues/{catalogue}/toggle-active',   [CatalogueController::class, 'toggleActive']);
            Route::delete('/catalogues/{catalogue}',               [CatalogueController::class, 'destroy']);
        });

        // ── ERP sync (permission: erp-sync) ────────────────────────────
        Route::middleware('can:erp-sync')->group(function () {
            Route::get('/erp/sync-status',       [ErpSyncController::class, 'status']);
            Route::get('/erp/sync-progress',     [ErpSyncController::class, 'syncProgress']);
            Route::post('/erp/sync',              [ErpSyncController::class, 'trigger']);
            Route::post('/erp/sync-categories',   [ErpSyncController::class, 'syncCategories']);
            Route::get('/erp/settings',           [ErpSyncController::class, 'settings']);
            Route::put('/erp/settings',           [ErpSyncController::class, 'updateSettings']);
            Route::post('/erp/full-resync',        [ErpSyncController::class, 'fullResync']);
        });

        // ── Product management (permission: products) ──────────────────
        Route::middleware('can:products')->group(function () {
            Route::get('/product-categories',                               [ProductCategoryController::class, 'index']);
            Route::patch('/product-categories/{productCategory}/feature',   [ProductCategoryController::class, 'toggleFeatured']);
            Route::delete('/product-categories/{productCategory}',          [ProductCategoryController::class, 'destroy']);
            Route::patch('/products/bulk',                        [ProductVisibilityController::class, 'bulkUpdate']);
            Route::post('/products/bulk-reset-display-name',      [ProductDisplayNameController::class, 'bulkReset']);
            Route::post('/products/import-display-names',         [ProductDisplayNameController::class, 'import']);
            Route::patch('/products/{product}/hide',              [ProductVisibilityController::class, 'toggleHidden']);
            Route::patch('/products/{product}/feature',           [ProductVisibilityController::class, 'toggleFeatured']);
            Route::patch('/products/{product}/display-name',      [ProductDisplayNameController::class, 'update']);
            Route::patch('/products/{product}/description',       [ProductDisplayNameController::class, 'updateDescription']);
            Route::get('/products/{product}/images',              [ProductImageController::class, 'index']);
            Route::post('/products/{product}/images',             [ProductImageController::class, 'store']);
            Route::delete('/products/{product}/images/{index}',   [ProductImageController::class, 'destroy']);
        });

        // ── Enquiry management (permission: enquiries) ─────────────────
        Route::middleware('can:enquiries')->group(function () {
            Route::get('/enquiries',                          [EnquiryController::class, 'index']);
            Route::get('/enquiries/{enquiry}',               [EnquiryController::class, 'show']);
            Route::patch('/enquiries/{enquiry}/status',      [EnquiryController::class, 'updateStatus']);
            Route::post('/enquiries/{enquiry}/notes',        [EnquiryController::class, 'addNote']);
        });

        // Enquiry assignment (admin only — needs users permission too)
        Route::middleware('can:users')->group(function () {
            Route::post('/enquiries/{enquiry}/assign',       [EnquiryController::class, 'assign']);
        });

        // ── Training management (permission: training-manage) ──────────
        Route::middleware('can:training-manage')->group(function () {
            Route::post('/training/materials',                    [TrainingController::class, 'uploadMaterial']);
            Route::delete('/training/materials/{material}',       [TrainingController::class, 'deleteMaterial']);
            Route::put('/training/company-info/{key}',            [TrainingController::class, 'updateCompanyInfo']);
        });

        // ── Training view (permission: training-view) ──────────────────
        Route::middleware('can:training-view')->group(function () {
            Route::get('/training/materials',    [TrainingController::class, 'materials']);
            Route::get('/training/company-info', [TrainingController::class, 'companyInfo']);
        });

        // ── Reports (permission: reports) ──────────────────────────────
        Route::middleware('can:reports')->group(function () {
            Route::get('/reports/enquiries',             [ReportController::class, 'enquiries']);
            Route::get('/reports/executive-performance', [ReportController::class, 'executivePerformance']);
            Route::get('/reports/product-interest',      [ReportController::class, 'productInterest']);
            Route::get('/reports/export',                [ReportController::class, 'export']);
        });

        // ── Quiz management (permission: quiz-manage) ──────────────────
        Route::middleware('can:quiz-manage')->group(function () {
            Route::get('/quiz-tests',                             [QuizController::class, 'index']);
            Route::post('/quiz-tests',                            [QuizController::class, 'store']);
            Route::post('/quiz-tests/{quiz}/assign',              [QuizController::class, 'assign']);
            Route::get('/quiz-tests/{quiz}/results',              [QuizController::class, 'results']);
            Route::post('/quiz-attempts/{attempt}/approve-retake',[QuizController::class, 'approveRetake']);
        });

        // ── Quiz view & attempt (permission: quiz-view) ────────────────
        Route::middleware('can:quiz-view')->group(function () {
            Route::get('/my-quizzes',                    [QuizController::class, 'myQuizzes']);
            Route::get('/quiz-tests/{quiz}',             [QuizController::class, 'show']);
            Route::get('/quiz-tests/{quiz}/review',      [QuizController::class, 'review']);
            Route::post('/quiz-tests/{quiz}/attempt',    [QuizController::class, 'attempt']);
        });

        // ── CMS (permission: cms) ──────────────────────────────────────
        Route::middleware('can:cms')->prefix('cms')->group(function () {
            Route::get('/media',                [CmsMediaController::class, 'index']);
            Route::post('/media',               [CmsMediaController::class, 'store']);
            Route::patch('/media/{medium}',     [CmsMediaController::class, 'update']);
            Route::delete('/media/{medium}',    [CmsMediaController::class, 'destroy']);

            Route::get('/banners',              [CmsBannerController::class, 'index']);
            Route::post('/banners',             [CmsBannerController::class, 'store']);
            Route::post('/banners/reorder',     [CmsBannerController::class, 'reorder']);
            Route::post('/banners/{banner}',    [CmsBannerController::class, 'update']);
            Route::delete('/banners/{banner}',  [CmsBannerController::class, 'destroy']);

            Route::get('/settings',             [CmsSiteSettingController::class, 'index']);
            Route::put('/settings',             [CmsSiteSettingController::class, 'bulkUpdate']);

            Route::get('/pages',                [CmsPageContentController::class, 'index']);
            Route::get('/pages/{slug}',         [CmsPageContentController::class, 'show']);
            Route::put('/pages/{slug}',         [CmsPageContentController::class, 'update']);

            Route::get('/seo',                  [CmsSeoController::class, 'index']);
            Route::put('/seo/{slug}',           [CmsSeoController::class, 'update']);

            Route::get('/testimonials',                     [CmsTestimonialController::class, 'index']);
            Route::post('/testimonials',                    [CmsTestimonialController::class, 'store']);
            Route::post('/testimonials/reorder',            [CmsTestimonialController::class, 'reorder']);
            Route::put('/testimonials/{testimonial}',       [CmsTestimonialController::class, 'update']);
            Route::delete('/testimonials/{testimonial}',    [CmsTestimonialController::class, 'destroy']);

            Route::get('/milestones',                       [CmsMilestoneController::class, 'index']);
            Route::post('/milestones',                      [CmsMilestoneController::class, 'store']);
            Route::post('/milestones/reorder',              [CmsMilestoneController::class, 'reorder']);
            Route::put('/milestones/{milestone}',           [CmsMilestoneController::class, 'update']);
            Route::delete('/milestones/{milestone}',        [CmsMilestoneController::class, 'destroy']);
        });

        // ── Roles & Access (permission: roles) ─────────────────────────
        Route::middleware('can:roles')->group(function () {
            Route::get('/roles',              [RolePermissionController::class, 'index']);
            Route::post('/roles',             [RolePermissionController::class, 'store']);
            Route::put('/roles/{role}',       [RolePermissionController::class, 'update']);
            Route::delete('/roles/{role}',    [RolePermissionController::class, 'destroy']);
            Route::get('/permissions',        [RolePermissionController::class, 'permissions']);
        });
    });
});
