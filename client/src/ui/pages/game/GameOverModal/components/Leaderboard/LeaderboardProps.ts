import { Player } from '../../../../../../models/Player';

export interface LeaderboardProps {
  alivePlayers: Player[];
  loserPlayers: Player[];
  player: Player;
}
