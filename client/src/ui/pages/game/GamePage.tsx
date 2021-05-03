import { History } from 'history';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { GamingRoom } from '../../../models/GamingRoom';
import { Piece } from '../../../models/Piece';
import { Player } from '../../../models/Player';
import roomsSelectors from '../../../redux/roomsStore/roomsSelectors';
import { StoreState } from '../../../redux/state';
import tetrisSelectors from '../../../redux/tetrisStore/tetrisSelectors';
import { ServerEvent } from '../../../shared/Events';
import { listen$ } from '../../../shared/Socket';
import { Component, Optional, State } from '../../../shared/Types';
import { nArray } from '../../../utils/array';
import { EMPTY_PLAYFIELD } from '../../../utils/constants';
import { Empty } from '../../components/empty/Empty';
import { PieceBoxTitlePosition } from '../../components/pieceBox/models/PieceBoxTitlePosition';
import { PieceBox } from '../../components/pieceBox/PieceBox';
import { TetrisGridOverlay } from '../../components/tetrisGrid/models/TetrisGridOverlay';
import { TetrisGridStyle } from '../../components/tetrisGrid/models/TetrisGridStyle';
import { TetrisGrid } from '../../components/tetrisGrid/TetrisGrid';
import { Countdown } from './Countdown/Countdown';
import { GameOverModal } from './GameOverModal/GameOverModal';
import './GamePage.css';
import { GamePageProps } from './GamePageProps';
import { OpponentGame } from './OpponentGame/OpponentGame';
import { PlayerGame } from './PlayerGame/PlayerGame';
import { Score } from './Score/Score';

interface GameParams {
  gameId: string;
}

enum ComponentState {
  countdown = 'countdown',
  game = 'game',
  gameOver = 'gameOver',
  win = 'win'
}

export function GamePage(props: GamePageProps): Component {
  const { gameId }: GameParams = useParams<GameParams>();
  const room: Optional<GamingRoom> = useSelector((state: StoreState) => roomsSelectors.getRoomWithId(state, gameId));
  const nextPiece: Optional<Piece> = useSelector(tetrisSelectors.getNextPiece);
  const heldPiece: Optional<Piece> = useSelector(tetrisSelectors.getHeldPiece);
  const [componentState, setComponentState]: State<ComponentState> = useState<ComponentState>(ComponentState.countdown);
  const [canStartGame, setCanStartGame]: State<boolean> = useState<boolean>(false);
  const history: History = useHistory();

  useEffect(() => {
    if (!room) {
      history.replace('/rooms');
      return;
    }
  }, [room]);

  useEffect(() => {
    const willUnmount$: Subject<void> = new Subject();
    listen$(ServerEvent.gameStart)
      .pipe(
        filter(response => response.room.id === gameId),
        tap(() => setComponentState(ComponentState.countdown)),
        takeUntil(willUnmount$)
      )
      .subscribe();
    listen$(ServerEvent.gameOver)
      .pipe(
        filter(response => response.room.id === gameId && response.player.id === props.player.id),
        tap(() => showGameOverModal(ComponentState.gameOver)),
        takeUntil(willUnmount$)
      )
      .subscribe();
    listen$(ServerEvent.gameEnd)
      .pipe(
        filter(response => response.room.id === gameId && componentState !== ComponentState.gameOver),
        tap(() => showGameOverModal(ComponentState.win)),
        takeUntil(willUnmount$)
      )
      .subscribe();
    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, []);

  useEffect(() => {
    setCanStartGame(componentState !== ComponentState.countdown);
  }, [componentState]);

  useEffect(() => {
    const unblockHistory: any = history.block((): any => {
      if (componentState === ComponentState.game || componentState === ComponentState.countdown) {
        return false;
      }
      return true;
    });
    return (): void => {
      unblockHistory();
    };
  }, [componentState]);

  function countdownDidFinish(): void {
    setComponentState(ComponentState.game);
  }

  function showGameOverModal(state: ComponentState): void {
    setTimeout(() => {
      setComponentState(state);
    }, 250);
  }

  function playfieldForPlayerAtIndex(playerIndex: number): Component {
    if (!room) {
      return <Empty />;
    }
    const opponents: Player[] = room.game.players.filter(player => player.id !== props.player.id);
    const playerExists: boolean = playerIndex < opponents.length;
    if (playerExists) {
      const player: Player = opponents[playerIndex];
      return (
        <div key={player.id} style={{ gridArea: `og${playerIndex}` }}>
          <OpponentGame room={room} playerId={player.id} />
        </div>
      );
    } else {
      return (
        <div key={playerIndex} style={{ gridArea: `og${playerIndex}` }}>
          <TetrisGrid
            playfield={EMPTY_PLAYFIELD}
            lockTimer={-1}
            style={TetrisGridStyle.compact}
            overlay={TetrisGridOverlay.emptyPlayer}
          />
        </div>
      );
    }
  }

  return (
    <div className="game_container">
      <div className="game_layout">
        <div style={{ gridArea: 'sc' }}>
          <Score />
        </div>
        <div style={{ gridArea: 'hd' }}>
          <PieceBox title="Hold" piece={heldPiece} titlePosition={PieceBoxTitlePosition.left} />
        </div>
        {room ? nArray((room.maxPlayer - 1) / 2).map(playfieldForPlayerAtIndex) : undefined}
        <div style={{ gridArea: 'pg' }}>
          {room ? <PlayerGame key={`${canStartGame}`} room={room} canStartGame={canStartGame} /> : undefined}
        </div>
        <div style={{ gridArea: 'qe' }}>
          <PieceBox title="Next" piece={nextPiece} titlePosition={PieceBoxTitlePosition.right} />
        </div>
        {room
          ? nArray((room.maxPlayer - 1) / 2)
              .map(playerIndex => playerIndex + (room.maxPlayer - 1) / 2)
              .map(playfieldForPlayerAtIndex)
          : undefined}
      </div>
      {componentState !== ComponentState.game && componentState !== ComponentState.countdown && room ? (
        <GameOverModal player={props.player} room={room} />
      ) : undefined}
      {componentState === ComponentState.countdown ? <Countdown onCountdownFinished={countdownDidFinish} /> : undefined}
    </div>
  );
}
