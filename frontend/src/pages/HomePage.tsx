import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { useWalletStore } from '../store/walletStore';
import { MOCK_LIVE_GAMES } from '../data/mockLiveGames';
import { MOCK_TOURNAMENTS } from '../data/mockTournaments';
import { DAILY_PUZZLES } from '../data/mockPuzzles';
import MyBetsWidget from '../components/MyBetsWidget';
import styles from './HomePage.module.css';

const STATS = [
  { label: 'Aktif Oyun',    value: '4',      icon: '♟',  color: '#f0c040' },
  { label: 'Canlı Bahis',   value: '12',     icon: '🎲',  color: '#4caf50' },
  { label: 'Turnuva',       value: '3',      icon: '🏆',  color: '#9c27b0' },
  { label: 'Toplam XLM Pot',value: '7,840',  icon: '✦',   color: '#2196f3' },
];

const FEATURED_FEN = 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5';

export default function HomePage() {
  const [wallet] = useWalletStore();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}>🔴 4 oyun şu an canlı</div>
          <h1 className={styles.heroTitle}>
            Satranç oyna,<br />
            <span className={styles.heroGold}>XLM kazan.</span>
          </h1>
          <p className={styles.heroSub}>
            Stellar blockchain üzerinde güvenli bahis. Kazananın ödülü anında cüzdanına.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.heroPlayBtn} onClick={() => navigate('/lobby')}>
              ⚡ Hemen Oyna
            </button>
            <button className={styles.heroWatchBtn} onClick={() => navigate('/live')}>
              👁 Canlı İzle
            </button>
          </div>
          {!wallet.connected && (
            <p className={styles.heroHint}>Bahis yapmak için cüzdanını bağla →</p>
          )}
        </div>
        <div className={styles.heroBoard}>
          <div className={styles.boardGlow} />
          <Chessboard
            position={FEATURED_FEN}
            arePiecesDraggable={false}
            customDarkSquareStyle={{ backgroundColor: '#2d5a27' }}
            customLightSquareStyle={{ backgroundColor: '#8bc34a' }}
            boardWidth={220}
            customBoardStyle={{ borderRadius: '10px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
          />
        </div>
      </div>

      {/* İstatistik kartları */}
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statIcon} style={{ color: s.color }}>{s.icon}</span>
            <div>
              <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* İçerik grid */}
      <div className={styles.grid}>
        {/* Canlı oyunlar */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🔴 Canlı Oyunlar</span>
            <button className={styles.cardMore} onClick={() => navigate('/live')}>Tümü →</button>
          </div>
          <div className={styles.liveList}>
            {MOCK_LIVE_GAMES.slice(0, 3).map((g) => (
              <div key={g.id} className={styles.liveRow} onClick={() => navigate('/live')}>
                <div className={styles.liveMatch}>
                  <span className={styles.livePlayer}>{g.whitePlayer.name}</span>
                  <span className={styles.liveScore}>vs</span>
                  <span className={styles.livePlayer}>{g.blackPlayer.name}</span>
                </div>
                <div className={styles.liveMeta}>
                  <span className={styles.livePot}>✦ {g.potXLM} XLM</span>
                  <span className={styles.liveSpec}>👁 {g.spectators}</span>
                  <span className={styles.liveTc}>{g.timeControl.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Turnuvalar */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🏆 Turnuvalar</span>
            <button className={styles.cardMore} onClick={() => navigate('/tournament')}>Tümü →</button>
          </div>
          <div className={styles.tourList}>
            {MOCK_TOURNAMENTS.map((t) => (
              <div key={t.id} className={styles.tourRow} onClick={() => navigate('/tournament')}>
                <div className={styles.tourLeft}>
                  <span className={styles.tourName}>{t.name}</span>
                  <span className={styles.tourMeta}>{t.registeredPlayers.length}/{t.maxPlayers} oyuncu · {t.timeControl.label}</span>
                </div>
                <div className={styles.tourRight}>
                  <span className={styles.tourPot}>{t.prizePoolXLM} XLM</span>
                  <span className={`${styles.tourStatus} ${styles[t.status]}`}>
                    {t.status === 'active' ? 'Canlı' : t.status === 'registering' ? 'Kayıt' : 'Yakında'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Günlük bulmacalar */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🧩 Günlük Bulmacalar</span>
            <button className={styles.cardMore} onClick={() => navigate('/puzzle')}>Çöz →</button>
          </div>
          <div className={styles.puzzleList}>
            {DAILY_PUZZLES.slice(0, 4).map((p) => (
              <div key={p.id} className={styles.puzzleRow} onClick={() => navigate('/puzzle')}>
                <div className={styles.puzzleLeft}>
                  <span className={styles.puzzleTheme}>{p.theme}</span>
                  <span className={styles.puzzleDesc}>{p.description}</span>
                </div>
                <div className={styles.puzzleRight}>
                  <span className={`${styles.puzzleDiff} ${styles[p.difficulty]}`}>{p.difficulty}</span>
                  <span className={styles.puzzleReward}>+{p.rewardXLM} XLM</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hızlı başlat */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>⚡ Hızlı Oyun</span>
          </div>
          <div className={styles.quickGrid}>
            {[
              { label: '1 dk', sub: 'Bullet', tc: '1+0', color: '#e05555' },
              { label: '3 dk', sub: 'Blitz',  tc: '3+0', color: '#f0c040' },
              { label: '5 dk', sub: 'Blitz',  tc: '5+0', color: '#4caf50' },
              { label: '10 dk',sub: 'Rapid',  tc: '10+0',color: '#2196f3' },
            ].map((tc) => (
              <button
                key={tc.tc}
                className={styles.quickBtn}
                style={{ '--tc-color': tc.color } as React.CSSProperties}
                onClick={() => navigate('/lobby')}
              >
                <span className={styles.quickTime}>{tc.label}</span>
                <span className={styles.quickSub}>{tc.sub}</span>
              </button>
            ))}
          </div>
          <button className={styles.customBtn} onClick={() => navigate('/lobby')}>
            + Özel Bahis Oluştur
          </button>
        </section>

        {/* Bahislerim */}
        <section className={`${styles.card} ${styles.myBetsCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🎲 Bahislerim</span>
            <span className={styles.cardMoreStatic}>Son 100</span>
          </div>
          <MyBetsWidget />
        </section>
      </div>
    </div>
  );
}
