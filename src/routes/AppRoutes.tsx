import { Routes, Route } from "react-router-dom";
import { routeConfig } from "../config/routeConfig";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    {routeConfig.map(({ path, element: Component, isProtected }) => (
      <Route
        key={path}
        path={path}
        element={
          isProtected ? (
            <ProtectedRoute>
              <Component />
            </ProtectedRoute>
          ) : (
            <Component />
          )
        }
      />
    ))}
  </Routes>
);

export default AppRoutes;
