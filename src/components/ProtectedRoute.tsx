import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { isAuthenticated } from "../session/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Route guard: renders `children` only when a session token exists, otherwise
 * redirects to `redirectTo` preserving the requested destination (pathname +
 * search) in navigation state so the sign-in page can return the user to it.
 */
const ProtectedRoute = ({
  children,
  redirectTo = "/sign-in",
}: ProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
