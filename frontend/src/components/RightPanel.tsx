import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_LIVE_GAMES } from '../data/mockLiveGames';
import { MOCK_TOURNAMENTS } from '../data/mockTournaments';
import MyBetsWidget from './MyBetsWidget';
import styles from './RightPanel.module.css';

const LEADERBOARD = [
  { rank: 1, name: 'LumenPawn',   rating: 2103, xlm: 4820, change: +120 },
  { rank: 2, name: 'HashQueen',   rating: 2088, xlm: 3950, change: +85  },
  { rank: 3, name: 'StellarGM',   rating: 1976, xlm: 2740, change: -40  },
  { rank: 4, name: 'CryptoKnight',rating: 1842, xlm: 1980, change: +210 },
  { rank: 5, name: 'BlockRook',   rating: 1701, xlm: 1450, change: +30  },
  { rank: 6, name: 'XLMaster',    rating: 1654, xlm: 980,  change: -90  },
];

const RECENT_ACTIVITY = [
  { text: 'CryptoKnight 50 XLM kazandı', time: '2dk', icon: '🏆' },
  { text: 'Yeni turnuva başladı: Blitz', time: '5dk', icon: '🏅' },
  { text: 'StellarGM bulmaca çözdü',     time: '8dk', icon: '🧩' },
  { text: 'LumenPawn 200 XLM bahis açtı',time: '12dk', icon: '🎲' },
  { text: 'HashQueen şah mat yaptı',      time: '15dk', icon: '♟' },
];

type Tab = 'leaderboard' | 'activity' | 'live' | 'mybets';

export default function RightPanel() {
  const [tab, setTab] = useState<Tab>('leaderboard');
  const navigate = useNavigate();

  return (
    <aside className={styles.panel}>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'leaderboard' ? styles.active : ''}`} onClick={() => setTab('leaderboard')}>Sıralama</button>
        <button className={`${styles.tab} ${tab === 'live' ? styles.active : ''}`} onClick={() => setTab('live')}>Canlı</button>
        <button className={`${styles.tab} ${tab === 'mybets' ? styles.active : ''}`} onClick={() => setTab('mybets')}>Bahislerim</button>
        <button className={`${styles.tab} ${tab === 'activity' ? styles.active : ''}`} onClick={() => setTab('activity')}>Aktivite</button>
      </div>

      <div className={styles.content}>
        {/* Leaderboard */}
        {tab === 'leaderboard' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Bu Hafta En Çok Kazanan</div>
            {LEADERBOARD.map((p) => (
              <div key={p.rank} className={styles.lbRow}>
                <span className={`${styles.lbRank} ${p.rank <= 3 ? styles[`rank${p.rank}`] : ''}`}>
                  {p.rank <= 3 ? ['🥇','🥈','🥉'][p.rank-1] : p.rank}
                </span>
                <div className={styles.lbInfo}>
                  <span className={styles.lbName}>{p.name}</span>
                  <span className={styles.lbRating}>{p.rating} ELO</span>
                </div>
                <div className={styles.lbRight}>
                  <span className={styles.lbXlm}>{p.xlm} XLM</span>
                  <span className={`${styles.lbChange} ${p.change >= 0 ? styles.pos : styles.neg}`}>
                    {p.change >= 0 ? '+' : ''}{p.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live games */}
        {tab === 'live' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Canlı Oyunlar</div>
            {MOCK_LIVE_GAMES.map((g) => (
              <div key={g.id} className={styles.liveRow} onClick={() => navigate('/live')}>
                <div className={styles.liveNames}>
                  <span>{g.whitePlayer.name}</span>
                  <span className={styles.liveVs}>vs</span>
                  <span>{g.blackPlayer.name}</span>
                </div>
                <div className={styles.liveMeta}>
                  <span className={styles.livePot}>🏆 {g.potXLM} XLM</span>
                  <span className={styles.liveSpec}>👁 {g.spectators}</span>
                  <span className={styles.livePulse} />
                </div>
              </div>
            ))}
            <div className={styles.sectionTitle} style={{ marginTop: '1rem' }}>Aktif Turnuvalar</div>
            {MOCK_TOURNAMENTS.filter(t => t.status === 'active' || t.status === 'registering').map((t) => (
              <div key={t.id} className={styles.tourRow} onClick={() => navigate('/tournament')}>
                <span className={styles.tourName}>{t.name}</span>
                <span className={styles.tourPot}>{t.prizePoolXLM} XLM</span>
              </div>
            ))}
          </div>
        )}

        {/* My bets */}
        {tab === 'mybets' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Bahislerim</div>
            <MyBetsWidget compact />
          </div>
        )}

        {/* Activity */}
        {tab === 'activity' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Son Aktiviteler</div>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className={styles.actRow}>
                <span className={styles.actIcon}>{a.icon}</span>
                <span className={styles.actText}>{a.text}</span>
                <span className={styles.actTime}>{a.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* XLM fiyat widget */}
      <div className={styles.priceWidget}>
        <div className={styles.priceLeft}>
          <span className={styles.priceLabel}>XLM / USD</span>
          <span className={styles.priceValue}>$0.112</span>
        </div>
        <span className={styles.priceChange}>+2.4% ↑</span>
      </div>
    </aside>
  );
}
