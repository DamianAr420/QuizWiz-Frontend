export interface Question {
  id?: string;
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
  isSubmitted?: boolean;
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

export interface GameState {
  isStarted: boolean;
  currentQuestion: string | null;
  answers: string[];
  endTime: string | null;
  scores: Record<string, number>;
  hasAnswered: boolean;
  answeredPlayerIds?: (string | number)[];
  rewards?: Record<
    string,
    {
      experience: number;
      points: number;
      correctAnswers: number;
    }
  >;
}

export interface ReconnectData {
  questionText: string;
  answers: string[];
  currentIndex: number;
  totalQuestions: number;
  endTime: string;
  scores: Record<number, number>;
}

export interface NewQuestionData {
  text: string;
  answers: string[];
  currentIndex: number;
  totalQuestions: number;
  endTime: string;
}
