import { useState } from 'react';
import toast from 'react-hot-toast';
import { useWalletStore, deductBalance } from '../store/walletStore';
import { createBet } from '../managers/BetManager';
import { addMyBet } from '../store/myBetsStore';
import type { TimeControl } from '../types';
import { TIME_CONTROLS } from '../types';
import styles from './CreateBetModal.module.css';

interface Props {
  onClose: () => void;
}

export default function CreateBetModal({ onClose }: Props) {
  const [wallet] = useWalletStore();
  const [amount, setAmount] = useState('10');
  const [timeControl, setTimeControl] = useState<TimeControl>(TIME_CONTROLS[4]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet.connected || !wallet.publicKey) return;

    setLoading(true);
    const result = createBet({
      creatorPublicKey: wallet.publicKey,
      amountXLM: parseFloat(amount),
      timeControl,
      balanceXLM: parseFloat(wallet.balanceXLM || '0'),
    });

    if (result.ok) {
      deductBalance(parseFloat(amount));
      addMyBet({
        type: 'game',
        description: `Lobi bahsi — ${timeControl.label}`,
        amountXLM: parseFloat(amount),
        potentialXLM: parseFloat(amount) * 2 * 0.98,
        status: 'active',
      });
      toast.success(`Bahis oluşturuldu: ${amount} XLM escrow'a kilitlendi`);
      onClose();
    } else {
      toast.error(result.error.message);
    }
    setLoading(false);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Bahis Oluştur</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Bahis Miktarı (XLM)</label>
            <div className={styles.inputRow}>
              <input
                type="number"
                min="1"
                max="10000"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.input}
                required
              />
              <span className={styles.unit}>XLM</span>
            </div>
            <span className={styles.hint}>Bakiye: {wallet.balanceXLM || '0'} XLM</span>
          </div>

          <div className={styles.field}>
            <label>Zaman Kontrolü</label>
            <div className={styles.timeGrid}>
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.label}
                  type="button"
                  className={`${styles.timeBtn} ${timeControl.label === tc.label ? styles.selected : ''}`}
                  onClick={() => setTimeControl(tc)}
                >
                  {tc.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.summary}>
            <span>Kazanırsanız alacağınız:</span>
            <span className={styles.payout}>
              ~{(parseFloat(amount || '0') * 2 * 0.98).toFixed(2)} XLM
            </span>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : '🎲 Bahis Aç'}
          </button>
        </form>
      </div>
    </div>
  );
}
