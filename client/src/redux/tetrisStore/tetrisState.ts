import { generatePiece as generatePiece, Piece } from '../../models/Piece';
import { PieceType } from '../../models/PieceType';
import { Playfield } from '../../models/Playfield';
import { EMPTY_PLAYFIELD } from '../../utils/constants';

export interface LockState {
  moveCount: number;
  minPieceY: number;
  lockTimer: number;
}

export const initialLockState: LockState = {
  moveCount: 0,
  minPieceY: 20,
  lockTimer: -1
};

export interface HoldState {
  piece?: Piece;
  hasHold: boolean;
}

export const initialHoldState: HoldState = {
  piece: undefined,
  hasHold: false
};

export interface PieceQueueState {
  queue: Piece[];
  fetching: boolean;
}

export const initialPieceQueueState: PieceQueueState = {
  queue: [],
  fetching: false
};
export interface TetrisState {
  piece: Piece;
  playfield: Playfield;
  deletedLines: number;
  level: number;
  score: number;
  lockState: LockState;
  pieceQueueState: PieceQueueState;
  holdState: HoldState;
  isGameOver: boolean;
  levelTimer: number;
}

export const initialTetrisState: TetrisState = {
  piece: generatePiece(PieceType.I),
  playfield: EMPTY_PLAYFIELD,
  deletedLines: 0,
  level: 1,
  score: 0,
  lockState: initialLockState,
  pieceQueueState: initialPieceQueueState,
  holdState: initialHoldState,
  isGameOver: false,
  levelTimer: 0
};
