import { AnyAction } from 'redux';
import { combineEpics } from 'redux-observable';
import { concat, EMPTY, interval, merge, Observable, of, timer } from 'rxjs';
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  mergeMap,
  mergeMapTo,
  pairwise,
  skip,
  switchMap,
  take,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import { Piece } from '../../models/Piece';
import { PieceDirection } from '../../models/PieceDirection';
import { Playfield } from '../../models/Playfield';
import { ClientEvent, ServerEvent } from '../../shared/Events';
import { emit$, listen$ } from '../../shared/Socket';
import { checkCollision } from '../../tetris/PieceCollision';
import { move, rotate } from '../../tetris/PieceMovement';
import { setPieceInBuffer } from '../../tetris/PiecePosition';
import { addGarbageLines } from '../../tetris/PlayfieldTransformations';
import { TETRIS_LEVELS, TETRIS_LOCK_INTERVAL, TETRIS_LOCK_MAX_MOVE_LOCK } from '../../utils/constants';
import { StoreState } from '../state';
import tetrisEpicActions from './tetrisEpicActions';
import { LockState, TetrisState } from './tetrisState';
import tetrisActions from './tetrisStore';

function startLockTimerEpic(
  action$: Observable<ReturnType<typeof tetrisEpicActions.startLockTimer>>,
  state$: Observable<StoreState>
): Observable<ReturnType<typeof tetrisActions.setLockTimer>> {
  const period: number = 20;
  return action$.pipe(
    filter(tetrisEpicActions.startLockTimer.match),
    switchMap(() =>
      timer(0, period).pipe(
        map(n => n * period),
        map(time => tetrisActions.setLockTimer(time)),
        take(TETRIS_LOCK_INTERVAL / period + 1),
        takeUntil(
          state$.pipe(
            map(state => state.tetris.lockState.lockTimer),
            distinctUntilChanged(),
            skip(1),
            filter(lockTimer => lockTimer === -1)
          )
        )
      )
    )
  );
}

function startLevelTimerEpic(
  action$: Observable<ReturnType<typeof tetrisEpicActions.startLevelTimer>>
): Observable<ReturnType<typeof tetrisActions.setLevelTimer> | ReturnType<typeof tetrisActions.incrementLevel>> {
  const period: number = 250;

  return action$.pipe(
    filter(tetrisEpicActions.startLevelTimer.match),
    switchMap(action =>
      concat(
        ...TETRIS_LEVELS.map(({ duration }) =>
          interval(period).pipe(
            map(n => n * period),
            mergeMap(time =>
              time === duration
                ? [tetrisActions.setLevelTimer(time), tetrisActions.incrementLevel()]
                : [tetrisActions.setLevelTimer(time)]
            ),
            take(duration / period + 2)
          )
        )
      ).pipe(takeUntil(action.payload.willUnmount$))
    )
  );
}

type SetPieceActions =
  | ReturnType<typeof tetrisActions.setPiece>
  | ReturnType<typeof tetrisEpicActions.startLockTimer>
  | ReturnType<typeof tetrisActions.stopTimer>;

function moveEpic(
  action$: Observable<ReturnType<typeof tetrisEpicActions.move>>,
  state$: Observable<StoreState>
): Observable<SetPieceActions> {
  return action$.pipe(
    filter(tetrisEpicActions.move.match),
    withLatestFrom(state$),
    map(([action, state]) => ({ action, state: state.tetris })),
    mergeMap(({ action, state }) => {
      let direction: PieceDirection;
      let isMoveDownFromInterval: boolean = false;
      if (action.payload === 'downFromInterval') {
        direction = PieceDirection.down;
        isMoveDownFromInterval = true;
      } else {
        direction = action.payload;
      }
      const hasCollision: boolean = checkCollision(direction, state.piece, state.playfield);
      const movedPiece: Piece = move(direction, state.piece);
      return hasCollision ? EMPTY : handleLockAfterInput(state, movedPiece, isMoveDownFromInterval);
    })
  );
}

function rotateEpic(
  action$: Observable<ReturnType<typeof tetrisEpicActions.rotate>>,
  state$: Observable<StoreState>
): Observable<SetPieceActions> {
  return action$.pipe(
    filter(tetrisEpicActions.rotate.match),
    withLatestFrom(state$),
    map(([action, state]) => ({ action, state: state.tetris })),
    mergeMap(({ action, state }) => {
      const rotatedPiece: Piece = rotate(action.payload, state.piece, state.playfield);
      const canRotate: boolean = state.piece !== rotatedPiece;
      return !canRotate ? EMPTY : handleLockAfterInput(state, rotatedPiece);
    })
  );
}

function handleLockAfterInput(state: TetrisState, piece: Piece, isMoveDownFromInterval?: boolean): SetPieceActions[] {
  const actions: SetPieceActions[] = [];
  const minPieceY: number = piece.points.reduce((acc, cur) => (cur.y < acc ? cur.y : acc), 30) + piece.point.y;
  const hasPieceMovedDown: boolean = minPieceY < state.lockState.minPieceY;
  const hasExcededMoves: boolean = state.lockState.moveCount + 1 >= TETRIS_LOCK_MAX_MOVE_LOCK;
  const shouldResetTimer: boolean = hasPieceMovedDown || !hasExcededMoves;
  if (shouldResetTimer) {
    actions.push(tetrisActions.stopTimer());
  }
  const hasDownCollision: boolean = checkCollision(PieceDirection.down, piece, state.playfield);
  if (hasDownCollision && (shouldResetTimer || state.lockState.lockTimer === -1)) {
    actions.push(tetrisEpicActions.startLockTimer());
  }
  actions.push(tetrisActions.setPiece({ piece, isMoveDownFromInterval }));
  return actions;
}

