<?php

namespace App\Notifications;

use App\Models\Enquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewEnquiryReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Enquiry $enquiry
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_enquiry',
            'title' => 'New Enquiry Received',
            'message' => "New {$this->enquiry->source} enquiry from {$this->enquiry->customer_name}.",
            'enquiry_id' => $this->enquiry->id,
            'customer_name' => $this->enquiry->customer_name,
            'phone' => $this->enquiry->phone,
            'source' => $this->enquiry->source,
        ];
    }
}
