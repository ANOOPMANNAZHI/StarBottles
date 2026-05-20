<?php

namespace Database\Seeders;

use App\Models\CompanyInfoSection;
use Illuminate\Database\Seeder;

class CompanyInfoSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            [
                'section_key'   => 'company_background',
                'title'         => 'Company Background',
                'content'       => '<p>StarBottles was founded with a mission to deliver premium packaging solutions to industries across India. With decades of experience, we have grown from a local manufacturer to a nationally recognised brand.</p>',
                'display_order' => 1,
            ],
            [
                'section_key'   => 'business_activities',
                'title'         => 'What We Do',
                'content'       => '<p>We design, manufacture and supply a wide range of plastic, glass, and metal packaging — including bottles, jars, containers and closures — for the food, beverage, pharmaceutical and personal care industries.</p>',
                'display_order' => 2,
            ],
            [
                'section_key'   => 'products_overview',
                'title'         => 'Products We Make',
                'content'       => '<p>Our product catalogue includes PET bottles, HDPE containers, glass jars, aluminium bottles, and PP containers in hundreds of shapes and sizes. All products meet BIS and international quality standards.</p>',
                'display_order' => 3,
            ],
            [
                'section_key'   => 'industries_served',
                'title'         => 'Industries We Serve',
                'content'       => '<p>We serve clients in food & beverage, pharmaceuticals, ayurveda, personal care, household chemicals, and industrial segments. Our packaging solutions are trusted by leading FMCG brands.</p>',
                'display_order' => 4,
            ],
            [
                'section_key'   => 'manufacturing',
                'title'         => 'Our Manufacturing',
                'content'       => '<p>Our state-of-the-art manufacturing plant spans over 50,000 sq. ft. and is equipped with injection moulding, blow moulding and extrusion lines. We maintain strict quality control at every stage of production.</p>',
                'display_order' => 5,
            ],
            [
                'section_key'   => 'values',
                'title'         => 'Our Values',
                'content'       => '<p>Quality, reliability, and customer focus are at the heart of everything we do. We believe in building long-term partnerships and delivering packaging that protects and enhances our customers\' products.</p>',
                'display_order' => 6,
            ],
        ];

        foreach ($sections as $section) {
            CompanyInfoSection::updateOrCreate(
                ['section_key' => $section['section_key']],
                $section
            );
        }
    }
}
