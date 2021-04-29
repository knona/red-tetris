import { Game } from './Game';
import { Room } from './Room';

export interface GamingRoom extends Room {
  managerId: string;
  maxPlayer: number;
  game: Game;
}
