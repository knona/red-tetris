import { Component } from '../../../shared/Types';
import { PlayerRowProps } from './PlayerRowProps';
import './PlayerRow.css';

export function PlayerRow(props: PlayerRowProps): Component {
  return (
    <div className="player_row" data-testid="player_row">
      <h2 data-testid="player_row_username">{props.player.username}</h2>
    </div>
  );
}
