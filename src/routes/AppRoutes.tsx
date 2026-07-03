import { Routes, Route } from "react-router-dom";
import { routeConfig } from "../config/routeConfig";

const AppRoutes = () => {
  return (
    <Routes>
      {routeConfig.map((route) => {
        const Component = route.element;
        return (
          <Route
            key={route.path}
            path={route.path}
            element={<Component />}
          />
        );
      })}
    </Routes>
  );
};

export default AppRoutes;
