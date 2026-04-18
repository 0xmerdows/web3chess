import { useState } from 'react';
import toast from 'react-hot-toast';
import { useWalletStore } from '../store/walletStore';
import { connectWallet, isFreighterInstalled, fetchBalance } from '../bridge/StellarBridge';
import styles from './WalletBar.module.css';

export default function WalletBar() {
  const [wallet, setWallet] = useWalletStore();
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    const installed = await isFreighterInstalled();
    if (!installed) {
      toast.error(
        <span>
          Freighter cüzdanı yüklü değil.{' '}
          <a href="https://freighter.app" target="_blank" rel="noreferrer" style={{ color: '#f0c040' }}>
            Yükle
          </a>
        </span>
      );
      setLoading(false);
      return;
    }

    const result = await connectWallet(wallet.network);
    if (result.ok) {
      setWallet(result.value);
      toast.success('Cüzdan bağlandı!');
    } else {
      toast.error(result.error.message);
    }
    setLoading(false);
  }

  async function handleRefreshBalance() {
    if (!wallet.publicKey) return;
    const balance = await fetchBalance(wallet.publicKey, wallet.network);
    setWallet({ balanceXLM: balance });
  }

  function handleDisconnect() {
    setWallet({ connected: false, publicKey: undefined, balanceXLM: undefined });
    toast('Cüzdan bağlantısı kesildi.');
  }

  function toggleNetwork() {
    const next = wallet.network === 'mainnet' ? 'testnet' : 'mainnet';
    setWallet({ network: next });
    if (wallet.connected && wallet.publicKey) {
      fetchBalance(wallet.publicKey, next).then((b) => setWallet({ balanceXLM: b }));
    }
    toast(`Ağ: ${next}`);
  }

  const shortKey = wallet.publicKey
    ? `${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(-4)}`
    : null;

  return (
    <div className={styles.bar}>
      <div className={styles.logo}>
        ♟ <span className={styles.brand}>KELK</span>
      </div>

      <div className={styles.right}>
        <button className={styles.networkBtn} onClick={toggleNetwork}>
          {wallet.network === 'testnet' ? '🧪 Testnet' : '🌐 Mainnet'}
        </button>

        {wallet.connected ? (
          <div className={styles.walletInfo}>
            <span className={styles.balance}>
              {wallet.balanceXLM} XLM
              <button className={styles.refreshBtn} onClick={handleRefreshBalance} title="Bakiyeyi yenile">↻</button>
            </span>
            <span className={styles.pubkey} title={wallet.publicKey}>{shortKey}</span>
            <button className={styles.disconnectBtn} onClick={handleDisconnect}>Çıkış</button>
          </div>
        ) : (
          <button className={styles.connectBtn} onClick={handleConnect} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : '🔗 Cüzdan Bağla'}
          </button>
        )}
      </div>
    </div>
  );
}
