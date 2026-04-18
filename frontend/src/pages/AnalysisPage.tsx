import { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { loadHistory } from '../managers/GameHistory';
import { useNotesStore, addNote, deleteNote, exportNotes } from '../store/analysisNotesStore';
import toast from 'react-hot-toast';
import styles from './AnalysisPage.module.css';

type EvalResult = {
  score: number | null;   // centipawn (pozitif = beyaz iyi)
  mate: number | null;    // mat kaç hamlede
  bestMove: string | null;
  depth: number;
  pv: string[];           // principal variation
};

type MoveAnnotation = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | '';

type AnnotatedMove = {
  san: string;
  fen: string;
  eval: EvalResult | null;
  annotation: MoveAnnotation;
  scoreDelta: number;
};

function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((r: EvalResult) => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const worker = new Worker('/stockfish.js', { type: 'classic' });
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent) => {
        const line: string = typeof e.data === 'string' ? e.data : '';
        if (line === 'uciok') { worker.postMessage('isready'); return; }
        if (line === 'readyok') { setReady(true); return; }

        if (line.startsWith('info') && line.includes('score') && resolveRef.current) {
          const depthMatch = line.match(/depth (\d+)/);
          const cpMatch = line.match(/score cp (-?\d+)/);
          const mateMatch = line.match(/score mate (-?\d+)/);
          const pvMatch = line.match(/ pv (.+)/);
          const depth = depthMatch ? parseInt(depthMatch[1]) : 0;
          if (depth < 10) return; // düşük depth'i atla

          const result: EvalResult = {
            score: cpMatch ? parseInt(cpMatch[1]) : null,
            mate: mateMatch ? parseInt(mateMatch[1]) : null,
            bestMove: pvMatch ? pvMatch[1].split(' ')[0] : null,
            depth,
            pv: pvMatch ? pvMatch[1].split(' ').slice(0, 5) : [],
          };
          resolveRef.current(result);
          resolveRef.current = null;
        }
      };

      worker.postMessage('uci');
    } catch {
      setReady(false);
    }

    return () => { workerRef.current?.terminate(); };
  }, []);

  const evaluate = useCallback((fen: string, depth = 15): Promise<EvalResult> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve({ score: 0, mate: null, bestMove: null, depth: 0, pv: [] });
        return;
      }
      resolveRef.current = resolve;
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${depth}`);
    });
  }, []);

  return { ready, evaluate };
}

function annotate(delta: number, isWhiteTurn: boolean): MoveAnnotation {
  const d = isWhiteTurn ? -delta : delta; // siyah oynarsa delta ters
  if (d >= -10) return 'best';
  if (d >= -30) return 'good';
  if (d >= -80) return 'inaccuracy';
  if (d >= -200) return 'mistake';
  return 'blunder';
}

const ANNOTATION_SYMBOLS: Record<MoveAnnotation, string> = {
  best: '✓', good: '', inaccuracy: '?!', mistake: '?', blunder: '??', '': '',
};
const ANNOTATION_COLORS: Record<MoveAnnotation, string> = {
  best: '#4caf50', good: '#aaa', inaccuracy: '#f0c040', mistake: '#ff9800', blunder: '#e05555', '': '#aaa',
};

// Örnek oyun (geçmiş yoksa)
const SAMPLE_MOVES = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'O-O', 'Nf6', 'Nc3', 'd6', 'Ng5', 'O-O', 'Nxf7'];

export default function AnalysisPage() {
  const history = loadHistory();
  const [selectedGameIdx, setSelectedGameIdx] = useState<number | null>(null);
  const [gameId, setGameId] = useState('sample');
  const [moves, setMoves] = useState<string[]>([]);
  const [annotated, setAnnotated] = useState<AnnotatedMove[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const { ready, evaluate } = useStockfish();
  const notes = useNotesStore(gameId);

  const chess = useRef(new Chess());

  function buildMoveList(moveSans: string[]): { san: string; fen: string }[] {
    const c = new Chess();
    return moveSans.map((san) => {
      c.move(san);
      return { san, fen: c.fen() };
    });
  }

  function loadGame(moveSans: string[], id = 'sample') {
    setMoves(moveSans);
    setAnnotated([]);
    setCurrentIdx(0);
    setGameId(id);
    chess.current.reset();
  }

  function loadSample() {
    loadGame(SAMPLE_MOVES, 'sample');
  }

  async function runAnalysis() {
    if (moves.length === 0 || !ready) return;
    setAnalyzing(true);
    setProgress(0);

    const moveList = buildMoveList(moves);
    const results: AnnotatedMove[] = [];
    let prevScore = 0;

    for (let i = 0; i < moveList.length; i++) {
      const { san, fen } = moveList[i];
      const evalResult = await evaluate(fen, 14);
      const score = evalResult.mate !== null
        ? (evalResult.mate > 0 ? 10000 : -10000)
        : (evalResult.score ?? 0);

      const isWhiteTurn = i % 2 === 0; // hamleyi yapan
      const delta = score - prevScore;
      const ann = i === 0 ? '' : annotate(delta, isWhiteTurn);

      results.push({ san, fen, eval: evalResult, annotation: ann, scoreDelta: delta });
      prevScore = score;
      setProgress(Math.round(((i + 1) / moveList.length) * 100));
    }

    setAnnotated(results);
    setAnalyzing(false);
  }

  const currentFen = annotated.length > 0
    ? (currentIdx === 0 ? 'start' : annotated[currentIdx - 1].fen)
    : (moves.length > 0 ? buildMoveList(moves)[Math.max(0, currentIdx - 1)]?.fen || 'start' : 'start');

  const currentEval = annotated[currentIdx - 1]?.eval ?? null;

  function evalBar(score: number | null, mate: number | null): number {
    if (mate !== null) return mate > 0 ? 100 : 0;
    if (score === null) return 50;
    return Math.round(50 + (Math.atan(score / 400) / Math.PI) * 100);
  }

  const barPct = currentEval ? evalBar(currentEval.score, currentEval.mate) : 50;

  const blunders = annotated.filter((m) => m.annotation === 'blunder').length;
  const mistakes = annotated.filter((m) => m.annotation === 'mistake').length;
  const inaccuracies = annotated.filter((m) => m.annotation === 'inaccuracy').length;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🔍 Oyun Analizi</h1>

      <div className={styles.layout}>
        {/* Sol: oyun seçimi */}
        <div className={styles.sidebar}>
          <div className={styles.sideTitle}>Oyun Seç</div>
          <button className={`${styles.gameItem} ${selectedGameIdx === null && moves.length > 0 ? styles.gameSelected : ''}`} onClick={loadSample}>
            📋 Örnek Oyun (Fried Liver)
          </button>
          {history.length === 0 && (
            <p className={styles.noHistory}>Henüz tamamlanmış oyun yok.</p>
          )}
          {history.map((rec, i) => (
            <button
              key={rec.id}
              className={`${styles.gameItem} ${selectedGameIdx === i ? styles.gameSelected : ''}`}
              onClick={() => { setSelectedGameIdx(i); loadGame(rec.moves, rec.id); }}
            >
              <span className={`${styles.resultDot} ${styles[rec.result]}`} />
              <span>{rec.opponentPublicKey.slice(0, 8)}...</span>
              <span className={styles.gameDate}>{new Date(rec.date).toLocaleDateString('tr-TR')}</span>
            </button>
          ))}

          {moves.length > 0 && (
            <button
              className={styles.analyzeBtn}
              onClick={runAnalysis}
              disabled={analyzing || !ready}
            >
              {!ready ? '⏳ Stockfish yükleniyor...' : analyzing ? `Analiz ediliyor... ${progress}%` : '🔍 Analiz Et'}
            </button>
          )}

          {analyzing && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          )}

          {annotated.length > 0 && (
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>Özet</div>
              <div className={styles.summaryRow}><span className={styles.blunder}>Ağır Hata ??</span><span>{blunders}</span></div>
              <div className={styles.summaryRow}><span className={styles.mistake}>Hata ?</span><span>{mistakes}</span></div>
              <div className={styles.summaryRow}><span className={styles.inaccuracy}>Zayıf ?!</span><span>{inaccuracies}</span></div>
            </div>
          )}
        </div>

        {/* Orta: tahta */}
        <div className={styles.boardSection}>
          <div className={styles.evalSection}>
            <div className={styles.evalBar}>
              <div className={styles.evalFill} style={{ height: `${barPct}%` }} />
            </div>
            <div className={styles.evalScore}>
              {currentEval?.mate !== null && currentEval?.mate !== undefined
                ? `M${Math.abs(currentEval.mate)}`
                : currentEval?.score !== null && currentEval?.score !== undefined
                ? (currentEval.score > 0 ? '+' : '') + (currentEval.score / 100).toFixed(1)
                : '0.0'}
            </div>
          </div>

          <div className={styles.boardWrap}>
            <Chessboard
              position={currentFen}
              arePiecesDraggable={false}
              customDarkSquareStyle={{ backgroundColor: '#2d5a27' }}
              customLightSquareStyle={{ backgroundColor: '#8bc34a' }}
              boardWidth={380}
              customBoardStyle={{ borderRadius: '8px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
            />
          </div>

          <div className={styles.navRow}>
            <button onClick={() => setCurrentIdx(0)} disabled={currentIdx === 0}>⏮</button>
            <button onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))} disabled={currentIdx === 0}>◀</button>
            <span>{currentIdx} / {moves.length}</span>
            <button onClick={() => setCurrentIdx((i) => Math.min(moves.length, i + 1))} disabled={currentIdx === moves.length}>▶</button>
            <button onClick={() => setCurrentIdx(moves.length)} disabled={currentIdx === moves.length}>⏭</button>
          </div>

          {currentEval?.bestMove && annotated.length > 0 && (
            <div className={styles.bestMoveBox}>
              En iyi hamle: <strong>{currentEval.bestMove}</strong>
              {currentEval.pv.length > 1 && (
                <span className={styles.pvLine}> · {currentEval.pv.slice(0, 4).join(' ')}</span>
              )}
            </div>
          )}

          {/* Not ekle */}
          {currentIdx > 0 && moves[currentIdx - 1] && (
            <div className={styles.noteSection}>
              {notes.find(n => n.moveIndex === currentIdx) ? (
                <div className={styles.existingNote}>
                  <span className={styles.noteIcon}>📝</span>
                  <span className={styles.noteText}>{notes.find(n => n.moveIndex === currentIdx)!.note}</span>
                  <button className={styles.noteDeleteBtn} onClick={() => {
                    const n = notes.find(x => x.moveIndex === currentIdx);
                    if (n) deleteNote(n.id);
                  }}>✕</button>
                </div>
              ) : showNoteInput ? (
                <div className={styles.noteInputRow}>
                  <input
                    className={styles.noteInput}
                    placeholder={`${moves[currentIdx - 1]} için not ekle...`}
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && noteInput.trim()) {
                        addNote({ gameId, moveIndex: currentIdx, moveSan: moves[currentIdx - 1], note: noteInput.trim() });
                        setNoteInput('');
                        setShowNoteInput(false);
                        toast.success('Not eklendi!');
                      }
                      if (e.key === 'Escape') setShowNoteInput(false);
                    }}
                    autoFocus
                  />
                  <button className={styles.noteSaveBtn} onClick={() => {
                    if (noteInput.trim()) {
                      addNote({ gameId, moveIndex: currentIdx, moveSan: moves[currentIdx - 1], note: noteInput.trim() });
                      setNoteInput('');
                      setShowNoteInput(false);
                      toast.success('Not eklendi!');
                    }
                  }}>Kaydet</button>
                  <button className={styles.noteCancelBtn} onClick={() => setShowNoteInput(false)}>İptal</button>
                </div>
              ) : (
                <button className={styles.addNoteBtn} onClick={() => setShowNoteInput(true)}>
                  📝 Bu hamleye not ekle
                </button>
              )}
            </div>
          )}

          {/* Notları paylaş */}
          {notes.length > 0 && (
            <button className={styles.exportBtn} onClick={() => {
              const text = exportNotes(gameId, moves);
              navigator.clipboard.writeText(text).then(() => toast.success('Notlar panoya kopyalandı!'));
            }}>
              📤 Notları Paylaş ({notes.length})
            </button>
          )}
        </div>

        {/* Sağ: hamle listesi */}
        <div className={styles.moveList}>
          <div className={styles.moveListTitle}>Hamleler</div>
          <div className={styles.moves}>
            {moves.length === 0 && <p className={styles.noMoves}>Bir oyun seçin.</p>}
            {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
              const wIdx = i * 2;
              const bIdx = i * 2 + 1;
              const wAnn = annotated[wIdx];
              const bAnn = annotated[bIdx];
              return (
                <div key={i} className={styles.movePair}>
                  <span className={styles.moveNum}>{i + 1}.</span>
                  <button
                    className={`${styles.moveBtn} ${currentIdx === wIdx + 1 ? styles.moveBtnActive : ''}`}
                    onClick={() => setCurrentIdx(wIdx + 1)}
                  >
                    {moves[wIdx]}
                    {wAnn && wAnn.annotation && (
                      <span style={{ color: ANNOTATION_COLORS[wAnn.annotation], fontSize: '0.7rem' }}>
                        {ANNOTATION_SYMBOLS[wAnn.annotation]}
                      </span>
                    )}
                  </button>
                  {moves[bIdx] && (
                    <button
                      className={`${styles.moveBtn} ${currentIdx === bIdx + 1 ? styles.moveBtnActive : ''}`}
                      onClick={() => setCurrentIdx(bIdx + 1)}
                    >
                      {moves[bIdx]}
                      {bAnn && bAnn.annotation && (
                        <span style={{ color: ANNOTATION_COLORS[bAnn.annotation], fontSize: '0.7rem' }}>
                          {ANNOTATION_SYMBOLS[bAnn.annotation]}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
