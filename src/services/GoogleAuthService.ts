import { jwtDecode } from "jwt-decode";
import { clearSession } from "../session/clearSession";
import { setSession } from "../session/setSession";

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
  exp: number;
}

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  id: string;
}

export interface AuthServiceResponse {
  success: boolean;
  user?: GoogleUser;
  error?: string;
}

export const GoogleAuthService = {
  async handleSignIn(credential: string): Promise<AuthServiceResponse> {
    try {
      if (!credential) {
        return { success: false, error: "No ID token received from Google." };
      }

      const decoded = jwtDecode<GoogleJwtPayload>(credential);

      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        return { success: false, error: "The Google session has expired. Please sign in again." };
      }

      const user: GoogleUser = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        id: decoded.sub,
      };

      setSession({ token: credential, user });

      return { success: true, user };

    } catch (error) {
      console.error("JWT Decode Error:", error);
      return { success: false, error: "Failed to process the login token. Please try again." };
    }
  },

  logout() {
    clearSession();
    window.location.reload();
  }
};