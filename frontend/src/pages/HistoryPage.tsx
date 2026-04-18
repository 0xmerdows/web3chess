import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { loadHistory, getStats } from '../managers/GameHistory';
import { useWalletStore } from '../store/walletStore';
import { useBoardSkin } from '../store/boardSkinStore';
import type { GameRecord } from '../types';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const [wallet] = useWalletStore();
  const history = loadHistory();
  const stats = getStats(history);
  const [replayGame, setReplayGame] = useState<GameRecord | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);

  function getReplayFen(record: GameRecord, index: number): string {
    const chess = new Chess();
    for (let i = 0; i < index; i++) {
      chess.move(record.moves[i]);
    }
    return chess.fen();
  }

  function openReplay(record: GameRecord) {
    setReplayGame(record);
    setReplayIndex(0);
  }

  const shortKey = (key: string) => `${key.slice(0, 6)}...${key.slice(-4)}`;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Oyun Geçmişi</h1>

      {/* İstatistikler */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Toplam Oyun</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#4caf50' }}>{stats.wins}</div>
          <div className={styles.statLabel}>Galibiyet</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#e05555' }}>{stats.losses}</div>
          <div className={styles.statLabel}>Mağlubiyet</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.draws}</div>
          <div className={styles.statLabel}>Beraberlik</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#f0c040' }}>{stats.winRate}%</div>
          <div className={styles.statLabel}>Kazanma Oranı</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${stats.totalXlmChange >= 0 ? styles.positive : styles.negative}`}>
            {stats.totalXlmChange >= 0 ? '+' : ''}{stats.totalXlmChange.toFixed(2)} XLM
          </div>
          <div className={styles.statLabel}>Net Kazanç</div>
        </div>
      </div>

      {/* Replay modal */}
      {replayGame && (
        <div className={styles.replayOverlay} onClick={() => setReplayGame(null)}>
          <div className={styles.replayModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.replayHeader}>
              <span>Oyun Tekrarı</span>
              <button className={styles.closeBtn} onClick={() => setReplayGame(null)}>✕</button>
            </div>
            <div className={styles.replayBoard}>
              <Chessboard
                position={getReplayFen(replayGame, replayIndex)}
                arePiecesDraggable={false}
                customDarkSquareStyle={{ backgroundColor: '#2d5a27' }}
                customLightSquareStyle={{ backgroundColor: '#8bc34a' }}
                boardWidth={320}
              />
            </div>
            <div className={styles.replayControls}>
              <button onClick={() => setReplayIndex(0)} disabled={replayIndex === 0}>⏮</button>
              <button onClick={() => setReplayIndex((i) => Math.max(0, i - 1))} disabled={replayIndex === 0}>◀</button>
              <span>{replayIndex} / {replayGame.moves.length}</span>
              <button
                onClick={() => setReplayIndex((i) => Math.min(replayGame.moves.length, i + 1))}
                disabled={replayIndex === replayGame.moves.length}
              >▶</button>
              <button
                onClick={() => setReplayIndex(replayGame.moves.length)}
                disabled={replayIndex === replayGame.moves.length}
              >⏭</button>
            </div>
          </div>
        </div>
      )}

      {/* Oyun listesi */}
      {history.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p>Henüz tamamlanmış oyun yok.</p>
        </div>
      ) : (
        <div className={styles.gameList}>
          {history.map((record) => (
            <div key={record.id} className={styles.gameCard} onClick={() => openReplay(record)}>
              <div className={`${styles.resultBadge} ${styles[record.result]}`}>
                {record.result === 'win' ? 'G' : record.result === 'loss' ? 'M' : 'B'}
              </div>
              <div className={styles.gameInfo}>
                <div className={styles.opponent}>{shortKey(record.opponentPublicKey)}</div>
                <div className={styles.gameDate}>{new Date(record.date).toLocaleDateString('tr-TR')}</div>
              </div>
              <div className={styles.gameAmount}>
                <div className={styles.amount}>{record.amountXLM} XLM</div>
                <div className={`${styles.change} ${record.xlmChange >= 0 ? styles.positive : styles.negative}`}>
                  {record.xlmChange >= 0 ? '+' : ''}{record.xlmChange.toFixed(2)}
                </div>
              </div>
              <div className={styles.replayHint}>▶ Tekrar</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
