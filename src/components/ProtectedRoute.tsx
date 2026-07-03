import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { STORAGE_KEYS } from "../session/storageKeys";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const readToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    window.sessionStorage.getItem(STORAGE_KEYS.TOKEN)
  );
};

const ProtectedRoute = ({
  children,
  redirectTo = "/sign-in",
}: ProtectedRouteProps) => {
  const location = useLocation();
  const token = readToken();

  if (!token) {
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
