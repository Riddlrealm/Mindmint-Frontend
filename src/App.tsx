import { useLocation } from "react-router-dom";
import { Suspense } from "react";
import "./App.css";
import ToastViewport from "./components/toasts/ToastViewport";
import Navbar from "./components/Navbar";
import GameplayNavbar from "./components/GameplayNavbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Pages that manage their own header / need no outer nav
  const isSignInPage = currentPath === "/sign-in";
  const isGameplayPage = currentPath === "/gameplay";

  // Home ("/") uses the GameplayNavbar which has section scroll-links
  const isHomePage = currentPath === "/";

  return (
    <>
      {/* Navigation Layout dynamically matched from path hooks */}
      {!isSignInPage && !isGameplayPage && (isHomePage ? <GameplayNavbar /> : <Navbar />)}

      <ToastViewport />

      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center text-white">
            Loading...
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </>
  );
}

export default App;