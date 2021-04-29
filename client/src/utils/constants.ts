import { PieceType } from '../models/PieceType';
import { newPlayfield, Playfield } from '../models/Playfield';
import { Optional } from '../shared/Types';

export const TETRIS_LEVELS: { interval: number; duration: number }[] = [
  { interval: 1000, duration: 45000 },
  { interval: 800, duration: 45000 },
  { interval: 600, duration: 45000 },
  { interval: 500, duration: 50000 },
  { interval: 400, duration: 60000 },
  { interval: 300, duration: 60000 },
  { interval: 200, duration: 70000 },
  { interval: 150, duration: 70000 },
  { interval: 100, duration: 70000 },
  { interval: 80, duration: 70000 },
  { interval: 50, duration: 80000 },
  { interval: 30, duration: 80000 },
  { interval: 20, duration: 80000 },
  { interval: 10, duration: 80000 }
];
export const TETRIS_MAX_LEVEL: number = TETRIS_LEVELS.length;
export const TETRIS_LAST_LEVEL: { interval: number; duration: number } = TETRIS_LEVELS[TETRIS_MAX_LEVEL - 1];
export const TETRIS_LOCK_INTERVAL: number = 500;
export const TETRIS_LOCK_MAX_MOVE_LOCK: number = 15;
export const PLAYFIELD_BUFFER: number = 4;
export const PLAYFIELD_HEIGHT: number = 20 + PLAYFIELD_BUFFER;
export const PLAYFIELD_WIDTH: number = 10;
export const PLAYFIELD_VISIBLE_HEIGHT: number = PLAYFIELD_HEIGHT - PLAYFIELD_BUFFER;
export const EMPTY_PLAYFIELD: Playfield = newPlayfield();
export const BACK_URL: string = 'localhost:5000';
// export const BACK_URL: string = 'https://red-tetris-bk.herokuapp.com/';

export const PIECE_BACKGROUND_COLOR: { [key in PieceType | '' | 'X']: Optional<string> } = {
  '': undefined,
  X: '#C3CFD9',
  I: '#32E0F6',
  O: '#FFCE00',
  T: '#C063D3',
  S: '#56CE2F',
  Z: '#FF3601',
  J: '#2085DD',
  L: '#FF9400'
};
export const PIECE_BORDER_RATIO: number = 0.2;
export const PIECE_BORDER_OPACITY: number = 0.2;
