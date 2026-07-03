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

export interface RouteItem {
  path: string;
  element: ComponentType<object>;
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
    showInNav: false,
  },
  {
    path: '/leaderboard',
    element: LeaderboardPage,
    label: 'Leaderboard',
    showInNav: true,
    navType: 'main',
  },
  {
    path: '/dashboard',
    element: Dashboard,
    label: 'Dashboard',
    showInNav: true,
    navType: 'main',
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
    path: '/gameplay',
    element: Gameplay,
    label: 'Play',
    showInNav: false,
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
] as const;

export const getNavItems = (navType: 'landing' | 'main' | 'both' = 'both') => {
  return routeConfig.filter((route) => {
    if (!route.showInNav) return false;
    if (navType === 'both') return true;
    return route.navType === navType;
  });
};
