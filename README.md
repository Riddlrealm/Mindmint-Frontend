# Mindmint — Frontend

The frontend application for **Mindmint**, a thought-provoking logic puzzle game. This
React + TypeScript SPA provides an engaging user experience for solving puzzles and
tracking progress, backed by the Mindmint REST API.

## ✨ Features

### Implemented

- **Puzzle gameplay** — interactive UI for answering logic-puzzle questions across
  multiple game modes, with Redux-managed game state.
- **Authentication** — email/password sign-in and "Sign in with Google" (OAuth 2.0)
  wired to the backend. Sessions are persisted to `localStorage` with JWT expiry.
- **Dashboard** — personal stats (points, games played, level, achievements, XP
  progress bar) and a recent-activity feed. Both are fetched from the backend via
  TanStack React Query; the activity feed falls back to a bundled mock fixture in
  local dev when the backend URL is not configured.
- **Leaderboard** — a podium + ranked-table leaderboard backed by the backend
  (with category/time-period params in the API contract); falls back to mock
  data in local dev.
- **Store** — a styled catalog of coin packs and lifelines (static data — see
  _Not yet implemented_ below).
- **Account settings** — profile form, account deletion, notification preferences.
- **Theming** — light/dark mode toggle persisted via Zustand.
- **Protected routes** — unauthenticated visitors are redirected to `/sign-in` and
  returned after login.
- **Responsive design** — optimized for desktop and mobile.

### Not yet implemented

- **Wallet integration** — no Stellar, Soroban, or Freighter code exists in the
  frontend. On-chain rewards are _not_ currently available.
- **Store checkout / purchases** — the `/store` page renders a catalog, but the
  buy buttons are not wired to a backend or wallet.
- **NFT gallery** — achievement NFTs are not yet integrated.
- **Token management** — no XLM or custom-token balance display.

---

## 🛠 Tech Stack

| Layer               | Technology                                       |
| -------------------- | ------------------------------------------------ |
| UI framework         | React 19 + TypeScript                            |
| Build tool           | Vite 7                                           |
| Styling              | Tailwind CSS 4 (`@tailwindcss/vite`)             |
| State management     | Redux Toolkit, Zustand                           |
| Server state / cache | TanStack React Query (v5)                        |
| Routing              | React Router 7                                   |
| OAuth                | `@react-oauth/google` (Google sign-in)           |
| Icons                | Lucide React                                     |
| Testing              | Vitest 4 + Testing Library + jsdom               |
| Linting              | ESLint 9 + typescript-eslint                     |
| CI                   | GitHub Actions — `npm ci && npm test`            |

---

## 📁 Project Structure

```
Mindmint-Frontend/
├── public/               # Static assets (favicon, etc.)
├── src/
│   ├── assets/           # Images, icons
│   ├── components/       # Reusable UI (Navbar, Footer, toasts, game UI, modals, …)
│   ├── config/           # Route definitions — the single source of truth for paths
│   ├── data/             # Mock fixtures (game modes, store items, leaderboard, …)
│   ├── features/         # Redux slices grouped by domain (preferences, notifications)
│   ├── hooks/            # Custom hooks (dashboard, leaderboard, recent activity, …)
│   ├── lib/              # Shared clients (React Query client)
│   ├── models/           # TypeScript interfaces and mock-fixture objects
│   ├── pages/            # Route-level page components
│   ├── routes/           # `<AppRoutes />` component
│   ├── services/         # API services (auth, dashboard, leaderboard)
│   ├── session/          # Session persistence, expiry, and auth guards
│   ├── test/             # Vitest setup (Testing Library matchers, jsdom)
│   ├── theme/            # Dark/light mode store and hook (Zustand)
│   ├── App.tsx           # Layout shell (nav, toasts, Suspense)
│   ├── AppProviders.tsx  # Wraps the tree with Google OAuth provider when configured
│   ├── main.tsx          # Application entry point (React DOM + providers)
│   ├── store.ts          # Redux store (preferences, notifications, game state)
│   └── types.ts          # Shared types (UserStats, ActivityItem, LeaderboardPlayer)
├── .env.example
├── package.json
├── vitest.config.ts
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
└── README.md
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 20.19+ / 22.12+ / 24+ (Vite 7 minimum; the CI runs
Node 24).

```bash
# Clone the repository
git clone https://github.com/Riddlrealm/Mindmint-Frontend.git
cd Mindmint-Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend URL and (optionally) Google OAuth client id

