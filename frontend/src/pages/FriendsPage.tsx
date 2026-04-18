import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useFriendStore, useChallengeStore,
  addFriend, removeFriend, sendChallenge, updateChallenge,
  type Friend,
} from '../store/friendStore';
import { pushNotification } from '../store/notificationStore';
import { useWalletStore } from '../store/walletStore';
import { TIME_CONTROLS } from '../types';
import styles from './FriendsPage.module.css';

const STATUS_LABEL: Record<string, string> = {
  online: '🟢 Çevrimiçi',
  playing: '🟡 Oynuyor',
  offline: '⚫ Çevrimdışı',
};

// Demo arkadaşlar — ilk açılışta ekle
const DEMO_FRIENDS: Friend[] = [
  { key: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37', name: 'CryptoKnight', rating: 1842, status: 'online',  addedAt: Date.now() - 86400000 },
  { key: 'GBVNNPOFVV2YNXSQXDJPBVQYY6MZXHKQPBXCQZQZQZQZQZQZQZQZQZQ', name: 'StellarGM',    rating: 1976, status: 'playing', addedAt: Date.now() - 172800000 },
  { key: 'GAHK7EEG2WWHVKDNT4CEQFZGKITDFIIZKFEVGENQ7JDJBKJIEWQSA37Y', name: 'XLMaster',     rating: 1654, status: 'offline', addedAt: Date.now() - 259200000 },
  { key: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGZQE3MONF7JSTF6OANZBIQ', name: 'BlockRook',    rating: 1701, status: 'online',  addedAt: Date.now() - 345600000 },
];

export default function FriendsPage() {
  const [wallet] = useWalletStore();
  const friends = useFriendStore();
  const challenges = useChallengeStore();
  const [tab, setTab] = useState<'friends' | 'challenges' | 'add'>('friends');
  const [searchKey, setSearchKey] = useState('');
  const [addKey, setAddKey] = useState('');
  const [addName, setAddName] = useState('');
  const [challengeFriend, setChallengeFriend] = useState<Friend | null>(null);
  const [challengeAmount, setChallengeAmount] = useState('50');
  const [challengeTc, setChallengeTc] = useState('5+0');
  const [sending, setSending] = useState(false);

  // Demo arkadaşları yükle
  if (friends.length === 0) {
    DEMO_FRIENDS.forEach(f => addFriend(f));
  }

  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(searchKey.toLowerCase()) ||
    f.key.toLowerCase().includes(searchKey.toLowerCase())
  );

  const pendingChallenges = challenges.filter(c => c.status === 'pending');

  function handleAddFriend() {
    if (!addKey.trim() || addKey.length < 10) {
      toast.error('Geçerli bir Stellar adresi girin.');
      return;
    }
    const name = addName.trim() || addKey.slice(0, 8);
    const ok = addFriend({
      key: addKey.trim(),
      name,
      rating: 1500,
      status: 'offline',
      addedAt: Date.now(),
    });
    if (ok) {
      toast.success(`${name} arkadaş listesine eklendi!`);
      pushNotification({ type: 'friend_add', title: 'Arkadaş Eklendi', body: `${name} arkadaş listenize eklendi.` });
      setAddKey('');
      setAddName('');
      setTab('friends');
    } else {
      toast.error('Bu adres zaten listenizde.');
    }
  }

  async function handleSendChallenge() {
    if (!wallet.connected || !wallet.publicKey || !challengeFriend) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 800));

    sendChallenge({
      id: `ch_${Date.now()}`,
      fromKey: wallet.publicKey,
      fromName: wallet.publicKey.slice(0, 8),
      toKey: challengeFriend.key,
      amountXLM: parseFloat(challengeAmount),
      timeControl: challengeTc,
      createdAt: Date.now(),
      status: 'pending',
    });

    pushNotification({
      type: 'challenge',
      title: 'Meydan Okuma Gönderildi',
      body: `${challengeFriend.name}'e ${challengeAmount} XLM meydan okuma gönderildi.`,
      link: '/friends',
    });

    toast.success(`${challengeFriend.name}'e meydan okuma gönderildi!`);
    setChallengeFriend(null);
    setSending(false);
    setTab('challenges');
  }

  function handleRespond(id: string, accept: boolean) {
    updateChallenge(id, accept ? 'accepted' : 'declined');
    toast(accept ? '✅ Meydan okuma kabul edildi!' : '❌ Meydan okuma reddedildi.');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>👥 Arkadaşlar</h1>
        {pendingChallenges.length > 0 && (
          <span className={styles.badge}>{pendingChallenges.length} bekleyen</span>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'friends' ? styles.active : ''}`} onClick={() => setTab('friends')}>
          Arkadaşlar ({friends.length})
        </button>
        <button className={`${styles.tab} ${tab === 'challenges' ? styles.active : ''}`} onClick={() => setTab('challenges')}>
          Meydan Okumalar {pendingChallenges.length > 0 && <span className={styles.tabBadge}>{pendingChallenges.length}</span>}
        </button>
        <button className={`${styles.tab} ${tab === 'add' ? styles.active : ''}`} onClick={() => setTab('add')}>
          + Arkadaş Ekle
        </button>
      </div>

      {/* Arkadaş listesi */}
      {tab === 'friends' && (
        <div className={styles.section}>
          <input
            className={styles.search}
            placeholder="🔎 İsim veya adres ara..."
            value={searchKey}
            onChange={e => setSearchKey(e.target.value)}
          />
          {filtered.length === 0 && (
            <div className={styles.empty}>
              <span>👥</span>
              <p>Arkadaş bulunamadı.</p>
            </div>
          )}
          <div className={styles.friendList}>
            {filtered.map(f => (
              <div key={f.key} className={styles.friendCard}>
                <div className={styles.avatar}>{f.name[0]}</div>
                <div className={styles.info}>
                  <div className={styles.name}>{f.name}</div>
                  <div className={styles.meta}>
                    <span className={styles.status}>{STATUS_LABEL[f.status]}</span>
                    <span className={styles.rating}>⚡ {f.rating} ELO</span>
                  </div>
                  <div className={styles.keyText} title={f.key}>
                    {f.key.slice(0, 8)}...{f.key.slice(-6)}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.challengeBtn}
                    onClick={() => { setChallengeFriend(f); }}
                    disabled={!wallet.connected}
                    title={wallet.connected ? 'Meydan Oku' : 'Cüzdan bağla'}
                  >
                    ⚔ Meydan Oku
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => { removeFriend(f.key); toast('Arkadaş listeden çıkarıldı.'); }}
                    title="Çıkar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meydan okumalar */}
      {tab === 'challenges' && (
        <div className={styles.section}>
          {challenges.length === 0 && (
            <div className={styles.empty}><span>⚔</span><p>Henüz meydan okuma yok.</p></div>
          )}
          {challenges.map(c => (
            <div key={c.id} className={`${styles.challengeCard} ${styles[c.status]}`}>
              <div className={styles.challengeInfo}>
                <div className={styles.challengeTitle}>
                  {c.fromKey === wallet.publicKey
                    ? `→ ${c.toKey.slice(0, 8)}...`
                    : `← ${c.fromName}`}
                </div>
                <div className={styles.challengeMeta}>
                  <span>⚡ {c.amountXLM} XLM</span>
                  <span>🕐 {c.timeControl}</span>
                  <span className={`${styles.challengeStatus} ${styles[c.status]}`}>
                    {c.status === 'pending' ? '⏳ Bekliyor' : c.status === 'accepted' ? '✅ Kabul' : '❌ Reddedildi'}
                  </span>
                </div>
              </div>
              {c.status === 'pending' && c.fromKey !== wallet.publicKey && (
                <div className={styles.respondBtns}>
                  <button className={styles.acceptBtn} onClick={() => handleRespond(c.id, true)}>Kabul Et</button>
                  <button className={styles.declineBtn} onClick={() => handleRespond(c.id, false)}>Reddet</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Arkadaş ekle */}
      {tab === 'add' && (
        <div className={styles.section}>
          <div className={styles.addForm}>
            <div className={styles.addTitle}>Stellar Adresiyle Arkadaş Ekle</div>
            <input
              className={styles.addInput}
              placeholder="Stellar public key (G...)"
              value={addKey}
              onChange={e => setAddKey(e.target.value)}
            />
            <input
              className={styles.addInput}
              placeholder="Takma ad (opsiyonel)"
              value={addName}
              onChange={e => setAddName(e.target.value)}
            />
            <button className={styles.addBtn} onClick={handleAddFriend}>
              + Arkadaş Ekle
            </button>
          </div>
        </div>
      )}

      {/* Meydan okuma modal */}
      {challengeFriend && (
        <div className={styles.overlay} onClick={() => setChallengeFriend(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>⚔ {challengeFriend.name}'e Meydan Oku</span>
              <button onClick={() => setChallengeFriend(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.modalLabel}>Bahis Miktarı (XLM)</label>
              <input
                type="number"
                className={styles.modalInput}
                value={challengeAmount}
                onChange={e => setChallengeAmount(e.target.value)}
                min="1" max="10000"
              />
              <label className={styles.modalLabel}>Zaman Kontrolü</label>
              <div className={styles.tcGrid}>
                {TIME_CONTROLS.map(tc => (
                  <button
                    key={tc.label}
                    className={`${styles.tcBtn} ${challengeTc === tc.label ? styles.tcActive : ''}`}
                    onClick={() => setChallengeTc(tc.label)}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
              <button
                className={styles.sendBtn}
                onClick={handleSendChallenge}
                disabled={sending}
              >
                {sending ? <span className={styles.spinner} /> : '⚔ Meydan Okuma Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
