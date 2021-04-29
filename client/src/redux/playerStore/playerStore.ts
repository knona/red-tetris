import { AnyAction, CaseReducerActions, createSlice, PayloadAction, Reducer, Slice } from '@reduxjs/toolkit';
import { Player } from '../../models/Player';
import { initialPlayerState, PlayerState } from './playerState';

type Reducers = {
  setPlayer(state: PlayerState, action: PayloadAction<{ player: Player }>): PlayerState;
};

const playerSlice: Slice<PlayerState, Reducers, 'player'> = createSlice<PlayerState, Reducers, 'player'>({
  name: 'player',
  initialState: initialPlayerState,
  reducers: { setPlayer }
});

function setPlayer(state: PlayerState, { payload }: PayloadAction<{ player: Player }>): PlayerState {
  return { ...state, player: payload.player };
}

export const playerReducer: Reducer<PlayerState, AnyAction> = playerSlice.reducer;
export const playerActions: CaseReducerActions<Reducers> = playerSlice.actions;
export default playerActions;
