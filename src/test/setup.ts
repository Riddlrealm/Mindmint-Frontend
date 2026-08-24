import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

/**
 * jsdom does not implement `window.matchMedia`, which `useApplyTheme` relies
 * on. Provide a minimal, configurable stub so any module touching matchMedia
 * (directly or through a component) loads and runs under the test env.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Several modules call `crypto.randomUUID()` at import/reduce time. Node 24
 * already exposes Web Crypto, but guard anyway so the suite also runs on
 * runtimes where `crypto.randomUUID` is unavailable.
 */
if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {
      randomUUID: () => '00000000-0000-4000-8000-000000000000',
    },
  });
}

/**
 * Keep storage state isolated between tests. Modules such as
 * `preferencesSlice` read `localStorage` at import time, so a clean slate
 * avoids cross-test leakage.
 */
beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});
