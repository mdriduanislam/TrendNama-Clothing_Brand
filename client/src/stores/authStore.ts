import {
  AuthStoreActionsType,
  AuthStoreStateType,
  LoginFormInputs,
} from "@/types";
import { create } from "zustand";

const useAuthStore = create<AuthStoreStateType & AuthStoreActionsType>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  bootstrap: async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const result = await response.json();

      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  login: async (payload: LoginFormInputs) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: result.error || "Login failed. Please try again.",
        };
      }

      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "Network error. Please try again.",
      };
    }
  },
  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
