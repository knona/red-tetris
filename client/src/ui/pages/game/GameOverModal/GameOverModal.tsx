import { History } from 'history';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { GameStatus } from '../../../../models/GameStatus';
import { Player } from '../../../../models/Player';
import roomsSelectors from '../../../../redux/roomsStore/roomsSelectors';
import { StoreState } from '../../../../redux/state';
import { ClientEvent } from '../../../../shared/Events';
import { emit$ } from '../../../../shared/Socket';
import { Component } from '../../../../shared/Types';
import { Empty } from '../../../components/empty/Empty';
import { RectButtonType } from '../../../components/rectButton/models/RectButtonType';
import { RectButton } from '../../../components/rectButton/RectButton';
import { Toolbar } from '../../../components/toolbar/Toolbar';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import './GameOverModal.css';
import { GameOverModalProps } from './GameOverModalProps';

enum ComponentState {
  default = 'default',
  failedToRematch = 'failedToRematch'
}

export function GameOverModal(props: GameOverModalProps): Component {
  const history: History = useHistory();
  const [componentState, setComponentState] = useState<ComponentState>(ComponentState.default);
  const alivePlayers: Player[] = useSelector((state: StoreState) =>
    roomsSelectors.getRoomGameAlivePlayers(state, props.room.id)
  );
  const loserPlayers: Player[] = useSelector((state: StoreState) =>
    roomsSelectors.getRoomGameLosers(state, props.room.id)
  );
  const isGameManager: boolean = props.player.id === props.room.managerId;

  function hasWin(): boolean {
    const playerIndex: number = [...loserPlayers].reverse().findIndex(player => player.id === props.player.id);
    const playerPosition: number = alivePlayers.length + playerIndex + 1;
    return playerPosition === 1;
  }

  function goToRoom(): void {
    history.replace(`/rooms/${props.room.id}`);
  }

  function rematch(): void {
    emit$(ClientEvent.startGame).subscribe({ error: () => setComponentState(ComponentState.failedToRematch) });
  }

  return (
    <div className="game_over_background">
      <div className="game_over_box">
        <div className="title" data-testid="title">
          <h2>{hasWin() ? 'You win!' : 'Game Over'}</h2>
        </div>
        <Leaderboard alivePlayers={alivePlayers} loserPlayers={loserPlayers} player={props.player} />
        <Toolbar>
          <RectButton title="Continue" onClick={goToRoom} />
          {isGameManager && props.room.game.status === GameStatus.finished ? (
            <RectButton title="Rematch" type={RectButtonType.confirm} onClick={rematch} />
          ) : (
            <Empty />
          )}
        </Toolbar>
        <div className="tips">
          {isGameManager && props.room.game.status !== GameStatus.finished ? (
            <h3>You can rematch once the game is finished.</h3>
          ) : (
            <Empty />
          )}
          {!isGameManager && props.room.game.status !== GameStatus.finished ? (
            <h3>Once the game is finished the game owner can propose a rematch.</h3>
          ) : (
            <Empty />
          )}
        </div>
        {componentState === ComponentState.failedToRematch ? (
          <div className="error">Failed to rematch. Please retry.</div>
        ) : undefined}
      </div>
    </div>
  );
}
