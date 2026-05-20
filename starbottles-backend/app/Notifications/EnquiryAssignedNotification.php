<?php

namespace App\Notifications;

use App\Models\Enquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EnquiryAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Enquiry $enquiry
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Enquiry Assigned to You')
            ->greeting("Hello {$notifiable->name},")
            ->line("A new enquiry has been assigned to you.")
            ->line("**Customer:** {$this->enquiry->customer_name}")
            ->line("**Phone:** {$this->enquiry->phone}")
            ->line("**Source:** {$this->enquiry->source}")
            ->when($this->enquiry->message, function ($mail) {
                return $mail->line("**Message:** {$this->enquiry->message}");
            })
            ->action('View Enquiry', config('app.frontend_url', '') . '/enquiries/' . $this->enquiry->id)
            ->line('Please follow up as soon as possible.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'enquiry_assigned',
            'title' => 'New Enquiry Assigned',
            'message' => "Enquiry from {$this->enquiry->customer_name} ({$this->enquiry->source}) has been assigned to you.",
            'enquiry_id' => $this->enquiry->id,
            'customer_name' => $this->enquiry->customer_name,
            'phone' => $this->enquiry->phone,
            'source' => $this->enquiry->source,
        ];
    }
}
