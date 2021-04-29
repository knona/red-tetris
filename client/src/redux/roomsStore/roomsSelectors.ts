import { GameStatus } from '../../models/GameStatus';
import { GamingRoom } from '../../models/GamingRoom';
import { Player } from '../../models/Player';
import { Room } from '../../models/Room';
import { Optional } from '../../shared/Types';
import { StoreState } from '../state';

function getWaitingRoom(state: StoreState): Optional<Room> {
  return state.rooms.waitingRoom;
}

function getRooms(state: StoreState): GamingRoom[] {
  return state.rooms.rooms;
}

function getRoomWithId(state: StoreState, id: string): Optional<GamingRoom> {
  return state.rooms.rooms.find(room => room.id === id);
}

function getRoomGameStatus(state: StoreState, id: string): Optional<GameStatus> {
  const currentRoom: Optional<GamingRoom> = state.rooms.rooms.find(room => room.id === id);
  if (!currentRoom) {
    return undefined;
  }
  return currentRoom.game.status;
}

function getRoomGameAlivePlayers(state: StoreState, id: string): Player[] {
  const currentRoom: Optional<GamingRoom> = state.rooms.rooms.find(room => room.id === id);
  if (!currentRoom) {
    return [];
  }
  return currentRoom.game.aliveIds
    .map(alivePlayerId => currentRoom.game.players.find(player => player.id === alivePlayerId))
    .filter(player => player !== undefined) as Player[];
}

function getRoomGameLoserPlayers(state: StoreState, id: string): Player[] {
  const currentRoom: Optional<GamingRoom> = state.rooms.rooms.find(room => room.id === id);
  if (!currentRoom) {
    return [];
  }
  return currentRoom.game.loserIds
    .map(loserId => currentRoom.game.players.find(player => player.id === loserId))
    .filter(player => player !== undefined) as Player[];
}

export default {
  getWaitingRoom,
  getRooms,
  getRoomWithId,
  getRoomGameStatus,
  getRoomGameAlivePlayers,
  getRoomGameLosers: getRoomGameLoserPlayers
};
