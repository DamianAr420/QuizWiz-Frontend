export interface Question {
  id?: number;
  text: string;
  correctAnswer: string;
  distractors: string[];
}

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  timeLimitSeconds: number;
  maxQuestions: number;
  questions: Question[];
  questionsCount?: number;
  isOfficial: boolean;
}

export interface CreateQuizDto extends Omit<Quiz, "id" | "questionsCount"> {}
