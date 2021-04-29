import { GameStatus } from './GameStatus';
import { Player } from './Player';

export interface Game {
  status: GameStatus;
  players: Player[];
  aliveIds: string[];
  loserIds: string[];
}
