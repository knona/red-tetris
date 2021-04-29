import { useEffect, useReducer } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { ServerEvent } from '../../../../shared/Events';
import { listen$ } from '../../../../shared/Socket';
import { Component, ComponentStore } from '../../../../shared/Types';
import { EMPTY_PLAYFIELD } from '../../../../utils/constants';
import { TetrisGridOverlay } from '../../../components/tetrisGrid/models/TetrisGridOverlay';
import { TetrisGridStyle } from '../../../components/tetrisGrid/models/TetrisGridStyle';
import { TetrisGrid } from '../../../components/tetrisGrid/TetrisGrid';
import { OpponentGameProps } from './OpponentGameProps';
import tetrisOpponentActions, {
  tetrisOpponentInitialState,
  tetrisOpponentReducer,
  TetrisOpponentStore
} from './redux/opponentStore';

export function OpponentGame(props: OpponentGameProps): Component {
  const [{ piece, playfield, isGameOver }, dispatch]: ComponentStore<TetrisOpponentStore> = useReducer(
    tetrisOpponentReducer,
    tetrisOpponentInitialState
  );

  useEffect(() => {
    const willUnmount$: Subject<void> = new Subject();
    listen$(ServerEvent.gameStart)
      .pipe(
        filter(response => response.room.id === props.room.id),
        tap(() => dispatch(tetrisOpponentActions.startGame())),
        takeUntil(willUnmount$)
      )
      .subscribe();
    listen$(ServerEvent.updatePlayerGame)
      .pipe(
        filter(response => response.player.id === props.playerId),
        tap(response =>
          dispatch(tetrisOpponentActions.updateGame({ piece: response.piece, playfield: response.playfield }))
        ),
        takeUntil(willUnmount$)
      )
      .subscribe();
    listen$(ServerEvent.gameOver)
      .pipe(
        filter(response => response.player.id === props.playerId),
        tap(() => dispatch(tetrisOpponentActions.setGameOver())),
        takeUntil(willUnmount$)
      )
      .subscribe();
    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, []);

  return (
    <TetrisGrid
      playfield={playfield ?? EMPTY_PLAYFIELD}
      piece={piece}
      lockTimer={-1}
      style={TetrisGridStyle.compact}
      overlay={isGameOver ? TetrisGridOverlay.gameOver : TetrisGridOverlay.none}
    />
  );
}