function observeNextPiecesEpic(
  action$: Observable<ReturnType<typeof tetrisEpicActions.observeNextPieces>>
): Observable<ReturnType<typeof tetrisActions.addPieces>> {
  return action$.pipe(
    filter(tetrisEpicActions.observeNextPieces.match),
    mergeMap(action =>
      listen$(ServerEvent.nextPieces).pipe(
        map(res => tetrisActions.addPieces(res.pieces)),
        takeUntil(action.payload.willUnmount$)
      )
    )
  );
}

function shouldStartLock(lockState: LockState, playfield: Playfield, piece: Piece): boolean {
  const hasExcededMoves: boolean = lockState.moveCount + 1 >= TETRIS_LOCK_MAX_MOVE_LOCK;
  const shouldResetTimer: boolean = !hasExcededMoves;
  const hasDownCollision: boolean = checkCollision(PieceDirection.down, piece, playfield);
  return hasDownCollision && (shouldResetTimer || lockState.lockTimer === -1);
}

function observeAttackEpic(
  action$: Observable<ReturnType<typeof tetrisEpicActions.observeAttack>>,
  state$: Observable<StoreState>
): Observable<
  | ReturnType<typeof tetrisActions.setPieceAndPlayfield>
  | ReturnType<typeof tetrisEpicActions.startLockTimer>
  | ReturnType<typeof tetrisActions.setGameOver>
> {
  return action$.pipe(
    filter(tetrisEpicActions.observeAttack.match),
    mergeMap(action =>
      listen$(ServerEvent.attack).pipe(
        withLatestFrom(state$),
        map(([res, state]) => ({ res, state: state.tetris })),
        mergeMap(({ res, state: { piece, playfield, lockState } }) => {
          const { isGameOver, ...newState } = addGarbageLines(piece, playfield, res.nLines);
          if (isGameOver) {
            return [tetrisActions.setGameOver({ playfield: newState.playfield, piece: setPieceInBuffer(piece) })];
          }
          if (shouldStartLock(lockState, newState.playfield, newState.piece)) {
            return [tetrisEpicActions.startLockTimer(), tetrisActions.setPieceAndPlayfield(newState)];
          }
          return [tetrisActions.setPieceAndPlayfield(newState)];
        }),
        takeUntil(action.payload.willUnmount$)
      )
    )
  );
}

function updatePlayerGame(tetrisState$: Observable<TetrisState>): Observable<never> {
  return tetrisState$.pipe(
    pairwise(),
    filter(([prevState, state]) => {
      const pieceChanged: boolean = prevState.piece !== state.piece;
      const playfieldChanged: boolean = prevState.playfield !== state.playfield;
      return pieceChanged || playfieldChanged;
    }),
    mergeMap(([prevState, state]) => {
      const pieceChanged: boolean = prevState.piece !== state.piece;
      const playfieldChanged: boolean = prevState.playfield !== state.playfield;
      const deletedLinesChanged: boolean = prevState.deletedLines !== state.deletedLines;

      return emit$(ClientEvent.updatePlayerGame, {
        playfield: playfieldChanged ? state.playfield : undefined,
        piece: pieceChanged ? state.piece : undefined,
        deletedLines: deletedLinesChanged && state.deletedLines >= 2 ? state.deletedLines : undefined
      });
    }),
    mergeMapTo(EMPTY)
  );
}

function nextPieces(tetrisState$: Observable<TetrisState>): Observable<ReturnType<typeof tetrisActions.startFetching>> {
  return tetrisState$.pipe(
    map(state => state.pieceQueueState),
    distinctUntilKeyChanged('queue'),
    filter(pieceQueueState => !pieceQueueState.fetching && pieceQueueState.queue.length <= 11),
    mergeMap(() => merge(of(tetrisActions.startFetching()), emit$(ClientEvent.nextPieces).pipe(mergeMapTo(EMPTY))))
  );
}

function lockAfterPieceSpawned(
  tetrisState$: Observable<TetrisState>
): Observable<ReturnType<typeof tetrisEpicActions.startLockTimer>> {
  return tetrisState$.pipe(
    distinctUntilKeyChanged('piece'),
    filter(state => shouldStartLock(state.lockState, state.playfield, state.piece)),
    map(() => tetrisEpicActions.startLockTimer())
  );
}

function observeStateEpic(
  action$: Observable<ReturnType<typeof tetrisEpicActions.observeState>>,
  state$: Observable<StoreState>
): Observable<ReturnType<typeof tetrisActions.startFetching> | ReturnType<typeof tetrisEpicActions.startLockTimer>> {
  const tetrisState$: Observable<TetrisState> = action$.pipe(
    filter(tetrisEpicActions.observeState.match),
    switchMap(action =>
      state$.pipe(
        map(state => state.tetris),
        takeUntil(action.payload.willUnmount$)
      )
    )
  );

  return merge(updatePlayerGame(tetrisState$), nextPieces(tetrisState$), lockAfterPieceSpawned(tetrisState$));
}

export const tetrisEpic: (
  action$: Observable<AnyAction>,
  state$: Observable<StoreState>
) => Observable<any> = combineEpics(
  startLockTimerEpic,
  startLevelTimerEpic,
  moveEpic,
  rotateEpic,
  observeStateEpic,
  observeNextPiecesEpic,
  observeAttackEpic
);
