<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\Media;
use App\Models\PageContent;
use App\Models\SeoMetadata;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class CmsTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
        Storage::fake('public');
    }

    private function actingAsAdmin(): User
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $user->assignRole('admin');
        Sanctum::actingAs($user);
        return $user;
    }

    private function seedSettings(): void
    {
        SiteSetting::create(['key' => 'company_name', 'value' => 'StarBottles', 'type' => 'text', 'group' => 'general']);
        SiteSetting::create(['key' => 'contact_email', 'value' => 'info@test.com', 'type' => 'text', 'group' => 'contact']);
    }

    private function seedPageContent(): void
    {
        PageContent::create(['page_slug' => 'home', 'section_key' => 'hero_title', 'content_type' => 'text', 'content' => 'Hello World', 'display_order' => 1]);
        PageContent::create(['page_slug' => 'home', 'section_key' => 'hero_subtitle', 'content_type' => 'text', 'content' => 'Subtitle', 'display_order' => 2]);
    }

    private function seedSeo(): void
    {
        SeoMetadata::create(['page_slug' => 'home', 'meta_title' => 'Home', 'meta_description' => 'Homepage']);
        SeoMetadata::create(['page_slug' => 'about', 'meta_title' => 'About', 'meta_description' => 'About us']);
    }

    // ── Media ──────────────────────────────────────────────────────────────

    public function test_admin_can_upload_media(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/v1/cms/media', [
            'files' => [UploadedFile::fake()->image('photo.jpg', 100, 100)],
        ]);

        $response->assertStatus(201)
            ->assertJsonCount(1, 'data');

        $this->assertDatabaseHas('media', ['filename' => 'photo.jpg']);
    }

    public function test_admin_can_list_media(): void
    {
        $user = $this->actingAsAdmin();

        Media::create([
            'filename' => 'test.jpg', 'path' => 'cms/media/test.jpg',
            'disk' => 'public', 'mime_type' => 'image/jpeg', 'size' => 1024,
            'uploaded_by' => $user->id,
        ]);

        $response = $this->getJson('/api/v1/cms/media');
        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }

    public function test_admin_can_delete_media(): void
    {
        $user = $this->actingAsAdmin();

        Storage::disk('public')->put('cms/media/test.jpg', 'content');
        $media = Media::create([
            'filename' => 'test.jpg', 'path' => 'cms/media/test.jpg',
            'disk' => 'public', 'mime_type' => 'image/jpeg', 'size' => 1024,
            'uploaded_by' => $user->id,
        ]);

        $response = $this->deleteJson("/api/v1/cms/media/{$media->id}");
        $response->assertStatus(204);

        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }

    public function test_admin_can_update_media_alt_text(): void
    {
        $user = $this->actingAsAdmin();

        $media = Media::create([
            'filename' => 'test.jpg', 'path' => 'cms/media/test.jpg',
            'disk' => 'public', 'mime_type' => 'image/jpeg', 'size' => 1024,
            'uploaded_by' => $user->id,
        ]);

        $response = $this->patchJson("/api/v1/cms/media/{$media->id}", [
            'alt_text' => 'A bottle photo',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.alt_text', 'A bottle photo');
    }

    // ── Banners ────────────────────────────────────────────────────────────

    public function test_admin_can_create_banner(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/v1/cms/banners', [
            'title' => 'Summer Sale',
            'subtitle' => 'Up to 50% off',
            'image' => UploadedFile::fake()->image('banner.jpg', 1200, 400),
            'cta_text' => 'Shop Now',
            'cta_url' => '/products',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Summer Sale');

        $this->assertDatabaseHas('banners', ['title' => 'Summer Sale']);
    }

    public function test_admin_can_list_banners(): void
    {
        $this->actingAsAdmin();

        Banner::create(['title' => 'B1', 'image_path' => 'banners/b1.jpg', 'display_order' => 1]);
        Banner::create(['title' => 'B2', 'image_path' => 'banners/b2.jpg', 'display_order' => 0]);

        $response = $this->getJson('/api/v1/cms/banners');
        $response->assertStatus(200)->assertJsonCount(2, 'data');

        // Should be ordered by display_order
        $this->assertEquals('B2', $response->json('data.0.title'));
    }

    public function test_admin_can_delete_banner(): void
    {
        $this->actingAsAdmin();

        Storage::disk('public')->put('banners/b1.jpg', 'content');
        $banner = Banner::create(['title' => 'B1', 'image_path' => 'banners/b1.jpg', 'display_order' => 0]);

        $response = $this->deleteJson("/api/v1/cms/banners/{$banner->id}");
        $response->assertStatus(204);

        $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
    }

    public function test_admin_can_reorder_banners(): void
    {
        $this->actingAsAdmin();

        $b1 = Banner::create(['title' => 'B1', 'image_path' => 'b1.jpg', 'display_order' => 0]);
        $b2 = Banner::create(['title' => 'B2', 'image_path' => 'b2.jpg', 'display_order' => 1]);

        $response = $this->postJson('/api/v1/cms/banners/reorder', [
            'order' => [$b2->id, $b1->id],
        ]);

        $response->assertStatus(200);
        $this->assertEquals(1, $b1->fresh()->display_order);
        $this->assertEquals(0, $b2->fresh()->display_order);
    }

    // ── Site Settings ──────────────────────────────────────────────────────

    public function test_admin_can_get_settings_grouped(): void
    {
        $this->actingAsAdmin();
        $this->seedSettings();

        $response = $this->getJson('/api/v1/cms/settings');
        $response->assertStatus(200);

        $generalKeys = collect($response->json('data.general'))->pluck('key')->toArray();
        $this->assertContains('company_name', $generalKeys);
    }

    public function test_admin_can_bulk_update_settings(): void
    {
        $this->actingAsAdmin();
        $this->seedSettings();

        $response = $this->putJson('/api/v1/cms/settings', [
            'settings' => [
                ['key' => 'company_name', 'value' => 'NewName'],
                ['key' => 'contact_email', 'value' => 'new@test.com'],
            ],
        ]);

        $response->assertStatus(200);
        $this->assertEquals('NewName', SiteSetting::getValue('company_name'));
        $this->assertEquals('new@test.com', SiteSetting::getValue('contact_email'));
    }

    // ── Page Content ───────────────────────────────────────────────────────

    public function test_admin_can_list_pages(): void
    {
        $this->actingAsAdmin();
        $this->seedPageContent();

        $response = $this->getJson('/api/v1/cms/pages');
        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['home']]);
    }

    public function test_admin_can_get_page_sections(): void
    {
        $this->actingAsAdmin();
        $this->seedPageContent();

        $response = $this->getJson('/api/v1/cms/pages/home');
        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_admin_can_update_page_content(): void
    {
        $this->actingAsAdmin();
        $this->seedPageContent();

        $response = $this->putJson('/api/v1/cms/pages/home', [
            'sections' => [
                ['section_key' => 'hero_title', 'content' => 'Updated Title'],
            ],
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('page_contents', [
            'page_slug' => 'home', 'section_key' => 'hero_title', 'content' => 'Updated Title',
        ]);
    }

    // ── SEO Metadata ───────────────────────────────────────────────────────

    public function test_admin_can_list_seo(): void
    {
        $this->actingAsAdmin();
        $this->seedSeo();

        $response = $this->getJson('/api/v1/cms/seo');
        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_admin_can_update_seo(): void
    {
        $this->actingAsAdmin();
        $this->seedSeo();

        $response = $this->putJson('/api/v1/cms/seo/home', [
            'meta_title' => 'New Home Title',
            'meta_description' => 'New description',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.meta_title', 'New Home Title');
    }

    // ── Public Website Endpoints ───────────────────────────────────────────

    public function test_public_can_get_active_banners(): void
    {
        Banner::create(['title' => 'Active', 'image_path' => 'b1.jpg', 'display_order' => 0, 'is_active' => true]);
        Banner::create(['title' => 'Inactive', 'image_path' => 'b2.jpg', 'display_order' => 1, 'is_active' => false]);

        $response = $this->getJson('/api/v1/website/banners');
        $response->assertStatus(200)->assertJsonCount(1, 'data');
        $this->assertEquals('Active', $response->json('data.0.title'));
    }

    public function test_public_can_get_settings(): void
    {
        $this->seedSettings();

        $response = $this->getJson('/api/v1/website/settings');
        $response->assertStatus(200)
            ->assertJsonPath('data.company_name', 'StarBottles');
    }

    public function test_public_can_get_page_content(): void
    {
        $this->seedPageContent();

        $response = $this->getJson('/api/v1/website/pages/home');
        $response->assertStatus(200)
            ->assertJsonPath('data.hero_title', 'Hello World');
    }

    public function test_public_can_get_seo(): void
    {
        $this->seedSeo();

        $response = $this->getJson('/api/v1/website/seo/home');
        $response->assertStatus(200)
            ->assertJsonPath('data.meta_title', 'Home');
    }

    // ── Auth Guard ─────────────────────────────────────────────────────────

    public function test_non_admin_cannot_access_cms(): void
    {
        $user = User::factory()->create(['role' => 'executive', 'is_active' => true]);
        $user->assignRole('executive');
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/cms/settings')->assertStatus(403);
        $this->getJson('/api/v1/cms/banners')->assertStatus(403);
        $this->getJson('/api/v1/cms/pages')->assertStatus(403);
        $this->getJson('/api/v1/cms/seo')->assertStatus(403);
    }
}
