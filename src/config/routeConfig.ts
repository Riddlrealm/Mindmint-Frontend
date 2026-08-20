import type { ComponentType } from 'react';
import {
  Home,
  SignIn,
  AccountSettings,
  LeaderboardPage,
  GetStarted,
  Store,
  GameMode,
  Dashboard,
  Gameplay,
  LandingPage,
} from './routes';
import NotFound from '../pages/NotFound';

export type NavType = 'landing' | 'main';

export interface RouteItem {
  path: string;
  element: ComponentType<object>;
  label: string;
  showInNav: boolean;
  navType?: NavType;
  /**
   * When true, the route renders inside `<ProtectedRoute>`: a visitor with no
   * auth token is redirected to `/sign-in` with the requested destination
   * preserved in navigation state, and is returned there after a successful
   * sign-in. Add `isProtected: true` to any route that must require a session.
   */
  isProtected?: boolean;
}

// Single absolute source of truth for routing configuration
export const routeConfig = [
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
    showInNav: false,
    isProtected: true,
  },
  {
    path: '/leaderboard',
    element: LeaderboardPage,
    label: 'Leaderboard',
    showInNav: true,
    navType: 'main',
    isProtected: true,
  },
  {
    path: '/dashboard',
    element: Dashboard,
    label: 'Dashboard',
    showInNav: true,
    navType: 'main',
    isProtected: true,
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
    isProtected: true,
  },
  {
    path: '/game-mode',
    element: GameMode,
    label: 'Game Mode',
    showInNav: true,
    navType: 'main',
  },
  {
    path: '/gameplay',
    element: Gameplay,
    label: 'Play',
    showInNav: false,
    isProtected: true,
  },
  {
    path: '/landing',
    element: LandingPage,
    label: 'Landing',
    showInNav: false,
  },
  {
    path: '*',
    element: NotFound as ComponentType<object>,
    label: 'Not Found',
    showInNav: false,
  },
] as const satisfies readonly RouteItem[];

export const getNavItems = (navType: NavType | 'both' = 'both') => {
  return routeConfig.filter((route) => {
    if (!route.showInNav) return false;
    if (navType === 'both') return true;
    return route.navType === navType;
  });
};
