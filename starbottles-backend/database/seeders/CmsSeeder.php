<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\PageContent;
use App\Models\ProductCategory;
use App\Models\SeoMetadata;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSiteSettings();
        $this->seedPageContents();
        $this->seedSeoMetadata();
        $this->seedCategoryDisplayData();
        $this->seedBanners();
    }

    private function seedSiteSettings(): void
    {
        $settings = [
            // General
            ['key' => 'company_name', 'value' => 'StarBottles', 'type' => 'text', 'group' => 'general'],
            ['key' => 'company_tagline', 'value' => 'Premium Bottles for Every Industry', 'type' => 'text', 'group' => 'general'],
            ['key' => 'logo_path', 'value' => null, 'type' => 'image', 'group' => 'general'],

            // Contact
            ['key' => 'contact_email', 'value' => 'mail@starbottles.in', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+91 80868 50000', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_phone_raw', 'value' => '+918086850000', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'whatsapp_number', 'value' => '918086850000', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'address', 'value' => 'Thrissur, Kerala — 680 001', 'type' => 'textarea', 'group' => 'contact'],
            ['key' => 'business_hours', 'value' => 'Mon – Sat · 9 AM – 6 PM IST', 'type' => 'text', 'group' => 'contact'],

            // Social
            ['key' => 'facebook_url', 'value' => '', 'type' => 'text', 'group' => 'social'],
            ['key' => 'instagram_url', 'value' => '', 'type' => 'text', 'group' => 'social'],
            ['key' => 'linkedin_url', 'value' => '', 'type' => 'text', 'group' => 'social'],
            ['key' => 'twitter_url', 'value' => '', 'type' => 'text', 'group' => 'social'],

            // Footer
            ['key' => 'footer_text', 'value' => '© StarBottles. All rights reserved.', 'type' => 'text', 'group' => 'footer'],
            ['key' => 'footer_logo_path', 'value' => null, 'type' => 'image', 'group' => 'footer'],

            // Company stats (used by b2b website)
            [
                'key'   => 'company_stats',
                'value' => json_encode([
                    'established'  => 1967,
                    'clients'      => ['value' => 2200, 'suffix' => '+'],
                    'skus'         => ['value' => 1500, 'suffix' => '+'],
                    'states'       => ['value' => 18,   'suffix' => '+'],
                    'unitsShipped' => ['value' => 10,   'suffix' => 'M+'],
                ]),
                'type'  => 'json',
                'group' => 'general',
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    private function seedPageContents(): void
    {
        $pages = [
            'home' => [
                ['section_key' => 'hero_title', 'content_type' => 'text', 'content' => 'Premium Bottles for Every Industry', 'display_order' => 1],
                ['section_key' => 'hero_subtitle', 'content_type' => 'text', 'content' => 'Quality glass and PET bottles for beverage, pharmaceutical, and food industries.', 'display_order' => 2],
                ['section_key' => 'hero_image', 'content_type' => 'image', 'content' => null, 'display_order' => 3],
                ['section_key' => 'hero_cta_text', 'content_type' => 'text', 'content' => 'View Products', 'display_order' => 4],
                ['section_key' => 'hero_cta_url', 'content_type' => 'text', 'content' => '/products', 'display_order' => 5],
                ['section_key' => 'intro_title', 'content_type' => 'text', 'content' => 'Why StarBottles?', 'display_order' => 6],
                ['section_key' => 'intro_text', 'content_type' => 'html', 'content' => '<p>We provide premium quality bottles with industry-leading standards, competitive pricing, and reliable delivery.</p>', 'display_order' => 7],
            ],
            'about' => [
                ['section_key' => 'title', 'content_type' => 'text', 'content' => 'About Us', 'display_order' => 1],
                ['section_key' => 'main_content', 'content_type' => 'html', 'content' => '<p>StarBottles is a premium manufacturer of glass and PET bottles serving the beverage, pharmaceutical, and food industries.</p>', 'display_order' => 2],
                ['section_key' => 'mission_title', 'content_type' => 'text', 'content' => 'Our Mission', 'display_order' => 3],
                ['section_key' => 'mission_text', 'content_type' => 'text', 'content' => 'To deliver world-class packaging solutions with uncompromising quality and innovation.', 'display_order' => 4],
                ['section_key' => 'values_content', 'content_type' => 'html', 'content' => '<ul><li><strong>Quality First</strong> — Every bottle meets stringent quality standards.</li><li><strong>Innovation</strong> — Continuously improving our processes and products.</li><li><strong>Customer Focus</strong> — Your success is our priority.</li><li><strong>Sustainability</strong> — Committed to eco-friendly manufacturing.</li></ul>', 'display_order' => 5],
            ],
            'contact' => [
                ['section_key' => 'title', 'content_type' => 'text', 'content' => 'Contact Us', 'display_order' => 1],
                ['section_key' => 'intro_text', 'content_type' => 'text', 'content' => 'Have a question or want a quote? Reach out to us and we\'ll get back to you promptly.', 'display_order' => 2],
            ],
            'privacy' => [
                ['section_key' => 'title', 'content_type' => 'text', 'content' => 'Privacy Policy', 'display_order' => 1],
                ['section_key' => 'content', 'content_type' => 'html', 'content' => '<h2>Information We Collect</h2><p>We collect information you provide through our enquiry forms, including your name, phone number, email, and message.</p><h2>How We Use Your Information</h2><p>Your information is used solely to respond to your enquiries and provide requested services.</p><h2>Third-Party Sharing</h2><p>We do not share your personal information with third parties.</p><h2>Contact</h2><p>For privacy-related questions, contact us at info@starbottles.in.</p>', 'display_order' => 2],
            ],
            'products' => [
                ['section_key' => 'title', 'content_type' => 'text', 'content' => 'Our Products', 'display_order' => 1],
                ['section_key' => 'intro_text', 'content_type' => 'text', 'content' => 'Browse our extensive catalogue of premium glass and PET bottles.', 'display_order' => 2],
            ],
        ];

        foreach ($pages as $slug => $sections) {
            foreach ($sections as $section) {
                PageContent::updateOrCreate(
                    ['page_slug' => $slug, 'section_key' => $section['section_key']],
                    array_merge($section, ['page_slug' => $slug])
                );
            }
        }
    }

    private function seedBanners(): void
    {
        // Clear existing banners and their images
        Banner::all()->each(function (Banner $banner) {
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $banner->delete();
        });

        $banners = [
            [
                'title'              => "Premium Packaging\nfor Every Industry",
                'subtitle'           => '1500+ SKUs across PET, HDPE, PP and ABS — cosmetics, pharma, FMCG, and personal care. Bulk-ready, custom-brandable, delivered pan-India.',
                'eyebrow'            => "India's #1 B2B Packaging Partner",
                'image_path'         => 'https://shop.starbottles.in/wp-content/uploads/2025/11/M3.webp',
                'cta_text'           => 'Explore Catalogue',
                'cta_url'            => '/products',
                'cta_secondary_text' => 'Request a Quote',
                'cta_secondary_url'  => '/contact',
                'display_order'      => 1,
                'is_active'          => true,
            ],
            [
                'title'              => "Your Brand,\nOur Packaging",
                'subtitle'           => 'Custom moulds, private-label printing, unique finishes — we build packaging from scratch for startups and enterprises alike.',
                'eyebrow'            => 'Custom OEM Solutions',
                'image_path'         => 'https://shop.starbottles.in/wp-content/uploads/2025/11/M2.webp',
                'cta_text'           => 'Browse Products',
                'cta_url'            => '/products',
                'cta_secondary_text' => 'Get Custom Quote',
                'cta_secondary_url'  => '/contact',
                'display_order'      => 2,
                'is_active'          => true,
            ],
            [
                'title'              => "Quality You Can\nCount On",
                'subtitle'           => 'ISO certified, BIS compliant, BPA-free. Every batch tested before dispatch. Serving 18+ states from Thrissur, Kerala since 2010.',
                'eyebrow'            => 'Trusted by 500+ Businesses',
                'image_path'         => 'https://shop.starbottles.in/wp-content/uploads/2025/11/M1.webp',
                'cta_text'           => 'Explore Catalogue',
                'cta_url'            => '/products',
                'cta_secondary_text' => 'Contact Us',
                'cta_secondary_url'  => '/contact',
                'display_order'      => 3,
                'is_active'          => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }
    }

    private function seedCategoryDisplayData(): void
    {
        $categories = [
            ['name' => 'Dropper Bottles', 'tagline' => 'Serums · Oils · Pharma', 'color' => '#1B2178', 'display_order' => 1],
            ['name' => 'Pump Dispensers', 'tagline' => 'Skincare · Cosmetics', 'color' => '#7c3aed', 'display_order' => 2],
            ['name' => 'Cosmetic Jars', 'tagline' => 'Creams · Balms · Gels', 'color' => '#d97706', 'display_order' => 3],
            ['name' => 'Pharma Bottles', 'tagline' => 'APIs · Syrups · Nutra', 'color' => '#dc2626', 'display_order' => 4],
            ['name' => 'Spray Bottles', 'tagline' => 'Mists · Sanitizers', 'color' => '#059669', 'display_order' => 5],
            ['name' => 'Custom Packaging', 'tagline' => 'Any Size · OEM', 'color' => '#1B2178', 'display_order' => 6],
        ];

        foreach ($categories as $catData) {
            ProductCategory::where('name', $catData['name'])->update([
                'tagline'       => $catData['tagline'],
                'color'         => $catData['color'],
                'display_order' => $catData['display_order'],
            ]);
        }
    }

    private function seedSeoMetadata(): void
    {
        $pages = [
            ['page_slug' => 'home', 'meta_title' => 'StarBottles — Premium Bottle Manufacturer', 'meta_description' => 'Premium glass and PET bottle manufacturer for beverage, pharmaceutical, and food industries.'],
            ['page_slug' => 'about', 'meta_title' => 'About Us | StarBottles', 'meta_description' => 'Learn about StarBottles — our mission, values, and commitment to quality bottle manufacturing.'],
            ['page_slug' => 'products', 'meta_title' => 'Products | StarBottles', 'meta_description' => 'Browse our extensive catalogue of premium glass and PET bottles for every industry.'],
            ['page_slug' => 'contact', 'meta_title' => 'Contact Us | StarBottles', 'meta_description' => 'Get in touch with StarBottles for quotes, enquiries, and partnership opportunities.'],
            ['page_slug' => 'privacy', 'meta_title' => 'Privacy Policy | StarBottles', 'meta_description' => 'StarBottles privacy policy — how we collect, use, and protect your information.'],
        ];

        foreach ($pages as $page) {
            SeoMetadata::updateOrCreate(
                ['page_slug' => $page['page_slug']],
                $page
            );
        }
    }
}