# Start the development server
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

---

## 🔧 Environment Variables

| Variable                  | Required | Description                                                        |
| ------------------------- | -------- | ------------------------------------------------------------------ |
| `VITE_BACKEND_API_URL`    | yes      | Backend REST API base URL (no trailing slash). Auth, dashboard, and leaderboard calls fail closed when this is unset. |
| `VITE_GOOGLE_CLIENT_ID`   | no       | Google OAuth 2.0 client id. The "Sign in with Google" button is only mounted when this is set. |
| `VITE_CONTRIBUTORS_REPO`  | no       | GitHub repo in `owner/repo` format for the contributors carousel. Defaults to `Riddlrealm/Mindmint-Frontend`. |

Variables that existed in earlier versions (`VITE_STELLAR_NETWORK`,
`VITE_SOROBAN_RPC_URL`, `VITE_CONTRACT_ADDRESS`) are **not read** by any
source file — they were removed when the Stellar/Soroban integration was
de-scoped.

---

## 📜 Scripts

| Command            | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server with HMR                      |
| `npm run build`    | Type-check (`tsc -b`) then production bundle (`vite build`) |
| `npm run lint`     | Lint the project with ESLint                            |
| `npm test`         | Run the Vitest test suite once (used by CI)             |
| `npm run test:watch` | Run tests in watch mode for development              |
| `npm run preview`  | Preview the production build locally                    |

---

## 🧪 Testing

The test suite uses **Vitest** with the **jsdom** environment and **Testing
Library** (React, DOM, jest-dom). Tests live alongside the modules they
exercise (e.g., `src/session/setSession.test.ts`,
`src/services/DashboardService.test.ts`).

Coverage is collected with `@vitest/coverage-v8`:

```bash
# Single run (used in CI)
npm test

# Watch mode
npm run test:watch
```

---

## 🔌 Backend API

All data-fetching goes through the React Query client (`src/lib/queryClient.ts`)
with caching, automatic retries, and stale-time management.

### Authentication

| Endpoint                            | Method | Authenticated | Description                 |
| ----------------------------------- | ------ | ------------- | --------------------------- |
| `{VITE_BACKEND_API_URL}/auth/signin` | POST   | no            | Email/password sign-in      |
| `{VITE_BACKEND_API_URL}/auth/google` | POST   | no            | Google sign-in (ID token)   |
| `{VITE_BACKEND_API_URL}/auth/delete` | DELETE | yes           | Delete the current account  |

**Sign-in response** (`POST /auth/signin`, `POST /auth/google`):
```json
{
  "token": "<jwt>",
  "user": { "id": "…", "email": "…", "name": "…", "picture": "…" }
}
```
The token and user are persisted to `localStorage` (keys defined in
`src/session/storageKeys.ts`). Expiry is tracked so the routing layer can
redirect expired sessions to `/sign-in`.

### Dashboard

```
GET {VITE_BACKEND_API_URL}/api/dashboard/stats
GET {VITE_BACKEND_API_URL}/api/dashboard/activity?limit=8
Authorization: Bearer <token>
```

**Stats** (`/api/dashboard/stats`):
```json
{
  "data": {
    "totalPoints": 1250,
    "gamesPlayed": 42,
    "level": 15,
    "achievements": 8,
    "currentXp": 750,
    "targetXp": 1000
  }
}
```

**Activity** (`/api/dashboard/activity?limit=8`):
```json
{
  "data": [
    {
      "id": 1,
      "mode": "Puzzle Game Mode",
      "level": 22,
      "groupSize": 10,
      "participants": 12,
      "coins": { "gold": 50, "red": 50 },
      "earnings": 8,
      "image": "/bag-coins.svg"
    }
  ]
}
```

