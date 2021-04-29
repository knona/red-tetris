import { PieceType } from './Piece';

export type Playfield = (PieceType | '' | 'X')[][];
export const PLAYFIELD_BUFFER: number = 4;
export const PLAYFIELD_HEIGTH: number = 20 + PLAYFIELD_BUFFER;
export const PLAYFIELD_WIDTH: number = 10;
