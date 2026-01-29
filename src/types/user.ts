export interface User {
  id: number;
  displayName: string;
  email: string;
  createdAt: string;
  role: string;
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
