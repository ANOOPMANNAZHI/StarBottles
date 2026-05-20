<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\PageContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsPageContentController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $pages = PageContent::orderBy('page_slug')
            ->orderBy('display_order')
            ->get()
            ->groupBy('page_slug')
            ->map(fn ($sections) => $sections->map(fn ($s) => [
                'id'            => $s->id,
                'section_key'   => $s->section_key,
                'content_type'  => $s->content_type,
                'content'       => $s->content,
                'display_order' => $s->display_order,
            ]));

        return $this->successResponse($pages);
    }

    public function show(string $slug): JsonResponse
    {
        $sections = PageContent::forPage($slug)->get()->map(fn ($s) => [
            'id'            => $s->id,
            'section_key'   => $s->section_key,
            'content_type'  => $s->content_type,
            'content'       => $s->content,
            'display_order' => $s->display_order,
        ]);

        return $this->successResponse($sections);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'sections'               => 'required|array',
            'sections.*.section_key' => 'required|string',
            'sections.*.content'     => 'nullable|string',
        ]);

        foreach ($data['sections'] as $section) {
            PageContent::where('page_slug', $slug)
                ->where('section_key', $section['section_key'])
                ->update(['content' => $section['content']]);
        }

        $sections = PageContent::forPage($slug)->get()->map(fn ($s) => [
            'id'            => $s->id,
            'section_key'   => $s->section_key,
            'content_type'  => $s->content_type,
            'content'       => $s->content,
            'display_order' => $s->display_order,
        ]);

        return $this->successResponse($sections, 'Page content updated');
    }
}
