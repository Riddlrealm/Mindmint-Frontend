import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Matches the @/* path mapping in tsconfig.app.json
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      // Keeps the queryClient dev warning silent; individual tests override
      // this per case (including unsetting it for the mock-fallback path).
      VITE_BACKEND_API_URL: 'http://localhost:3000',
    },
  },
});
