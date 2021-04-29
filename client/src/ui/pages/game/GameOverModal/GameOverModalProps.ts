import { GamingRoom } from '../../../../models/GamingRoom';
import { Player } from '../../../../models/Player';

export interface GameOverModalProps {
  player: Player;
  room: GamingRoom;
}
