import { useState } from 'react';
import { useMyBetsStore, type MyBet, type MyBetStatus } from '../store/myBetsStore';
import styles from './MyBetsWidget.module.css';

type Filter = 'all' | 'active' | 'won' | 'lost';

type Props = { compact?: boolean };

export default function MyBetsWidget({ compact = false }: Props) {
  const bets = useMyBetsStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = bets.filter(b => {
    if (filter === 'active') return b.status === 'active';
    if (filter === 'won')    return b.status === 'won';
    if (filter === 'lost')   return b.status === 'lost';
    return true;
  });

  const active = bets.filter(b => b.status === 'active').length;
  const won    = bets.filter(b => b.status === 'won').length;
  const lost   = bets.filter(b => b.status === 'lost').length;
  const totalNet = bets
    .filter(b => b.resultXLM !== undefined)
    .reduce((s, b) => s + (b.resultXLM ?? 0), 0);

  function statusIcon(s: MyBetStatus) {
    if (s === 'active')    return <span className={`${styles.dot} ${styles.dotActive}`} />;
    if (s === 'won')       return <span className={styles.wonIcon}>✓</span>;
    if (s === 'lost')      return <span className={styles.lostIcon}>✗</span>;
    if (s === 'draw')      return <span className={styles.drawIcon}>½</span>;
    return <span className={styles.cancelIcon}>—</span>;
  }

  function timeAgo(ts: number) {
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return 'Az önce';
    if (m < 60) return `${m}dk`;
    return `${Math.floor(m / 60)}sa`;
  }

  if (bets.length === 0) {
    return (
      <div className={styles.empty}>
        <span>🎲</span>
        <p>Henüz bahis yok</p>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      {/* Özet satırı */}
      {!compact && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryVal} style={{ color: '#f0c040' }}>{active}</span>
            <span className={styles.summaryLbl}>Aktif</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryVal} style={{ color: '#4caf50' }}>{won}</span>
            <span className={styles.summaryLbl}>Kazandı</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryVal} style={{ color: '#e05555' }}>{lost}</span>
            <span className={styles.summaryLbl}>Kaybetti</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={`${styles.summaryVal} ${totalNet >= 0 ? styles.pos : styles.neg}`}>
              {totalNet >= 0 ? '+' : ''}{totalNet.toFixed(1)}
            </span>
            <span className={styles.summaryLbl}>Net XLM</span>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className={styles.filters}>
        {(['all', 'active', 'won', 'lost'] as Filter[]).map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tümü' : f === 'active' ? '⏳ Aktif' : f === 'won' ? '✓ Kazandı' : '✗ Kaybetti'}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.emptyFilter}>Bu filtrede bahis yok.</div>
        )}
        {filtered.map(bet => (
          <div key={bet.id} className={`${styles.betRow} ${styles[bet.status]}`}>
            <div className={styles.betIcon}>{statusIcon(bet.status)}</div>
            <div className={styles.betInfo}>
              <div className={styles.betDesc}>{bet.description}</div>
              <div className={styles.betMeta}>
                <span className={styles.betType}>{bet.type === 'live' ? '🔴 Canlı' : '♟ Oyun'}</span>
                <span className={styles.betTime}>{timeAgo(bet.createdAt)}</span>
              </div>
            </div>
            <div className={styles.betAmounts}>
              <div className={styles.betStake}>{bet.amountXLM} XLM</div>
              {bet.status === 'active' && (
                <div className={styles.betPotential}>→ {bet.potentialXLM.toFixed(1)}</div>
              )}
              {bet.resultXLM !== undefined && (
                <div className={`${styles.betResult} ${bet.resultXLM >= 0 ? styles.pos : styles.neg}`}>
                  {bet.resultXLM >= 0 ? '+' : ''}{bet.resultXLM.toFixed(1)} XLM
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
