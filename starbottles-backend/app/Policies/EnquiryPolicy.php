<?php

namespace App\Policies;

use App\Models\Enquiry;
use App\Models\User;

class EnquiryPolicy
{
    public function view(User $user, Enquiry $enquiry): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('executive') && $enquiry->assigned_to === $user->id;
    }

    public function update(User $user, Enquiry $enquiry): bool
    {
        return $this->view($user, $enquiry);
    }

    public function addNote(User $user, Enquiry $enquiry): bool
    {
        return $this->view($user, $enquiry);
    }
}
