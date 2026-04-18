import { useState, useEffect } from 'react';
import type { Bet } from '../types';

const BETS_KEY = 'kelk_open_bets';

function loadBets(): Bet[] {
  try {
    return JSON.parse(localStorage.getItem(BETS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveBets(bets: Bet[]) {
  localStorage.setItem(BETS_KEY, JSON.stringify(bets));
}

let bets: Bet[] = loadBets();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function getBets(): Bet[] {
  return bets;
}

export function setBets(next: Bet[]) {
  bets = next;
  saveBets(bets);
  notify();
}

export function addBet(bet: Bet) {
  bets = [bet, ...bets];
  saveBets(bets);
  notify();
}

export function updateBet(id: string, patch: Partial<Bet>) {
  bets = bets.map((b) => (b.id === id ? { ...b, ...patch } : b));
  saveBets(bets);
  notify();
}

export function removeBet(id: string) {
  bets = bets.filter((b) => b.id !== id);
  saveBets(bets);
  notify();
}

export function useBetStore(): Bet[] {
  const [, rerender] = useState(0);
  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return bets;
}
