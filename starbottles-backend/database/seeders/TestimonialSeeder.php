<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'quote'    => 'StarBottles has been our packaging partner for 3 years. Their airless pump bottles are perfect for our premium skincare line. Low MOQ and fast delivery make repeat orders effortless.',
                'name'     => 'Priya Menon',
                'business' => 'Lustre Skin Co.',
                'location' => 'Bengaluru, Karnataka',
                'metric'   => '3 years · 6 product lines',
                'initials' => 'PM',
                'rating'   => 5,
                'order'    => 1,
            ],
            [
                'quote'    => 'We needed pharma-grade Boston round bottles with custom labelling on a tight timeline. StarBottles delivered on time and the quality passed all our QC checks. Highly recommended.',
                'name'     => 'Arvind Kapoor',
                'business' => 'HealthFirst Nutraceuticals',
                'location' => 'Pune, Maharashtra',
                'metric'   => '12,000+ units per quarter',
                'initials' => 'AK',
                'rating'   => 5,
                'order'    => 2,
            ],
            [
                'quote'    => 'As a small FMCG brand, finding a supplier with low MOQ was critical. StarBottles was the only one who could supply 500 units of PP jars without huge minimums. Brilliant service.',
                'name'     => 'Fatima Shaikh',
                'business' => 'Green Roots Organics',
                'location' => 'Hyderabad, Telangana',
                'metric'   => 'Started with just 500 units',
                'initials' => 'FS',
                'rating'   => 5,
                'order'    => 3,
            ],
        ];

        foreach ($testimonials as $data) {
            Testimonial::updateOrCreate(
                ['name' => $data['name'], 'business' => $data['business']],
                $data
            );
        }
    }
}
