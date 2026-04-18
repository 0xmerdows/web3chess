import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useGameStore, setActiveGame, updateActiveGame } from '../store/gameStore';
import { useWalletStore, addBalance } from '../store/walletStore';
import { updateBet } from '../store/betStore';
import { ClockManager } from '../managers/ClockManager';
import { calculatePayout } from '../managers/BetManager';
import { saveRecord } from '../managers/GameHistory';
import { getBets } from '../store/betStore';
import { useBoardSkin } from '../store/boardSkinStore';
import type { GameResult } from '../types';
import styles from './GamePage.module.css';

type Piece = 'wQ' | 'wR' | 'wB' | 'wN' | 'bQ' | 'bR' | 'bB' | 'bN';

export default function GamePage() {
  const game = useGameStore();
  const [wallet] = useWalletStore();
  const navigate = useNavigate();

  const chessRef = useRef(new Chess());
  const clockRef = useRef<ClockManager | null>(null);
  const [fen, setFen] = useState('');
  const [times, setTimes] = useState({ white: 0, black: 0 });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);
  const [gameOver, setGameOver] = useState<GameResult | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const bet = game ? getBets().find((b) => b.id === game.betId) : null;

  const handleGameOver = useCallback((result: GameResult) => {
    clockRef.current?.destroy();
    setGameOver(result);
    updateActiveGame({ status: 'completed', result });
    if (game) updateBet(game.betId, { status: 'completed' });

    if (result.winner !== 'draw') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      if (result.winnerPublicKey === wallet.publicKey) {
        const { winner: payout } = calculatePayout(bet?.amountXLM || 0);
        addBalance(payout);
        toast.success(`🏆 Kazandınız! +${payout.toFixed(2)} XLM bakiyenize eklendi.`);
      } else {
        toast('😔 Kaybettiniz.');
      }
    } else {
      // Beraberlikte bahis iadesi
      if (bet?.amountXLM) addBalance(bet.amountXLM);
      toast('🤝 Beraberlik! Bahsiniz iade edildi.');
    }

    // Geçmişe kaydet
    if (game && wallet.publicKey) {
      const isWhite = game.whitePublicKey === wallet.publicKey;
      const myResult =
        result.winner === 'draw' ? 'draw' : result.winnerPublicKey === wallet.publicKey ? 'win' : 'loss';
      const betAmount = bet?.amountXLM || 0;
      const { winner: payout } = calculatePayout(betAmount);
      const xlmChange =
        myResult === 'win' ? payout - betAmount : myResult === 'loss' ? -betAmount : 0;

      saveRecord({
        id: game.id,
        opponentPublicKey: isWhite ? game.blackPublicKey : game.whitePublicKey,
        result: myResult,
        amountXLM: betAmount,
        xlmChange,
        date: Date.now(),
        moves: chessRef.current.history(),
        finalFen: chessRef.current.fen(),
      });
    }
  }, [game, wallet.publicKey, bet]);

  useEffect(() => {
    if (!game) {
      navigate('/');
      return;
    }

    const chess = chessRef.current;
    chess.load(game.fen);
    setFen(chess.fen());

    const tc = bet?.timeControl || { initialSeconds: 300, incrementSeconds: 0, label: '5+0' };
    const clock = new ClockManager(tc.initialSeconds, tc.incrementSeconds, () => {
      setTimes({
        white: clock.getRemainingTime('white'),
        black: clock.getRemainingTime('black'),
      });
    });
    clock.onTimeout((player) => {
      const winner = player === 'white' ? 'black' : 'white';
      const winnerKey = winner === 'white' ? game.whitePublicKey : game.blackPublicKey;
      handleGameOver({ winner, reason: 'timeout', winnerPublicKey: winnerKey });
    });
    clockRef.current = clock;
    setTimes({ white: tc.initialSeconds * 1000, black: tc.initialSeconds * 1000 });
    clock.start('white');

    return () => clock.destroy();
  }, []);

  function formatTime(ms: number) {
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function getSquareStyles() {
    const styles: Record<string, React.CSSProperties> = {};
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(240,192,64,0.3)' };
      styles[lastMove.to] = { backgroundColor: 'rgba(240,192,64,0.4)' };
    }
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(100,200,100,0.5)' };
    }
    legalMoves.forEach((sq) => {
      styles[sq] = { backgroundColor: 'rgba(100,200,100,0.3)', borderRadius: '50%' };
    });
    return styles;
  }

  function handleSquareClick(square: string) {
    if (gameOver) return;
    const chess = chessRef.current;

    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        // Piyon terfisi kontrolü
        const piece = chess.get(selectedSquare as any);
        const isPromotion =
          piece?.type === 'p' &&
          ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          setPromotionPending({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }

        executeMove(selectedSquare, square);
      } else {
        // Yeni taş seç
        selectSquare(square);
      }
    } else {
      selectSquare(square);
    }
  }

  function selectSquare(square: string) {
    const chess = chessRef.current;
    const piece = chess.get(square as any);
    if (!piece) { setSelectedSquare(null); setLegalMoves([]); return; }

    const moves = chess.moves({ square: square as any, verbose: true });
    if (moves.length === 0) { setSelectedSquare(null); setLegalMoves([]); return; }

    setSelectedSquare(square);
    setLegalMoves(moves.map((m) => m.to));
  }

  function executeMove(from: string, to: string, promotion?: string) {
    const chess = chessRef.current;
    const move = chess.move({ from: from as any, to: to as any, promotion: promotion as any });
    if (!move) { toast.error('Geçersiz hamle!'); return; }

    setFen(chess.fen());
    setLastMove({ from, to });
    setMoveHistory(chess.history());
    setSelectedSquare(null);
    setLegalMoves([]);
    clockRef.current?.switchTurn();
    updateActiveGame({ fen: chess.fen(), history: chess.history() });

    if (chess.isGameOver()) {
      let result: GameResult;
      if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'black' : 'white';
        const winnerKey = winner === 'white' ? game!.whitePublicKey : game!.blackPublicKey;
        result = { winner, reason: 'checkmate', winnerPublicKey: winnerKey };
      } else {
        result = { winner: 'draw', reason: 'stalemate' };
      }
      handleGameOver(result);
    }
  }

  function handlePromotion(piece: Piece) {
    if (!promotionPending) return;
    const promo = piece[1].toLowerCase();
    executeMove(promotionPending.from, promotionPending.to, promo);
    setPromotionPending(null);
  }

  function handleResign() {
    if (!game || gameOver) return;
    const winner = game.whitePublicKey === wallet.publicKey ? 'black' : 'white';
    const winnerKey = winner === 'white' ? game.whitePublicKey : game.blackPublicKey;
    handleGameOver({ winner, reason: 'resignation', winnerPublicKey: winnerKey });
  }

  function handleDrop(sourceSquare: string, targetSquare: string) {
    if (gameOver) return false;
    const chess = chessRef.current;
    const piece = chess.get(sourceSquare as any);
    const isPromotion =
      piece?.type === 'p' &&
      ((piece.color === 'w' && targetSquare[1] === '8') || (piece.color === 'b' && targetSquare[1] === '1'));

    if (isPromotion) {
      setPromotionPending({ from: sourceSquare, to: targetSquare });
      return true;
    }

    const move = chess.move({ from: sourceSquare as any, to: targetSquare as any });
    if (!move) return false;

    chess.undo();
    executeMove(sourceSquare, targetSquare);
    return true;
  }

  const isMyTurn = game
    ? (chessRef.current.turn() === 'w' && game.whitePublicKey === wallet.publicKey) ||
      (chessRef.current.turn() === 'b' && game.blackPublicKey === wallet.publicKey)
    : false;

  const myColor = game?.whitePublicKey === wallet.publicKey ? 'white' : 'black';
  const skin = useBoardSkin();

  if (!game) return null;

  return (
    <div className={styles.page}>
      {/* Siyah oyuncu saati */}
      <div className={`${styles.clockRow} ${styles.top}`}>
        <div className={styles.playerInfo}>
          <span className={styles.playerKey}>
            {game.blackPublicKey.slice(0, 6)}...{game.blackPublicKey.slice(-4)}
          </span>
          <span className={styles.colorDot} style={{ background: '#222', border: '2px solid #888' }} />
        </div>
        <div className={`${styles.clock} ${clockRef.current?.getActive() === 'black' ? styles.activeClock : ''}`}>
          {formatTime(times.black)}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.boardWrapper}>
          <Chessboard
            position={fen}
            onSquareClick={handleSquareClick}
            onPieceDrop={handleDrop}
            boardOrientation={myColor}
            customSquareStyles={getSquareStyles()}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
            customDarkSquareStyle={{ backgroundColor: skin.dark }}
            customLightSquareStyle={{ backgroundColor: skin.light }}
            animationDuration={150}
          />
        </div>

        <div className={styles.sidebar}>
          {bet && (
            <div className={styles.betInfo}>
              <div className={styles.betLabel}>Bahis</div>
              <div className={styles.betValue}>{bet.amountXLM} XLM</div>
              <div className={styles.betPayout}>
                Kazanç: ~{(bet.amountXLM * 2 * 0.98).toFixed(2)} XLM
              </div>
            </div>
          )}

          <div className={styles.moveList}>
            <div className={styles.moveListTitle}>Hamleler</div>
            <div className={styles.moves}>
              {moveHistory.length === 0 ? (
                <span className={styles.noMoves}>Henüz hamle yok</span>
              ) : (
                Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                  <div key={i} className={styles.movePair}>
                    <span className={styles.moveNum}>{i + 1}.</span>
                    <span className={styles.moveWhite}>{moveHistory[i * 2]}</span>
                    {moveHistory[i * 2 + 1] && (
                      <span className={styles.moveBlack}>{moveHistory[i * 2 + 1]}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {!gameOver && (
            <button className={styles.resignBtn} onClick={handleResign}>
              🏳 Teslim Ol
            </button>
          )}

          {gameOver && (
            <div className={styles.resultPanel}>
              <div className={styles.resultTitle}>
                {gameOver.winner === 'draw'
                  ? '🤝 Beraberlik'
                  : gameOver.winnerPublicKey === wallet.publicKey
                  ? '🏆 Kazandınız!'
                  : '😔 Kaybettiniz'}
              </div>
              <div className={styles.resultReason}>
                {gameOver.reason === 'checkmate' && 'Şah mat'}
                {gameOver.reason === 'timeout' && 'Süre doldu'}
                {gameOver.reason === 'stalemate' && 'Pat'}
                {gameOver.reason === 'resignation' && 'Teslim'}
              </div>
              <button
                className={styles.lobbyBtn}
                onClick={() => { setActiveGame(null); navigate('/'); }}
              >
                Lobiye Dön
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Beyaz oyuncu saati */}
      <div className={`${styles.clockRow} ${styles.bottom}`}>
        <div className={styles.playerInfo}>
          <span className={styles.colorDot} style={{ background: '#fff', border: '2px solid #888' }} />
          <span className={styles.playerKey}>
            {game.whitePublicKey.slice(0, 6)}...{game.whitePublicKey.slice(-4)}
          </span>
        </div>
        <div className={`${styles.clock} ${clockRef.current?.getActive() === 'white' ? styles.activeClock : ''}`}>
          {formatTime(times.white)}
        </div>
      </div>

      {/* Piyon terfisi modal */}
      {promotionPending && (
        <div className={styles.promoOverlay}>
          <div className={styles.promoModal}>
            <p>Terfi seçin:</p>
            <div className={styles.promoOptions}>
              {(['Q', 'R', 'B', 'N'] as const).map((p) => {
                const piece = (myColor === 'white' ? 'w' : 'b') + p as Piece;
                const symbols: Record<string, string> = { Q: '♛', R: '♜', B: '♝', N: '♞' };
                return (
                  <button key={p} className={styles.promoBtn} onClick={() => handlePromotion(piece)}>
                    {symbols[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sıra göstergesi */}
      {!gameOver && (
        <div className={styles.turnIndicator}>
          {isMyTurn ? '🟢 Sizin sıranız' : '⏳ Rakip düşünüyor...'}
        </div>
      )}
    </div>
  );
}
