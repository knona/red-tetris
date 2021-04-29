import { Player } from '../../../models/Player';

export interface PlayerRowProps {
  player: Player;
  onClick?: () => void;
}
