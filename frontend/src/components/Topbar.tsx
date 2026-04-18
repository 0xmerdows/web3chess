import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWalletStore } from '../store/walletStore';
import { connectWallet, isFreighterInstalled, fetchBalance } from '../bridge/StellarBridge';
import { useNotificationStore, getUnreadCount, seedMockNotifications } from '../store/notificationStore';
import NotificationPanel from './NotificationPanel';
import styles from './Topbar.module.css';

export default function Topbar() {
  const [wallet, setWallet] = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  useNotificationStore(); // reaktif
  seedMockNotifications();
  const unread = getUnreadCount();

  async function handleConnect() {
    setLoading(true);
    const installed = await isFreighterInstalled();
    if (!installed) {
      toast.error(
        <span>Freighter yüklü değil. <a href="https://freighter.app" target="_blank" rel="noreferrer" style={{ color: '#f0c040' }}>Yükle →</a></span>
      );
      setLoading(false);
      return;
    }
    const result = await connectWallet(wallet.network);
    if (result.ok) { setWallet(result.value); toast.success('Cüzdan bağlandı!'); }
    else toast.error(result.error.message);
    setLoading(false);
  }

  async function handleRefresh() {
    if (!wallet.publicKey) return;
    const b = await fetchBalance(wallet.publicKey, wallet.network);
    setWallet({ balanceXLM: b });
  }

  function handleDisconnect() {
    setWallet({ connected: false, publicKey: undefined, balanceXLM: undefined });
    toast('Cüzdan bağlantısı kesildi.');
  }

  const shortKey = wallet.publicKey ? `${wallet.publicKey.slice(0, 4)}…${wallet.publicKey.slice(-4)}` : '';

  return (
    <header className={styles.topbar}>
      {/* Sol: arama */}
      <div className={styles.search}>
        <span className={styles.searchIcon}>🔎</span>
        <input className={styles.searchInput} placeholder="Oyuncu ara, oyun bul..." />
      </div>

      {/* Orta: hızlı aksiyonlar */}
      <div className={styles.quickActions}>
        <button className={styles.playBtn} onClick={() => navigate('/lobby')}>
          ⚡ Hızlı Oyun
        </button>
        <button className={styles.puzzleBtn} onClick={() => navigate('/puzzle')}>
          🧩 Bulmaca
        </button>
      </div>

      {/* Sağ: cüzdan + ağ */}
      <div className={styles.right}>
        <button
          className={`${styles.networkPill} ${wallet.network === 'testnet' ? styles.testnet : styles.mainnet}`}
          onClick={() => {
            const next = wallet.network === 'mainnet' ? 'testnet' : 'mainnet';
            setWallet({ network: next });
            if (wallet.publicKey) fetchBalance(wallet.publicKey, next).then(b => setWallet({ balanceXLM: b }));
            toast(`Ağ: ${next}`);
          }}
        >
          {wallet.network === 'testnet' ? '🧪 Test' : '🌐 Main'}
        </button>

        {wallet.connected ? (
          <div className={styles.walletChip}>
            <div className={styles.walletBalance} onClick={handleRefresh} title="Yenile">
              <span className={styles.xlmIcon}>✦</span>
              <span>{wallet.balanceXLM}</span>
              <span className={styles.xlmLabel}>XLM</span>
            </div>
            <div className={styles.walletDivider} />
            <div className={styles.walletKey} title={wallet.publicKey}>{shortKey}</div>
            <button className={styles.disconnectBtn} onClick={handleDisconnect} title="Çıkış">✕</button>
          </div>
        ) : (
          <button className={styles.connectBtn} onClick={handleConnect} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : '🔗 Cüzdan Bağla'}
          </button>
        )}

        {/* Bildirim */}
        <div className={styles.notifWrap}>
          <button className={styles.notifBtn} onClick={() => setShowNotifs(v => !v)} title="Bildirimler">
            🔔
            {unread > 0 && <span className={styles.notifBadge}>{unread > 9 ? '9+' : unread}</span>}
          </button>
          {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
        </div>
      </div>
    </header>
  );
}
