<?php

namespace App\Services;

use App\Models\Enquiry;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class EnquiryAssignmentService
{
    private const LAST_ASSIGNED_KEY = 'enquiry_round_robin_last_assigned';

    public function autoAssign(Enquiry $enquiry): ?User
    {
        $executives = User::role('executive')
            ->active()
            ->orderBy('id')
            ->get();

        if ($executives->isEmpty()) {
            return null;
        }

        $lastAssignedId = Cache::get(self::LAST_ASSIGNED_KEY);

        $next = null;

        if ($lastAssignedId) {
            // Find the next executive after the last assigned one
            $found = false;
            foreach ($executives as $exec) {
                if ($found) {
                    $next = $exec;
                    break;
                }
                if ($exec->id === $lastAssignedId) {
                    $found = true;
                }
            }
        }

        // If no next found (last assigned was removed, or first time), start from first
        if (!$next) {
            $next = $executives->first();
        }

        $enquiry->update(['assigned_to' => $next->id]);

        Cache::put(self::LAST_ASSIGNED_KEY, $next->id);

        return $next;
    }
}