When `VITE_BACKEND_API_URL` is unset (local dev), the activity feed falls back
to the mock fixture in `src/models/recentActivity.ts`; stats surface an error
state instead.

### Leaderboard

```
GET {VITE_BACKEND_API_URL}/api/leaderboard?category=score&timePeriod=all_time&limit=100
Authorization: Bearer <token>
```

**Response shape:**
```json
{
  "data": [
    {
      "playerId": "uuid",
      "rank": 1,
      "score": 50000,
      "name": "Abbas",
      "avatar": "…",
      "level": 56,
      "scoreIcon": "…"
    }
  ],
  "total": 1
}
```

The current player's row is highlighted by matching `playerId`. When
`VITE_BACKEND_API_URL` is unset (local dev), the leaderboard falls back to the
mock fixture in `src/data/mockLeaderboardData.ts`.

---

## 🛒 Store Purchase Flow

The Store (`src/pages/Store.tsx`) is a real purchase flow backed by the
Mindmint backend. **Trust boundary:** the backend is the sole authority on
pricing, deduction, and balances — the client never sends a price and only
renders a wallet the server confirmed. A purchase is complete only when the
`POST` returns the authoritative post-purchase wallet.

**Endpoint contracts (agreed with Mindmint-Backend):**

```
GET  {VITE_BACKEND_API_URL}/api/store/wallet
POST {VITE_BACKEND_API_URL}/api/store/purchase   body: { "itemType": "coin-pack" | "lifeline", "itemId": number }
Authorization: Bearer <session token>
```

**Response shapes (both endpoints):**

```json
{
  "data": {
    "coins": 500,
    "lifelines": { "fiftyFifty": 1, "callAFriend": 2, "audience": 0 }
  }
}
```

`coins` is the spendable balance; `lifelines` are owned counts per lifeline.
The mapper (`mapWalletResponse` in `src/services/StoreService.ts`) also accepts
the bare object (no `data` wrapper), coerces string numbers (Postgres `bigint`
columns), and degrades malformed responses to a null wallet that fails closed
rather than fabricating a balance.

**Client behavior:**

- Buy buttons show a loading state while the purchase is in flight and are
disabled during it, so a double-click can never fire two purchases.
- A failed or unconfirmed purchase surfaces the server's message through the
toast system (`src/components/toasts/`) and an inline error banner, and never
increments the displayed balance.
- The confirmed wallet is cached in localStorage keyed to the signed-in user
(`STORAGE_KEYS.WALLET_STATE`, cleared on logout) for instant render and dev
mode; the backend stays the source of truth.
- The gameplay header (`src/components/gameplay/GameHeader.tsx`) shows the
live coin balance and owned lifeline counts from the same wallet state.

## 🚢 Deployment

```bash
npm run build     # type-check + production bundle
npm run preview   # preview the production build locally
```

The `dist/` directory is the deployable artifact (static files served by any
web server or CDN).

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for a guide
to setting up the project, understanding the codebase, and submitting pull
requests.

---

## 🔗 Related Repositories

| Repository                                                       | Relationship |
| ---------------------------------------------------------------- | ------------ |
| [Mindmint Backend](https://github.com/Riddlrealm/Mindmint-Backend) | REST API backing auth, dashboard, leaderboard, and activity endpoints. |
| [Mindmint Smart Contracts](https://github.com/Riddlrealm/Mindmint-Contract) | Smart contracts reserved for the future on-chain wallet/rewards features — **not yet integrated** in the frontend. |

---

When adding or changing images, follow the [Asset Policy](ASSET_POLICY.md) (WebP, ≤ 250 KB per asset, sized to ~2× rendered size, lazy-load offscreen images).

## 📄 License

This project is licensed under the **MIT License**.

---

## 💬 Support

For questions or support, please open an issue or join our community
discussions.