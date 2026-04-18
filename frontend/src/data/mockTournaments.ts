import type { TimeControl } from '../types';

export type TournamentStatus = 'upcoming' | 'registering' | 'active' | 'completed';

export type TournamentPlayer = {
  key: string;
  name: string;
  rating: number;
  seed: number;
};

export type BracketMatch = {
  id: string;
  round: number;
  position: number;
  white?: TournamentPlayer;
  black?: TournamentPlayer;
  result?: 'white' | 'black' | null;
  fen?: string;
  status: 'pending' | 'active' | 'completed';
};

export type Tournament = {
  id: string;
  name: string;
  description: string;
  entryFeeXLM: number;
  prizePoolXLM: number;
  maxPlayers: number;
  registeredPlayers: TournamentPlayer[];
  timeControl: TimeControl;
  status: TournamentStatus;
  startTime: number;
  rounds: number;
  bracket: BracketMatch[];
  winnerId?: string;
};

const tc5: TimeControl = { initialSeconds: 300, incrementSeconds: 0, label: '5+0' };
const tc10: TimeControl = { initialSeconds: 600, incrementSeconds: 5, label: '10+5' };
const tc3: TimeControl = { initialSeconds: 180, incrementSeconds: 2, label: '3+2' };

const PLAYERS: TournamentPlayer[] = [
  { key: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37', name: 'CryptoKnight', rating: 1842, seed: 1 },
  { key: 'GBVNNPOFVV2YNXSQXDJPBVQYY6MZXHKQPBXCQZQZQZQZQZQZQZQZQZQ', name: 'StellarGM', rating: 1976, seed: 2 },
  { key: 'GAHK7EEG2WWHVKDNT4CEQFZGKITDFIIZKFEVGENQ7JDJBKJIEWQSA37Y', name: 'XLMaster', rating: 1654, seed: 3 },
  { key: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGZQE3MONF7JSTF6OANZBIQ', name: 'BlockRook', rating: 1701, seed: 4 },
  { key: 'GDFOHLMRAUATEE2ACER4MPEFF4CLAQV5QNBMKM76THEINAZU3YFLBZUZ', name: 'LumenPawn', rating: 2103, seed: 5 },
  { key: 'GBSJ222MYAMOQCOUATOZGWHDQOHZGRY5LPIASH7LBUKQFC4BIOCNTUGG', name: 'HashQueen', rating: 2088, seed: 6 },
  { key: 'GCVLWUIQYZMMZAS67QI7CYZNVCRN5DZE26UIUP2B3IQSDTS4UUNMJUGG', name: 'SatoshiRook', rating: 1523, seed: 7 },
  { key: 'GDMXNQBKPKPLCINI72GPRP6MBYIPYZJMCC5WVKLC5UALI6MGEEN2ZK44', name: 'ChainBishop', rating: 1489, seed: 8 },
];

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour_1',
    name: '⚡ Blitz Şampiyonası',
    description: '8 oyunculu tek eleme turnuvası. Kazanan tüm potu alır!',
    entryFeeXLM: 50,
    prizePoolXLM: 400,
    maxPlayers: 8,
    registeredPlayers: PLAYERS,
    timeControl: tc3,
    status: 'active',
    startTime: Date.now() - 30 * 60 * 1000,
    rounds: 3,
    bracket: [
      // Çeyrek final
      { id: 'm1', round: 1, position: 0, white: PLAYERS[0], black: PLAYERS[7], result: 'white', status: 'completed', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1' },
      { id: 'm2', round: 1, position: 1, white: PLAYERS[3], black: PLAYERS[4], result: 'black', status: 'completed', fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1' },
      { id: 'm3', round: 1, position: 2, white: PLAYERS[2], black: PLAYERS[5], result: 'white', status: 'completed', fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1' },
      { id: 'm4', round: 1, position: 3, white: PLAYERS[1], black: PLAYERS[6], result: 'white', status: 'completed', fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1' },
      // Yarı final
      { id: 'm5', round: 2, position: 0, white: PLAYERS[0], black: PLAYERS[4], result: null, status: 'active', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5' },
      { id: 'm6', round: 2, position: 1, white: PLAYERS[2], black: PLAYERS[1], result: null, status: 'active', fen: 'rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 6' },
      // Final
      { id: 'm7', round: 3, position: 0, status: 'pending' },
    ],
  },
  {
    id: 'tour_2',
    name: '🏆 Haftalık Grand Prix',
    description: '16 oyunculu büyük turnuva. 10+5 zaman kontrolü.',
    entryFeeXLM: 100,
    prizePoolXLM: 1600,
    maxPlayers: 16,
    registeredPlayers: PLAYERS.slice(0, 6),
    timeControl: tc10,
    status: 'registering',
    startTime: Date.now() + 2 * 60 * 60 * 1000,
    rounds: 4,
    bracket: [],
  },
  {
    id: 'tour_3',
    name: '🎯 Hızlı Ateş',
    description: 'Sadece 5+0. Hızlı düşün, hızlı kazan.',
    entryFeeXLM: 25,
    prizePoolXLM: 200,
    maxPlayers: 8,
    registeredPlayers: PLAYERS.slice(0, 3),
    timeControl: tc5,
    status: 'upcoming',
    startTime: Date.now() + 24 * 60 * 60 * 1000,
    rounds: 3,
    bracket: [],
  },
];
