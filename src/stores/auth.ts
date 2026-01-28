import { defineStore } from "pinia";
import api from "@/services/api";
import type { AuthState, AuthResponse } from "@/types/user";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(identifier: string, passwordHash: string) {
      this.loading = true;
      try {
        const response = await api.post<AuthResponse>("/auth/login", {
          identifier,
          password: passwordHash,
        });
        this.setAuth(response.data);
      } catch (error: any) {
        throw error.response?.data?.message || "Błąd logowania";
      } finally {
        this.loading = false;
      }
    },

    async register(displayName: string, email: string, passwordHash: string) {
      this.loading = true;
      try {
        const response = await api.post<AuthResponse>("/auth/register", {
          displayName,
          email,
          password: passwordHash,
        });
        this.setAuth(response.data);
      } catch (error: any) {
        throw error.response?.data?.message || "Błąd rejestracji";
      } finally {
        this.loading = false;
      }
    },

    setAuth(data: AuthResponse) {
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});
