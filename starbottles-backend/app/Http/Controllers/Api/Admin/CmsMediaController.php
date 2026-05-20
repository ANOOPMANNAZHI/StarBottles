<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CmsMediaController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Media::orderBy('created_at', 'desc');

        if ($request->has('mime_type')) {
            $query->where('mime_type', 'like', $request->mime_type . '%');
        }

        $media = $query->paginate(24);

        $media->getCollection()->transform(fn ($item) => [
            'id'        => $item->id,
            'filename'  => $item->filename,
            'url'       => $item->url,
            'mime_type' => $item->mime_type,
            'size'      => $item->size,
            'alt_text'  => $item->alt_text,
            'created_at' => $item->created_at->toIso8601String(),
        ]);

        return $this->paginatedResponse($media);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'files'   => 'required|array|min:1',
            'files.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,webp,svg,pdf',
        ]);

        $uploaded = [];

        foreach ($request->file('files') as $file) {
            $path = Storage::disk('public')->putFile('cms/media', $file);

            $media = Media::create([
                'filename'    => $file->getClientOriginalName(),
                'path'        => $path,
                'disk'        => 'public',
                'mime_type'   => $file->getMimeType(),
                'size'        => $file->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);

            $uploaded[] = [
                'id'        => $media->id,
                'filename'  => $media->filename,
                'url'       => $media->url,
                'mime_type' => $media->mime_type,
                'size'      => $media->size,
                'alt_text'  => $media->alt_text,
                'created_at' => $media->created_at->toIso8601String(),
            ];
        }

        return $this->successResponse($uploaded, 'Files uploaded', 201);
    }

    public function update(Request $request, Media $medium): JsonResponse
    {
        $data = $request->validate([
            'alt_text' => 'nullable|string|max:255',
        ]);

        $medium->update($data);

        return $this->successResponse([
            'id'        => $medium->id,
            'filename'  => $medium->filename,
            'url'       => $medium->url,
            'mime_type' => $medium->mime_type,
            'size'      => $medium->size,
            'alt_text'  => $medium->alt_text,
        ]);
    }

    public function destroy(Media $medium): JsonResponse
    {
        Storage::disk($medium->disk)->delete($medium->path);
        $medium->delete();

        return response()->json(null, 204);
    }
}
