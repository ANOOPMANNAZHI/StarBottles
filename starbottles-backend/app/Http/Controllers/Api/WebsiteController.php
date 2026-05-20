<?php

namespace App\Http\Controllers\Api;

use App\Models\Banner;
use App\Models\Milestone;
use App\Models\PageContent;
use App\Models\SeoMetadata;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class WebsiteController extends BaseApiController
{
    public function banners(): JsonResponse
    {
        $banners = Banner::active()->ordered()->get()->map(fn ($b) => [
            'id'                 => $b->id,
            'title'              => $b->title,
            'subtitle'           => $b->subtitle,
            'eyebrow'            => $b->eyebrow,
            'image_url'          => $b->image_url,
            'cta_text'           => $b->cta_text,
            'cta_url'            => $b->cta_url,
            'cta_secondary_text' => $b->cta_secondary_text,
            'cta_secondary_url'  => $b->cta_secondary_url,
        ]);

        return $this->successResponse($banners);
    }

    public function settings(): JsonResponse
    {
        $settings = SiteSetting::all()->pluck('value', 'key');

        return $this->successResponse($settings);
    }

    public function page(string $slug): JsonResponse
    {
        $sections = PageContent::forPage($slug)->get()
            ->pluck('content', 'section_key');

        return $this->successResponse($sections);
    }

    public function seo(string $slug): JsonResponse
    {
        $seo = SeoMetadata::where('page_slug', $slug)->first();

        if (!$seo) {
            return $this->successResponse(null);
        }

        return $this->successResponse([
            'meta_title'       => $seo->meta_title,
            'meta_description' => $seo->meta_description,
            'og_image_url'     => $seo->og_image_url,
            'extra_head_tags'  => $seo->extra_head_tags,
        ]);
    }

    public function testimonials(): JsonResponse
    {
        $testimonials = Testimonial::active()->ordered()->get()->map(fn($t) => [
            'id'       => $t->id,
            'quote'    => $t->quote,
            'name'     => $t->name,
            'business' => $t->business,
            'location' => $t->location,
            'metric'   => $t->metric,
            'initials' => $t->initials,
            'rating'   => $t->rating,
        ]);

        return $this->successResponse($testimonials);
    }

    public function companyStats(): JsonResponse
    {
        $setting = SiteSetting::where('key', 'company_stats')->first();
        $stats = $setting ? json_decode($setting->value, true) : [];

        return $this->successResponse($stats);
    }

    public function milestones(): JsonResponse
    {
        $milestones = Milestone::active()->ordered()->get()->map(fn($m) => [
            'id'          => $m->id,
            'year'        => $m->year,
            'title'       => $m->title,
            'description' => $m->description,
        ]);

        return $this->successResponse($milestones);
    }
}
