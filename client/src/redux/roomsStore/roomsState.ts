import { GamingRoom } from '../../models/GamingRoom';
import { Room } from '../../models/Room';

export interface RoomsState {
  waitingRoom?: Room;
  rooms: GamingRoom[];
}

export const initialRoomsState: RoomsState = { waitingRoom: undefined, rooms: [] };
