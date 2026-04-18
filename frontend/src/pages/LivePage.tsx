import { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import toast from 'react-hot-toast';
import { MOCK_LIVE_GAMES, type LiveGame, type LiveBet } from '../data/mockLiveGames';
import { useWalletStore, deductBalance } from '../store/walletStore';
import { addMyBet } from '../store/myBetsStore';
import styles from './LivePage.module.css';

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  time: number;
  type: 'chat' | 'system' | 'bet';
};

const BOT_NAMES = ['ChessWatcher', 'XLMFan', 'StellarSpy', 'CryptoViewer', 'BlockObserver'];
const BOT_COMMENTS = [
  'Harika hamle!', 'Bu pozisyon çok ilginç...', 'Beyaz baskı kuruyor.',
  'Siyah savunmada zorlanıyor.', 'Klasik Sicilya yapısı.', 'Zaman baskısı başlıyor!',
  'Bu at çok güçlü bir konumda.', 'Kale açık hatta çok etkili.', 'Mat tehdidi var!',
  'Beraberlik teklifi gelebilir.', 'Endgame yaklaşıyor.', 'Piyonlar belirleyici olacak.',
];

function generateChatId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// Mock oyunları simüle et — her 3-6 saniyede bir hamle yap
function useLiveGames() {
  const [games, setGames] = useState<LiveGame[]>(() =>
    MOCK_LIVE_GAMES.map((g) => ({ ...g, bets: [...g.bets] }))
  );

  useEffect(() => {
    const intervals = games.map((game, idx) => {
      const delay = 3000 + idx * 1500 + Math.random() * 2000;
      return setInterval(() => {
        setGames((prev) =>
          prev.map((g) => {
            if (g.id !== game.id) return g;
            try {
              const chess = new Chess(g.fen);
              if (chess.isGameOver()) return g;
              const moves = chess.moves();
              if (moves.length === 0) return g;
              chess.move(moves[Math.floor(Math.random() * moves.length)]);
              const tick = 800 + Math.random() * 1200;
              return {
                ...g,
                fen: chess.fen(),
                activeTurn: chess.turn() === 'w' ? 'white' : 'black',
                whiteTimeMs: g.activeTurn === 'white' ? Math.max(0, g.whiteTimeMs - tick) : g.whiteTimeMs,
                blackTimeMs: g.activeTurn === 'black' ? Math.max(0, g.blackTimeMs - tick) : g.blackTimeMs,
                spectators: Math.max(1, g.spectators + (Math.random() > 0.5 ? 1 : -1)),
              };
            } catch {
              return g;
            }
          })
        );
      }, delay);
    });
    return () => intervals.forEach(clearInterval);
  }, []);

  return [games, setGames] as const;
}

