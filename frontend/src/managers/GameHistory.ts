import type { GameRecord } from '../types';

const HISTORY_KEY = 'kelk_game_history';
const MAX_RECORDS = 100;

export function loadHistory(): GameRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRecord(record: GameRecord): void {
  const history = loadHistory();
  const updated = [record, ...history].slice(0, MAX_RECORDS);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // quota exceeded — remove oldest and retry
    const trimmed = [record, ...history].slice(0, MAX_RECORDS - 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }
}

export function getStats(history: GameRecord[]) {
  const total = history.length;
  const wins = history.filter((r) => r.result === 'win').length;
  const losses = history.filter((r) => r.result === 'loss').length;
  const draws = history.filter((r) => r.result === 'draw').length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const totalXlmChange = history.reduce((sum, r) => sum + r.xlmChange, 0);
  return { total, wins, losses, draws, winRate, totalXlmChange };
}
