import { clearSession } from "../session/clearSession";
import { setSession } from "../session/setSession";
import { STORAGE_KEYS } from "../session/storageKeys";

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

/**
 * Thrown by `apiFetch` when the backend URL is not configured. Translated into
 * the public `{ success: false, error }` shape by each caller, so the public
 * return types stay unchanged.
 */
class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigError";
  }
}

const readErrorMessage = (data: unknown, fallback: string): string => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string" && record.message) {
      return record.message;
    }
    if (typeof record.error === "string" && record.error) {
      return record.error;
    }
  }
  return fallback;
};

interface ApiFetchResult {
  ok: boolean;
  data: unknown;
}

/**
 * Single request path for AuthService calls. Enforces that the backend URL is
 * configured (failing closed instead of issuing a relative request that a SPA
 * would answer with its own `index.html`), attaches the bearer token when one
 * is stored and `authenticated` is not disabled, and normalizes the response.
 * A 2xx whose content-type is not JSON is treated as a failure, so a
 * misconfigured environment can never masquerade as a successful backend
 * operation.
 */
async function apiFetch(
  path: string,
  init: RequestInit,
  authenticated = true,
): Promise<ApiFetchResult> {
  if (!API_BASE) {
    throw new ApiConfigError("API URL is not configured.");
  }

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.TOKEN) ||
        window.sessionStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : null;

  return { ok: res.ok && isJson, data };
}

export const AuthService = {
  async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    try {
      const { ok, data } = await apiFetch(
        "/auth/signin",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        },
        false,
      );

      if (!ok) {
        return {
          success: false,
          error: data
            ? readErrorMessage(data, "Invalid email or password. Please try again.")
            : "Unexpected response from the server. Please try again.",
        };
      }

      // Fail closed: a 2xx without a session is a backend contract violation,
      // not a successful sign-in. Never navigate the user away in that case.
      const session = data as { token?: string; user?: AuthUser } | null;
      if (!session?.token || !session?.user) {
        return {
          success: false,
          error: "Sign-in succeeded but no session was returned.",
        };
      }

      setSession({ token: session.token, user: session.user });

      return {
        success: true,
        user: session.user,
        token: session.token,
      };
    } catch (err) {
      console.error("AuthService.signIn error:", err);
      if (err instanceof ApiConfigError) {
        return { success: false, error: err.message };
      }
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

      const { ok, data } = await apiFetch("/auth/delete", {
        method: "DELETE",
      });

      if (!ok) {
        return {
          success: false,
          error: data
            ? readErrorMessage(data, "Failed to delete account.")
            : "Failed to delete account.",
        };
      }

      clearSession();
      return { success: true };
    } catch (err) {
      console.error("AuthService.deleteAccount error:", err);
      if (err instanceof ApiConfigError) {
        return { success: false, error: err.message };
      }
      return {
        success: false,
        error: !navigator.onLine
          ? "You appear to be offline. Check your connection and try again."
          : "Unable to reach the server. Please try again in a moment.",
      };
    }
  },
};
