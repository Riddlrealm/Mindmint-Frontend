import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Matches the @/* path mapping in tsconfig.app.json
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    env: {
      // Services read this at import time; a stable value keeps tests
      // deterministic without depending on a real backend.
      VITE_BACKEND_API_URL: 'http://api.test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/services/AuthService.ts',
        'src/services/GoogleAuthService.ts',
        'src/session/setSession.ts',
        'src/session/clearSession.ts',
        'src/features/preferences/preferencesSlice.ts',
        'src/features/notifications/notificationsSlice.ts',
      ],
    },
  },
});
