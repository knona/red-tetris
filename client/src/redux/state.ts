import { initialPlayerState, PlayerState } from './playerStore/playerState';
import { initialRoomsState, RoomsState } from './roomsStore/roomsState';
import { initialTetrisState, TetrisState } from './tetrisStore/tetrisState';

export interface StoreState {
  player: PlayerState;
  rooms: RoomsState;
  tetris: TetrisState;
}

export const initialStoreState: StoreState = {
  player: initialPlayerState,
  rooms: initialRoomsState,
  tetris: initialTetrisState
};
