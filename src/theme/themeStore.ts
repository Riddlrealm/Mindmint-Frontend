import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../session/storageKeys';

export type ThemePreference = 'dark' | 'light' | 'system';

export interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  resetTheme: () => void;
}

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: DEFAULT_THEME_PREFERENCE,
      setPreference: (preference) => set({ preference }),
      resetTheme: () => set({ preference: DEFAULT_THEME_PREFERENCE }),
    }),
    {
      name: STORAGE_KEYS.THEME_PREFERENCE,
    },
  ),
);
