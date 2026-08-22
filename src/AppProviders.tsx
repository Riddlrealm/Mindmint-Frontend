import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./services/GoogleAuthService";

/**
 * Wraps the app with the Google OAuth provider only when a client id is
 * configured, so the "Sign in with Google" button is never advertised in
 * deployments that cannot serve it.
 */
export const AppProviders = ({ children }: { children: ReactNode }) => {
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
};
