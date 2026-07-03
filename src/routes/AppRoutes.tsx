import { Routes, Route } from "react-router-dom";
import { routeConfig } from "../config/routeConfig";

const AppRoutes = () => (
  <Routes>
    {routeConfig.map(({ path, element: Component }) => (
      <Route key={path} path={path} element={<Component />} />
    ))}
  </Routes>
);

export default AppRoutes;
