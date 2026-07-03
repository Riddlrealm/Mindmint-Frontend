import { Navigate } from "react-router-dom";

// Settings is served at /settings by AccountSettings directly.
// This file exists as a fallback redirect in case it's referenced elsewhere.
export default function Settings() {
  return <Navigate to="/settings" replace />;
}
