import { ActionCreatorWithoutPayload, ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { Subject } from 'rxjs';
import { PieceDirection } from '../../models/PieceDirection';
import { PieceRotation } from '../../models/PieceRotation';

const startLockTimer: ActionCreatorWithoutPayload = createAction('epic:tetris/startLockTimer');
const startLevelTimer: ActionCreatorWithPayload<{ willUnmount$: Subject<void> }> = createAction(
  'epic:tetris/startLevelTimer'
);
const move: ActionCreatorWithPayload<PieceDirection | 'downFromInterval'> = createAction('epic:tetris/move');
const rotate: ActionCreatorWithPayload<PieceRotation> = createAction('epic:tetris/rotation');
const observeState: ActionCreatorWithPayload<{ willUnmount$: Subject<void> }> = createAction(
  'epic:tetris/observeState'
);
const observeNextPieces: ActionCreatorWithPayload<{ willUnmount$: Subject<void> }> = createAction(
  'epic:tetris/observeNextPieces'
);
const observeAttack: ActionCreatorWithPayload<{ willUnmount$: Subject<void> }> = createAction(
  'epic:tetris/observeAttack'
);

export default {
  startLockTimer,
  startLevelTimer,
  move,
  rotate,
  observeState,
  observeNextPieces,
  observeAttack
};
