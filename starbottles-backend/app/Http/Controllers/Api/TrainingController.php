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
                'download_url' => Storage::disk('public')->url($material->file_path),
                'created_at'   => $material->created_at->toIso8601String(),
            ];

            if (isset($grouped[$material->type . 's'])) {
                $grouped[$material->type . 's'][] = $item;
            } elseif ($material->type === 'video') {
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
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => 'required|in:video,pdf,document',
            'file'        => 'required|file|max:102400',
            'description' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $path = Storage::disk('public')->putFile('training/' . $data['type'], $file);

        $material = TrainingMaterial::create([
            'title'       => $data['title'],
            'type'        => $data['type'],
            'file_path'   => $path,
            'description' => $data['description'] ?? null,
            'uploaded_by' => $request->user()->id,
            'is_active'   => true,
        ]);

        return $this->successResponse([
            'id'           => $material->id,
            'title'        => $material->title,
            'type'         => $material->type,
            'description'  => $material->description,
            'download_url' => Storage::disk('public')->url($material->file_path),
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
