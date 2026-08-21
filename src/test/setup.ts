import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

// jsdom does not implement window.scrollTo; components call it from empty-state
// actions, so stub it to keep those interactions testable.
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Polyfill localStorage and sessionStorage for environments where jsdom storage is missing or unmocked
const createStorageMock = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
};

if (typeof window !== 'undefined') {
  const localStorageMock = createStorageMock();
  const sessionStorageMock = createStorageMock();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  Object.defineProperty(globalThis, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });
}

beforeEach(() => {
  window.localStorage?.clear();
  window.sessionStorage?.clear();
});
