import { Player } from '../../models/Player';
import { Optional } from '../../shared/Types';
import { StoreState } from '../state';

function getPlayer(state: StoreState): Optional<Player> {
  return state.player.player;
}

export default {
  getPlayer
};
