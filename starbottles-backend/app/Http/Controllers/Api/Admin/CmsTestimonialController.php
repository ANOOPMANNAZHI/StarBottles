<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsTestimonialController extends BaseApiController
{
    public function index(): JsonResponse
    {
        return $this->successResponse(Testimonial::ordered()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'quote'     => 'required|string',
            'name'      => 'required|string|max:255',
            'business'  => 'required|string|max:255',
            'location'  => 'required|string|max:255',
            'metric'    => 'nullable|string|max:255',
            'initials'  => 'required|string|max:4',
            'rating'    => 'integer|min:1|max:5',
            'order'     => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $data['order'] ??= (Testimonial::max('order') ?? 0) + 1;

        return $this->successResponse(Testimonial::create($data), 'Testimonial created', 201);
    }

    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $data = $request->validate([
            'quote'     => 'sometimes|required|string',
            'name'      => 'sometimes|required|string|max:255',
            'business'  => 'sometimes|required|string|max:255',
            'location'  => 'sometimes|required|string|max:255',
            'metric'    => 'nullable|string|max:255',
            'initials'  => 'sometimes|required|string|max:4',
            'rating'    => 'integer|min:1|max:5',
            'order'     => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $testimonial->update($data);

        return $this->successResponse($testimonial->fresh());
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:testimonials,id',
        ]);

        foreach ($data['order'] as $position => $id) {
            Testimonial::where('id', $id)->update(['order' => $position]);
        }

        return $this->successResponse(null, 'Order updated');
    }
}
