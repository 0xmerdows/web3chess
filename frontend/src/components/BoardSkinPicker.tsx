import { BOARD_SKINS, setSkin, useBoardSkin } from '../store/boardSkinStore';
import { Chessboard } from 'react-chessboard';
import styles from './BoardSkinPicker.module.css';

const PREVIEW_FEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

export default function BoardSkinPicker() {
  const current = useBoardSkin();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎨 Tahta Görünümü</h1>
        <p className={styles.sub}>Seçilen skin tüm tahtalara uygulanır</p>
      </div>

      <div className={styles.layout}>
        {/* Büyük önizleme */}
        <div className={styles.preview}>
          <div className={styles.previewLabel}>Önizleme — {current.name}</div>
          <div
            className={styles.previewBoard}
            style={{ boxShadow: current.glow ?? '0 8px 40px rgba(0,0,0,0.5)' }}
          >
            <Chessboard
              position={PREVIEW_FEN}
              arePiecesDraggable={false}
              customDarkSquareStyle={{ backgroundColor: current.dark }}
              customLightSquareStyle={{ backgroundColor: current.light }}
              boardWidth={320}
              customBoardStyle={{
                borderRadius: '10px',
                border: current.border ? `2px solid ${current.border}` : undefined,
              }}
            />
          </div>
          {current.id === 'neon' && (
            <div className={styles.neonHint}>⚡ Neon modda taşlar parlıyor</div>
          )}
        </div>

        {/* Skin grid */}
        <div className={styles.skinGrid}>
          {BOARD_SKINS.map(skin => (
            <button
              key={skin.id}
              className={`${styles.skinCard} ${current.id === skin.id ? styles.active : ''}`}
              onClick={() => setSkin(skin.id)}
            >
              {/* Mini tahta önizleme */}
              <div className={styles.miniBoard}>
                {Array.from({ length: 16 }, (_, i) => {
                  const row = Math.floor(i / 4);
                  const col = i % 4;
                  const isDark = (row + col) % 2 === 1;
                  return (
                    <div
                      key={i}
                      className={styles.miniSquare}
                      style={{
                        background: isDark ? skin.dark : skin.light,
                        boxShadow: isDark && skin.glow ? skin.glow : undefined,
                      }}
                    />
                  );
                })}
              </div>
              <span className={styles.skinLabel}>{skin.label}</span>
              {current.id === skin.id && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
