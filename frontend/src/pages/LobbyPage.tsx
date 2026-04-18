import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWalletStore, deductBalance } from '../store/walletStore';
import { useBetStore } from '../store/betStore';
import { setActiveGame } from '../store/gameStore';
import { joinBet, cancelBet, getOpenBets } from '../managers/BetManager';
import { addMyBet } from '../store/myBetsStore';
import type { Bet } from '../types';
import CreateBetModal from '../components/CreateBetModal';
import styles from './LobbyPage.module.css';

type SortKey = 'amount_asc' | 'amount_desc' | 'newest';

export default function LobbyPage() {
  const [wallet] = useWalletStore();
  const allBets = useBetStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [sort, setSort] = useState<SortKey>('newest');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Lobi 5 saniyede bir güncellenir (localStorage tabanlı)
  useEffect(() => {
    const id = setInterval(() => {
      // store zaten reaktif, sadece trigger
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const openBets = getOpenBets();

  const filtered = openBets.filter((b) => {
    if (filterMin && b.amountXLM < parseFloat(filterMin)) return false;
    if (filterMax && b.amountXLM > parseFloat(filterMax)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'amount_asc') return a.amountXLM - b.amountXLM;
    if (sort === 'amount_desc') return b.amountXLM - a.amountXLM;
    return b.createdAt - a.createdAt;
  });

  async function handleJoin(bet: Bet) {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Önce cüzdanınızı bağlayın.');
      return;
    }
    setJoiningId(bet.id);
    const result = joinBet(bet.id, wallet.publicKey, parseFloat(wallet.balanceXLM || '0'));
    if (result.ok) {
      deductBalance(bet.amountXLM);
      addMyBet({
        type: 'game',
        description: `vs ${bet.creatorPublicKey.slice(0, 6)}... — ${bet.timeControl.label}`,
        amountXLM: bet.amountXLM,
        potentialXLM: bet.amountXLM * 2 * 0.98,
        status: 'active',
      });
      const game = {
        id: result.value.gameId!,
        betId: bet.id,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        history: [],
        whitePublicKey: bet.creatorPublicKey,
        blackPublicKey: wallet.publicKey,
        status: 'active' as const,
        startedAt: Date.now(),
      };
      setActiveGame(game);
      toast.success('Oyuna katıldınız!');
      navigate('/game');
    } else {
      toast.error(result.error.message);
    }
    setJoiningId(null);
  }

  function handleCancel(betId: string) {
    cancelBet(betId);
    toast('Bahis iptal edildi.');
  }

  function handleCreateGame() {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Önce cüzdanınızı bağlayın.');
      return;
    }
    setShowCreate(true);
  }

  function formatTime(ms: number) {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Az önce';
    if (mins < 60) return `${mins}dk önce`;
    return `${Math.floor(mins / 60)}sa önce`;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Lobi</h1>
          <p className={styles.subtitle}>{sorted.length} açık bahis</p>
        </div>
        <button className={styles.createBtn} onClick={handleCreateGame}>
          + Bahis Oluştur
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <input
            type="number"
            placeholder="Min XLM"
            value={filterMin}
            onChange={(e) => setFilterMin(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="number"
            placeholder="Max XLM"
            value={filterMax}
            onChange={(e) => setFilterMax(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className={styles.sortSelect}
        >
          <option value="newest">En Yeni</option>
          <option value="amount_desc">En Yüksek XLM</option>
          <option value="amount_asc">En Düşük XLM</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>♟</span>
          <p>Henüz açık bahis yok.</p>
          <p className={styles.emptyHint}>İlk bahsi sen oluştur!</p>
        </div>
      ) : (
        <div className={styles.betList}>
          {sorted.map((bet) => {
            const isOwn = wallet.publicKey === bet.creatorPublicKey;
            const shortKey = `${bet.creatorPublicKey.slice(0, 6)}...${bet.creatorPublicKey.slice(-4)}`;
            return (
              <div key={bet.id} className={styles.betCard}>
                <div className={styles.betLeft}>
                  <div className={styles.betAmount}>{bet.amountXLM} <span>XLM</span></div>
                  <div className={styles.betTime}>{bet.timeControl.label}</div>
                </div>
                <div className={styles.betMid}>
                  <span className={styles.betCreator} title={bet.creatorPublicKey}>{shortKey}</span>
                  <span className={styles.betAge}>{formatTime(bet.createdAt)}</span>
                </div>
                <div className={styles.betRight}>
                  {isOwn ? (
                    <button className={styles.cancelBtn} onClick={() => handleCancel(bet.id)}>
                      İptal
                    </button>
                  ) : (
                    <button
                      className={styles.joinBtn}
                      onClick={() => handleJoin(bet)}
                      disabled={!wallet.connected || joiningId === bet.id}
                    >
                      {joiningId === bet.id ? <span className={styles.spinner} /> : 'Katıl'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateBetModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
