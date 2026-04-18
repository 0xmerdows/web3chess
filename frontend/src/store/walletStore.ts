import { useState, useCallback, useEffect } from 'react';
import type { WalletState } from '../types';

const NETWORK_KEY = 'kelk_wallet_network';

let globalState: WalletState = {
  connected: false,
  network: (localStorage.getItem(NETWORK_KEY) as 'mainnet' | 'testnet') || 'testnet',
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function getWalletState(): WalletState {
  return globalState;
}

export function setWalletState(next: Partial<WalletState>) {
  globalState = { ...globalState, ...next };
  if (next.network) localStorage.setItem(NETWORK_KEY, next.network);
  notify();
}

export function deductBalance(amount: number) {
  const current = parseFloat(globalState.balanceXLM || '0');
  const next = Math.max(0, current - amount);
  setWalletState({ balanceXLM: next.toFixed(2) });
}

export function addBalance(amount: number) {
  const current = parseFloat(globalState.balanceXLM || '0');
  setWalletState({ balanceXLM: (current + amount).toFixed(2) });
}

export function useWalletStore(): [WalletState, (next: Partial<WalletState>) => void] {
  const [, rerender] = useState(0);

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  const set = useCallback((next: Partial<WalletState>) => setWalletState(next), []);
  return [globalState, set];
}
