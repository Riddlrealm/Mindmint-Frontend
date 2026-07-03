import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Matches the @/* path mapping in tsconfig.app.json
      '@': resolve(__dirname, 'src'),
    },
  },
  // Tells Vite 7 this is a single page app, forcing it to fallback
  // address-bar URLs to index.html automatically without breaking asset modules
  appType: 'spa',
})
