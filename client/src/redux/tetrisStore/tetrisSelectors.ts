import { Piece } from '../../models/Piece';
import { Playfield } from '../../models/Playfield';
import { Optional } from '../../shared/Types';
import { StoreState } from '../state';

function getPiece(state: StoreState): Piece {
  return state.tetris.piece;
}

function getPlayfield(state: StoreState): Playfield {
  return state.tetris.playfield;
}

function getLockTimer(state: StoreState): number {
  return state.tetris.lockState.lockTimer;
}

function getNextPiece(state: StoreState): Optional<Piece> {
  return state.tetris.pieceQueueState.queue[0];
}

function getHeldPiece(state: StoreState): Optional<Piece> {
  return state.tetris.holdState.piece;
}

function getLevel(state: StoreState): number {
  return state.tetris.level;
}

function getScore(state: StoreState): number {
  return state.tetris.score;
}

function getIsGameOver(state: StoreState): boolean {
  return state.tetris.isGameOver;
}

function getLevelTimer(state: StoreState): number {
  return state.tetris.levelTimer;
}

export default {
  getPiece,
  getPlayfield,
  getLockTimer,
  getNextPiece,
  getHeldPiece,
  getLevel,
  getScore,
  getIsGameOver,
  getLevelTimer
};
