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

## 🏆 Leaderboard API

The leaderboard (on `/leaderboard` and the Dashboard) is served through the
shared React Query client (`src/lib/queryClient.ts`), which caches and retries
requests per its defaults. Data is fetched from `src/services/LeaderboardService.ts`.

**Endpoint contract (agreed with Mindmint-Backend):**

```
GET {VITE_BACKEND_API_URL}/api/leaderboard?category=score&timePeriod=all_time&limit=100
Authorization: Bearer <session token>
```

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
