import { Player } from '../../models/Player';

export interface PlayerState {
  player?: Player;
}

export const initialPlayerState: PlayerState = { player: undefined };
