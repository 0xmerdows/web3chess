import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import toast from 'react-hot-toast';
import { MOCK_TOURNAMENTS, type Tournament, type BracketMatch } from '../data/mockTournaments';
import { useWalletStore } from '../store/walletStore';
import styles from './TournamentPage.module.css';

export default function TournamentPage() {
  const [wallet] = useWalletStore();
  const [tournaments, setTournaments] = useState(MOCK_TOURNAMENTS);
  const [selected, setSelected] = useState<Tournament>(MOCK_TOURNAMENTS[0]);
  const [registering, setRegistering] = useState(false);
  const [watchMatch, setWatchMatch] = useState<BracketMatch | null>(null);

  const current = tournaments.find((t) => t.id === selected.id) ?? selected;

  async function handleRegister(t: Tournament) {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Önce cüzdanınızı bağlayın.');
      return;
    }
    const balance = parseFloat(wallet.balanceXLM || '0');
    if (balance < t.entryFeeXLM) {
      toast.error(`Yetersiz bakiye. Gerekli: ${t.entryFeeXLM} XLM`);
      return;
    }
    const alreadyIn = t.registeredPlayers.some((p) => p.key === wallet.publicKey);
    if (alreadyIn) { toast('Zaten kayıtlısınız.'); return; }
    if (t.registeredPlayers.length >= t.maxPlayers) { toast.error('Turnuva dolu.'); return; }

    setRegistering(true);
    await new Promise((r) => setTimeout(r, 900));

    const newPlayer = {
      key: wallet.publicKey,
      name: wallet.publicKey.slice(0, 8),
      rating: 1500,
      seed: t.registeredPlayers.length + 1,
    };

    setTournaments((prev) =>
      prev.map((x) =>
        x.id === t.id
          ? {
              ...x,
              registeredPlayers: [...x.registeredPlayers, newPlayer],
              prizePoolXLM: x.prizePoolXLM + t.entryFeeXLM,
            }
          : x
      )
    );
    toast.success(`${t.entryFeeXLM} XLM ödendi. Turnuvaya kayıt olundu!`);
    setRegistering(false);
  }

  function statusLabel(s: Tournament['status']) {
    const map = { upcoming: '⏳ Yakında', registering: '📝 Kayıt Açık', active: '🔴 Canlı', completed: '✅ Bitti' };
    return map[s];
  }

  function statusColor(s: Tournament['status']) {
    const map = { upcoming: '#888', registering: '#4caf50', active: '#e05555', completed: '#666' };
    return map[s];
  }

  function formatCountdown(ms: number) {
    const diff = ms - Date.now();
    if (diff <= 0) return 'Başladı';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}sa ${m}dk` : `${m}dk`;
  }

  const rounds = current.status === 'active' ? Math.max(...current.bracket.map((m) => m.round)) : 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🏆 Turnuvalar</h1>

      <div className={styles.layout}>
        {/* Sol: turnuva listesi */}
        <div className={styles.list}>
          {tournaments.map((t) => (
            <div
              key={t.id}
              className={`${styles.card} ${current.id === t.id ? styles.cardSelected : ''}`}
              onClick={() => setSelected(t)}
            >
              <div className={styles.cardName}>{t.name}</div>
              <div className={styles.cardMeta}>
                <span style={{ color: statusColor(t.status) }}>{statusLabel(t.status)}</span>
                <span className={styles.cardFee}>{t.entryFeeXLM} XLM giriş</span>
              </div>
              <div className={styles.cardPrize}>
                🏆 {t.prizePoolXLM} XLM pot
              </div>
              <div className={styles.cardPlayers}>
                {t.registeredPlayers.length}/{t.maxPlayers} oyuncu · {t.timeControl.label}
              </div>
            </div>
          ))}
        </div>

        {/* Sağ: detay */}
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <div>
              <h2 className={styles.detailName}>{current.name}</h2>
              <p className={styles.detailDesc}>{current.description}</p>
            </div>
            <span className={styles.statusBadge} style={{ background: statusColor(current.status) + '22', color: statusColor(current.status), border: `1px solid ${statusColor(current.status)}44` }}>
              {statusLabel(current.status)}
            </span>
          </div>

          {/* İstatistikler */}
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statVal} style={{ color: '#f0c040' }}>{current.prizePoolXLM} XLM</div>
              <div className={styles.statLbl}>Ödül Havuzu</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{current.entryFeeXLM} XLM</div>
              <div className={styles.statLbl}>Giriş Ücreti</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{current.registeredPlayers.length}/{current.maxPlayers}</div>
              <div className={styles.statLbl}>Oyuncu</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{current.timeControl.label}</div>
              <div className={styles.statLbl}>Zaman</div>
            </div>
          </div>

          {/* Kayıt / Başlangıç */}
          {current.status === 'registering' && (
            <div className={styles.registerBox}>
              <div className={styles.registerInfo}>
                <span>Başlangıç: <strong>{formatCountdown(current.startTime)}</strong></span>
                <span>{current.maxPlayers - current.registeredPlayers.length} yer kaldı</span>
              </div>
              <button
                className={styles.registerBtn}
                onClick={() => handleRegister(current)}
                disabled={registering || !wallet.connected}
              >
                {registering ? <span className={styles.spinner} /> : `Kayıt Ol — ${current.entryFeeXLM} XLM`}
              </button>
              {!wallet.connected && <p className={styles.hint}>Kayıt için cüzdanınızı bağlayın.</p>}
            </div>
          )}

          {current.status === 'upcoming' && (
            <div className={styles.upcomingBox}>
              ⏳ Kayıt <strong>{formatCountdown(current.startTime)}</strong> içinde açılacak
            </div>
          )}

          {/* Bracket */}
          {current.status === 'active' && current.bracket.length > 0 && (
            <div className={styles.bracketSection}>
              <div className={styles.bracketTitle}>Turnuva Bracket</div>
              <div className={styles.bracket}>
                {Array.from({ length: rounds }, (_, ri) => ri + 1).map((round) => {
                  const roundLabel = round === rounds ? 'Final' : round === rounds - 1 ? 'Yarı Final' : `${round}. Tur`;
                  const matches = current.bracket.filter((m) => m.round === round);
                  return (
                    <div key={round} className={styles.bracketRound}>
                      <div className={styles.roundLabel}>{roundLabel}</div>
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className={`${styles.matchCard} ${match.status === 'active' ? styles.matchActive : ''} ${match.status === 'pending' ? styles.matchPending : ''}`}
                          onClick={() => match.status !== 'pending' && setWatchMatch(match)}
                        >
                          <MatchSlot player={match.white} result={match.result} side="white" winner={match.result === 'white'} />
                          <div className={styles.matchVs}>vs</div>
                          <MatchSlot player={match.black} result={match.result} side="black" winner={match.result === 'black'} />
                          {match.status === 'active' && <span className={styles.liveDot}>CANLI</span>}
                          {match.status === 'completed' && <span className={styles.doneDot}>✓</span>}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kayıtlı oyuncular */}
          <div className={styles.playersSection}>
            <div className={styles.playersSectionTitle}>Kayıtlı Oyuncular ({current.registeredPlayers.length})</div>
            <div className={styles.playersList}>
              {current.registeredPlayers.map((p) => (
                <div key={p.key} className={styles.playerRow}>
                  <span className={styles.playerSeed}>#{p.seed}</span>
                  <span className={styles.playerName}>{p.name}</span>
                  <span className={styles.playerRating}>{p.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Maç izleme modal */}
      {watchMatch && (
        <div className={styles.overlay} onClick={() => setWatchMatch(null)}>
          <div className={styles.watchModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.watchHeader}>
              <span>{watchMatch.white?.name} vs {watchMatch.black?.name}</span>
              <button onClick={() => setWatchMatch(null)}>✕</button>
            </div>
            <Chessboard
              position={watchMatch.fen || 'start'}
              arePiecesDraggable={false}
              customDarkSquareStyle={{ backgroundColor: '#2d5a27' }}
              customLightSquareStyle={{ backgroundColor: '#8bc34a' }}
              boardWidth={340}
            />
            {watchMatch.result && (
              <div className={styles.watchResult}>
                🏆 {watchMatch.result === 'white' ? watchMatch.white?.name : watchMatch.black?.name} kazandı
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchSlot({ player, winner }: { player?: { name: string; rating: number }; result?: 'white' | 'black' | null; side: 'white' | 'black'; winner: boolean }) {
  if (!player) return <div className={styles.emptySlot}>TBD</div>;
  return (
    <div className={`${styles.matchPlayer} ${winner ? styles.matchWinner : ''}`}>
      <span className={styles.matchName}>{player.name}</span>
      <span className={styles.matchRating}>{player.rating}</span>
    </div>
  );
}
