<?php

namespace Tests\Feature;

use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizTest;
use App\Models\QuizTestAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class QuizApiTest extends TestCase
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

    private function makeQuiz(array $attrs = []): QuizTest
    {
        $admin = $this->makeUser('admin');
        return QuizTest::create(array_merge([
            'title'         => 'Product Knowledge Test',
            'passing_score' => 70,
            'created_by'    => $admin->id,
            'is_active'     => true,
        ], $attrs));
    }

    private function addQuestion(QuizTest $quiz, int $correct = 0): QuizQuestion
    {
        return QuizQuestion::create([
            'quiz_id'        => $quiz->id,
            'question_text'  => 'What is PET?',
            'options'        => ['Polyethylene Terephthalate', 'Polymer', 'Plastic', 'None'],
            'correct_option' => $correct,
            'display_order'  => 1,
        ]);
    }

    private function assignToTrainee(QuizTest $quiz, User $trainee, User $admin): QuizTestAssignment
    {
        return QuizTestAssignment::create([
            'quiz_id'         => $quiz->id,
            'trainee_id'      => $trainee->id,
            'assigned_by'     => $admin->id,
            'assigned_at'     => now(),
            'retake_approved' => false,
        ]);
    }

    // ── Admin quiz management ─────────────────────────────────────────────

    public function test_admin_can_create_quiz_with_questions(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->postJson('/api/v1/quiz-tests', [
            'title'         => 'Onboarding Test',
            'passing_score' => 75,
            'questions'     => [
                [
                    'question_text'  => 'What material is a PET bottle?',
                    'options'        => ['Glass', 'PET Plastic', 'Aluminium', 'Steel'],
                    'correct_option' => 1,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Onboarding Test')
            ->assertJsonCount(1, 'data.questions');

        $this->assertDatabaseHas('quiz_tests', ['title' => 'Onboarding Test']);
        $this->assertDatabaseHas('quiz_questions', ['correct_option' => 1]);
    }

    public function test_admin_can_assign_quiz_to_trainee(): void
    {
        $admin   = $this->makeUser('admin');
        $trainee = $this->makeUser('trainee');
        $quiz    = $this->makeQuiz();

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/quiz-tests/{$quiz->id}/assign", [
            'trainee_ids' => [$trainee->id],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.message', 'Quiz assigned to 1 trainees');

        $this->assertDatabaseHas('quiz_test_assignments', [
            'quiz_id'    => $quiz->id,
            'trainee_id' => $trainee->id,
        ]);
    }

    // ── Quiz show / access control ────────────────────────────────────────

    public function test_trainee_can_view_assigned_quiz_without_correct_answers(): void
    {
        $quiz    = $this->makeQuiz();
        $trainee = $this->makeUser('trainee');
        $this->addQuestion($quiz);
        $this->assignToTrainee($quiz, $trainee, $this->makeUser('admin'));

        Sanctum::actingAs($trainee);

        $response = $this->getJson("/api/v1/quiz-tests/{$quiz->id}");

        $response->assertOk();
        $questions = $response->json('data.questions');
        $this->assertArrayNotHasKey('correct_option', $questions[0]);
    }

    public function test_trainee_cannot_view_unassigned_quiz(): void
    {
        $quiz    = $this->makeQuiz();
        $trainee = $this->makeUser('trainee');

        Sanctum::actingAs($trainee);

        $response = $this->getJson("/api/v1/quiz-tests/{$quiz->id}");

        $response->assertStatus(403);
    }

    // ── Quiz attempts ─────────────────────────────────────────────────────

    public function test_trainee_can_submit_quiz_attempt_and_get_score(): void
    {
        $quiz    = $this->makeQuiz(['passing_score' => 50]);
        $trainee = $this->makeUser('trainee');
        $this->addQuestion($quiz, 0);
        $this->assignToTrainee($quiz, $trainee, $this->makeUser('admin'));

        Sanctum::actingAs($trainee);

        $response = $this->postJson("/api/v1/quiz-tests/{$quiz->id}/attempt", [
            'answers' => [0], // correct answer
        ]);

        $response->assertOk()
            ->assertJsonPath('data.score', 100)
            ->assertJsonPath('data.passed', true)
            ->assertJsonMissing(['wrong_answers']);
    }

    public function test_trainee_cannot_retake_without_approval(): void
    {
        $quiz    = $this->makeQuiz();
        $trainee = $this->makeUser('trainee');
        $admin   = $this->makeUser('admin');
        $this->addQuestion($quiz);
        $this->assignToTrainee($quiz, $trainee, $admin);

        // First attempt
        QuizAttempt::create([
            'quiz_id'      => $quiz->id,
            'trainee_id'   => $trainee->id,
            'answers'      => [0],
            'score'        => 100,
            'passed'       => true,
            'attempted_at' => now(),
        ]);

        Sanctum::actingAs($trainee);

        $response = $this->postJson("/api/v1/quiz-tests/{$quiz->id}/attempt", [
            'answers' => [0],
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You have already completed this quiz. Contact admin for a retake.');
    }

    public function test_admin_can_approve_retake(): void
    {
        $quiz    = $this->makeQuiz();
        $trainee = $this->makeUser('trainee');
        $admin   = $this->makeUser('admin');
        $this->addQuestion($quiz);
        $this->assignToTrainee($quiz, $trainee, $admin);

        $attempt = QuizAttempt::create([
            'quiz_id'      => $quiz->id,
            'trainee_id'   => $trainee->id,
            'answers'      => [1],
            'score'        => 0,
            'passed'       => false,
            'attempted_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/quiz-attempts/{$attempt->id}/approve-retake");

        $response->assertOk()
            ->assertJsonPath('data.retake_approved', true);

        $this->assertDatabaseHas('quiz_test_assignments', [
            'quiz_id'         => $quiz->id,
            'trainee_id'      => $trainee->id,
            'retake_approved' => true,
        ]);
    }

    public function test_admin_can_view_quiz_results(): void
    {
        $quiz    = $this->makeQuiz();
        $trainee = $this->makeUser('trainee');
        $admin   = $this->makeUser('admin');
        $this->addQuestion($quiz);

        QuizAttempt::create([
            'quiz_id'      => $quiz->id,
            'trainee_id'   => $trainee->id,
            'answers'      => [0],
            'score'        => 100,
            'passed'       => true,
            'attempted_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/v1/quiz-tests/{$quiz->id}/results");

        $response->assertOk()
            ->assertJsonStructure(['summary' => ['total_attempts', 'pass_rate', 'average_score'], 'data']);
    }

    public function test_trainee_can_list_assigned_quizzes_via_my_quizzes(): void
    {
        $quiz    = $this->makeQuiz();
        $trainee = $this->makeUser('trainee');
        $admin   = $this->makeUser('admin');
        $this->addQuestion($quiz);
        $this->assignToTrainee($quiz, $trainee, $admin);

        // Create a second quiz NOT assigned to this trainee
        $quiz2 = $this->makeQuiz(['title' => 'Unassigned Quiz']);

        Sanctum::actingAs($trainee);

        $response = $this->getJson('/api/v1/my-quizzes');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($quiz->id, $data[0]['id']);
        $this->assertArrayHasKey('questions_count', $data[0]);
        $this->assertArrayHasKey('attempted', $data[0]);
        $this->assertFalse($data[0]['attempted']);
    }

    public function test_my_quizzes_shows_attempt_status(): void
    {
        $quiz    = $this->makeQuiz(['passing_score' => 50]);
        $trainee = $this->makeUser('trainee');
        $admin   = $this->makeUser('admin');
        $this->addQuestion($quiz, 0);
        $this->assignToTrainee($quiz, $trainee, $admin);

        QuizAttempt::create([
            'quiz_id'      => $quiz->id,
            'trainee_id'   => $trainee->id,
            'answers'      => [0],
            'score'        => 100,
            'passed'       => true,
            'attempted_at' => now(),
        ]);

        Sanctum::actingAs($trainee);

        $response = $this->getJson('/api/v1/my-quizzes');

        $response->assertOk();
        $data = $response->json('data.0');
        $this->assertTrue($data['attempted']);
        $this->assertEquals(100, $data['score']);
        $this->assertTrue($data['passed']);
    }

    public function test_correct_option_not_exposed_to_trainee_in_show(): void
    {
        $quiz    = $this->makeQuiz();
        $trainee = $this->makeUser('trainee');
        $admin   = $this->makeUser('admin');
        $this->addQuestion($quiz, 2);
        $this->assignToTrainee($quiz, $trainee, $admin);

        Sanctum::actingAs($trainee);

        $response = $this->getJson("/api/v1/quiz-tests/{$quiz->id}");

        $response->assertOk();
        $question = $response->json('data.questions.0');
        $this->assertArrayNotHasKey('correct_option', $question);
    }
}
