# Mindmint - Frontend

The frontend application for **Mindmint**, a thought-provoking logic puzzle game built on the Stellar blockchain. This React-based interface provides an engaging and intuitive user experience for players to solve puzzles and earn on-chain rewards.

## 🚀 Features

* **Interactive Puzzle Interface**: Smooth, responsive UI for solving logic puzzles
* **Stellar Wallet Integration**: Connect with Freighter and other Stellar wallets
* **Real-time Progress Tracking**: Visual feedback on puzzle completion and achievements
* **NFT Gallery**: Display earned achievement NFTs from completed puzzles
* **Token Management**: View and manage XLM and custom tokens for unlocking content
* **Responsive Design**: Optimized for desktop and mobile gameplay

## 🛠️ Tech Stack

* **Framework**: React 18+
* **Styling**: TailwindCSS
* **State Management**: React Context API / Redux
* **Blockchain Integration**: Stellar SDK, Soroban RPC
* **Wallet Connection**: Freighter Wallet API
* **Build Tool**: Vite
* **Type Safety**: TypeScript

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Riddlrealm/Mindmint-Frontend.git

# Navigate to the project directory
cd Mindmint-Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Stellar network configuration

# Start the development server
npm run dev
```

## 🔧 Configuration

Create a `.env` file in the root directory with the following variables:

```env
VITE_STELLAR_NETWORK=testnet
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_BACKEND_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=your_contract_address
```

## 🎮 Usage

1. **Connect Wallet**: Click "Connect Wallet" to link your Freighter wallet
2. **Browse Puzzles**: Explore available puzzles organized by difficulty
3. **Solve Challenges**: Complete logic puzzles to earn points and rewards
4. **Claim NFTs**: Mint achievement NFTs for completing puzzle milestones
5. **Unlock Content**: Use tokens to access hints and special levels

## 📁 Project Structure

```
Mindmint-Frontend/
├── public/
├── src/
│   ├── assets/          # Images, icons, and static files
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API and blockchain services
│   ├── utils/           # Helper functions
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── .env.example
├── package.json
└── README.md
```

## 🧪 Testing

The test suite runs with [Vitest](https://vitest.dev/) (jsdom + React Testing Library) and covers the session, auth, and Redux state modules.

```bash
# Run the Vitest unit/component tests once
npm run test

# Watch mode for local development
npm run test:watch
```

## 📊 Dashboard API

The Dashboard (and the Recent Activity feed on the landing page) is served
through the shared React Query client (`src/lib/queryClient.ts`), which caches
and retries requests per its defaults. Data is fetched from
`src/services/DashboardService.ts`.

**Endpoint contracts (agreed with Mindmint-Backend):**

```
GET {VITE_BACKEND_API_URL}/api/dashboard/stats
GET {VITE_BACKEND_API_URL}/api/dashboard/activity?limit=8
Authorization: Bearer <session token>
```

**Auth requirement:** the API gateway's `JwtAuthGuard` protects every route, so
requests are only fired when a session token (`STORAGE_KEYS.TOKEN`) exists and
has not expired. A signed-out or missing-token visitor sees the empty surface
and never triggers an unauthenticated request.

**Response shapes:**

```json
// GET /api/dashboard/stats
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

// GET /api/dashboard/activity?limit=8
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

Both mappers also accept the bare object/array (no `data` wrapper) and tolerate
string numbers (Postgres `bigint` columns). Malformed entries are dropped or
degraded to safe defaults rather than crashing the view. When
`VITE_BACKEND_API_URL` is unset (local dev), the activity feed falls back to
the bundled mock fixture in `src/models/recentActivity.ts`; stats have no mock
and surface the error state instead.

**Auth requirement:** the API gateway's `JwtAuthGuard` protects every route, so
the frontend attaches the persisted session token (`STORAGE_KEYS.TOKEN`) as a
bearer token whenever one is available.

**Response shape:**

```json
{
  "data": [
    { "playerId": "uuid", "rank": 1, "score": 50000, "name": "Abbas", "avatar": "...", "level": 56, "scoreIcon": "..." }
  ],
  "total": 1
}
```

`playerId` matches the signed-in user's id and is used to highlight the
current player's row. `name`, `avatar`, `level`, and `scoreIcon` may be omitted
while the backend enrichment lands; missing fields degrade to safe defaults
rather than crashing the view. When `VITE_BACKEND_API_URL` is unset (local dev),
the leaderboard falls back to the bundled mock fixture in
`src/data/mockLeaderboardData.ts`.

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
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the **MIT License**.

## 🔗 Related Repositories

* [Mindmint Backend](https://github.com/Riddlrealm/Mindmint-Backend)
* [Mindmint Smart Contracts](https://github.com/Riddlrealm/Mindmint-Contract)

## 💬 Support

For questions or support, please open an issue or join our community discussions.
