import { AnyAction, CaseReducerActions, createSlice, PayloadAction, Reducer, Slice } from '@reduxjs/toolkit';
import { generatePiece, Piece } from '../../models/Piece';
import { PieceDirection } from '../../models/PieceDirection';
import { Playfield } from '../../models/Playfield';
import { checkCollision, checkPieceInBuffer } from '../../tetris/PieceCollision';
import { hardDrop } from '../../tetris/PieceMovement';
import { topProjection } from '../../tetris/PiecePosition';
import { putPiece } from '../../tetris/PlayfieldTransformations';
import { TETRIS_LOCK_INTERVAL } from '../../utils/constants';
import { HoldState, initialLockState, initialTetrisState, TetrisState } from './tetrisState';

type Reducers = {
  setPiece(state: TetrisState, action: PayloadAction<{ piece: Piece; isMoveDownFromInterval?: boolean }>): TetrisState;
  setPieceAndPlayfield(
    state: TetrisState,
    action: PayloadAction<{ piece?: Piece; playfield?: Playfield }>
  ): TetrisState;
  holdPiece(state: TetrisState): TetrisState;
  hardDrop(state: TetrisState): TetrisState;
  stopTimer(state: TetrisState): TetrisState;
  setLockTimer(state: TetrisState, action: PayloadAction<number>): TetrisState;
  startFetching(state: TetrisState): TetrisState;
  addPieces(state: TetrisState, action: PayloadAction<Piece[]>): TetrisState;
  start(state: TetrisState, action: PayloadAction<Piece[]>): TetrisState;
  setGameOver(state: TetrisState, action: PayloadAction<{ playfield: Playfield; piece: Piece }>): TetrisState;
  setLevelTimer(state: TetrisState, action: PayloadAction<number>): TetrisState;
  incrementLevel(state: TetrisState): TetrisState;
};

const tetrisSlice: Slice<TetrisState, Reducers, 'tetris'> = createSlice<TetrisState, Reducers, 'tetris'>({
  name: 'tetris',
  initialState: initialTetrisState,
  reducers: {
    setPiece,
    setPieceAndPlayfield,
    holdPiece,
    hardDrop: hardDropReducer,
    stopTimer,
    setLockTimer,
    startFetching,
    addPieces,
    start,
    setGameOver,
    setLevelTimer,
    incrementLevel
  }
});

function holdPiece(state: TetrisState): TetrisState {
  const { playfield, pieceQueueState, holdState } = state;
  if (holdState.hasHold) {
    return state;
  }
  const newHoldState: HoldState = { piece: generatePiece(state.piece.type), hasHold: true };
  if (!holdState.piece) {
    const [newPiece, ...queue] = pieceQueueState.queue;
    return {
      ...state,
      piece: topProjection(newPiece, playfield),
      pieceQueueState: { ...pieceQueueState, queue },
      holdState: newHoldState
    };
  }
  return { ...state, piece: topProjection(holdState.piece, playfield), holdState: newHoldState };
}

function setPieceAndPlayfield(
  state: TetrisState,
  action: PayloadAction<{ piece?: Piece; playfield?: Playfield }>
): TetrisState {
  return { ...state, ...action.payload };
}

function start(state: TetrisState, action: PayloadAction<Piece[]>): TetrisState {
  const [newPiece, ...pieceQueue] = action.payload;
  return { ...initialTetrisState, piece: newPiece, pieceQueueState: { ...state.pieceQueueState, queue: pieceQueue } };
}

function addPieces(state: TetrisState, action: PayloadAction<Piece[]>): TetrisState {
  return { ...state, pieceQueueState: { queue: state.pieceQueueState.queue.concat(action.payload), fetching: false } };
}

function startFetching(state: TetrisState): TetrisState {
  return { ...state, pieceQueueState: { ...state.pieceQueueState, fetching: true } };
}

function hardDropReducer(state: TetrisState): TetrisState {
  return lockPiece(state, hardDrop(state.piece, state.playfield));
}

function stopTimer(state: TetrisState): TetrisState {
  return { ...state, lockState: { ...state.lockState, lockTimer: -1 } };
}

function computeScore(level: number, nLines: number): number {
  if (nLines === 0) {
    return 0;
  }
  const factor: number[] = [800, 1200, 1800, 2000];
  return factor[nLines - 1] * level;
}

function lockPiece(state: TetrisState, piece: Piece): TetrisState {
  const [newPiece, ...queue] = state.pieceQueueState.queue;
  const { playfield, deletedLines }: { playfield: Playfield; deletedLines: number } = putPiece(piece, state.playfield);
  const isGameOver: boolean = state.isGameOver || checkPieceInBuffer(piece);
  return {
    ...state,
    playfield,
    deletedLines,
    score: state.score + computeScore(state.level, deletedLines),
    piece: isGameOver ? state.piece : topProjection(newPiece, playfield),
    pieceQueueState: { ...state.pieceQueueState, queue },
    holdState: { ...state.holdState, hasHold: false },
    lockState: initialLockState,
    isGameOver
  };
}

function setLockTimer(state: TetrisState, { payload }: PayloadAction<number>): TetrisState {
  if (payload === TETRIS_LOCK_INTERVAL) {
    const hasDownCollision: boolean = checkCollision(PieceDirection.down, state.piece, state.playfield);
    if (hasDownCollision) {
      return lockPiece(state, state.piece);
    }
  }
  return { ...state, lockState: { ...state.lockState, lockTimer: payload } };
}

function setLevelTimer(state: TetrisState, { payload: time }: PayloadAction<number>): TetrisState {
  return { ...state, levelTimer: time };
}

function incrementLevel(state: TetrisState): TetrisState {
  return { ...state, level: state.level + 1 };
}

function setPiece(
  state: TetrisState,
  { payload: { piece, isMoveDownFromInterval } }: PayloadAction<{ piece: Piece; isMoveDownFromInterval?: boolean }>
): TetrisState {
  const { playfield, lockState } = state;
  const hasDownCollision: boolean = checkCollision(PieceDirection.down, piece, playfield);
  const canPutPiece: boolean = hasDownCollision && lockState.lockTimer === TETRIS_LOCK_INTERVAL;
  const minPieceY: number = piece.points.reduce((acc, cur) => (cur.y < acc ? cur.y : acc), 30) + piece.point.y;
  const hasPieceMovedDown: boolean = minPieceY < state.lockState.minPieceY;
  const moveCountIncremented: number = lockState.moveCount + +!isMoveDownFromInterval;
  const shouldIncrementMoveCount: boolean = state.lockState.moveCount > 0 || hasDownCollision;

  if (canPutPiece) {
    return lockPiece(state, piece);
  }
  if (hasPieceMovedDown) {
    return { ...state, piece, lockState: { ...lockState, minPieceY, moveCount: 0 } };
  }
  if (shouldIncrementMoveCount) {
    return { ...state, piece, lockState: { ...lockState, moveCount: moveCountIncremented } };
  }
  return { ...state, piece };
}

function setGameOver(
  state: TetrisState,
  { payload }: PayloadAction<{ playfield: Playfield; piece: Piece }>
): TetrisState {
  return { ...state, piece: payload.piece, playfield: payload.playfield, isGameOver: true };
}

export const tetrisReducer: Reducer<TetrisState, AnyAction> = tetrisSlice.reducer;
export const tetrisActions: CaseReducerActions<Reducers> = tetrisSlice.actions;
export default tetrisActions;
