import { GamingRoom } from '../../../../models/GamingRoom';

export interface PlayerGameProps {
  room: GamingRoom;
  canStartGame: boolean;
}
