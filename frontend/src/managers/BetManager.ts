import type { Bet, TimeControl, Result } from '../types';
import { addBet, updateBet, removeBet, getBets } from '../store/betStore';

function generateId(): string {
  return `bet_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export type CreateBetParams = {
  creatorPublicKey: string;
  amountXLM: number;
  timeControl: TimeControl;
  balanceXLM: number;
}

export function createBet(params: CreateBetParams): Result<Bet> {
  const { creatorPublicKey, amountXLM, timeControl, balanceXLM } = params;

  if (amountXLM < 1 || amountXLM > 10000) {
    return {
      ok: false,
      error: { code: 'INVALID_BET_AMOUNT', message: 'Bahis miktarı 1-10.000 XLM arasında olmalıdır.', retryable: false },
    };
  }

  if (amountXLM > balanceXLM) {
    return {
      ok: false,
      error: { code: 'INSUFFICIENT_BALANCE', message: 'Yetersiz XLM bakiyesi.', retryable: false },
    };
  }

  const bet: Bet = {
    id: generateId(),
    creatorPublicKey,
    amountXLM,
    timeControl,
    status: 'open',
    createdAt: Date.now(),
  };

  addBet(bet);
  return { ok: true, value: bet };
}

export function joinBet(betId: string, opponentPublicKey: string, balanceXLM: number): Result<Bet> {
  const bet = getBets().find((b) => b.id === betId);
  if (!bet) {
    return { ok: false, error: { code: 'INVALID_BET_AMOUNT', message: 'Bahis bulunamadı.', retryable: false } };
  }
  if (bet.status !== 'open') {
    return { ok: false, error: { code: 'INVALID_BET_AMOUNT', message: 'Bu bahis artık açık değil.', retryable: false } };
  }
  if (bet.creatorPublicKey === opponentPublicKey) {
    return { ok: false, error: { code: 'INVALID_BET_AMOUNT', message: 'Kendi bahsinize katılamazsınız.', retryable: false } };
  }
  if (bet.amountXLM > balanceXLM) {
    return { ok: false, error: { code: 'INSUFFICIENT_BALANCE', message: 'Yetersiz XLM bakiyesi.', retryable: false } };
  }

  const gameId = `game_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const updated: Bet = { ...bet, opponentPublicKey, status: 'active', gameId };
  updateBet(betId, { opponentPublicKey, status: 'active', gameId });
  return { ok: true, value: updated };
}

export function cancelBet(betId: string): void {
  removeBet(betId);
}

export function getOpenBets(): Bet[] {
  return getBets().filter((b) => b.status === 'open');
}

export function calculatePayout(amountXLM: number): { winner: number; platform: number } {
  const total = amountXLM * 2;
  const platform = total * 0.02;
  const winner = total - platform;
  return { winner, platform };
}
