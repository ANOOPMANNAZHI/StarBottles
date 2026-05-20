<?php

namespace Database\Seeders;

use App\Models\CompanyInfoSection;
use App\Models\Enquiry;
use App\Models\EnquiryNote;
use App\Models\ErpSyncLog;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizTest;
use App\Models\QuizTestAssignment;
use App\Models\TrainingMaterial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UatSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (['admin', 'executive', 'trainee'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // ── Users ─────────────────────────────────────────────────────────
        $admin = $this->makeUser('Admin User',  'admin@starbottles.com',    'Admin@2024',   'admin');
        $exec1 = $this->makeUser('Ravi Kumar',  'exec1@starbottles.com',    'Exec@2024',    'executive');
        $exec2 = $this->makeUser('Priya Singh', 'exec2@starbottles.com',    'Exec@2024',    'executive');
        $exec3 = $this->makeUser('Arun Mehta',  'exec3@starbottles.com',    'Exec@2024',    'executive');
        $t1    = $this->makeUser('Sonal Patel', 'trainee1@starbottles.com', 'Trainee@2024', 'trainee');
        $t2    = $this->makeUser('Vikram Das',  'trainee2@starbottles.com', 'Trainee@2024', 'trainee');

        // ── Product Categories ─────────────────────────────────────────────
        $catPet   = ProductCategory::firstOrCreate(['slug' => 'pet-bottles'],      ['name' => 'PET Bottles']);
        $catHdpe  = ProductCategory::firstOrCreate(['slug' => 'hdpe-containers'],  ['name' => 'HDPE Containers']);
        $catGlass = ProductCategory::firstOrCreate(['slug' => 'glass-jars'],       ['name' => 'Glass Jars']);
        $catPp    = ProductCategory::firstOrCreate(['slug' => 'pp-other'],         ['name' => 'PP / Other']);

        // ── Products (20 total) ────────────────────────────────────────────
        $petProducts = [
            ['PET Round 500ml',   'pet', '500ml', 'round'],
            ['PET Square 1L',     'pet', '1000ml', 'square'],
            ['PET Oval 750ml',    'pet', '750ml', 'oval'],
            ['PET Boston Round',  'pet', '250ml', 'boston_round'],
            ['PET Spray Bottle',  'pet', '300ml', 'spray'],
        ];

        $hdpeProducts = [
            ['HDPE Wide Mouth Jar', 'hdpe', '500ml', 'wide_mouth'],
            ['HDPE Cream Jar',      'hdpe', '200ml', 'cream'],
            ['HDPE Canister 5L',    'hdpe', '5000ml', 'canister'],
            ['HDPE Dropper 30ml',   'hdpe', '30ml', 'dropper'],
            ['HDPE Flip-Top',       'hdpe', '200ml', 'flip_top'],
        ];

        $glassProducts = [
            ['Amber Glass Jar 100ml', 'glass', '100ml', 'amber'],
            ['Clear Glass Jar 250ml', 'glass', '250ml', 'clear'],
            ['Frosted Glass 500ml',   'glass', '500ml', 'frosted'],
            ['Glass Boston Round',    'glass', '150ml', 'boston_round'],
            ['Hexagonal Glass Jar',   'glass', '300ml', 'hexagonal'],
        ];

        $ppProducts = [
            ['PP Pump Bottle 300ml',   'pp', '300ml', 'pump'],
            ['PP Trigger Sprayer',     'pp', '500ml', 'trigger'],
            ['Lotion Pump 200ml',      'pp', '200ml', 'lotion'],
            ['Tottle 100ml',           'pp', '100ml', 'tottle'],
            ['Disc Cap Container',     'pp', '250ml', 'disc_cap'],
        ];

        foreach ($petProducts as $i => [$title, $material, $capacity, $shape]) {
            Product::firstOrCreate(['erp_id' => "PET{$i}"], [
                'title' => $title, 'material' => $material, 'capacity' => $capacity,
                'shape_type' => $shape, 'category_id' => $catPet->id,
                'is_active' => true, 'is_hidden' => false, 'is_featured' => $i === 0,
                'description' => "High-quality {$title} for food and beverage packaging.",
            ]);
        }

        foreach ($hdpeProducts as $i => [$title, $material, $capacity, $shape]) {
            Product::firstOrCreate(['erp_id' => "HDPE{$i}"], [
                'title' => $title, 'material' => $material, 'capacity' => $capacity,
                'shape_type' => $shape, 'category_id' => $catHdpe->id,
                'is_active' => true, 'is_hidden' => false, 'is_featured' => false,
                'description' => "Durable {$title} for pharmaceutical and personal care use.",
            ]);
        }

        foreach ($glassProducts as $i => [$title, $material, $capacity, $shape]) {
            Product::firstOrCreate(['erp_id' => "GLASS{$i}"], [
                'title' => $title, 'material' => $material, 'capacity' => $capacity,
                'shape_type' => $shape, 'category_id' => $catGlass->id,
                'is_active' => true, 'is_hidden' => false, 'is_featured' => false,
                'description' => "Premium {$title} for cosmetics and gourmet food.",
            ]);
        }

        foreach ($ppProducts as $i => [$title, $material, $capacity, $shape]) {
            Product::firstOrCreate(['erp_id' => "PP{$i}"], [
                'title' => $title, 'material' => $material, 'capacity' => $capacity,
                'shape_type' => $shape, 'category_id' => $catPp->id,
                'is_active' => true, 'is_hidden' => false, 'is_featured' => false,
                'description' => "Versatile {$title} for household and industrial use.",
            ]);
        }

        // ── Enquiries (10) ────────────────────────────────────────────────
        // 3 for exec1
        $e1 = Enquiry::create(['customer_name' => 'Rajesh Sharma',  'phone' => '9876543001', 'source' => 'website',  'status' => 'new',              'assigned_to' => $exec1->id, 'received_at' => now()->subDays(5)]);
        $e2 = Enquiry::create(['customer_name' => 'Meena Joshi',    'phone' => '9876543002', 'source' => 'whatsapp', 'status' => 'contacted',         'assigned_to' => $exec1->id, 'received_at' => now()->subDays(10), 'first_action_at' => now()->subDays(9)]);
        $e3 = Enquiry::create(['customer_name' => 'Suresh Patil',   'phone' => '9876543003', 'source' => 'website',  'status' => 'follow_up_pending', 'assigned_to' => $exec1->id, 'received_at' => now()->subDays(15), 'first_action_at' => now()->subDays(14), 'follow_up_date' => now()->addDays(2)->toDateString()]);

        // 3 for exec2
        $e4 = Enquiry::create(['customer_name' => 'Anita Desai',    'phone' => '9876543004', 'source' => 'website',  'status' => 'qualified_lead', 'assigned_to' => $exec2->id, 'received_at' => now()->subDays(20), 'first_action_at' => now()->subDays(19)]);
        $e5 = Enquiry::create(['customer_name' => 'Ritu Agarwal',   'phone' => '9876543005', 'source' => 'email',    'status' => 'closed_won',     'assigned_to' => $exec2->id, 'received_at' => now()->subDays(25), 'first_action_at' => now()->subDays(24)]);
        $e6 = Enquiry::create(['customer_name' => 'Vijay Nair',     'phone' => '9876543006', 'source' => 'website',  'status' => 'closed_lost',    'assigned_to' => $exec2->id, 'received_at' => now()->subDays(30), 'first_action_at' => now()->subDays(29)]);

        // 2 for exec3 (with overdue follow-up)
        $e7 = Enquiry::create(['customer_name' => 'Kavita Rao',     'phone' => '9876543007', 'source' => 'whatsapp', 'status' => 'new',              'assigned_to' => $exec3->id, 'received_at' => now()->subDays(3)]);
        $e8 = Enquiry::create(['customer_name' => 'Dinesh Gupta',   'phone' => '9876543008', 'source' => 'website',  'status' => 'follow_up_pending', 'assigned_to' => $exec3->id, 'received_at' => now()->subDays(8), 'first_action_at' => now()->subDays(7), 'follow_up_date' => now()->subDays(2)->toDateString()]);

        // 2 unassigned
        $e9  = Enquiry::create(['customer_name' => 'Pooja Verma',   'phone' => '9876543009', 'source' => 'website',  'status' => 'new', 'received_at' => now()->subDays(1)]);
        $e10 = Enquiry::create(['customer_name' => 'Amit Tiwari',   'phone' => '9876543010', 'source' => 'website',  'status' => 'new', 'received_at' => now()]);

        // ── Enquiry Notes ─────────────────────────────────────────────────
        EnquiryNote::create(['enquiry_id' => $e1->id, 'user_id' => $exec1->id, 'note_text' => 'Customer interested in 500ml PET bottles. Will send samples.']);
        EnquiryNote::create(['enquiry_id' => $e2->id, 'user_id' => $exec1->id, 'note_text' => 'Called customer. Needs quote for 10,000 units. Follow up next week.']);
        EnquiryNote::create(['enquiry_id' => $e4->id, 'user_id' => null,       'note_text' => '[WhatsApp] Interested in HDPE jars, please share catalog.']);

        // ── Quiz ──────────────────────────────────────────────────────────
        $quiz = QuizTest::firstOrCreate(['title' => 'Product Knowledge Test'], [
            'passing_score' => 70,
            'created_by'    => $admin->id,
            'is_active'     => true,
        ]);

        $questions = [
            ['What material is PET?', ['Plastic', 'Glass', 'Metal', 'Ceramic'], 0],
            ['Which closure type is used for pumps?', ['Screw cap', 'Pump closure', 'Disc cap', 'Flip-top'], 1],
            ['HDPE stands for?', ['Hard Dense Polymer', 'High-Density Polyethylene', 'Heavy Duty Plastic', 'Hardened Dense PE'], 1],
            ['Which product is suitable for pharmaceutical use?', ['PET Round', 'HDPE Dropper', 'Glass Boston Round', 'Both B and C'], 3],
            ['What does BIS certification indicate?', ['Bureau of Indian Standards', 'Best Industry Score', 'Business Integration System', 'Basic Industrial Safety'], 0],
        ];

        foreach ($questions as $i => [$text, $opts, $correct]) {
            QuizQuestion::firstOrCreate(['quiz_id' => $quiz->id, 'display_order' => $i + 1], [
                'question_text'  => $text,
                'options'        => $opts,
                'correct_option' => $correct,
            ]);
        }

        // Assign to trainees
        foreach ([$t1, $t2] as $trainee) {
            QuizTestAssignment::firstOrCreate(
                ['quiz_id' => $quiz->id, 'trainee_id' => $trainee->id],
                ['assigned_by' => $admin->id, 'assigned_at' => now(), 'retake_approved' => false]
            );
        }

        // Trainee1 has a completed attempt (score 80, passed)
        QuizAttempt::firstOrCreate(
            ['quiz_id' => $quiz->id, 'trainee_id' => $t1->id],
            [
                'answers'      => [0, 1, 1, 3, 0],
                'score'        => 80,
                'passed'       => true,
                'attempted_at' => now()->subDays(2),
            ]
        );

        // ── Training Materials ────────────────────────────────────────────
        $pdfs = [
            ['Product Catalogue 2024', 'pdf', 'The complete StarBottles product range for 2024.'],
            ['Company Profile',        'pdf', 'Overview of StarBottles history and capabilities.'],
            ['Material Guide',         'pdf', 'Guide to packaging materials: PET, HDPE, Glass, PP.'],
        ];

        foreach ($pdfs as [$title, $type, $desc]) {
            TrainingMaterial::firstOrCreate(['title' => $title], [
                'type'        => $type,
                'file_path'   => "training/pdf/{$title}.pdf",
                'description' => $desc,
                'uploaded_by' => $admin->id,
                'is_active'   => true,
            ]);
        }

        $videos = [
            ['Manufacturing Process Overview', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ['Product Quality Standards',      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        ];

        foreach ($videos as [$title, $url]) {
            TrainingMaterial::firstOrCreate(['title' => $title], [
                'type'        => 'video',
                'file_path'   => $url,
                'description' => "Training video: {$title}",
                'uploaded_by' => $admin->id,
                'is_active'   => true,
            ]);
        }

        // ── Company Info ──────────────────────────────────────────────────
        $this->call(CompanyInfoSeeder::class);

        // ── ERP Sync Logs ─────────────────────────────────────────────────
        $logs = [
            ['success', 120, 15, null,                    now()->subDays(10)],
            ['success', 0,   8,  null,                    now()->subDays(7)],
            ['success', 5,   22, null,                    now()->subDays(4)],
            ['failed',  0,   0,  'ERP connection timeout', now()->subDays(2)],
            ['success', 2,   10, null,                    now()->subDays(1)],
        ];

        foreach ($logs as [$status, $added, $updated, $error, $at]) {
            ErpSyncLog::create([
                'status'           => $status,
                'products_added'   => $added,
                'products_updated' => $updated,
                'error_message'    => $error,
                'synced_at'        => $at,
            ]);
        }
    }

    private function makeUser(string $name, string $email, string $password, string $role): User
    {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'      => $name,
                'password'  => Hash::make($password),
                'role'      => $role,
                'is_active' => true,
            ]
        );
        $user->syncRoles([$role]);
        return $user;
    }
}
