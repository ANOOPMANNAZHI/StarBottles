<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\SeoMetadata;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsSeoController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $seo = SeoMetadata::all()->map(fn ($s) => [
            'id'               => $s->id,
            'page_slug'        => $s->page_slug,
            'meta_title'       => $s->meta_title,
            'meta_description' => $s->meta_description,
            'og_image_url'     => $s->og_image_url,
            'extra_head_tags'  => $s->extra_head_tags,
        ]);

        return $this->successResponse($seo);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'meta_title'       => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
            'og_image_path'    => 'nullable|string',
            'extra_head_tags'  => 'nullable|string',
        ]);

        $seo = SeoMetadata::where('page_slug', $slug)->firstOrFail();
        $seo->update($data);

        return $this->successResponse([
            'id'               => $seo->id,
            'page_slug'        => $seo->page_slug,
            'meta_title'       => $seo->meta_title,
            'meta_description' => $seo->meta_description,
            'og_image_url'     => $seo->og_image_url,
            'extra_head_tags'  => $seo->extra_head_tags,
        ], 'SEO metadata updated');
    }
}
