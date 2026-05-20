<?php

namespace App\Http\Controllers\Api;

use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizTest;
use App\Models\QuizTestAssignment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $quizzes = QuizTest::withCount(['questions', 'attempts', 'assignments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $data = $quizzes->map(function ($quiz) {
            $total    = $quiz->attempts_count;
            $passed   = QuizAttempt::where('quiz_id', $quiz->id)->where('passed', true)->count();
            $passRate = $total > 0 ? round(($passed / $total) * 100) : null;

            return [
                'id'              => $quiz->id,
                'title'           => $quiz->title,
                'passing_score'   => $quiz->passing_score,
                'questions_count' => $quiz->questions_count,
                'attempts_count'  => $total,
                'assignments_count' => $quiz->assignments_count,
                'pass_rate'       => $passRate,
                'is_active'       => $quiz->is_active,
                'created_at'      => $quiz->created_at->toIso8601String(),
            ];
        });

        return $this->paginatedResponse(
            $quizzes->setCollection($data)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'                           => 'required|string|max:255',
            'passing_score'                   => 'required|integer|min:0|max:100',
            'questions'                       => 'required|array|min:1',
            'questions.*.question_text'       => 'required|string',
            'questions.*.options'             => 'required|array|size:4',
            'questions.*.options.*'           => 'required|string',
            'questions.*.correct_option'      => 'required|integer|min:0|max:3',
        ]);

        $quiz = QuizTest::create([
            'title'         => $data['title'],
            'passing_score' => $data['passing_score'],
            'created_by'    => $request->user()->id,
            'is_active'     => true,
        ]);

        foreach ($data['questions'] as $index => $q) {
            QuizQuestion::create([
                'quiz_id'        => $quiz->id,
                'question_text'  => $q['question_text'],
                'options'        => $q['options'],
                'correct_option' => $q['correct_option'],
                'display_order'  => $index + 1,
            ]);
        }

        $quiz->load('questions');

        return $this->successResponse([
            'id'            => $quiz->id,
            'title'         => $quiz->title,
            'passing_score' => $quiz->passing_score,
            'questions'     => $quiz->questions->map(fn($q) => [
                'id'             => $q->id,
                'question_text'  => $q->question_text,
                'options'        => $q->options,
                'correct_option' => $q->correct_option,
                'display_order'  => $q->display_order,
            ]),
        ], 'Quiz created', 201);
    }

    /**
     * List quizzes assigned to the current trainee.
     */
    public function myQuizzes(Request $request): JsonResponse
    {
        $user = $request->user();

        $assignedQuizIds = QuizTestAssignment::where('trainee_id', $user->id)
            ->pluck('quiz_id');

        $quizzes = QuizTest::whereIn('id', $assignedQuizIds)
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $quizzes->map(function ($quiz) use ($user) {
            $attempt = QuizAttempt::where('quiz_id', $quiz->id)
                ->where('trainee_id', $user->id)
                ->latest('attempted_at')
                ->first();

            $assignment = QuizTestAssignment::where('quiz_id', $quiz->id)
                ->where('trainee_id', $user->id)
                ->first();

            return [
                'id'              => $quiz->id,
                'title'           => $quiz->title,
                'passing_score'   => $quiz->passing_score,
                'questions_count' => $quiz->questions_count,
                'attempted'       => $attempt !== null,
                'score'           => $attempt?->score,
                'passed'          => $attempt?->passed ?? false,
                'retake_approved' => $assignment?->retake_approved ?? false,
            ];
        });

        return $this->successResponse($data);
    }

    public function show(Request $request, QuizTest $quiz): JsonResponse
    {
        $user  = $request->user();
        $isAdmin = $user->hasRole('admin');

        if (!$isAdmin) {
            $assigned = QuizTestAssignment::where('quiz_id', $quiz->id)
                ->where('trainee_id', $user->id)
                ->exists();

            if (!$assigned) {
                return $this->errorResponse('You are not assigned to this quiz.', 403);
            }
        }

        $quiz->load('questions');

        return $this->successResponse([
            'id'            => $quiz->id,
            'title'         => $quiz->title,
            'passing_score' => $quiz->passing_score,
            'questions'     => $quiz->questions->map(fn($q) => array_merge(
                [
                    'id'            => $q->id,
                    'question_text' => $q->question_text,
                    'options'       => $q->options,
                    'display_order' => $q->display_order,
                ],
                $isAdmin ? ['correct_option' => $q->correct_option] : []
            )),
        ]);
    }

    public function assign(Request $request, QuizTest $quiz): JsonResponse
    {
        $data = $request->validate([
            'trainee_ids'   => 'required|array',
            'trainee_ids.*' => 'required|exists:users,id',
        ]);

        $assigned       = 0;
        $alreadyAssigned = 0;

        foreach ($data['trainee_ids'] as $traineeId) {
            $user = User::find($traineeId);
            if (!$user || !$user->hasRole('trainee')) {
                continue;
            }

            $exists = QuizTestAssignment::where('quiz_id', $quiz->id)
                ->where('trainee_id', $traineeId)
                ->exists();

            if ($exists) {
                $alreadyAssigned++;
                continue;
            }

            QuizTestAssignment::create([
                'quiz_id'         => $quiz->id,
                'trainee_id'      => $traineeId,
                'assigned_by'     => $request->user()->id,
                'assigned_at'     => now(),
                'retake_approved' => false,
            ]);

            $assigned++;
        }

        return $this->successResponse([
            'message'          => "Quiz assigned to {$assigned} trainees",
            'already_assigned' => $alreadyAssigned,
        ]);
    }

    public function attempt(Request $request, QuizTest $quiz): JsonResponse
    {
        $user = $request->user();

        $assignment = QuizTestAssignment::where('quiz_id', $quiz->id)
            ->where('trainee_id', $user->id)
            ->first();

        if (!$assignment) {
            return $this->errorResponse('You are not assigned to this quiz.', 403);
        }

        $existingAttempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('trainee_id', $user->id)
            ->first();

        if ($existingAttempt && !$assignment->retake_approved) {
            return $this->errorResponse(
                'You have already completed this quiz. Contact admin for a retake.',
                403
            );
        }

        $questions = $quiz->questions()->orderBy('display_order')->get();

        $data = $request->validate([
            'answers'   => 'required|array|size:' . $questions->count(),
            'answers.*' => 'required|integer|min:0|max:3',
        ]);

        $correctCount = 0;
        foreach ($questions as $index => $question) {
            if (isset($data['answers'][$index]) && (int) $data['answers'][$index] === $question->correct_option) {
                $correctCount++;
            }
        }

        $total  = $questions->count();
        $score  = $total > 0 ? (int) round(($correctCount / $total) * 100) : 0;
        $passed = $score >= $quiz->passing_score;

        QuizAttempt::create([
            'quiz_id'      => $quiz->id,
            'trainee_id'   => $user->id,
            'answers'      => $data['answers'],
            'score'        => $score,
            'passed'       => $passed,
            'attempted_at' => now(),
        ]);

        if ($passed) {
            $assignment->update(['retake_approved' => false]);
        }

        return $this->successResponse([
            'score'          => $score,
            'passed'         => $passed,
            'correct_count'  => $correctCount,
            'total_count'    => $total,
            'passing_score'  => $quiz->passing_score,
        ]);
    }

    public function review(Request $request, QuizTest $quiz): JsonResponse
    {
        $user = $request->user();

        $assignment = QuizTestAssignment::where('quiz_id', $quiz->id)
            ->where('trainee_id', $user->id)
            ->first();

        if (!$assignment) {
            return $this->errorResponse('You are not assigned to this quiz.', 403);
        }

        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('trainee_id', $user->id)
            ->latest('attempted_at')
            ->first();

        if (!$attempt) {
            return $this->errorResponse('You have not attempted this quiz yet.', 404);
        }

        $questions = $quiz->questions()->orderBy('display_order')->get();
        $traineeAnswers = $attempt->answers ?? [];

        return $this->successResponse([
            'id'            => $quiz->id,
            'title'         => $quiz->title,
            'passing_score' => $quiz->passing_score,
            'score'         => $attempt->score,
            'passed'        => $attempt->passed,
            'correct_count' => collect($questions)->filter(function ($q, $i) use ($traineeAnswers) {
                return isset($traineeAnswers[$i]) && (int) $traineeAnswers[$i] === $q->correct_option;
            })->count(),
            'total_count'   => $questions->count(),
            'attempted_at'  => $attempt->attempted_at->toIso8601String(),
            'questions'     => $questions->map(function ($q, $index) use ($traineeAnswers) {
                $markedAnswer = $traineeAnswers[$index] ?? null;
                return [
                    'id'             => $q->id,
                    'question_text'  => $q->question_text,
                    'options'        => $q->options,
                    'correct_option' => $q->correct_option,
                    'marked_option'  => $markedAnswer !== null ? (int) $markedAnswer : null,
                    'is_correct'     => $markedAnswer !== null && (int) $markedAnswer === $q->correct_option,
                ];
            }),
        ]);
    }

    public function results(Request $request, QuizTest $quiz): JsonResponse
    {
        $attempts = QuizAttempt::with('trainee:id,name')
            ->where('quiz_id', $quiz->id)
            ->orderBy('attempted_at', 'desc')
            ->paginate(20);

        $totalAttempts = $attempts->total();
        $passedCount   = QuizAttempt::where('quiz_id', $quiz->id)->where('passed', true)->count();
        $avgScore      = QuizAttempt::where('quiz_id', $quiz->id)->avg('score');

        $summary = [
            'total_attempts' => $totalAttempts,
            'pass_rate'      => $totalAttempts > 0 ? round(($passedCount / $totalAttempts) * 100) : 0,
            'average_score'  => $avgScore ? round($avgScore) : 0,
        ];

        $data = $attempts->map(fn($a) => [
            'id'           => $a->id,
            'trainee_name' => $a->trainee->name ?? 'Unknown',
            'score'        => $a->score,
            'passed'       => $a->passed,
            'attempted_at' => $a->attempted_at->toIso8601String(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'summary' => $summary,
            'data'    => $data,
            'meta'    => [
                'pagination' => [
                    'total'        => $attempts->total(),
                    'per_page'     => $attempts->perPage(),
                    'current_page' => $attempts->currentPage(),
                    'last_page'    => $attempts->lastPage(),
                    'from'         => $attempts->firstItem(),
                    'to'           => $attempts->lastItem(),
                ],
            ],
        ]);
    }

    public function approveRetake(Request $request, QuizAttempt $attempt): JsonResponse
    {
        $assignment = QuizTestAssignment::where('quiz_id', $attempt->quiz_id)
            ->where('trainee_id', $attempt->trainee_id)
            ->first();

        if (!$assignment) {
            return $this->errorResponse('Assignment not found.', 404);
        }

        $assignment->update(['retake_approved' => true]);

        return $this->successResponse(['retake_approved' => true]);
    }
}
