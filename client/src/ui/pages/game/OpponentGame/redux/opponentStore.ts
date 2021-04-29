import { AnyAction, CaseReducerActions, createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { Reducer } from 'react';
import { Piece } from '../../../../../models/Piece';
import { Playfield } from '../../../../../models/Playfield';
import { EMPTY_PLAYFIELD } from '../../../../../utils/constants';

export interface TetrisOpponentStore {
  piece?: Piece;
  playfield?: Playfield;
  isGameOver: boolean;
}

export const tetrisOpponentInitialState: TetrisOpponentStore = {
  playfield: EMPTY_PLAYFIELD,
  isGameOver: false
};

type Reducers = {
  startGame(state: TetrisOpponentStore): TetrisOpponentStore;
  updateGame(
    state: TetrisOpponentStore,
    action: PayloadAction<{ piece?: Piece; playfield?: Playfield }>
  ): TetrisOpponentStore;
  setGameOver(state: TetrisOpponentStore): TetrisOpponentStore;
};

const tetrisOpponentSlice: Slice<TetrisOpponentStore, Reducers, 'tetrisOpponent'> = createSlice<
  TetrisOpponentStore,
  Reducers,
  'tetrisOpponent'
>({
  name: 'tetrisOpponent',
  initialState: tetrisOpponentInitialState,
  reducers: {
    startGame: startGame,
    updateGame: updateGame,
    setGameOver: setGameOver
  }
});

function startGame(): TetrisOpponentStore {
  return tetrisOpponentInitialState;
}

function updateGame(
  state: TetrisOpponentStore,
  action: PayloadAction<{ piece?: Piece; playfield?: Playfield }>
): TetrisOpponentStore {
  return {
    ...state,
    piece: action.payload.piece ?? state.piece,
    playfield: action.payload.playfield ?? state.playfield
  };
}

function setGameOver(state: TetrisOpponentStore): TetrisOpponentStore {
  return {
    ...state,
    isGameOver: true
  };
}

export const tetrisOpponentReducer: Reducer<TetrisOpponentStore, AnyAction> = tetrisOpponentSlice.reducer;
export const tetrisOpponentActions: CaseReducerActions<Reducers> = tetrisOpponentSlice.actions;
export default tetrisOpponentActions;
