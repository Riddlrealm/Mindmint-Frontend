import { clearSession } from "../session/clearSession";
import { setSession } from "../session/setSession";

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
        setSession({ token: data.token, user: data.user });
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
        error: "Network error. Please check your connection and try again.",
      };
    }
  },

  logout() {
    clearSession();
  },

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem("quest_token");
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
        error: "Network error. Please check your connection and try again.",
      };
    }
  },
};