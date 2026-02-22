export interface Question {
  id?: number;
  text: string;
  correctAnswer: string;
  distractors: string[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimitSeconds: number;
  maxQuestions: number;
  questions: Question[];
  questionsCount: number;
  isOfficial: boolean;
  isVisible: boolean;
  isPlayable: boolean;
  authorId?: string;
  isVerified: boolean;
  createdAt?: string;
  isCompletedToday?: boolean;
}

export interface CreateQuizDto extends Omit<
  Quiz,
  "id" | "questionsCount" | "questions" | "isVerified" | "isOfficial"
> {
  questions: Omit<Question, "id">[];
  isOfficial?: boolean;
  isVerified?: boolean;
}

export interface UpdateQuizDto extends CreateQuizDto {}

export interface QuizSubmitResult {
  pointsGained: number;
  xpGained: number;
  isLevelUp: boolean;
  currentLevel: number;
  newTotalPoints?: number;
  newExperience?: number;
}
