export interface User {
  id: number;
  displayName: string;
  email: string;
  createdAt: string;
  role: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface UserStats {
  quizzesPlayed: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  bestStreak: number;
}
