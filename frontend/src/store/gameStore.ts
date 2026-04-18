import { useState, useEffect } from 'react';
import type { GameState } from '../types';

let activeGame: GameState | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function getActiveGame(): GameState | null {
  return activeGame;
}

export function setActiveGame(game: GameState | null) {
  activeGame = game;
  notify();
}

export function updateActiveGame(patch: Partial<GameState>) {
  if (!activeGame) return;
  activeGame = { ...activeGame, ...patch };
  notify();
}

export function useGameStore(): GameState | null {
  const [, rerender] = useState(0);
  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return activeGame;
}
