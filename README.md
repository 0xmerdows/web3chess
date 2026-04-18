# KELKIT — Chess Betting Platform on Stellar

> Play chess. Wager XLM. Win on-chain.

KELKIT is a fully frontend-based chess betting platform built on the Stellar blockchain. Players connect their Stellar wallets, create or join XLM-wagered chess games, watch live matches, compete in tournaments, solve daily puzzles, and analyze their games with Stockfish — all from the browser with no backend required.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Pages & Modules](#pages--modules)
- [Architecture](#architecture)
- [Wallet Integration](#wallet-integration)
- [Payment Flow](#payment-flow)
- [Board Skins](#board-skins)
- [Roadmap](#roadmap)

---

## Features

### Core Gameplay
- ♟ **Full chess engine** — FIDE-compliant rules via `chess.js` (castling, en passant, promotion, check/checkmate/stalemate detection)
- 🎲 **XLM wagering** — Create or join bets with 1–10,000 XLM stake
- ⏱ **Chess clocks** — Independent countdown timers per player with configurable time controls (1+0 to 15+10)
- 🏳 **Resign & draw** — In-game resignation support

### Betting & Finance
- 💰 **Lobby** — Browse open bets, filter/sort by XLM amount, join instantly
- 🔴 **Live betting** — Watch ongoing games and bet on white/black with dynamic odds
- 📊 **My Bets** — Real-time bet tracker with active/won/lost/draw status and net XLM P&L
- 💸 **Balance simulation** — Stake deducted on bet placement, winnings credited on game end (2% platform fee)

### Tournaments
- 🏆 **Bracket tournaments** — Single-elimination format with XLM prize pools
- 📝 **Registration** — Pay entry fee to join, prize pool grows with each registration
- 👁 **Match viewer** — Watch any bracket match live with board preview

### Puzzles
- 🧩 **Daily puzzles** — 6 puzzles per day across easy/medium/hard difficulties
- 🏅 **XLM rewards** — Earn XLM for solving puzzles correctly
- 💡 **Hint system** — Highlight the source square when stuck
- ✅ **Progress tracking** — Solved puzzles persist across sessions

### Analysis
- 🔍 **Stockfish 18 integration** — Engine runs in a Web Worker via `public/stockfish.js`
- 📈 **Eval bar** — Visual centipawn advantage bar per move
- 🏷 **Move annotations** — Automatic `??` `?` `?!` `✓` labels based on score delta
- 📝 **Move notes** — Add personal annotations to any move, export as text
- 🔄 **Game replay** — Step through any completed game move by move

### Social
- 👥 **Friends** — Add friends by Stellar address, see online/playing/offline status
- ⚔ **Challenges** — Send direct match challenges with custom XLM stake and time control
- 💬 **Live chat** — Per-game chat panel with bot commentators in live games
- 🔔 **Notifications** — In-app notification panel + browser push notifications

### Customization
- 🎨 **10 board skins** — Classic, Walnut, Ocean, Midnight, Neon, Purple, Gold, Ice, Lava, Marble
- 🌐 **Mainnet / Testnet toggle** — Switch Stellar networks from the topbar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Chess engine | chess.js |
| Chess UI | react-chessboard |
| Routing | React Router v7 |
| Wallet | @stellar/freighter-api |
| Blockchain SDK | @stellar/stellar-sdk |
| Analysis engine | Stockfish 18 (Web Worker) |
| Notifications | react-hot-toast |
| Animations | canvas-confetti |
| State | Custom reactive stores (localStorage-backed) |
| Styling | CSS Modules |

---

## Project Structure

```
frontend/
├── public/
│   └── stockfish.js          # Stockfish 18 lite (Web Worker)
├── src/
│   ├── bridge/
│   │   └── StellarBridge.ts  # Freighter wallet + Horizon API
│   ├── components/
│   │   ├── Sidebar.tsx        # Left navigation + friends list
│   │   ├── Topbar.tsx         # Search, quick actions, wallet chip
│   │   ├── RightPanel.tsx     # Leaderboard / Live / My Bets / Activity
│   │   ├── BoardSkinPicker.tsx
│   │   ├── CreateBetModal.tsx
│   │   ├── MyBetsWidget.tsx
│   │   └── NotificationPanel.tsx
│   ├── data/
│   │   ├── mockLiveGames.ts
│   │   ├── mockPuzzles.ts
│   │   └── mockTournaments.ts
│   ├── managers/
│   │   ├── BetManager.ts      # Bet creation, joining, payout calculation
│   │   ├── ClockManager.ts    # Per-player countdown with increment
│   │   └── GameHistory.ts     # localStorage game record management
│   ├── pages/
│   │   ├── HomePage.tsx       # Dashboard with stats, live games, my bets
│   │   ├── LobbyPage.tsx      # Open bets list
│   │   ├── GamePage.tsx       # Active chess game
│   │   ├── LivePage.tsx       # Live game spectating + betting + chat
│   │   ├── TournamentPage.tsx # Tournament brackets
│   │   ├── PuzzlePage.tsx     # Daily puzzles
│   │   ├── AnalysisPage.tsx   # Stockfish analysis + move notes
│   │   ├── FriendsPage.tsx    # Friends + challenges
│   │   └── HistoryPage.tsx    # Game history + stats + replay
│   ├── store/
│   │   ├── walletStore.ts     # Wallet state + balance helpers
│   │   ├── betStore.ts        # Open bets (localStorage)
│   │   ├── gameStore.ts       # Active game state
│   │   ├── myBetsStore.ts     # Personal bet history + P&L
│   │   ├── friendStore.ts     # Friends + challenge requests
│   │   ├── notificationStore.ts
│   │   ├── boardSkinStore.ts  # Selected board skin
│   │   └── analysisNotesStore.ts
│   └── types.ts               # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Freighter wallet extension](https://freighter.app) (for wallet features)

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the next available port).

### Build

```bash
npm run build
```

---

## Pages & Modules

### Home (`/`)
Dashboard with live stats, featured board, quick-play buttons, live game previews, tournament list, daily puzzles, and the full **My Bets** widget showing active/settled bets with net XLM P&L.

### Lobby (`/lobby`)
Lists all open bets with XLM amount, time control, and creator. Filter by min/max XLM, sort by newest or amount. Create a new bet or join an existing one — balance is deducted immediately on action.

### Live Games (`/live`)
Four simulated live games with auto-advancing moves. Select a game to see the board, clocks, bet distribution bar, odds-based betting form, bet history, and a live chat panel with bot commentators.

### Tournaments (`/tournament`)
Three tournaments in different states (active, registering, upcoming). Active tournaments show a full bracket with round labels. Click any match to view the board. Register by paying the entry fee.

### Puzzles (`/puzzle`)
Six daily puzzles with UCI-format solutions. Drag-and-drop piece movement, hint highlighting, progress bar, confetti on solve, and XLM reward tracking.

### Analysis (`/analysis`)
Load any completed game or the built-in sample (Fried Liver Attack). Click **Analyze** to run Stockfish 18 at depth 14 across all moves. Eval bar, best move line, move annotations, per-move notes, and clipboard export.

### Friends (`/friends`)
Add friends by Stellar public key. View online/playing/offline status. Send challenges with custom XLM stake and time control. Accept or decline incoming challenges.

### Game (`/game`)
Full chess game with drag-and-drop + click-to-move, legal move highlighting, last-move highlight, per-player clocks, move history panel, pawn promotion modal, resign button, and confetti + balance update on game end.

### History (`/history`)
Win/loss/draw statistics, total XLM net change, and a scrollable game list. Click any game to open the move-by-move replay viewer.

---

## Architecture

KELKIT is a **pure frontend** application — no backend server, no database. All state lives in:

- **Memory** — reactive global stores (custom pub/sub pattern)
- **localStorage** — persisted across sessions (bets, game history, friends, notes, skin preference)
- **Stellar Horizon** — balance fetched directly from the public API

### State Management

Each store follows the same pattern:

```ts
let state = loadFromLocalStorage();
const listeners = new Set<() => void>();

export function setState(patch) {
  state = { ...state, ...patch };
  saveToLocalStorage(state);
  listeners.forEach(fn => fn());
}

export function useStore() {
  const [, rerender] = useState(0);
  useEffect(() => {
    listeners.add(() => rerender(n => n + 1));
    return () => listeners.delete(...);
  }, []);
  return state;
}
```

No Redux, no Zustand, no Context — just reactive module-level singletons.

---

## Wallet Integration

KELKIT uses the **Freighter** browser extension via `@stellar/freighter-api` v6.

```ts
// Check if installed
const { isConnected } = await isConnected();

// Request access + get address
const { address } = await requestAccess();

// Fetch XLM balance from Horizon
const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
const xlm = data.balances.find(b => b.asset_type === 'native');
```

If Freighter is not installed, the user sees a direct install link. Mainnet and Testnet are both supported — toggle from the topbar.

---

## Payment Flow

> ⚠️ Payments are currently **simulated on the frontend**. Real Stellar transactions require a Soroban escrow contract or a trusted backend.

| Event | Balance change |
|---|---|
| Create bet | `-amountXLM` |
| Join bet | `-amountXLM` |
| Place live bet | `-amountXLM` |
| Win game | `+(amountXLM × 2 × 0.98)` |
| Draw | `+amountXLM` (refund) |
| Lose game | no change (already deducted) |

Platform fee: **2%** of total pot on win.

---

## Board Skins

10 built-in skins, persisted to localStorage:

| ID | Name | Dark | Light |
|---|---|---|---|
| `classic` | Classic | `#2d5a27` | `#8bc34a` |
| `walnut` | Walnut | `#7b4f2e` | `#d4a96a` |
| `ocean` | Ocean | `#1a4a6b` | `#5b9bd5` |
| `midnight` | Midnight | `#1a1a2e` | `#3d3d6b` |
| `neon` | Neon | `#0d0d0d` | `#1a1a1a` |
| `purple` | Purple | `#3b1f5e` | `#9b59b6` |
| `gold` | Gold | `#8b6914` | `#f0c040` |
| `ice` | Ice | `#4a7fa5` | `#c8e6f5` |
| `lava` | Lava | `#6b1a1a` | `#d45a2a` |
| `marble` | Marble | `#5a5a5a` | `#e8e8e8` |

Access via **Settings → Board Skin** (or add `/skin` route).

---

## Roadmap

- [ ] **Real Stellar escrow** — Soroban smart contract for trustless bet settlement
- [ ] **WebSocket multiplayer** — Real-time P2P games instead of single-player simulation
- [ ] **Leaderboard page** — Full weekly/monthly XLM rankings
- [ ] **Profile page** — Avatar, badge wall, win-rate chart, XLM P&L graph
- [ ] **Sound effects** — Move, capture, check, win sounds
- [ ] **PWA support** — Install as mobile app
- [ ] **Multi-token betting** — USDC and other Stellar assets
- [ ] **Opening explorer** — Learn Sicilian, Ruy Lopez, and more
- [ ] **Bot mode** — Play against Stockfish at adjustable difficulty

---

## License

MIT
