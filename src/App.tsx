import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense } from "react";
import HeroSection from "./components/HeroSection";
import "./App.css";
import FaqsSection from "./components/FaqsSection";
import ContributorsSection from "./components/ContributorsSection";
import AboutUsSection from "./components/AboutUsSection";
import WhyShouldYouPlaySection from "./components/why-should-you-play-section";
import GameModeSection from "./components/GameMode/GameModeSection";
import Footer from "./components/Footer";
import { RecentActivity } from "./components/RecentActivity";
import { mockActivities } from "./models/recentActivity";
import HowToPlay from "./components/HowToPlay";
import ToastViewport from "./components/toasts/ToastViewport";
import Navbar from "./components/Navbar";
import GameplayNavbar from "./components/GameplayNavbar";
import { routeConfig } from "./config/routes";
import NotFound from "./pages/NotFound";

const Home = () => (
  <>
    <HeroSection />
    <HowToPlay />
    <WhyShouldYouPlaySection />
    <AboutUsSection />
    <ContributorsSection />
    <FaqsSection />
    <GameModeSection />
    <RecentActivity activities={mockActivities} />
    <Footer />
  </>
);

function App() {
  const location = useLocation();

  // Modern browser-native route tracking (cleans out the breaking hash fallback checks)
  const currentPath = location.pathname;
  const isSignInPage = currentPath === "/sign-in";
  const isHomePage = currentPath === "/";

  return (
    <>
      {!isSignInPage && (isHomePage ? <GameplayNavbar /> : <Navbar />)}
      <ToastViewport />
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center text-white">
            Loading...
          </div>
        }
      >
        <Routes>
          {/* Static Core Route */}
          <Route path="/" element={<Home />} />

          {/* Dynamic Lazy-Loaded Configurations with Type Guarding */}
          {routeConfig
            .filter((route) => route.isLazy && "component" in route)
            .map((route) => {
              const routeWithComponent = route as Extract<
                (typeof routeConfig)[number],
                { component: any }
              >;
              const LazyComponent = routeWithComponent.component;

              return (
                <Route
                  key={routeWithComponent.path}
                  path={routeWithComponent.path}
                  element={<LazyComponent />}
                />
              );
            })}

          {/* CRITICAL FIX: The native universal catch-all route.
            React Router will automatically hit this whenever 'currentPath' 
            fails to match any route listed above.
          */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
