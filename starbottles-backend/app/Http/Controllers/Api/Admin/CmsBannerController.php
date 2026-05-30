<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CmsBannerController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $banners = Banner::ordered()->get()->map(fn ($b) => $this->formatBanner($b));

        return $this->successResponse($banners);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'              => 'required|string|max:255',
            'subtitle'           => 'nullable|string|max:255',
            'eyebrow'            => 'nullable|string|max:255',
            'image'              => 'nullable|file|max:5120|mimes:jpg,jpeg,png,webp',
            'video_url'          => 'nullable|string|max:500',
            'cta_text'           => 'nullable|string|max:100',
            'cta_url'            => 'nullable|string|max:255',
            'cta_secondary_text' => 'nullable|string|max:100',
            'cta_secondary_url'  => 'nullable|string|max:255',
            'is_active'          => 'boolean',
        ]);

        if (!$request->hasFile('image') && empty($data['video_url'])) {
            return response()->json(['message' => 'An image is required when no video URL is provided.'], 422);
        }

        $path = $request->hasFile('image')
            ? Storage::disk('public')->putFile('cms/banners', $request->file('image'))
            : null;

        $maxOrder = Banner::max('display_order') ?? 0;

        $banner = Banner::create([
            'title'              => $data['title'],
            'subtitle'           => $data['subtitle'] ?? null,
            'eyebrow'            => $data['eyebrow'] ?? null,
            'image_path'         => $path,
            'video_url'          => $data['video_url'] ?? null,
            'cta_text'           => $data['cta_text'] ?? null,
            'cta_url'            => $data['cta_url'] ?? null,
            'cta_secondary_text' => $data['cta_secondary_text'] ?? null,
            'cta_secondary_url'  => $data['cta_secondary_url'] ?? null,
            'display_order'      => $maxOrder + 1,
            'is_active'          => $data['is_active'] ?? true,
        ]);

        return $this->successResponse($this->formatBanner($banner), 'Banner created', 201);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $data = $request->validate([
            'title'              => 'sometimes|required|string|max:255',
            'subtitle'           => 'nullable|string|max:255',
            'eyebrow'            => 'nullable|string|max:255',
            'image'              => 'nullable|file|max:5120|mimes:jpg,jpeg,png,webp',
            'video_url'          => 'nullable|string|max:500',
            'cta_text'           => 'nullable|string|max:100',
            'cta_url'            => 'nullable|string|max:255',
            'cta_secondary_text' => 'nullable|string|max:100',
            'cta_secondary_url'  => 'nullable|string|max:255',
            'is_active'          => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($banner->image_path);
            $data['image_path'] = Storage::disk('public')->putFile('cms/banners', $request->file('image'));
        }
        unset($data['image']);

        $banner->update($data);

        return $this->successResponse($this->formatBanner($banner->fresh()));
    }

    public function destroy(Banner $banner): JsonResponse
    {
        Storage::disk('public')->delete($banner->image_path);
        $banner->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:banners,id',
        ]);

        foreach ($data['order'] as $position => $id) {
            Banner::where('id', $id)->update(['display_order' => $position]);
        }

        return $this->successResponse(null, 'Order updated');
    }

    private function formatBanner(Banner $banner): array
    {
        return [
            'id'                 => $banner->id,
            'title'              => $banner->title,
            'subtitle'           => $banner->subtitle,
            'eyebrow'            => $banner->eyebrow,
            'image_url'          => $banner->image_url,
            'video_url'          => $banner->video_url,
            'cta_text'           => $banner->cta_text,
            'cta_url'            => $banner->cta_url,
            'cta_secondary_text' => $banner->cta_secondary_text,
            'cta_secondary_url'  => $banner->cta_secondary_url,
            'display_order'      => $banner->display_order,
            'is_active'          => $banner->is_active,
            'created_at'         => $banner->created_at->toIso8601String(),
        ];
    }
}
