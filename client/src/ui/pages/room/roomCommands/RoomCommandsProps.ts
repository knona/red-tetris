import { GamingRoom } from '../../../../models/GamingRoom';

export interface RoomCommandsProps {
  room: GamingRoom;
  hasJoined: boolean;
  isManager: boolean;
}
