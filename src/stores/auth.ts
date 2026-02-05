import { defineStore } from "pinia";
import api from "@/services/api";
import type { AuthState, AuthResponse } from "@/types/user";
import { useToastStore } from "./toast";
import i18n from "@/i18n/index";

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
      const toast = useToastStore();
      const t = i18n.global.t;
      try {
        const response = await api.post<AuthResponse>("/auth/login", {
          identifier,
          password: passwordHash,
        });
        this.setAuth(response.data);
        toast.show(
          t("auth.loginSuccess", { name: response.data.user.displayName }),
          "success",
        );
      } catch (error: any) {
        const msg = error.response?.data?.message || "Błąd logowania";
        toast.show(msg, "error");
        throw msg;
      } finally {
        this.loading = false;
      }
    },

    async register(displayName: string, email: string, passwordHash: string) {
      this.loading = true;
      const toast = useToastStore();
      const t = i18n.global.t;
      try {
        const response = await api.post<AuthResponse>("/auth/register", {
          displayName,
          email,
          password: passwordHash,
        });
        this.setAuth(response.data);
        toast.show(t("auth.registerSuccess"), "success");
      } catch (error: any) {
        const msg = error.response?.data?.message || "Błąd rejestracji";
        toast.show(t("auth.registerError"), "error");
        throw msg;
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
      const toast = useToastStore();
      const t = i18n.global.t;
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.show(t("auth.logoutSuccess"), "info");
    },
  },
});
