export interface Stats {
  totalQuizzes: number;
  totalQuestions: number;
  totalUsers: number;
}

export interface Attempt {
  id: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
  quizTitle: string;
}
