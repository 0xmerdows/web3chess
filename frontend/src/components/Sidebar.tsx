import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/',           icon: '⊞',  label: 'Ana Sayfa' },
  { to: '/lobby',      icon: '🎲',  label: 'Lobi' },
  { to: '/live',       icon: '🔴',  label: 'Canlı Oyunlar' },
  { to: '/tournament', icon: '🏆',  label: 'Turnuvalar' },
  { to: '/puzzle',     icon: '🧩',  label: 'Bulmacalar' },
  { to: '/analysis',   icon: '🔍',  label: 'Analiz' },
  { to: '/friends',    icon: '👥',  label: 'Arkadaşlar' },
  { to: '/game',       icon: '♟',   label: 'Oyun Oyna' },
  { to: '/history',    icon: '📋',  label: 'Geçmiş' },
];

const FRIENDS = [
  { name: 'CryptoKnight', status: 'online',  rating: 1842 },
  { name: 'StellarGM',    status: 'playing', rating: 1976 },
  { name: 'XLMaster',     status: 'online',  rating: 1654 },
  { name: 'BlockRook',    status: 'offline', rating: 1701 },
  { name: 'LumenPawn',    status: 'online',  rating: 2103 },
  { name: 'HashQueen',    status: 'playing', rating: 2088 },
];

type Props = { collapsed: boolean; onToggle: () => void };

export default function Sidebar({ collapsed, onToggle }: Props) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>♟</span>
        {!collapsed && <span className={styles.logoText}>KELKIT</span>}
        <button className={styles.toggleBtn} onClick={onToggle} title="Sidebar'ı daralt">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {!collapsed && <div className={styles.navSection}>MENÜ</div>}
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            title={collapsed ? label : undefined}
          >
            <span className={styles.navIcon}>{icon}</span>
            {!collapsed && <span className={styles.navLabel}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Arkadaşlar */}
      {!collapsed && (
        <div className={styles.friends}>
          <div className={styles.friendsHeader}>
            <span className={styles.navSection}>ARKADAŞLAR</span>
            <span className={styles.onlineCount}>
              {FRIENDS.filter(f => f.status !== 'offline').length} çevrimiçi
            </span>
          </div>
          <div className={styles.friendList}>
            {FRIENDS.map((f) => (
              <div key={f.name} className={styles.friendRow}>
                <div className={styles.friendAvatar}>
                  {f.name[0]}
                  <span className={`${styles.statusDot} ${styles[f.status]}`} />
                </div>
                <div className={styles.friendInfo}>
                  <span className={styles.friendName}>{f.name}</span>
                  <span className={styles.friendStatus}>
                    {f.status === 'playing' ? '♟ Oynuyor' : f.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </span>
                </div>
                <span className={styles.friendRating}>{f.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alt */}
      {!collapsed && (
        <div className={styles.sidebarFooter}>
          <div className={styles.footerLink}>⚙ Ayarlar</div>
          <div className={styles.footerLink}>❓ Yardım</div>
        </div>
      )}
    </aside>
  );
}
