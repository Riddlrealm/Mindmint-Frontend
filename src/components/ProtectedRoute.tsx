import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { isAuthenticated } from "../session/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Route guard: renders `children` only when an authenticated (non-expired)
 * session exists, otherwise redirects to `redirectTo` preserving the
 * requested path in navigation state.
 */
const ProtectedRoute = ({
  children,
  redirectTo = "/sign-in",
}: ProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
