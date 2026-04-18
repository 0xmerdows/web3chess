import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotificationStore, markRead, markAllRead,
  deleteNotification, requestBrowserPermission,
  type Notification,
} from '../store/notificationStore';
import styles from './NotificationPanel.module.css';

const TYPE_ICON: Record<string, string> = {
  move: '♟', challenge: '⚔', tournament: '🏆',
  bet_joined: '🎲', game_over: '🏁', friend_add: '👥', system: '🔔',
};

type Props = { onClose: () => void };

export default function NotificationPanel({ onClose }: Props) {
  const notifications = useNotificationStore();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  function handleClick(n: Notification) {
    markRead(n.id);
    if (n.link) { navigate(n.link); onClose(); }
  }

  function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Az önce';
    if (m < 60) return `${m}dk`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}sa`;
    return `${Math.floor(h / 24)}g`;
  }

  return (
    <div className={styles.panel} ref={ref}>
      <div className={styles.header}>
        <span className={styles.title}>🔔 Bildirimler</span>
        <div className={styles.headerActions}>
          <button className={styles.permBtn} onClick={requestBrowserPermission} title="Tarayıcı bildirimleri aç">
            📲
          </button>
          <button className={styles.allReadBtn} onClick={markAllRead}>Tümünü oku</button>
        </div>
      </div>

      <div className={styles.list}>
        {notifications.length === 0 && (
          <div className={styles.empty}>
            <span>🔔</span>
            <p>Bildirim yok</p>
          </div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className={`${styles.item} ${!n.read ? styles.unread : ''}`}
            onClick={() => handleClick(n)}
          >
            <div className={styles.icon}>{TYPE_ICON[n.type] ?? '🔔'}</div>
            <div className={styles.content}>
              <div className={styles.notifTitle}>{n.title}</div>
              <div className={styles.body}>{n.body}</div>
            </div>
            <div className={styles.right}>
              <span className={styles.time}>{timeAgo(n.createdAt)}</span>
              <button
                className={styles.deleteBtn}
                onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                title="Sil"
              >✕</button>
            </div>
            {!n.read && <div className={styles.dot} />}
          </div>
        ))}
      </div>
    </div>
  );
}
