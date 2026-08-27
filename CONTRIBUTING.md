# Contributing to Mindmint Frontend

Thanks for contributing! This guide will help you set up the project, find
your way around the codebase, and submit changes.

---

## 🛠 Setup

**Prerequisites**

- **Node.js** 20.19+ / 22.12+ / 24+ (the CI runs Node 24; Vite 7 requires
  at least 20.19 or 22.12).
- **npm** (the project uses npm; lockfile is committed).

```bash
git clone https://github.com/Riddlrealm/Mindmint-Frontend.git
cd Mindmint-Frontend
npm install
cp .env.example .env
```

Edit `.env` if you have a running backend and/or a Google OAuth client id.

---

## 🏃 Running the app

```bash
npm run dev        # Vite dev server at http://localhost:5173
```

---

## 🧪 Testing, linting, and building

| Command               | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `npm test`            | Run Vitest test suite once (used by CI)             |
| `npm run test:watch`  | Run tests in watch mode                             |
| `npm run lint`        | Lint all files with ESLint                          |
| `npm run build`       | Type-check (`tsc -b`) + production Vite build       |
| `npm run preview`     | Serve the production build locally                  |

**Run all checks before pushing** — the CI pipeline runs `npm ci && npm test`
on every PR.

---

## 🗺 Codebase map

### Auth & session

| File / directory                     | Purpose                                      |
| ------------------------------------ | -------------------------------------------- |
| `src/services/AuthService.ts`        | Email/password sign-in, logout, account-delete |
| `src/services/GoogleAuthService.ts`  | Google OAuth sign-in                        |
| `src/session/storageKeys.ts`         | Centralised `localStorage` key constants     |
| `src/session/setSession.ts`          | Persist session token + user + expiry        |
| `src/session/clearSession.ts`        | Clear session data                           |
| `src/session/auth.ts`                | 401 handler and session-expired utilities    |
| `src/components/ProtectedRoute.tsx`   | Redirect unauthenticated visitors to sign-in |

### State (Redux Toolkit + Zustand)

| File / directory                       | Purpose                                   |
| -------------------------------------- | ----------------------------------------- |
| `src/store.ts`                         | Redux store (preferences, notifications, game) |
| `src/features/preferences/preferencesSlice.ts` | Theme/language preferences        |
| `src/features/notifications/notificationsSlice.ts` | Notification toggles       |
| `src/components/GameMode/gameSliceStore.ts`     | In-game state (answers, levels, scoring) |
| `src/types.ts`                         | Shared types (`UserStats`, `ActivityItem`, `LeaderboardPlayer`) |
| `src/theme/themeStore.ts`              | Dark/light mode (Zustand)                |

### Data fetching

| File / directory                     | Purpose                                    |
| ------------------------------------ | ------------------------------------------ |
| `src/lib/queryClient.ts`             | React Query client (cache, retries, stale time) |
| `src/hooks/useDashboardStats.ts`     | Fetch + transform dashboard stats          |
| `src/hooks/useRecentActivity.ts`     | Fetch + transform activity feed            |
| `src/hooks/useLeaderboard.ts`        | Fetch + transform leaderboard              |
| `src/services/DashboardService.ts`   | Raw API calls for dashboard endpoints      |
| `src/services/LeaderboardService.ts` | Raw API calls for leaderboard endpoints    |

### Routes & pages

| File / directory               | Purpose                                      |
| ------------------------------ | -------------------------------------------- |
| `src/config/routeConfig.ts`    | Single source of truth — all routes + nav metadata + protection flags |
| `src/config/routes.tsx`        | Lazy-loaded route component imports          |
| `src/routes/AppRoutes.tsx`     | `<Routes>` tree with protected-route wrapper |
| `src/pages/`                   | One component file per route                 |

### UI components (`src/components/`)

| Directory / file            | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `Navbar.tsx`, `Footer.tsx`  | Site chrome                                 |
| `GameplayNavbar.tsx`        | Navbar for the landing page (scroll links)  |
| `ProtectedRoute.tsx`        | Auth gate for protected routes              |
| `gameplay/`                 | In-game UI (question, answers, level, header) |
| `GameMode/`                 | Game mode selection cards                  |
| `gameModes/`                | Game mode definitions                      |
| `state/SurfaceState.tsx`    | Centered loading / error / empty surfaces  |
| `toasts/`                   | Toast notification system                  |
| `modals/`                   | Modal dialogs                              |
| `icons/`                    | SVG icon components                        |
| `HeroSection.tsx`, `HowToPlay.tsx`, `AboutUsSection.tsx`, `FaqsSection.tsx` | Landing page sections |
| `ContributorsSection.tsx`   | GitHub contributors carousel                |
| `RecentActivity.tsx`        | Dashboard / landing activity feed           |
| `Leaderboard.tsx`           | Leaderboard table                           |
| `AccountSettings.tsx`       | Account settings page shell                 |
| `ProfileForm.tsx`           | Profile edit form                           |

### Mock data

| File                          | Purpose                             |
| ----------------------------- | ----------------------------------- |
| `src/data/mockGameData.ts`    | Levels, questions, answers          |
| `src/data/gameModes.ts`       | Game mode metadata                  |
| `src/data/storeItems.ts`      | Coin packs and lifeline definitions |
| `src/data/mockLeaderboardData.ts` | Leaderboard fallback fixture    |
| `src/models/recentActivity.ts` | Recent activity fallback fixture   |

---

## 📝 Pull request workflow

1. **Fork** the repository and create a feature branch from `main`.
2. Make your changes and run all checks locally:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
3. Write clear commit messages describing **why** the change is needed.
4. Push your branch and open a pull request against the upstream `main`.
5. Reference any related issues in the PR description (e.g., `Closes #15`).

---

## 🔧 Code conventions

- **TypeScript** throughout — no `any` without a comment explaining why.
- Redux Toolkit slices go in `src/features/` grouped by domain; Zustand stores
  go alongside the feature they serve.
- API service functions are pure async wrappers around `fetch` — no component
  hooks inside services.
- Tests live next to the module they exercise with a `.test.ts` extension.
- CSS uses Tailwind utility classes; custom styles go in `src/index.css`.

---

## ❓ Need help?

Open an issue or ask in the repository discussions.