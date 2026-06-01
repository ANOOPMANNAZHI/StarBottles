<?php

namespace App\Http\Controllers\Api;

use App\Models\CompanyInfoSection;
use App\Models\TrainingMaterial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TrainingController extends BaseApiController
{
    public function materials(Request $request): JsonResponse
    {
        $materials = TrainingMaterial::active()->orderBy('created_at', 'desc')->get();

        $grouped = [
            'videos'    => [],
            'pdfs'      => [],
            'documents' => [],
        ];

        foreach ($materials as $material) {
            $item = [
                'id'           => $material->id,
                'title'        => $material->title,
                'type'         => $material->type,
                'description'  => $material->description,
                'download_url' => $material->file_path
                    ? Storage::disk('public')->url($material->file_path)
                    : null,
                'video_url'    => $material->video_url,
                'created_at'   => $material->created_at->toIso8601String(),
            ];

            if ($material->type === 'video') {
                $grouped['videos'][] = $item;
            } elseif ($material->type === 'pdf') {
                $grouped['pdfs'][] = $item;
            } else {
                $grouped['documents'][] = $item;
            }
        }

        return $this->successResponse($grouped);
    }

    public function uploadMaterial(Request $request): JsonResponse
    {
        $isVideo = $request->input('type') === 'video';

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => 'required|in:video,pdf,document',
            'file'        => $isVideo ? 'sometimes|file|max:102400' : 'required|file|max:102400',
            'video_url'   => $isVideo ? ['nullable', 'string', 'max:1000', 'regex:/^https?:\/\/.+/'] : 'prohibited',
            'description' => 'nullable|string',
        ]);

        if ($isVideo && empty($data['file']) && empty($data['video_url'])) {
            return response()->json([
                'message' => 'Either a video file or a video URL is required.',
                'errors'  => ['file' => ['Provide a file or a YouTube/video URL.']],
            ], 422);
        }

        $filePath = null;
        $videoUrl = null;

        if ($request->hasFile('file')) {
            $filePath = Storage::disk('public')->putFile('training/' . $data['type'], $request->file('file'));
        } else {
            $videoUrl = $data['video_url'];
        }

        $material = TrainingMaterial::create([
            'title'       => $data['title'],
            'type'        => $data['type'],
            'file_path'   => $filePath,
            'video_url'   => $videoUrl,
            'description' => $data['description'] ?? null,
            'uploaded_by' => $request->user()->id,
            'is_active'   => true,
        ]);

        return $this->successResponse([
            'id'           => $material->id,
            'title'        => $material->title,
            'type'         => $material->type,
            'description'  => $material->description,
            'download_url' => $material->file_path
                ? Storage::disk('public')->url($material->file_path)
                : null,
            'video_url'    => $material->video_url,
            'created_at'   => $material->created_at->toIso8601String(),
        ], 'Material uploaded', 201);
    }

    public function deleteMaterial(TrainingMaterial $material): JsonResponse
    {
        $material->update(['is_active' => false]);

        return response()->json(null, 204);
    }

    public function companyInfo(): JsonResponse
    {
        $sections = CompanyInfoSection::orderBy('display_order')->get();

        return $this->successResponse($sections);
    }

    public function updateCompanyInfo(Request $request, string $key): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'display_order' => 'integer|min:0',
        ]);

        $section = CompanyInfoSection::updateOrCreate(
            ['section_key' => $key],
            array_merge($data, ['section_key' => $key])
        );

        return $this->successResponse($section);
    }
}
