<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Catalogue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CatalogueController extends BaseApiController
{
    public function current(): JsonResponse
    {
        $catalogue = Catalogue::where('is_current', true)->latest('updated_at')->first();

        if (! $catalogue) {
            return $this->errorResponse('No catalogue available', 404);
        }

        return $this->successResponse([
            'id'         => $catalogue->id,
            'version'    => $catalogue->version,
            'file_url'   => $catalogue->file_url,
            'updated_at' => $catalogue->updated_at->toIso8601String(),
        ]);
    }

    public function active(): JsonResponse
    {
        $catalogues = Catalogue::where('is_current', true)
            ->latest('updated_at')
            ->get()
            ->map(fn ($c) => [
                'id'         => $c->id,
                'version'    => $c->version,
                'file_url'   => $c->file_url,
                'updated_at' => $c->updated_at->toIso8601String(),
            ]);

        return $this->successResponse($catalogues);
    }

    public function index(): JsonResponse
    {
        $catalogues = Catalogue::with('uploadedBy:id,name')
            ->orderByDesc('created_at')
            ->paginate(10);

        $catalogues->getCollection()->transform(fn ($c) => [
            'id'          => $c->id,
            'version'     => $c->version,
            'file_url'    => $c->file_url,
            'is_current'  => $c->is_current,
            'uploaded_by' => $c->uploadedBy?->name,
            'created_at'  => $c->created_at->toIso8601String(),
        ]);

        return $this->paginatedResponse($catalogues);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file'    => 'required|file|mimes:pdf|max:20480',
            'version' => 'nullable|string|max:50',
        ]);

        $file    = $request->file('file');
        $version = $request->input('version') ?? now()->format('Y-m');
        $name    = 'catalogue_' . now()->format('Ymd_His') . '_' . $version . '.pdf';

        $path = Storage::disk('public')->putFileAs('catalogue', $file, $name);

        $catalogue = Catalogue::create([
            'file_path'   => $path,
            'version'     => $version,
            'uploaded_by' => $request->user()->id,
            'is_current'  => false,
        ]);

        return $this->successResponse([
            'id'          => $catalogue->id,
            'version'     => $catalogue->version,
            'file_url'    => $catalogue->file_url,
            'is_current'  => $catalogue->is_current,
            'uploaded_by' => $request->user()->name,
            'created_at'  => $catalogue->created_at->toIso8601String(),
        ], 'Catalogue uploaded successfully', 201);
    }

    public function toggleActive(Catalogue $catalogue): JsonResponse
    {
        $catalogue->update(['is_current' => ! $catalogue->is_current]);

        $message = $catalogue->is_current ? 'Catalogue activated' : 'Catalogue deactivated';

        return $this->successResponse([
            'id'         => $catalogue->id,
            'version'    => $catalogue->version,
            'is_current' => $catalogue->is_current,
        ], $message);
    }

    public function destroy(Catalogue $catalogue): JsonResponse
    {
        Storage::disk('public')->delete($catalogue->file_path);
        $catalogue->delete();

        return $this->successResponse(null, 'Catalogue deleted');
    }
}
