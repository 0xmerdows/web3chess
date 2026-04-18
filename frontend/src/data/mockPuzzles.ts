export type Puzzle = {
  id: string;
  fen: string;
  solution: string[]; // UCI formatında hamleler: ['e2e4', 'e7e5']
  theme: string;
  difficulty: 'kolay' | 'orta' | 'zor';
  rewardXLM: number;
  description: string;
};

export const DAILY_PUZZLES: Puzzle[] = [
  {
    id: 'pz_1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['h5f7'],
    theme: 'Mat',
    difficulty: 'kolay',
    rewardXLM: 1,
    description: 'Beyaz oynuyor. Tek hamlede mat!',
  },
  {
    id: 'pz_2',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: ['e1e8'],
    theme: 'Mat',
    difficulty: 'kolay',
    rewardXLM: 1,
    description: 'Beyaz oynuyor. Kaleyi kullan!',
  },
  {
    id: 'pz_3',
    fen: 'r2qkb1r/ppp2ppp/2np1n2/4p1B1/2B1P3/2N2N2/PPPP1PPP/R2QK2R w KQkq - 0 7',
    solution: ['c4f7', 'e8f7', 'f3e5'],
    theme: 'Çatal',
    difficulty: 'orta',
    rewardXLM: 2,
    description: 'Beyaz oynuyor. Fil fedası ile çatal!',
  },
  {
    id: 'pz_4',
    fen: '2r3k1/1p3ppp/p7/3p4/8/1P3N2/P4PPP/3R2K1 w - - 0 1',
    solution: ['f3d4', 'c8c1', 'd1c1'],
    theme: 'Taktik',
    difficulty: 'orta',
    rewardXLM: 2,
    description: 'Beyaz oynuyor. Materyal kazan!',
  },
  {
    id: 'pz_5',
    fen: 'r1b1kb1r/ppppqppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    solution: ['f3g5', 'e7g5', 'c4f7', 'e8d8', 'f7g8'],
    theme: 'Kombinasyon',
    difficulty: 'zor',
    rewardXLM: 5,
    description: 'Beyaz oynuyor. Derin kombinasyon bul!',
  },
  {
    id: 'pz_6',
    fen: '4r1k1/pp3ppp/2p5/8/4n3/2N3P1/PP3P1P/R3R1K1 w - - 0 1',
    solution: ['c3e4', 'e8e4', 'e1e4'],
    theme: 'Çifte Saldırı',
    difficulty: 'orta',
    rewardXLM: 2,
    description: 'Beyaz oynuyor. Atı al!',
  },
];
