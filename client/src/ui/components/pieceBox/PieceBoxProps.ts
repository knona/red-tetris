import { HTMLAttributes } from 'react';
import { Piece } from '../../../models/Piece';
import { PieceBoxTitlePosition } from './models/PieceBoxTitlePosition';

export interface PieceBoxProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  titlePosition: PieceBoxTitlePosition;
  piece?: Piece;
}
