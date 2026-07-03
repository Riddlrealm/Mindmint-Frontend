import { QueryClient } from '@tanstack/react-query';

if (import.meta.env.DEV && !import.meta.env.VITE_BACKEND_API_URL) {
  console.warn('[Mindmint] VITE_BACKEND_API_URL is not set. API calls will fail. Copy .env.example to .env and fill in the value.');
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      gcTime: 300_000,
    },
  },
});
