/* eslint-disable */
import { generatePiece, Piece } from '../../../models/Piece';
import { PieceType } from '../../../models/PieceType';
import { initialStoreState, StoreState } from '../../../redux/state';
import tetrisSelectors from '../../../redux/tetrisStore/tetrisSelectors';
import { initialTetrisState } from '../../../redux/tetrisStore/tetrisState';
import { EMPTY_PLAYFIELD } from '../../../utils/constants';

describe('Tetris selector', () => {
  it('getPiece', () => {
    const piece: Piece = generatePiece(PieceType.I);
    const state: StoreState = { ...initialStoreState, tetris: { ...initialTetrisState, piece } };
    expect(tetrisSelectors.getPiece(state)).toStrictEqual(piece);
  });

  it('getPlayfield', () => {
    expect(tetrisSelectors.getPlayfield(initialStoreState)).toStrictEqual(EMPTY_PLAYFIELD);
  });

  it('getLockTimer', () => {
    expect(tetrisSelectors.getLockTimer(initialStoreState)).toStrictEqual(-1);
  });

  it('getNextPiece', () => {
    const queue: Piece[] = [generatePiece(PieceType.O), generatePiece(PieceType.L), generatePiece(PieceType.S)];
    const state: StoreState = {
      ...initialStoreState,
      tetris: { ...initialTetrisState, pieceQueueState: { queue, fetching: false } }
    };
    expect(tetrisSelectors.getNextPiece(state)).toStrictEqual(queue[0]);
  });

  it('getHeldPiece', () => {
    const piece: Piece = generatePiece(PieceType.I);
    const state: StoreState = {
      ...initialStoreState,
      tetris: { ...initialTetrisState, holdState: { ...initialTetrisState.holdState, piece } }
    };
    expect(tetrisSelectors.getHeldPiece(state)).toStrictEqual(piece);
  });

  it('getLevel', () => {
    expect(tetrisSelectors.getLevel(initialStoreState)).toStrictEqual(1);
  });

  it('getScore', () => {
    expect(tetrisSelectors.getScore(initialStoreState)).toStrictEqual(0);
  });

  it('getIsGameOver', () => {
    expect(tetrisSelectors.getIsGameOver(initialStoreState)).toStrictEqual(false);
  });

  it('getLevelTimer', () => {
    expect(tetrisSelectors.getLevelTimer(initialStoreState)).toStrictEqual(0);
  });
});
