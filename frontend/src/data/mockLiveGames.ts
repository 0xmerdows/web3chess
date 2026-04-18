import type { TimeControl } from '../types';

export type LiveGame = {
  id: string;
  whitePlayer: { key: string; name: string; rating: number };
  blackPlayer: { key: string; name: string; rating: number };
  fen: string;
  moves: string[];
  timeControl: TimeControl;
  whiteTimeMs: number;
  blackTimeMs: number;
  potXLM: number;
  spectators: number;
  startedAt: number;
  activeTurn: 'white' | 'black';
  bets: LiveBet[];
};

export type LiveBet = {
  id: string;
  bettorKey: string;
  side: 'white' | 'black';
  amountXLM: number;
  odds: number;
};

const tc5: TimeControl = { initialSeconds: 300, incrementSeconds: 0, label: '5+0' };
const tc10: TimeControl = { initialSeconds: 600, incrementSeconds: 5, label: '10+5' };
const tc3: TimeControl = { initialSeconds: 180, incrementSeconds: 2, label: '3+2' };

export const MOCK_LIVE_GAMES: LiveGame[] = [
  {
    id: 'live_1',
    whitePlayer: { key: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37', name: 'CryptoKnight', rating: 1842 },
    blackPlayer: { key: 'GBVNNPOFVV2YNXSQXDJPBVQYY6MZXHKQPBXCQZQZQZQZQZQZQZQZQZQ', name: 'StellarGM', rating: 1976 },
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'Nc3', 'Nf6'],
    timeControl: tc10,
    whiteTimeMs: 487000,
    blackTimeMs: 521000,
    potXLM: 200,
    spectators: 14,
    startedAt: Date.now() - 4 * 60 * 1000,
    activeTurn: 'white',
    bets: [
      { id: 'lb1', bettorKey: 'GABC...1234', side: 'white', amountXLM: 50, odds: 1.9 },
      { id: 'lb2', bettorKey: 'GDEF...5678', side: 'black', amountXLM: 80, odds: 2.1 },
    ],
  },
  {
    id: 'live_2',
    whitePlayer: { key: 'GAHK7EEG2WWHVKDNT4CEQFZGKITDFIIZKFEVGENQ7JDJBKJIEWQSA37Y', name: 'XLMaster', rating: 1654 },
    blackPlayer: { key: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGZQE3MONF7JSTF6OANZBIQ', name: 'BlockRook', rating: 1701 },
    fen: 'rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 6',
    moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6', 'cxd5', 'cxd5'],
    timeControl: tc5,
    whiteTimeMs: 198000,
    blackTimeMs: 231000,
    potXLM: 50,
    spectators: 7,
    startedAt: Date.now() - 7 * 60 * 1000,
    activeTurn: 'black',
    bets: [
      { id: 'lb3', bettorKey: 'GHIJ...9012', side: 'white', amountXLM: 20, odds: 1.7 },
    ],
  },
  {
    id: 'live_3',
    whitePlayer: { key: 'GDFOHLMRAUATEE2ACER4MPEFF4CLAQV5QNBMKM76THEINAZU3YFLBZUZ', name: 'LumenPawn', rating: 2103 },
    blackPlayer: { key: 'GBSJ222MYAMOQCOUATOZGWHDQOHZGRY5LPIASH7LBUKQFC4BIOCNTUGG', name: 'HashQueen', rating: 2088 },
    fen: 'r2q1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2Q1RK1 w - - 4 9',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'O-O', 'Nf6', 'Nc3', 'O-O', 'Bg5', 'Bg4', 'd3', 'd6'],
    timeControl: tc3,
    whiteTimeMs: 89000,
    blackTimeMs: 104000,
    potXLM: 500,
    spectators: 31,
    startedAt: Date.now() - 9 * 60 * 1000,
    activeTurn: 'white',
    bets: [
      { id: 'lb4', bettorKey: 'GKLM...3456', side: 'white', amountXLM: 150, odds: 1.95 },
      { id: 'lb5', bettorKey: 'GNOP...7890', side: 'black', amountXLM: 200, odds: 2.05 },
      { id: 'lb6', bettorKey: 'GQRS...1234', side: 'white', amountXLM: 75, odds: 1.95 },
    ],
  },
  {
    id: 'live_4',
    whitePlayer: { key: 'GCVLWUIQYZMMZAS67QI7CYZNVCRN5DZE26UIUP2B3IQSDTS4UUNMJUGG', name: 'SatoshiRook', rating: 1523 },
    blackPlayer: { key: 'GDMXNQBKPKPLCINI72GPRP6MBYIPYZJMCC5WVKLC5UALI6MGEEN2ZK44', name: 'ChainBishop', rating: 1489 },
    fen: 'rnbqkbnr/pp2pppp/2p5/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    moves: ['e4', 'd5', 'Nf3', 'c6'],
    timeControl: tc5,
    whiteTimeMs: 276000,
    blackTimeMs: 289000,
    potXLM: 25,
    spectators: 3,
    startedAt: Date.now() - 2 * 60 * 1000,
    activeTurn: 'white',
    bets: [],
  },
];
