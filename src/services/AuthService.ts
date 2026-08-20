import { clearSession } from "../session/clearSession";
import { setSession, DEFAULT_SESSION_TTL_MS } from "../session/setSession";
import { STORAGE_KEYS } from "../session/storageKeys";
import {
  handleUnauthorized,
  SESSION_EXPIRED_ERROR,
} from "../session/auth";

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface SignInResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

export const AuthService = {
  async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    try {
      if (!API_BASE) {
        return {
          success: false,
          error: "API URL is not configured.",
        };
      }

      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error:
            data?.message ||
            data?.error ||
            "Invalid email or password. Please try again.",
        };
      }

      if (data.token && data.user) {
        // Record an expiry so the routing layer can treat a past-expiry token
        // as signed out. `expiresAt` from the backend is epoch seconds (JWT
        // convention); when absent, fall back to the documented TTL.
        const backendExpiresAt =
          typeof data.expiresAt === "number" ? data.expiresAt * 1000 : undefined;

        setSession({
          token: data.token,
          user: data.user,
          expiresAt: backendExpiresAt ?? Date.now() + DEFAULT_SESSION_TTL_MS,
        });
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (err) {
      console.error("AuthService.signIn error:", err);
      return {
        success: false,
        error: !navigator.onLine
          ? "You appear to be offline. Check your connection and try again."
          : "Unable to reach the server. Please try again in a moment.",
      };
    }
  },

  logout() {
    clearSession();
  },

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        return { success: false, error: "No token found." };
      }

      const res = await fetch(`${API_BASE}/auth/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // A 401 means the session expired or was revoked — that is the
      // centralized expiry path, not a generic deletion failure.
      if (res.status === 401) {
        handleUnauthorized();
        return { success: false, error: SESSION_EXPIRED_ERROR };
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data?.message || data?.error || "Failed to delete account.",
        };
      }

      clearSession();
      return { success: true };
    } catch (err) {
      console.error("AuthService.deleteAccount error:", err);
      return {
        success: false,
        error: !navigator.onLine
          ? "You appear to be offline. Check your connection and try again."
          : "Unable to reach the server. Please try again in a moment.",
      };
    }
  },
};
