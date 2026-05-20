<?php

namespace Tests\Feature;

use App\Models\CompanyInfoSection;
use App\Models\TrainingMaterial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class TrainingTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
    }

    private function makeUser(string $role): User
    {
        $user = User::factory()->create(['role' => $role, 'is_active' => true]);
        $user->assignRole($role);
        return $user;
    }

    public function test_trainee_can_access_training_materials(): void
    {
        TrainingMaterial::create([
            'title'       => 'Product Guide',
            'type'        => 'pdf',
            'file_path'   => 'training/pdf/guide.pdf',
            'uploaded_by' => $this->makeUser('admin')->id,
            'is_active'   => true,
        ]);

        Sanctum::actingAs($this->makeUser('trainee'));

        $response = $this->getJson('/api/v1/training/materials');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['videos', 'pdfs', 'documents']]);
    }

    public function test_admin_can_upload_training_material(): void
    {
        Storage::fake('public');

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->postJson('/api/v1/training/materials', [
            'title'       => 'Company Overview',
            'type'        => 'pdf',
            'file'        => UploadedFile::fake()->create('overview.pdf', 100, 'application/pdf'),
            'description' => 'Annual overview',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Company Overview')
            ->assertJsonPath('data.type', 'pdf');

        $this->assertDatabaseHas('training_materials', ['title' => 'Company Overview']);
    }

    public function test_admin_can_delete_training_material(): void
    {
        $admin = $this->makeUser('admin');
        $material = TrainingMaterial::create([
            'title'       => 'Old Material',
            'type'        => 'document',
            'file_path'   => 'training/document/old.docx',
            'uploaded_by' => $admin->id,
            'is_active'   => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/v1/training/materials/{$material->id}");

        $response->assertStatus(204);
        $this->assertDatabaseHas('training_materials', ['id' => $material->id, 'is_active' => false]);
    }

    public function test_admin_can_update_company_info_section(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->putJson('/api/v1/training/company-info/company_background', [
            'title'         => 'Our Story',
            'content'       => '<p>Founded in 1990...</p>',
            'display_order' => 1,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.section_key', 'company_background')
            ->assertJsonPath('data.title', 'Our Story');

        $this->assertDatabaseHas('company_info_sections', ['section_key' => 'company_background', 'title' => 'Our Story']);
    }

    public function test_company_info_returns_all_sections_ordered(): void
    {
        CompanyInfoSection::create(['section_key' => 'section_b', 'title' => 'B', 'content' => 'B', 'display_order' => 2]);
        CompanyInfoSection::create(['section_key' => 'section_a', 'title' => 'A', 'content' => 'A', 'display_order' => 1]);

        Sanctum::actingAs($this->makeUser('trainee'));

        $response = $this->getJson('/api/v1/training/company-info');

        $response->assertOk();
        $sections = $response->json('data');
        $this->assertCount(2, $sections);
        $this->assertEquals(1, $sections[0]['display_order']);
        $this->assertEquals(2, $sections[1]['display_order']);
    }
}
