/* eslint-disable */
import { generatePiece, Piece } from '../../../models/Piece';
import { PieceType } from '../../../models/PieceType';
import { Playfield } from '../../../models/Playfield';
import { initialTetrisState, TetrisState } from '../../../redux/tetrisStore/tetrisState';
import tetrisActions, { tetrisReducer } from '../../../redux/tetrisStore/tetrisStore';
import { moveDown, moveRight } from '../../../tetris/PieceMovement';
import { bottomProjection } from '../../../tetris/PiecePosition';
import { putPiece } from '../../../tetris/PlayfieldTransformations';
import { EMPTY_PLAYFIELD, TETRIS_LOCK_INTERVAL } from '../../../utils/constants';

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

describe('Tetris Reducer', () => {
  describe('setPieceAndPlayfield', () => {
    it('should set piece and playfield', () => {
      const piece: Piece = generatePiece(PieceType.O);
      const playfield: Playfield = EMPTY_PLAYFIELD;
      const state: TetrisState = tetrisReducer(
        initialTetrisState,
        tetrisActions.setPieceAndPlayfield({ piece, playfield })
      );
      expect(state.piece).toStrictEqual(piece);
      expect(state.playfield).toStrictEqual(playfield);
    });

    it('should set piece only', () => {
      const piece: Piece = generatePiece(PieceType.O);
      const state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.setPieceAndPlayfield({ piece }));
      expect(state.piece).toStrictEqual(piece);
    });

    it('should set playfield only', () => {
      const playfield: Playfield = EMPTY_PLAYFIELD;
      const state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.setPieceAndPlayfield({ playfield }));
      expect(state.playfield).toStrictEqual(playfield);
    });
  });

  describe('stopTimer', () => {
    it('should stop the timer', () => {
      const state: TetrisState = tetrisReducer(
        { ...initialTetrisState, lockState: { ...initialTetrisState.lockState, lockTimer: 42 } },
        tetrisActions.stopTimer()
      );
      expect(state.lockState.lockTimer).toBe(-1);
    });
  });

  describe('startFetching', () => {
    it('should start fetching', () => {
      const state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.startFetching());
      expect(state.pieceQueueState.fetching).toBe(true);
    });
  });

  describe('addPieces', () => {
    it('should add pieces to queue', () => {
      const queue: Piece[] = [generatePiece(PieceType.Z)];
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      const state: TetrisState = tetrisReducer(
        { ...initialTetrisState, pieceQueueState: { queue, fetching: false } },
        tetrisActions.addPieces(pieces)
      );
      expect(state.pieceQueueState.queue).toStrictEqual(queue.concat(pieces));
    });
  });

  describe('start', () => {
    it('should start, set the piece queue and the main piece', () => {
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      const state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.start(pieces));
      expect(state.pieceQueueState.queue).toStrictEqual(pieces.slice(1));
      expect(state.piece).toStrictEqual(pieces[0]);
    });
  });

  describe('setGameOver', () => {
    it('should set the game over and set playfield and piece', () => {
      const piece: Piece = generatePiece(PieceType.O);
      const playfield: Playfield = EMPTY_PLAYFIELD;
      const state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.setGameOver({ piece, playfield }));
      expect(state.piece).toStrictEqual(piece);
      expect(state.playfield).toStrictEqual(playfield);
      expect(state.isGameOver).toStrictEqual(true);
    });
  });

  describe('setLevelTimer', () => {
    it('should set the level timer', () => {
      const state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.setLevelTimer(42));
      expect(state.levelTimer).toStrictEqual(42);
    });
  });

  describe('incrementLevel', () => {
    it('should increment the level', () => {
      const state: TetrisState = tetrisReducer({ ...initialTetrisState, level: 41 }, tetrisActions.incrementLevel());
      expect(state.level).toStrictEqual(42);
    });
  });

  describe('setLockTimer', () => {
    it('should set the lock timer if timer !== max', () => {
      const state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.setLockTimer(42));
      expect(state.lockState.lockTimer).toStrictEqual(42);
    });

    it('should lock piece and reset lock state if timer === max and piece has down collision', () => {
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      const piece: Piece = generatePiece(PieceType.L, { x: 5, y: 1 });
      let state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.setPieceAndPlayfield({ piece }));
      state = tetrisReducer(state, tetrisActions.addPieces(pieces));
      state = tetrisReducer(state, tetrisActions.setLockTimer(TETRIS_LOCK_INTERVAL));
      expect(state.lockState).toStrictEqual(initialTetrisState.lockState);
      expect(state.playfield).toStrictEqual(putPiece(piece, EMPTY_PLAYFIELD).playfield);
    });
  });

  describe('hardDrop', () => {
    it('should hard drop and lock piece', () => {
      const playfield: Playfield = EMPTY_PLAYFIELD;
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      let state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.start(pieces));
      state = tetrisReducer(state, tetrisActions.hardDrop());
      expect(state.lockState).toStrictEqual(initialTetrisState.lockState);
      expect(state.playfield).toStrictEqual(putPiece(bottomProjection(pieces[0], playfield), playfield).playfield);
    });
  });

  describe('holdPiece', () => {
    it('should hold piece when held piece is undefined', () => {
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      let state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.start(pieces));
      state = tetrisReducer(state, tetrisActions.holdPiece());
      expect(state.holdState.piece).toStrictEqual(pieces[0]);
      expect(state.piece).toStrictEqual(pieces[1]);
    });
    it('should not hold piece if a hold is already done', () => {
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      let state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.start(pieces));
      state = tetrisReducer(state, tetrisActions.holdPiece());
      state = tetrisReducer(state, tetrisActions.holdPiece());
      expect(state.holdState.piece).toStrictEqual(pieces[0]);
      expect(state.piece).toStrictEqual(pieces[1]);
    });
    it('should hold piece when held piece is undefined', () => {
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      let state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.start(pieces));
      state = tetrisReducer(state, tetrisActions.holdPiece());
      state = tetrisReducer(state, tetrisActions.hardDrop());
      state = tetrisReducer(state, tetrisActions.holdPiece());
      expect(state.holdState.piece).toStrictEqual(pieces[2]);
      expect(state.piece).toStrictEqual(pieces[0]);
    });
  });

  describe('setPiece', () => {
    it('should set piece and change move count', () => {
      let state: TetrisState = tetrisReducer(
        initialTetrisState,
        tetrisActions.setPieceAndPlayfield({ piece: generatePiece(PieceType.L, { x: 5, y: 2 }) })
      );

      let newPiece: Piece = moveDown(state.piece);
      state = tetrisReducer(state, tetrisActions.setPiece({ piece: newPiece }));
      expect(state.piece).toStrictEqual(newPiece);
      expect(state.lockState.moveCount).toBe(0);

      newPiece = moveRight(state.piece);
      state = tetrisReducer(state, tetrisActions.setPiece({ piece: newPiece }));
      expect(state.piece).toStrictEqual(newPiece);
      expect(state.lockState.moveCount).toBe(1);
    });

    it('should set piece and lock it', () => {
      const playfield: Playfield = EMPTY_PLAYFIELD;
      const pieces: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
      let state: TetrisState = tetrisReducer(initialTetrisState, tetrisActions.addPieces(pieces));
      state = tetrisReducer(
        { ...state, lockState: { ...state.lockState, lockTimer: TETRIS_LOCK_INTERVAL } },
        tetrisActions.setPieceAndPlayfield({ piece: generatePiece(PieceType.L, { x: 5, y: 1 }) })
      );
      const newPiece: Piece = moveRight(state.piece);
      state = tetrisReducer(state, tetrisActions.setPiece({ piece: newPiece }));
      expect(state.piece).toStrictEqual(pieces[0]);
      expect(state.lockState).toStrictEqual(initialTetrisState.lockState);
      expect(state.playfield).toStrictEqual(putPiece(newPiece, playfield).playfield);
    });
  });
});
