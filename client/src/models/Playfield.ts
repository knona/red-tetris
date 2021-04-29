import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from '../utils/constants';
import { PieceType } from './PieceType';

export type Playfield = (PieceType | '' | 'X')[][];

export function newPlayfield(): Playfield {
  return Array.from({ length: PLAYFIELD_HEIGHT }, () => new Array(PLAYFIELD_WIDTH).fill('')) as Playfield;
}
