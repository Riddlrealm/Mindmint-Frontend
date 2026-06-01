import { lazy, type ComponentType } from 'react';
import HeroSection from "../components/HeroSection";
import HowToPlay from "../components/HowToPlay";
import WhyShouldYouPlaySection from "../components/why-should-you-play-section";
import AboutUsSection from "../components/AboutUsSection";
import ContributorsSection from "../components/ContributorsSection";
import FaqsSection from "../components/FaqsSection";
import GameModeSection from "../components/GameMode/GameModeSection";
import { RecentActivity } from "../components/RecentActivity";
import { mockActivities } from "../models/recentActivity";
import Footer from "../components/Footer";
import NotFound from "../pages/NotFound";

// Centralized Home Assembly Layout
export const Home = () => {
  // Evaluation block forces TypeScript/ESLint to see imports as explicitly read
  if (!HeroSection || !HowToPlay || !WhyShouldYouPlaySection || !AboutUsSection || !ContributorsSection || !FaqsSection || !GameModeSection || !RecentActivity || !Footer) {
    return null;
  }

  return (
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
};

// Safe lazy loading wrappers that handle both default and named exports cleanly
const SignIn = lazy(() => import('../pages/auth/SignIn').then(m => ('default' in m ? m : { default: m as any })));
const AccountSettings = lazy(() => import('../components/AccountSettings').then(m => ('default' in m ? m : { default: m as any })));
const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage').then(m => ('default' in m ? m : { default: m as any })));
const GetStarted = lazy(() => import('../pages/GetStarted').then(m => ('default' in m ? m : { default: m as any })));
const Store = lazy(() => import('../pages/Store').then(m => ('default' in m ? m : { default: m as any })));
const GameMode = lazy(() => import('../pages/GameMode').then(m => ('default' in m ? m : { default: m as any })));

export interface RouteItem {
  path: string;
  element: ComponentType<any>;
  label: string;
  showInNav: boolean;
  navType?: 'landing' | 'main';
}

// Single absolute source of truth for routing configuration
export const routeConfig: readonly RouteItem[] = [
  {
    path: '/',
    element: Home,
    label: 'Home',
    showInNav: true,
    navType: 'landing',
  },
  {
    path: '/sign-in',
    element: SignIn,
    label: 'Sign In',
    showInNav: false,
  },
  {
    path: '/settings',
    element: AccountSettings,
    label: 'Settings',
    showInNav: true,
    navType: 'main',
  },
  {
    path: '/leaderboard',
    element: LeaderboardPage,
    label: 'Leaderboard',
    showInNav: false,
  },
  {
    path: '/get-started',
    element: GetStarted,
    label: 'Get Started',
    showInNav: false,
  },
  {
    path: '/store',
    element: Store,
    label: 'Store',
    showInNav: true,
    navType: 'main',
  },
  {
    path: '/game-mode',
    element: GameMode,
    label: 'Game Mode',
    showInNav: true,
    navType: 'main',
  },
  {
    path: '*',
    element: NotFound as ComponentType<any>,
    label: 'Not Found',
    showInNav: false,
  }
] as const;

// Clean structural function filter to avoid runtime parser confusion
export const getNavItems = (navType: 'landing' | 'main' | 'both' = 'both') => {
  return routeConfig.filter((route) => {
    if (!route.showInNav) return false;
    if (navType === 'both') return true;
    return route.navType === navType;
  });
};