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
}

export interface CreateQuizDto extends Omit<Quiz, "id" | "questionsCount"> {}
