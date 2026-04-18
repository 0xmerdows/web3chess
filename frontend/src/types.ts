export type Square = string;
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type TimeControl = {
  initialSeconds: number;
  incrementSeconds: number;
  label: string;
};

export type GameResult = {
  winner: 'white' | 'black' | 'draw';
  reason: 'checkmate' | 'timeout' | 'stalemate' | 'resignation' | 'draw_agreement';
  winnerPublicKey?: string;
};

export type Bet = {
  id: string;
  creatorPublicKey: string;
  opponentPublicKey?: string;
  amountXLM: number;
  timeControl: TimeControl;
  status: 'open' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
  gameId?: string;
};

export type GameState = {
  id: string;
  betId: string;
  fen: string;
  history: string[];
  whitePublicKey: string;
  blackPublicKey: string;
  status: 'active' | 'completed';
  result?: GameResult;
  startedAt: number;
};

export type WalletState = {
  connected: boolean;
  publicKey?: string;
  balanceXLM?: string;
  network: 'mainnet' | 'testnet';
};

export type GameRecord = {
  id: string;
  opponentPublicKey: string;
  result: 'win' | 'loss' | 'draw';
  amountXLM: number;
  xlmChange: number;
  date: number;
  moves: string[];
  finalFen: string;
};

export type AppError = {
  code: ErrorCode;
  message: string;
  retryable: boolean;
};

export type ErrorCode =
  | 'WALLET_NOT_INSTALLED'
  | 'WALLET_CONNECTION_FAILED'
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_BET_AMOUNT'
  | 'STELLAR_TX_FAILED'
  | 'STELLAR_TX_TIMEOUT'
  | 'STORAGE_QUOTA_EXCEEDED';

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };

export const TIME_CONTROLS: TimeControl[] = [
  { initialSeconds: 60, incrementSeconds: 0, label: '1+0' },
  { initialSeconds: 180, incrementSeconds: 0, label: '3+0' },
  { initialSeconds: 180, incrementSeconds: 2, label: '3+2' },
  { initialSeconds: 300, incrementSeconds: 0, label: '5+0' },
  { initialSeconds: 300, incrementSeconds: 3, label: '5+3' },
  { initialSeconds: 600, incrementSeconds: 0, label: '10+0' },
  { initialSeconds: 600, incrementSeconds: 5, label: '10+5' },
  { initialSeconds: 900, incrementSeconds: 10, label: '15+10' },
];
