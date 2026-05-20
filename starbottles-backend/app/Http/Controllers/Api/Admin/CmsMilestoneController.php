<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Milestone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsMilestoneController extends BaseApiController
{
    public function index(): JsonResponse
    {
        return $this->successResponse(Milestone::ordered()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'year'        => 'required|integer|min:1900|max:2100',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'order'       => 'integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $data['order'] ??= (Milestone::max('order') ?? 0) + 1;

        return $this->successResponse(Milestone::create($data), 'Milestone created', 201);
    }

    public function update(Request $request, Milestone $milestone): JsonResponse
    {
        $data = $request->validate([
            'year'        => 'sometimes|required|integer|min:1900|max:2100',
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'order'       => 'integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $milestone->update($data);

        return $this->successResponse($milestone->fresh());
    }

    public function destroy(Milestone $milestone): JsonResponse
    {
        $milestone->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:milestones,id',
        ]);

        foreach ($data['order'] as $position => $id) {
            Milestone::where('id', $id)->update(['order' => $position]);
        }

        return $this->successResponse(null, 'Order updated');
    }
}
