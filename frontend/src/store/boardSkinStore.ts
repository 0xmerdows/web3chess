import { useState, useEffect } from 'react';

export type BoardSkin = {
  id: string;
  name: string;
  dark: string;
  light: string;
  border?: string;
  glow?: string;
  label: string;
  preview: [string, string]; // [dark, light] for mini preview
};

export const BOARD_SKINS: BoardSkin[] = [
  {
    id: 'classic',
    name: 'Klasik',
    label: '♟ Klasik',
    dark: '#2d5a27',
    light: '#8bc34a',
    preview: ['#2d5a27', '#8bc34a'],
  },
  {
    id: 'walnut',
    name: 'Ceviz',
    label: '🪵 Ceviz',
    dark: '#7b4f2e',
    light: '#d4a96a',
    preview: ['#7b4f2e', '#d4a96a'],
  },
  {
    id: 'ocean',
    name: 'Okyanus',
    label: '🌊 Okyanus',
    dark: '#1a4a6b',
    light: '#5b9bd5',
    preview: ['#1a4a6b', '#5b9bd5'],
  },
  {
    id: 'midnight',
    name: 'Gece',
    label: '🌙 Gece',
    dark: '#1a1a2e',
    light: '#3d3d6b',
    preview: ['#1a1a2e', '#3d3d6b'],
  },
  {
    id: 'neon',
    name: 'Neon',
    label: '⚡ Neon',
    dark: '#0d0d0d',
    light: '#1a1a1a',
    border: '#00ff88',
    glow: '0 0 20px rgba(0,255,136,0.3)',
    preview: ['#0d0d0d', '#1a1a1a'],
  },
  {
    id: 'purple',
    name: 'Mor',
    label: '💜 Mor',
    dark: '#3b1f5e',
    light: '#9b59b6',
    preview: ['#3b1f5e', '#9b59b6'],
  },
  {
    id: 'gold',
    name: 'Altın',
    label: '✨ Altın',
    dark: '#8b6914',
    light: '#f0c040',
    preview: ['#8b6914', '#f0c040'],
  },
  {
    id: 'ice',
    name: 'Buz',
    label: '❄ Buz',
    dark: '#4a7fa5',
    light: '#c8e6f5',
    preview: ['#4a7fa5', '#c8e6f5'],
  },
  {
    id: 'lava',
    name: 'Lav',
    label: '🌋 Lav',
    dark: '#6b1a1a',
    light: '#d45a2a',
    preview: ['#6b1a1a', '#d45a2a'],
  },
  {
    id: 'marble',
    name: 'Mermer',
    label: '🏛 Mermer',
    dark: '#5a5a5a',
    light: '#e8e8e8',
    preview: ['#5a5a5a', '#e8e8e8'],
  },
];

const SKIN_KEY = 'kelkit_board_skin';

let currentSkinId: string = localStorage.getItem(SKIN_KEY) || 'classic';
const listeners = new Set<() => void>();

export function getCurrentSkin(): BoardSkin {
  return BOARD_SKINS.find(s => s.id === currentSkinId) ?? BOARD_SKINS[0];
}

export function setSkin(id: string) {
  currentSkinId = id;
  localStorage.setItem(SKIN_KEY, id);
  listeners.forEach(f => f());
}

export function useBoardSkin(): BoardSkin {
  const [, r] = useState(0);
  useEffect(() => {
    const fn = () => r(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return getCurrentSkin();
}
