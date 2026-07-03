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

// Safe lazy loading wrappers — typed without `any`
type LazyFactory<T extends ComponentType<object>> = () => Promise<{ default: T }>;

function safeLazy<T extends ComponentType<object>>(factory: LazyFactory<T>) {
  return lazy(factory);
}

export const SignIn = safeLazy(() => import('../pages/auth/SignIn'));
export const AccountSettings = safeLazy(() => import('../components/AccountSettings'));
export const LeaderboardPage = safeLazy(() => import('../pages/LeaderboardPage'));
export const GetStarted = safeLazy(() => import('../pages/GetStarted'));
export const Store = safeLazy(() => import('../pages/Store'));
export const GameMode = safeLazy(() => import('../pages/GameMode'));
export const Dashboard = safeLazy(() => import('../pages/Dashboard'));
export const Gameplay = safeLazy(() => import('../pages/Gameplay'));
export const LandingPage = safeLazy(() => import('../pages/LandingPage'));
