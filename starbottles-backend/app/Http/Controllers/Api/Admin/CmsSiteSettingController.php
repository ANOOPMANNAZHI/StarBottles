<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsSiteSettingController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $settings = SiteSetting::all()->groupBy('group')->map(function ($group) {
            return $group->map(fn ($s) => [
                'id'    => $s->id,
                'key'   => $s->key,
                'value' => $s->value,
                'type'  => $s->type,
                'group' => $s->group,
            ]);
        });

        return $this->successResponse($settings);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings'         => 'required|array',
            'settings.*.key'   => 'required|string|exists:site_settings,key',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($data['settings'] as $item) {
            SiteSetting::where('key', $item['key'])->update(['value' => $item['value']]);
        }

        return $this->successResponse(null, 'Settings updated');
    }
}
