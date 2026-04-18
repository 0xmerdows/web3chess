import { useState, useEffect } from 'react';

export type NotifType =
  | 'move'        // rakip hamle yaptı
  | 'challenge'   // meydan okuma geldi
  | 'tournament'  // turnuva başladı
  | 'bet_joined'  // bahise katılındı
  | 'game_over'   // oyun bitti
  | 'friend_add'  // arkadaş eklendi
  | 'system';

export type Notification = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  link?: string;
};

const NOTIF_KEY = 'kelkit_notifications';

function load(): Notification[] {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); }
  catch { return []; }
}

let notifications: Notification[] = load();
const listeners = new Set<() => void>();
function notify() { listeners.forEach(f => f()); }

export function getNotifications() { return notifications; }
export function getUnreadCount() { return notifications.filter(n => !n.read).length; }

export function pushNotification(n: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
  const notif: Notification = {
    ...n,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    read: false,
    createdAt: Date.now(),
  };
  notifications = [notif, ...notifications].slice(0, 50);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  notify();

  // Browser notification (izin varsa)
  if (Notification.permission === 'granted') {
    new Notification(notif.title, { body: notif.body, icon: '/favicon.svg' });
  }
}

export function markRead(id: string) {
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  notify();
}

export function markAllRead() {
  notifications = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  notify();
}

export function deleteNotification(id: string) {
  notifications = notifications.filter(n => n.id !== id);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  notify();
}

export async function requestBrowserPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function useNotificationStore() {
  const [, r] = useState(0);
  useEffect(() => {
    const fn = () => r(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return notifications;
}

// Mock bildirimler — demo için
export function seedMockNotifications() {
  if (notifications.length > 0) return;
  const mocks: Omit<Notification, 'id' | 'read' | 'createdAt'>[] = [
    { type: 'challenge',   title: 'Meydan Okuma!',        body: 'CryptoKnight sizi 50 XLM için meydan okuyor.', link: '/friends' },
    { type: 'tournament',  title: 'Turnuva Başlıyor!',     body: 'Blitz Şampiyonası 30 dakika içinde başlıyor.', link: '/tournament' },
    { type: 'bet_joined',  title: 'Bahsinize Katılındı',   body: 'StellarGM 100 XLM bahsinize katıldı.', link: '/game' },
  ];
  mocks.forEach(m => pushNotification(m));
}
