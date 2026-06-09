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
    currentUser: (state) => state.user,
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
        await api.post("users/ping");
      } catch (error: any) {
        const code = error.response?.data?.code;
        const msg = code ? t(`auth.errors.${code}`) : t("auth.registerError");

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
        const code = error.response?.data?.code;
        const msg = code ? t(`auth.errors.${code}`) : t("auth.registerError");

        toast.show(msg, "error");
        throw msg;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      const toast = useToastStore();
      const t = i18n.global.t;

      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("Wylogowywanie z serwera nie powiodło się", error);
      } finally {
        this.clearAuth();

        toast.show(t("auth.logoutSuccess"), "info");
      }
    },

    setAuth(data: AuthResponse) {
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },

    clearAuth() {
      this.user = null;
      this.token = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});
