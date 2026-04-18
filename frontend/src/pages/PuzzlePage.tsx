import { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { DAILY_PUZZLES, type Puzzle } from '../data/mockPuzzles';
import { useWalletStore } from '../store/walletStore';
import styles from './PuzzlePage.module.css';

type PuzzleState = 'idle' | 'playing' | 'solved' | 'failed';

export default function PuzzlePage() {
  const [wallet] = useWalletStore();
  const [selected, setSelected] = useState<Puzzle>(DAILY_PUZZLES[0]);
  const [state, setState] = useState<PuzzleState>('idle');
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(selected.fen);
  const [moveIndex, setMoveIndex] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState(false);

  function startPuzzle(puzzle: Puzzle) {
    chess.load(puzzle.fen);
    setFen(chess.fen());
    setSelected(puzzle);
    setState('playing');
    setMoveIndex(0);
    setLastMove(null);
    setHint(false);
  }

  // UCI → from/to dönüşümü
  function uciToMove(uci: string) {
    return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
  }

  function handleDrop(from: string, to: string): boolean {
    if (state !== 'playing') return false;
    return tryMove(from, to);
  }

  function handleSquareClick(square: string) {
    // basit tıklama desteği — seçili kare yoksa seç, varsa hamle dene
  }

  const tryMove = useCallback((from: string, to: string): boolean => {
    const expected = uciToMove(selected.solution[moveIndex]);
    if (from !== expected.from || to !== expected.to) {
      toast.error('❌ Yanlış hamle! Tekrar dene.');
      setState('failed');
      setTimeout(() => {
        chess.load(selected.fen);
        setFen(chess.fen());
        setMoveIndex(0);
        setLastMove(null);
        setState('playing');
      }, 1200);
      return false;
    }

    const move = chess.move({ from: from as any, to: to as any, promotion: expected.promotion as any || 'q' });
    if (!move) return false;

    setFen(chess.fen());
    setLastMove({ from, to });
    const nextIndex = moveIndex + 1;

    if (nextIndex >= selected.solution.length) {
      // Çözüldü!
      setState('solved');
      setSolved((prev) => new Set([...prev, selected.id]));
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      toast.success(`🎉 Doğru! +${selected.rewardXLM} XLM kazandınız!`);
    } else {
      // Rakip cevap hamlesi
      setMoveIndex(nextIndex);
      setTimeout(() => {
        const oppMove = uciToMove(selected.solution[nextIndex]);
        chess.move({ from: oppMove.from as any, to: oppMove.to as any, promotion: oppMove.promotion as any || 'q' });
        setFen(chess.fen());
        setLastMove({ from: oppMove.from, to: oppMove.to });
        setMoveIndex(nextIndex + 1);
      }, 500);
    }
    return true;
  }, [chess, moveIndex, selected]);

  function getSquareStyles() {
    const s: Record<string, React.CSSProperties> = {};
    if (lastMove) {
      s[lastMove.from] = { backgroundColor: 'rgba(240,192,64,0.3)' };
      s[lastMove.to] = { backgroundColor: 'rgba(240,192,64,0.4)' };
    }
    if (hint && state === 'playing') {
      const h = uciToMove(selected.solution[moveIndex]);
      s[h.from] = { backgroundColor: 'rgba(100,200,100,0.5)' };
    }
    return s;
  }

  const diffColor = { kolay: '#4caf50', orta: '#f0c040', zor: '#e05555' };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🧩 Günlük Bulmacalar</h1>
      <p className={styles.subtitle}>Doğru çöz, XLM kazan!</p>

      <div className={styles.layout}>
        {/* Sol: bulmaca listesi */}
        <div className={styles.list}>
          {DAILY_PUZZLES.map((p) => (
            <div
              key={p.id}
              className={`${styles.puzzleCard} ${selected.id === p.id ? styles.puzzleSelected : ''} ${solved.has(p.id) ? styles.puzzleSolved : ''}`}
              onClick={() => { if (!solved.has(p.id)) startPuzzle(p); }}
            >
              <div className={styles.puzzleTop}>
                <span className={styles.puzzleTheme}>{p.theme}</span>
                <span className={styles.puzzleDiff} style={{ color: diffColor[p.difficulty] }}>
                  {p.difficulty}
                </span>
              </div>
              <div className={styles.puzzleDesc}>{p.description}</div>
              <div className={styles.puzzleReward}>
                {solved.has(p.id)
                  ? <span className={styles.solvedBadge}>✅ Çözüldü</span>
                  : <span className={styles.rewardBadge}>+{p.rewardXLM} XLM</span>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Sağ: tahta */}
        <div className={styles.boardSection}>
          <div className={styles.puzzleInfo}>
            <div className={styles.puzzleInfoLeft}>
              <span className={styles.infoTheme}>{selected.theme}</span>
              <span className={styles.infoDiff} style={{ color: diffColor[selected.difficulty] }}>{selected.difficulty}</span>
            </div>
            <span className={styles.infoReward}>🏆 +{selected.rewardXLM} XLM</span>
          </div>

          <p className={styles.puzzleQuestion}>{selected.description}</p>

          <div className={styles.boardWrap}>
            <Chessboard
              position={fen}
              onPieceDrop={handleDrop}
              onSquareClick={handleSquareClick}
              arePiecesDraggable={state === 'playing'}
              customSquareStyles={getSquareStyles()}
              customDarkSquareStyle={{ backgroundColor: '#2d5a27' }}
              customLightSquareStyle={{ backgroundColor: '#8bc34a' }}
              boardWidth={380}
              customBoardStyle={{ borderRadius: '8px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
            />
          </div>

          <div className={styles.actions}>
            {state === 'idle' && (
              <button className={styles.startBtn} onClick={() => startPuzzle(selected)}>
                ▶ Başla
              </button>
            )}
            {state === 'playing' && (
              <>
                <button className={styles.hintBtn} onClick={() => setHint(true)}>
                  💡 İpucu
                </button>
                <button className={styles.resetBtn} onClick={() => startPuzzle(selected)}>
                  ↺ Sıfırla
                </button>
              </>
            )}
            {state === 'solved' && (
              <div className={styles.solvedMsg}>
                🎉 Harika! {wallet.connected ? `+${selected.rewardXLM} XLM cüzdanınıza eklendi.` : 'Cüzdan bağlayarak ödül alın.'}
              </div>
            )}
            {state === 'failed' && (
              <div className={styles.failedMsg}>❌ Yanlış hamle, tekrar deneniyor...</div>
            )}
          </div>

          {/* İlerleme */}
          {state === 'playing' && (
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(moveIndex / selected.solution.length) * 100}%` }}
                />
              </div>
              <span className={styles.progressText}>{moveIndex}/{selected.solution.length} hamle</span>
            </div>
          )}
        </div>
      </div>

      {/* Toplam kazanç */}
      <div className={styles.totalReward}>
        <span>Bugünkü kazancınız:</span>
        <span className={styles.totalXlm}>
          +{DAILY_PUZZLES.filter((p) => solved.has(p.id)).reduce((s, p) => s + p.rewardXLM, 0)} XLM
        </span>
      </div>
    </div>
  );
}
