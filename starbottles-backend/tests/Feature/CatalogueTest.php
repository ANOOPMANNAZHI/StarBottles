<?php

namespace Tests\Feature;

use App\Models\Catalogue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class CatalogueTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected User $admin;
    protected User $executive;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->seedRolesAndPermissions();

        $this->admin = tap(User::create([
            'name'     => 'Admin',
            'email'    => 'admin@test.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'is_active' => true,
        ]))->assignRole('admin');

        $this->executive = tap(User::create([
            'name'     => 'Exec',
            'email'    => 'exec@test.com',
            'password' => Hash::make('password'),
            'role'     => 'executive',
            'is_active' => true,
        ]))->assignRole('executive');
    }

    // ── Public endpoint ───────────────────────────────────────────────────

    public function test_public_current_returns_404_when_no_catalogue(): void
    {
        $response = $this->getJson('/api/v1/catalogue/current');

        $response->assertStatus(404);
    }

    public function test_public_current_returns_current_catalogue(): void
    {
        $file = UploadedFile::fake()->create('catalogue.pdf', 500, 'application/pdf');
        Storage::disk('public')->putFileAs('catalogue', $file, 'catalogue_test.pdf');

        Catalogue::create([
            'file_path'   => 'catalogue/catalogue_test.pdf',
            'version'     => '2024-01',
            'uploaded_by' => $this->admin->id,
            'is_current'  => true,
        ]);

        $response = $this->getJson('/api/v1/catalogue/current');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'version', 'file_url', 'updated_at']]);
    }

    // ── Admin: list ───────────────────────────────────────────────────────

    public function test_admin_can_list_catalogues(): void
    {
        Sanctum::actingAs($this->admin);

        Catalogue::create([
            'file_path'   => 'catalogue/a.pdf',
            'version'     => '2024-01',
            'uploaded_by' => $this->admin->id,
            'is_current'  => true,
        ]);

        $response = $this->getJson('/api/v1/catalogues');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure(['data' => [['id', 'version', 'file_url', 'is_current', 'uploaded_by', 'created_at']]]);
    }

    public function test_executive_cannot_list_catalogues(): void
    {
        Sanctum::actingAs($this->executive);

        $this->getJson('/api/v1/catalogues')->assertForbidden();
    }

    // ── Admin: upload ─────────────────────────────────────────────────────

    public function test_admin_can_upload_pdf(): void
    {
        Sanctum::actingAs($this->admin);

        $file = UploadedFile::fake()->create('catalogue.pdf', 500, 'application/pdf');

        $response = $this->postJson('/api/v1/catalogues', [
            'file'    => $file,
            'version' => '2024-Q1',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.version', '2024-Q1')
            ->assertJsonPath('data.is_current', false);

        $this->assertDatabaseHas('catalogues', ['version' => '2024-Q1']);
    }

    public function test_upload_rejects_non_pdf(): void
    {
        Sanctum::actingAs($this->admin);

        $file = UploadedFile::fake()->create('image.jpg', 100, 'image/jpeg');

        $this->postJson('/api/v1/catalogues', ['file' => $file])
            ->assertUnprocessable();
    }

    public function test_upload_rejects_oversized_pdf(): void
    {
        Sanctum::actingAs($this->admin);

        $file = UploadedFile::fake()->create('big.pdf', 25000, 'application/pdf');

        $this->postJson('/api/v1/catalogues', ['file' => $file])
            ->assertUnprocessable();
    }

    // ── Admin: set-current ────────────────────────────────────────────────

    public function test_toggle_active_activates_inactive_catalogue(): void
    {
        Sanctum::actingAs($this->admin);

        $catalogue = Catalogue::create([
            'file_path'   => 'catalogue/new.pdf',
            'version'     => '2024-01',
            'uploaded_by' => $this->admin->id,
            'is_current'  => false,
        ]);

        $this->patchJson("/api/v1/catalogues/{$catalogue->id}/toggle-active")
            ->assertOk()
            ->assertJsonPath('data.is_current', true);

        $this->assertDatabaseHas('catalogues', ['id' => $catalogue->id, 'is_current' => true]);
    }

    public function test_toggle_active_allows_multiple_active(): void
    {
        Sanctum::actingAs($this->admin);

        $first = Catalogue::create([
            'file_path'   => 'catalogue/first.pdf',
            'version'     => '2023-01',
            'uploaded_by' => $this->admin->id,
            'is_current'  => true,
        ]);

        $second = Catalogue::create([
            'file_path'   => 'catalogue/second.pdf',
            'version'     => '2024-01',
            'uploaded_by' => $this->admin->id,
            'is_current'  => false,
        ]);

        $this->patchJson("/api/v1/catalogues/{$second->id}/toggle-active")->assertOk();

        $this->assertDatabaseHas('catalogues', ['id' => $first->id,  'is_current' => true]);
        $this->assertDatabaseHas('catalogues', ['id' => $second->id, 'is_current' => true]);
    }

    public function test_toggle_active_deactivates_active_catalogue(): void
    {
        Sanctum::actingAs($this->admin);

        $catalogue = Catalogue::create([
            'file_path'   => 'catalogue/active.pdf',
            'version'     => '2024-01',
            'uploaded_by' => $this->admin->id,
            'is_current'  => true,
        ]);

        $this->patchJson("/api/v1/catalogues/{$catalogue->id}/toggle-active")
            ->assertOk()
            ->assertJsonPath('data.is_current', false);

        $this->assertDatabaseHas('catalogues', ['id' => $catalogue->id, 'is_current' => false]);
    }

    // ── Admin: delete ─────────────────────────────────────────────────────

    public function test_admin_can_delete_non_current_catalogue(): void
    {
        Sanctum::actingAs($this->admin);

        $file = UploadedFile::fake()->create('c.pdf', 100, 'application/pdf');
        $path = Storage::disk('public')->putFileAs('catalogue', $file, 'c.pdf');

        $catalogue = Catalogue::create([
            'file_path'   => $path,
            'version'     => '2024-01',
            'uploaded_by' => $this->admin->id,
            'is_current'  => false,
        ]);

        $this->deleteJson("/api/v1/catalogues/{$catalogue->id}")->assertOk();

        $this->assertDatabaseMissing('catalogues', ['id' => $catalogue->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_admin_can_delete_active_catalogue(): void
    {
        Sanctum::actingAs($this->admin);

        $file = UploadedFile::fake()->create('active.pdf', 100, 'application/pdf');
        $path = Storage::disk('public')->putFileAs('catalogue', $file, 'active.pdf');

        $catalogue = Catalogue::create([
            'file_path'   => $path,
            'version'     => '2024-01',
            'uploaded_by' => $this->admin->id,
            'is_current'  => true,
        ]);

        $this->deleteJson("/api/v1/catalogues/{$catalogue->id}")->assertOk();

        $this->assertDatabaseMissing('catalogues', ['id' => $catalogue->id]);
        Storage::disk('public')->assertMissing($path);
    }
}
