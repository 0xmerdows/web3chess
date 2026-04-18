import { useState, useEffect } from 'react';

export type MyBetStatus = 'active' | 'won' | 'lost' | 'draw' | 'cancelled';

export type MyBet = {
  id: string;
  type: 'game' | 'live';           // lobi oyunu mu, canlı bahis mi
  description: string;             // "vs StellarGM" veya "⬜ Beyaz — CryptoKnight vs XLMaster"
  amountXLM: number;
  potentialXLM: number;            // kazanılabilecek miktar
  status: MyBetStatus;
  resultXLM?: number;              // gerçekleşen kazanç/kayıp (+ veya -)
  createdAt: number;
  settledAt?: number;
};

const KEY = 'kelkit_my_bets';

function load(): MyBet[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

let bets: MyBet[] = load();
const listeners = new Set<() => void>();
function notify() { listeners.forEach(f => f()); }

export function getMyBets(): MyBet[] { return bets; }
export function getActiveBets(): MyBet[] { return bets.filter(b => b.status === 'active'); }

export function addMyBet(bet: Omit<MyBet, 'id' | 'createdAt'>) {
  const newBet: MyBet = { ...bet, id: `mb_${Date.now()}`, createdAt: Date.now() };
  bets = [newBet, ...bets].slice(0, 100);
  localStorage.setItem(KEY, JSON.stringify(bets));
  notify();
}

export function settleMyBet(id: string, status: Exclude<MyBetStatus, 'active'>, resultXLM: number) {
  bets = bets.map(b => b.id === id ? { ...b, status, resultXLM, settledAt: Date.now() } : b);
  localStorage.setItem(KEY, JSON.stringify(bets));
  notify();
}

export function useMyBetsStore(): MyBet[] {
  const [, r] = useState(0);
  useEffect(() => {
    const fn = () => r(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return bets;
}
