import { History } from 'history';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Switch, useHistory } from 'react-router';
import { AnyAction, Dispatch } from 'redux';
import { Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Player } from '../../../models/Player';
import { Room } from '../../../models/Room';
import { DispatchObserve } from '../../../redux/observableActions';
import roomsEpicActions from '../../../redux/roomsStore/roomsEpicActions';
import roomsSelectors from '../../../redux/roomsStore/roomsSelectors';
import playerSelectors from '../../../redux/playerStore/playerSelectors';
import { ClientEvent } from '../../../shared/Events';
import { emit$, isConnected$ } from '../../../shared/Socket';
import { Component, Optional } from '../../../shared/Types';
import { DisconnectedPage } from '../disconnected/DisconnectedPage';
import { MissingRoomPage } from '../missingRoom/MissingRoomPage';
import { OnboardingPage } from '../onboarding/OnboardingPage';
import { PlayerCreationPage } from '../playerCreation/PlayerCreationPage';
import { RoomPage } from '../room/RoomPage';
import { RoomCreationPage } from '../roomCreation/RoomCreationPage';
import { RoomsPage } from '../rooms/RoomsPage';
import { GamePage } from '../game/GamePage';

export function AppNavigation(): Component {
  const player: Optional<Player> = useSelector(playerSelectors.getPlayer);
  const waitingRoom: Optional<Room> = useSelector(roomsSelectors.getWaitingRoom);
  const history: History = useHistory();
  const dispatch: Dispatch<AnyAction> = useDispatch();

  useEffect(() => {
    const isConnectedSubject$: Subscription = isConnected$.subscribe(isConnected => {
      const isOnboarding: boolean = history.location.pathname === '/' || history.location.pathname === '/createPlayer';
      if (!isOnboarding && player && !isConnected) {
        history.push('/disconnected');
      }
    });

    return (): void => {
      isConnectedSubject$.unsubscribe();
    };
  });

  function joinRoomWithId(roomId: string): void {
    emit$(ClientEvent.joinRoom, { roomId: roomId })
      .pipe(mergeMap(() => (dispatch as DispatchObserve)(roomsEpicActions.getRooms())))
      .subscribe({
        next: () => {
          history.replace(`/rooms/${roomId}`);
        },
        error: () => {
          history.replace('/roomNotFound');
        }
      });
  }

  return (
    <Switch>
      <Route path="/game/:gameId">{player ? <GamePage player={player} /> : <Redirect to="/" />}</Route>
      <Route path="/rooms/:roomId">
        {player ? (
          <RoomPage player={player} />
        ) : (
          <PlayerCreationPage
            redirectPath={history.location.pathname}
            onPlayerCreated={(redirectPath): void => {
              const pathComponents: string[] = redirectPath?.split('/') ?? [];
              const roomId: string = pathComponents[pathComponents.length - 1];
              joinRoomWithId(roomId);
            }}
          />
        )}
      </Route>
      <Route exact path="/roomNotFound">
        <MissingRoomPage />
      </Route>
      <Route exact path="/rooms">
        {player && waitingRoom ? <RoomsPage waitingRoom={waitingRoom} /> : <Redirect to="/" />}
      </Route>
      <Route exact path="/createRoom">
        {player ? <RoomCreationPage /> : <Redirect to="/" />}
      </Route>
      <Route exact path="/createPlayer">
        {player ? (
          <Redirect to="/rooms" />
        ) : (
          <PlayerCreationPage
            onPlayerCreated={(): void => {
              history.replace('/rooms');
            }}
          />
        )}
      </Route>
      <Route exact path="/disconnected">
        <DisconnectedPage />
      </Route>
      <Route exact path="/">
        <OnboardingPage />
      </Route>
      <Route exact path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
