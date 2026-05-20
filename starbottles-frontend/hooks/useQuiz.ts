import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface QuizQuestion {
  id: number;
  question_text: string;
  options: string[];
  display_order: number;
  correct_option?: number; // only for admin
}

export interface QuizDetail {
  id: number;
  title: string;
  passing_score: number;
  questions: QuizQuestion[];
}

export interface QuizListItem {
  id: number;
  title: string;
  passing_score: number;
  questions_count: number;
  attempts_count: number;
  assignments_count: number;
  pass_rate: number | null;
  is_active: boolean;
  created_at: string;
}

export interface QuizAttemptResult {
  score: number;
  passed: boolean;
  correct_count: number;
  total_count: number;
  passing_score: number;
}

export interface QuizResultRow {
  id: number;
  trainee_name: string;
  score: number;
  passed: boolean;
  attempted_at: string;
}

export interface QuizResultsResponse {
  success: boolean;
  summary: {
    total_attempts: number;
    pass_rate: number;
    average_score: number;
  };
  data: QuizResultRow[];
  meta: { pagination: { total: number; per_page: number; current_page: number; last_page: number } };
}

export interface MyQuizItem {
  id: number;
  title: string;
  passing_score: number;
  questions_count: number;
  attempted: boolean;
  score: number | null;
  passed: boolean;
  retake_approved: boolean;
}

export interface QuizReviewQuestion {
  id: number;
  question_text: string;
  options: string[];
  correct_option: number;
  marked_option: number | null;
  is_correct: boolean;
}

export interface QuizReviewData {
  id: number;
  title: string;
  passing_score: number;
  score: number;
  passed: boolean;
  correct_count: number;
  total_count: number;
  attempted_at: string;
  questions: QuizReviewQuestion[];
}

export function useQuizReview(id: number | null) {
  return useQuery<QuizReviewData>({
    queryKey: ["quiz-review", id],
    queryFn: () => api.get(`/v1/quiz-tests/${id}/review`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useMyQuizzes() {
  return useQuery<MyQuizItem[]>({
    queryKey: ["my-quizzes"],
    queryFn: () => api.get("/v1/my-quizzes").then((r) => r.data.data),
  });
}

export function useQuiz(id: number | null) {
  return useQuery<QuizDetail>({
    queryKey: ["quiz", id],
    queryFn: () => api.get(`/v1/quiz-tests/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useAdminQuizzes() {
  return useQuery<{ data: QuizListItem[]; meta: { pagination: object } }>({
    queryKey: ["admin-quizzes"],
    queryFn: () => api.get("/v1/quiz-tests").then((r) => r.data),
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      passing_score: number;
      questions: { question_text: string; options: string[]; correct_option: number }[];
    }) => api.post("/v1/quiz-tests", payload).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
  });
}

export function useAssignQuiz(quizId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (traineeIds: number[]) =>
      api.post(`/v1/quiz-tests/${quizId}/assign`, { trainee_ids: traineeIds }).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
  });
}

export function useQuizResults(quizId: number) {
  return useQuery<QuizResultsResponse>({
    queryKey: ["quiz-results", quizId],
    queryFn: () => api.get(`/v1/quiz-tests/${quizId}/results`).then((r) => r.data),
  });
}

export function useSubmitQuizAttempt(quizId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: number[]) =>
      api.post(`/v1/quiz-tests/${quizId}/attempt`, { answers }).then((r) => r.data.data as QuizAttemptResult),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });
}

export function useApproveRetake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: number) =>
      api.post(`/v1/quiz-attempts/${attemptId}/approve-retake`).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-results"] });
    },
  });
}
