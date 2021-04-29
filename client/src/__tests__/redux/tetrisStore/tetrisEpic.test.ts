/* eslint-disable */
import { AnyAction } from 'redux';
import { Observable, of, Subject } from 'rxjs';
import { isEmpty, reduce, startWith, take, tap } from 'rxjs/operators';
import { generatePiece, Piece } from '../../../models/Piece';
import { PieceDirection } from '../../../models/PieceDirection';
import { PieceRotation } from '../../../models/PieceRotation';
import { PieceType } from '../../../models/PieceType';
import { initialStoreState, StoreState } from '../../../redux/state';
import { tetrisEpic } from '../../../redux/tetrisStore/tetrisEpic';
import tetrisEpicActions from '../../../redux/tetrisStore/tetrisEpicActions';
import { initialTetrisState, TetrisState } from '../../../redux/tetrisStore/tetrisState';
import tetrisActions from '../../../redux/tetrisStore/tetrisStore';
import { emit$, listen$ } from '../../../shared/Socket';
import { moveDown } from '../../../tetris/PieceMovement';
import { addGarbageLines } from '../../../tetris/PlayfieldTransformations';
import { TETRIS_LOCK_INTERVAL } from '../../../utils/constants';

const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5;
global.Math = mockMath;

jest.mock('../../../shared/Socket.ts', () => ({
  ...jest.requireActual('../../../shared/Socket.ts'),
  emit$: jest.fn(),
  listen$: jest.fn()
}));

jest.mock('socket.io-client', () => ({
  ...jest.requireActual('socket.io-client'),
  io: jest.fn(() => ({
    on: (): void => {
      return;
    },
    emit: (): void => {
      return;
    }
  }))
}));

