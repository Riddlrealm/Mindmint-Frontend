import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement window.scrollTo; components call it from empty-state
// actions, so stub it to keep those interactions testable.
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});
