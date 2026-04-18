import { useState, useEffect } from 'react';

export type MoveNote = {
  id: string;
  gameId: string;
  moveIndex: number;
  moveSan: string;
  note: string;
  createdAt: number;
};

const NOTES_KEY = 'kelkit_analysis_notes';

function load(): MoveNote[] {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); }
  catch { return []; }
}

let notes: MoveNote[] = load();
const listeners = new Set<() => void>();
function notify() { listeners.forEach(f => f()); }

export function getNotes(gameId: string): MoveNote[] {
  return notes.filter(n => n.gameId === gameId);
}

export function addNote(note: Omit<MoveNote, 'id' | 'createdAt'>) {
  const existing = notes.find(n => n.gameId === note.gameId && n.moveIndex === note.moveIndex);
  if (existing) {
    notes = notes.map(n => n.id === existing.id ? { ...n, note: note.note } : n);
  } else {
    notes = [{
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    }, ...notes];
  }
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  notify();
}

export function deleteNote(id: string) {
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  notify();
}

export function exportNotes(gameId: string, moves: string[]): string {
  const gameNotes = getNotes(gameId);
  if (gameNotes.length === 0) return 'Bu oyun için not yok.';
  const lines = gameNotes
    .sort((a, b) => a.moveIndex - b.moveIndex)
    .map(n => {
      const moveNum = Math.ceil(n.moveIndex / 2);
      const side = n.moveIndex % 2 === 1 ? 'Beyaz' : 'Siyah';
      return `${moveNum}. ${side} (${n.moveSan}): ${n.note}`;
    });
  return `KELKIT Oyun Analizi\n${'─'.repeat(30)}\n${lines.join('\n')}`;
}

export function useNotesStore(gameId: string): MoveNote[] {
  const [, r] = useState(0);
  useEffect(() => {
    const fn = () => r(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return getNotes(gameId);
}