describe('Tetris epic', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('moveEpic', () => {
    it('move down', done => {
      const actions$ = of(tetrisEpicActions.move(PieceDirection.down));
      const piece = generatePiece(PieceType.L);
      const state$ = of({ ...initialStoreState, tetris: { ...initialTetrisState, piece } });
      tetrisEpic(actions$, state$)
        .pipe(
          reduce((acc, value: AnyAction) => [...acc, value], [] as AnyAction[]),
          tap(actions => {
            expect(actions.map(action => action.type)).toMatchObject([
              tetrisActions.stopTimer.type,
              tetrisActions.setPiece.type
            ]);
          })
        )
        .subscribe({ complete: done });
    });

    it('move down with down collision', done => {
      const actions$ = of(tetrisEpicActions.move(PieceDirection.down));
      const piece = generatePiece(PieceType.L, { x: 5, y: 1 });
      const state$ = of({ ...initialStoreState, tetris: { ...initialTetrisState, piece } });
      tetrisEpic(actions$, state$)
        .pipe(
          isEmpty(),
          tap(empty => expect(empty).toBe(true))
        )
        .subscribe({ complete: done });
    });

    it('move right with down collision', done => {
      const actions$ = of(tetrisEpicActions.move(PieceDirection.right));
      const piece = generatePiece(PieceType.L, { x: 5, y: 1 });
      const state$ = of({ ...initialStoreState, tetris: { ...initialTetrisState, piece } });
      tetrisEpic(actions$, state$)
        .pipe(
          reduce((acc, value: AnyAction) => [...acc, value], [] as AnyAction[]),
          tap(actions => {
            expect(actions.map(action => action.type)).toMatchObject([
              tetrisActions.stopTimer.type,
              tetrisEpicActions.startLockTimer.type,
              tetrisActions.setPiece.type
            ]);
          })
        )
        .subscribe({ complete: done });
    });
  });

  describe('rotateEpic', () => {
    it('rotate right', done => {
      const actions$ = of(tetrisEpicActions.rotate(PieceRotation.right));
      const piece = generatePiece(PieceType.L);
      const state$ = of({ ...initialStoreState, tetris: { ...initialTetrisState, piece } });
      tetrisEpic(actions$, state$)
        .pipe(
          reduce((acc, value: AnyAction) => [...acc, value], [] as AnyAction[]),
          tap(actions => {
            expect(actions.map(action => action.type)).toMatchObject([
              tetrisActions.stopTimer.type,
              tetrisActions.setPiece.type
            ]);
          })
        )
        .subscribe({ complete: done });
    });

    it('rotation right failed', done => {
      const actions$ = of(tetrisEpicActions.rotate(PieceRotation.right));
      const piece = generatePiece(PieceType.O);
      const state$ = of({ ...initialStoreState, tetris: { ...initialTetrisState, piece } });
      tetrisEpic(actions$, state$)
        .pipe(
          isEmpty(),
          tap(empty => expect(empty).toBe(true))
        )
        .subscribe({ complete: done });
    });

    it('rotation right with down collision', done => {
      const actions$ = of(tetrisEpicActions.rotate(PieceRotation.right));
      const piece = generatePiece(PieceType.L, { x: 5, y: 1 });
      const state$ = of({ ...initialStoreState, tetris: { ...initialTetrisState, piece } });
      tetrisEpic(actions$, state$)
        .pipe(
          reduce((acc, value: AnyAction) => [...acc, value], [] as AnyAction[]),
          tap(actions => {
            expect(actions.map(action => action.type)).toMatchObject([
              tetrisActions.stopTimer.type,
              tetrisEpicActions.startLockTimer.type,
              tetrisActions.setPiece.type
            ]);
          })
        )
        .subscribe({ complete: done });
    });
  });

  describe('startLockTimerEpic', () => {
    it('rotate right', done => {
      const actions$ = of(tetrisEpicActions.startLockTimer());
      const state$ = of(initialStoreState);
      tetrisEpic(actions$, state$)
        .pipe(
          reduce((acc, value: AnyAction) => [...acc, value], [] as AnyAction[]),
          tap(actions => {
            expect(actions.map(action => action.type)).toMatchObject(
              Array.from({ length: TETRIS_LOCK_INTERVAL / 20 + 1 }, () => tetrisActions.setLockTimer.type)
            );
          })
        )
        .subscribe({ complete: done });
    });
  });

  describe('startLockTimerEpic', () => {
    it('should start lock timer', done => {
      const actions$ = of(tetrisEpicActions.startLockTimer());
      const state$ = of(initialStoreState);
      const period: number = 20;
      tetrisEpic(actions$, state$)
        .pipe(
          reduce((acc, value: AnyAction) => [...acc, value], [] as AnyAction[]),
          tap(actions => {
            expect(actions.map(action => action.type)).toMatchObject(
              Array.from({ length: TETRIS_LOCK_INTERVAL / period + 1 }, () => tetrisActions.setLockTimer.type)
            );
          })
        )
        .subscribe({ complete: done });
    });
  });

  describe('startLevelTimerEpic', () => {
    it('should start level timer', done => {
      const actions$ = of(tetrisEpicActions.startLevelTimer({ willUnmount$: new Subject() }));
      const state$ = of(initialStoreState);
      tetrisEpic(actions$, state$)
        .pipe(
          tap((action: AnyAction) => expect(action.type).toBe(tetrisActions.setLevelTimer.type)),
          take(1)
        )
        .subscribe({ complete: done });
    });
  });

  describe('observeNextPiecesEpic', () => {
    it('should listen and pieces to queue', done => {
      const mockedDependency = listen$ as jest.Mock<any, any>;
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      mockedDependency.mockReturnValue(of({ room: { id: 'roomid' }, pieces }));
      const actions$ = of(tetrisEpicActions.observeNextPieces({ willUnmount$: new Subject() }));
      const state$ = of(initialStoreState);
      tetrisEpic(actions$, state$)
        .pipe(tap((action: AnyAction) => expect(action).toMatchObject(tetrisActions.addPieces(pieces))))
        .subscribe({ complete: done });
    });
  });

  describe('observeAttackEpic', () => {
    it('should listen and pieces to queue', done => {
      const mockedDependency = listen$ as jest.Mock<any, any>;
      const nLines: number = 3;
      mockedDependency.mockReturnValue(of({ room: { id: 'roomid' }, nLines }));
      const actions$ = of(tetrisEpicActions.observeAttack({ willUnmount$: new Subject() }));
      const tetrisState: TetrisState = {
        ...initialTetrisState,
        piece: generatePiece(PieceType.L)
      };
      const { isGameOver, ...newState } = addGarbageLines(tetrisState.piece, tetrisState.playfield, nLines);
      const state$ = of({ ...initialStoreState, tetris: tetrisState });
      tetrisEpic(actions$, state$)
        .pipe(tap((action: AnyAction) => expect(action).toMatchObject(tetrisActions.setPieceAndPlayfield(newState))))
        .subscribe({ complete: done });
    });
  });

  describe('observeStateEpic', () => {
    it('updatePlayerGame', done => {
      const mockedDependency = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of(null));
      const actions$ = of(tetrisEpicActions.observeState({ willUnmount$: new Subject() }));
      const piece: Piece = generatePiece(PieceType.I);
      const state1: StoreState = {
        ...initialStoreState,
        tetris: { ...initialTetrisState, piece, pieceQueueState: { queue: new Array(50), fetching: true } }
      };
      const state2: StoreState = { ...state1, tetris: { ...state1.tetris, piece: moveDown(piece) } };
      mockedDependency.mockClear();
      tetrisEpic(actions$, of(state1, state2))
        .pipe(
          isEmpty(),
          tap(empty => {
            expect(mockedDependency.mock.calls.length).toBe(1);
            expect(empty).toBe(true);
          })
        )
        .subscribe({ complete: done });
    });

    it('nextPieces', done => {
      const mockedDependency = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of(null));
      const actions$ = of(tetrisEpicActions.observeState({ willUnmount$: new Subject() }));
      const state$ = of(initialStoreState);
      mockedDependency.mockClear();
      tetrisEpic(actions$, state$)
        .pipe(
          tap((action: AnyAction) => {
            expect(mockedDependency.mock.calls.length).toBe(1);
            expect(action.type).toBe(tetrisActions.startFetching.type);
          })
        )
        .subscribe({ complete: done });
    });

    it('lockAfterPieceSpawned', done => {
      const actions$ = of(tetrisEpicActions.observeState({ willUnmount$: new Subject() }));
      const piece: Piece = generatePiece(PieceType.L, { x: 5, y: 1 });
      const state: StoreState = {
        ...initialStoreState,
        tetris: { ...initialTetrisState, piece, pieceQueueState: { queue: new Array(50), fetching: true } }
      };
      tetrisEpic(actions$, of(state))
        .pipe(tap((action: AnyAction) => expect(action.type).toBe(tetrisEpicActions.startLockTimer.type)))
        .subscribe({ complete: done });
    });
  });
});
