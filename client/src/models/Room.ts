import { Player } from './Player';

export enum RoomType {
  WaitingRoom = 'WaitingRoom',
  GamingRoom = 'GamingRoom'
}

export interface Room {
  id: string;
  name: string;
  nbPlayers: number;
  players: Player[];
  type: RoomType;
}
