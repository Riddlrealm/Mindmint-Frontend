import type { AuthUser } from "./AuthService";
import { clearSession } from "../session/clearSession";
import { setSession } from "../session/setSession";

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "";

/**
 * Google OAuth client id, read from `VITE_GOOGLE_CLIENT_ID`.
 * The "Sign in with Google" button and the `GoogleOAuthProvider` are only
 * mounted when this is configured, so the screen never advertises a Google
 * path the deployment cannot serve.
 */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/**
 * Reads the expiry (`exp`, epoch seconds) out of a Google ID token (a JWT)
 * without verifying its signature. Signature/issuer/audience verification is
 * the backend's responsibility; this is only used to mirror the expiry
 * locally. Returns epoch milliseconds, or null when decoding fails.
 */
function decodeGoogleIdTokenExpiry(credential: string): number | null {
  const segments = credential.split(".");
  if (segments.length !== 3) return null;

  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export interface AuthServiceResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export const GoogleAuthService = {
  /**
   * Exchanges a Google ID token for a Mindmint session.
   *
   * The raw Google credential is never persisted as the app's bearer token.
   * Trust is fully deferred to the backend, which verifies the token's
   * signature, audience (`aud`), and issuer (`iss`) before issuing a Mindmint
   * session token. Only that backend-issued `{ token, user }` is stored via
   * `setSession`, so `Authorization: Bearer <token>` always carries a token
   * the backend issued and accepts.
   *
   * Contract: `POST ${VITE_BACKEND_API_URL}/auth/google` with body
   * `{ credential }` must return the same `SignInResponse` shape as
   * `AuthService.signIn` (`{ token, user }`).
   */
  async handleSignIn(credential: string): Promise<AuthServiceResponse> {
    if (!credential) {
      return { success: false, error: "No ID token received from Google." };
    }

    if (!API_BASE) {
      return { success: false, error: "API URL is not configured." };
    }

    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error:
            data?.message ||
            data?.error ||
            "Google sign-in failed. Please try again.",
        };
      }

      // Fail closed: a 2xx without a session is a backend contract violation,
      // not a successful sign-in.
      if (!data.token || !data.user) {
        return {
          success: false,
          error: "Sign-in succeeded but no session was returned.",
        };
      }

      // The backend is the source of truth for the user record; the Google
      // credential is only decoded locally to mirror its expiry.
      setSession({
        token: data.token,
        user: data.user,
        expiresAt: decodeGoogleIdTokenExpiry(credential) ?? undefined,
      });

      return { success: true, user: data.user };
    } catch (err) {
      console.error("GoogleAuthService.handleSignIn error:", err);
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
    window.location.reload();
  },
};
