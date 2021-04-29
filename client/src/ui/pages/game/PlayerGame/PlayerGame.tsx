import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { interval, Subject, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { GameStatus } from '../../../../models/GameStatus';
import { Piece } from '../../../../models/Piece';
import { PieceDirection } from '../../../../models/PieceDirection';
import { PieceRotation } from '../../../../models/PieceRotation';
import { Playfield } from '../../../../models/Playfield';
import roomsSelectors from '../../../../redux/roomsStore/roomsSelectors';
import { StoreState } from '../../../../redux/state';
import tetrisEpicActions from '../../../../redux/tetrisStore/tetrisEpicActions';
import tetrisSelectors from '../../../../redux/tetrisStore/tetrisSelectors';
import tetrisActions from '../../../../redux/tetrisStore/tetrisStore';
import { ClientEvent } from '../../../../shared/Events';
import { emit$ } from '../../../../shared/Socket';
import { Component, Optional } from '../../../../shared/Types';
import { TETRIS_LAST_LEVEL, TETRIS_LEVELS, TETRIS_MAX_LEVEL } from '../../../../utils/constants';
import { KeyCode, observeKeyboardEvent, observeKeyboardEventNoRepeat } from '../../../../utils/keyboard';
import { TetrisGrid } from '../../../components/tetrisGrid/TetrisGrid';
import { PlayerGameProps } from './PlayerGameProps';

export function PlayerGame(props: PlayerGameProps): Component {
  const piece: Piece = useSelector(tetrisSelectors.getPiece);
  const playfield: Playfield = useSelector(tetrisSelectors.getPlayfield);
  const lockTimer: number = useSelector(tetrisSelectors.getLockTimer);
  const isGameOver: boolean = useSelector(tetrisSelectors.getIsGameOver);
  const level: number = useSelector(tetrisSelectors.getLevel);
  const gameStatus: Optional<GameStatus> = useSelector((state: StoreState) =>
    roomsSelectors.getRoomGameStatus(state, props.room.id)
  );
  const dispatch: Dispatch<AnyAction> = useDispatch();

  useEffect(() => {
    if (!props.canStartGame) {
      return;
    }
    const willUnmount$: Subject<void> = new Subject();
    dispatch(tetrisEpicActions.startLevelTimer({ willUnmount$ }));
    dispatch(tetrisEpicActions.observeNextPieces({ willUnmount$ }));
    dispatch(tetrisEpicActions.observeState({ willUnmount$ }));
    dispatch(tetrisEpicActions.observeAttack({ willUnmount$ }));
    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, []);

  useEffect(() => {
    const timerSubscription: Subscription = interval(
      level > TETRIS_MAX_LEVEL ? TETRIS_LAST_LEVEL.interval : TETRIS_LEVELS[level - 1].interval
    )
      .pipe(
        filter(() => !isGameOver && gameStatus !== GameStatus.finished && props.canStartGame),
        tap(() => {
          dispatch(tetrisEpicActions.move('downFromInterval'));
        })
      )
      .subscribe();
    return (): void => timerSubscription.unsubscribe();
  }, [isGameOver, gameStatus, level]);

  useEffect(() => {
    if (isGameOver) {
      emit$(ClientEvent.gameOver).subscribe();
    }
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver || gameStatus === GameStatus.finished || !props.canStartGame) {
      return;
    }

    const willUnmount$: Subject<void> = new Subject();

    observeKeyboardEvent(KeyCode.arrowLeft, willUnmount$, () => dispatch(tetrisEpicActions.move(PieceDirection.left)));
    observeKeyboardEvent(KeyCode.arrowRight, willUnmount$, () =>
      dispatch(tetrisEpicActions.move(PieceDirection.right))
    );
    observeKeyboardEvent(KeyCode.arrowDown, willUnmount$, () => dispatch(tetrisEpicActions.move(PieceDirection.down)));
    observeKeyboardEventNoRepeat(KeyCode.arrowUp, willUnmount$, () =>
      dispatch(tetrisEpicActions.rotate(PieceRotation.right))
    );
    observeKeyboardEventNoRepeat([KeyCode.z, KeyCode.ctrlLeft], willUnmount$, () =>
      dispatch(tetrisEpicActions.rotate(PieceRotation.left))
    );
    observeKeyboardEventNoRepeat(KeyCode.space, willUnmount$, () => dispatch(tetrisActions.hardDrop()));
    observeKeyboardEventNoRepeat([KeyCode.c, KeyCode.shiftLeft], willUnmount$, () =>
      dispatch(tetrisActions.holdPiece())
    );

    return (): void => {
      willUnmount$.next();
      willUnmount$.complete();
    };
  }, [isGameOver, gameStatus]);

  return <TetrisGrid playfield={playfield} piece={piece} lockTimer={lockTimer} />;
}
