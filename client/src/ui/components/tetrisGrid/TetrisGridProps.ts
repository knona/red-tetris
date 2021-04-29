import { Piece } from '../../../models/Piece';
import { Playfield } from '../../../models/Playfield';
import { TetrisGridOverlay } from './models/TetrisGridOverlay';
import { TetrisGridStyle } from './models/TetrisGridStyle';

export interface TetrisGridProps {
  playfield: Playfield;
  lockTimer: number;
  piece?: Piece;
  style?: TetrisGridStyle;
  overlay?: TetrisGridOverlay;
}