export default function LivePage() {
  const [wallet] = useWalletStore();
  const [games, setGames] = useLiveGames();
  const [selected, setSelected] = useState<LiveGame | null>(null);
  const [betSide, setBetSide] = useState<'white' | 'black'>('white');
  const [betAmount, setBetAmount] = useState('10');
  const [placingBet, setPlacingBet] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Seçili oyunu güncel tut
  const selectedGame = selected ? games.find((g) => g.id === selected.id) ?? null : null;

  // Bot mesajları
  useEffect(() => {
    if (!selectedGame) return;
    const id = setInterval(() => {
      const bot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const text = BOT_COMMENTS[Math.floor(Math.random() * BOT_COMMENTS.length)];
      setChatMessages((prev) => [
        ...prev.slice(-49),
        { id: generateChatId(), user: bot, text, time: Date.now(), type: 'chat' },
      ]);
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [selectedGame?.id]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Oyun seçilince sistem mesajı
  function selectGame(game: LiveGame) {
    setSelected(game);
    setChatMessages([
      { id: generateChatId(), user: 'Sistem', text: `${game.whitePlayer.name} vs ${game.blackPlayer.name} izleniyor`, time: Date.now(), type: 'system' },
    ]);
  }

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const name = wallet.publicKey ? wallet.publicKey.slice(0, 8) : 'Misafir';
    setChatMessages((prev) => [
      ...prev.slice(-49),
      { id: generateChatId(), user: name, text: chatInput.trim(), time: Date.now(), type: 'chat' },
    ]);
    setChatInput('');
  }

  function formatTime(ms: number) {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  }

  function totalBets(game: LiveGame, side: 'white' | 'black') {
    return game.bets.filter((b) => b.side === side).reduce((s, b) => s + b.amountXLM, 0);
  }

  function odds(game: LiveGame, side: 'white' | 'black'): string {
    const w = totalBets(game, 'white') || 1;
    const b = totalBets(game, 'black') || 1;
    const total = w + b;
    const ratio = side === 'white' ? total / w : total / b;
    return ratio.toFixed(2);
  }

  async function handlePlaceBet(game: LiveGame) {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Önce cüzdanınızı bağlayın.');
      return;
    }
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error('Geçersiz miktar.');
      return;
    }
    if (amount > parseFloat(wallet.balanceXLM || '0')) {
      toast.error('Yetersiz bakiye.');
      return;
    }

    setPlacingBet(true);
    await new Promise((r) => setTimeout(r, 900));

    const newBet: LiveBet = {
      id: `lb_${Date.now()}`,
      bettorKey: wallet.publicKey,
      side: betSide,
      amountXLM: amount,
      odds: parseFloat(odds(game, betSide)),
    };

    setGames((prev) =>
      prev.map((g) =>
        g.id === game.id
          ? { ...g, bets: [...g.bets, newBet], potXLM: g.potXLM + amount }
          : g
      )
    );

    toast.success(`${betSide === 'white' ? '⬜ Beyaz' : '⬛ Siyah'} için ${amount} XLM bahis yapıldı!`);
    deductBalance(amount);
    addMyBet({
      type: 'live',
      description: `${betSide === 'white' ? '⬜ Beyaz' : '⬛ Siyah'} — ${game.whitePlayer.name} vs ${game.blackPlayer.name}`,
      amountXLM: amount,
      potentialXLM: amount * parseFloat(odds(game, betSide)),
      status: 'active',
    });
    setPlacingBet(false);
    setBetAmount('10');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🔴 Canlı Oyunlar</h1>
        <span className={styles.liveCount}>{games.length} oyun canlı</span>
      </div>

      <div className={styles.layout}>
        {/* Sol: oyun listesi */}
        <div className={styles.gameList}>
          {games.map((game) => (
            <div
              key={game.id}
              className={`${styles.gameCard} ${selectedGame?.id === game.id ? styles.selected : ''}`}
              onClick={() => selectGame(game)}
            >
              <div className={styles.cardTop}>
                <div className={styles.players}>
                  <div className={styles.player}>
                    <span className={styles.colorDot} style={{ background: '#fff', border: '2px solid #555' }} />
                    <span className={styles.playerName}>{game.whitePlayer.name}</span>
                    <span className={styles.rating}>{game.whitePlayer.rating}</span>
                  </div>
                  <span className={styles.vs}>vs</span>
                  <div className={styles.player}>
                    <span className={styles.colorDot} style={{ background: '#222', border: '2px solid #888' }} />
                    <span className={styles.playerName}>{game.blackPlayer.name}</span>
                    <span className={styles.rating}>{game.blackPlayer.rating}</span>
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.tc}>{game.timeControl.label}</span>
                  <span className={styles.pot}>🏆 {game.potXLM} XLM</span>
                </div>
              </div>

              <div className={styles.cardBottom}>
                <div className={styles.clocks}>
                  <span className={`${styles.clock} ${game.activeTurn === 'white' ? styles.activeClock : ''}`}>
                    ⬜ {formatTime(game.whiteTimeMs)}
                  </span>
                  <span className={`${styles.clock} ${game.activeTurn === 'black' ? styles.activeClock : ''}`}>
                    ⬛ {formatTime(game.blackTimeMs)}
                  </span>
                </div>
                <div className={styles.cardStats}>
                  <span className={styles.spectators}>👁 {game.spectators}</span>
                  <span className={styles.betCount}>💰 {game.bets.length} bahis</span>
                </div>
              </div>

              {/* Bahis dağılımı bar */}
              <BetBar game={game} totalBets={totalBets} />
            </div>
          ))}
        </div>

        {/* Sağ: detay paneli */}
        {selectedGame ? (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <span className={styles.detailTitle}>
                {selectedGame.whitePlayer.name} vs {selectedGame.blackPlayer.name}
              </span>
              <button className={styles.closeDetail} onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* Mini tahta */}
            <div className={styles.boardWrap}>
              <Chessboard
                position={selectedGame.fen}
                arePiecesDraggable={false}
                customDarkSquareStyle={{ backgroundColor: '#2d5a27' }}
                customLightSquareStyle={{ backgroundColor: '#8bc34a' }}
                boardWidth={300}
              />
            </div>

            {/* Saatler */}
            <div className={styles.detailClocks}>
              <div className={`${styles.detailClock} ${selectedGame.activeTurn === 'white' ? styles.activeClock : ''}`}>
                ⬜ {formatTime(selectedGame.whiteTimeMs)}
              </div>
              <div className={styles.detailTc}>{selectedGame.timeControl.label}</div>
              <div className={`${styles.detailClock} ${selectedGame.activeTurn === 'black' ? styles.activeClock : ''}`}>
                ⬛ {formatTime(selectedGame.blackTimeMs)}
              </div>
            </div>

            {/* Bahis dağılımı */}
            <div className={styles.betDistSection}>
              <div className={styles.betDistLabel}>Bahis Dağılımı</div>
              <div className={styles.betDistRow}>
                <span className={styles.betDistSide}>⬜ {totalBets(selectedGame, 'white')} XLM</span>
                <div className={styles.betDistBar}>
                  <div
                    className={styles.betDistFill}
                    style={{
                      width: `${Math.round(
                        (totalBets(selectedGame, 'white') /
                          Math.max(1, totalBets(selectedGame, 'white') + totalBets(selectedGame, 'black'))) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <span className={styles.betDistSide}>⬛ {totalBets(selectedGame, 'black')} XLM</span>
              </div>
            </div>

            {/* Bahis formu */}
            <div className={styles.betForm}>
              <div className={styles.betFormTitle}>Bahis Yap</div>
              <div className={styles.sideSelect}>
                <button
                  className={`${styles.sideBtn} ${betSide === 'white' ? styles.sideBtnActive : ''}`}
                  onClick={() => setBetSide('white')}
                >
                  ⬜ Beyaz Kazanır
                  <span className={styles.oddsTag}>x{odds(selectedGame, 'white')}</span>
                </button>
                <button
                  className={`${styles.sideBtn} ${betSide === 'black' ? styles.sideBtnActive : ''}`}
                  onClick={() => setBetSide('black')}
                >
                  ⬛ Siyah Kazanır
                  <span className={styles.oddsTag}>x{odds(selectedGame, 'black')}</span>
                </button>
              </div>

              <div className={styles.amountRow}>
                <input
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className={styles.amountInput}
                  placeholder="XLM miktarı"
                />
                <span className={styles.potentialWin}>
                  → ~{(parseFloat(betAmount || '0') * parseFloat(odds(selectedGame, betSide))).toFixed(2)} XLM
                </span>
              </div>

              <button
                className={styles.placeBetBtn}
                onClick={() => handlePlaceBet(selectedGame)}
                disabled={placingBet || !wallet.connected}
              >
                {placingBet ? <span className={styles.spinner} /> : '🎲 Bahis Yap'}
              </button>
              {!wallet.connected && (
                <p className={styles.connectHint}>Bahis yapmak için cüzdanınızı bağlayın.</p>
              )}
            </div>

            {/* Mevcut bahisler */}
            {selectedGame.bets.length > 0 && (
              <div className={styles.betsList}>
                <div className={styles.betsListTitle}>Yapılan Bahisler</div>
                {selectedGame.bets.map((b) => (
                  <div key={b.id} className={styles.betRow}>
                    <span className={styles.betRowSide}>{b.side === 'white' ? '⬜' : '⬛'}</span>
                    <span className={styles.betRowKey}>
                      {b.bettorKey.slice(0, 6)}...{b.bettorKey.slice(-4)}
                    </span>
                    <span className={styles.betRowAmount}>{b.amountXLM} XLM</span>
                    <span className={styles.betRowOdds}>x{b.odds.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sohbet */}
            <div className={styles.chat}>
              <div className={styles.chatTitle}>💬 Sohbet</div>
              <div className={styles.chatMessages}>
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`${styles.chatMsg} ${msg.type === 'system' ? styles.chatMsgSystem : ''}`}>
                    {msg.type === 'system' ? (
                      <span className={styles.systemMsg}>— {msg.text} —</span>
                    ) : (
                      <>
                        <span className={styles.chatUser}>{msg.user}</span>
                        <span className={styles.chatText}>{msg.text}</span>
                      </>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendChat} className={styles.chatForm}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Mesaj yaz..."
                  className={styles.chatInput}
                  maxLength={120}
                />
                <button type="submit" className={styles.chatSend} disabled={!chatInput.trim()}>↑</button>
              </form>
            </div>
          </div>
        ) : (
          <div className={styles.detailEmpty}>
            <span>👈</span>
            <p>Detay ve bahis için bir oyun seç</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BetBar({ game, totalBets }: { game: LiveGame; totalBets: (g: LiveGame, s: 'white' | 'black') => number }) {
  const w = totalBets(game, 'white');
  const b = totalBets(game, 'black');
  const total = w + b;
  if (total === 0) return null;
  const wPct = Math.round((w / total) * 100);
  return (
    <div className={styles.miniBar}>
      <div className={styles.miniBarFill} style={{ width: `${wPct}%` }} />
    </div>
  );
}
