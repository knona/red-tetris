import { History } from 'history';
// import { Dispatch } from 'react';
// import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
// import { switchMap, tap } from 'rxjs/operators';
// import { GamingRoom } from '../../../models/GamingRoom';
// import { DispatchObserve } from '../../../redux/observableActions';
// import playerEpicActions from '../../../redux/playerStore/playerEpicActions';
// import roomsEpicActions from '../../../redux/roomsStore/roomsEpicActions';
import { Component } from '../../../shared/Types';
import { RectButton } from '../../components/rectButton/RectButton';
import { LogoImage } from './components/LogoImage/LogoImage';
import './OnboardingPage.css';

export function OnboardingPage(): Component {
  const history: History = useHistory();
  // const dispatch: Dispatch<any> = useDispatch();

  // function goToCreatePlayer(): void {
  //   (dispatch as DispatchObserve)(playerEpicActions.connection({ username: 'krambono' }))
  //     .pipe(
  //       switchMap(() => (dispatch as DispatchObserve)(roomsEpicActions.createRoom({ name: 'mysuperoom' }))),
  //       tap(({ room }: { room: GamingRoom }) => history.push(`/rooms/${room.id}`))
  //     )
  //     .subscribe();
  // }

  function goToCreatePlayer(): void {
    history.push('/createPlayer');
  }

  return (
    <div className="onboarding_container">
      <LogoImage />
      <RectButton title="Start" onClick={goToCreatePlayer} />
    </div>
  );
}
