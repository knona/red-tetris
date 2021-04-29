import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { DispatchObserve } from '../../../redux/observableActions';
import playerEpicActions from '../../../redux/playerStore/playerEpicActions';
import { Component, State } from '../../../shared/Types';
import { isUsernameValid } from '../../../utils/validator';
import { Empty } from '../../components/empty/Empty';
import { Modal } from '../../components/modal/Modal';
import { TextField } from '../../components/textField/TextField';
import { PlayerCreationPageProps } from './PlayerCreationPageProps';
import './PlayerCreationPage.css';

enum ComponentState {
  waitingForUserInput = 'waitingForUserInput',
  invalidUsername = 'invalidUsername',
  failedToCreatePlayer = 'failedToCreatePlayer'
}

export function PlayerCreationPage(props: PlayerCreationPageProps): Component {
  const [username, setUsername]: State<string> = useState('');
  const [currentState, setCurrentState]: State<ComponentState> = useState<ComponentState>(
    ComponentState.waitingForUserInput
  );
  const dispatch: Dispatch<AnyAction> = useDispatch();

  function validateUsername(): void {
    if (isUsernameValid(username)) {
      createPlayer();
    } else {
      setCurrentState(ComponentState.invalidUsername);
    }
  }

  function createPlayer(): void {
    (dispatch as DispatchObserve)(playerEpicActions.connection({ username })).subscribe({
      next: () => props.onPlayerCreated(props.redirectPath),
      error: () => setCurrentState(ComponentState.failedToCreatePlayer)
    });
  }

  return (
    <Modal
      title="Welcome!"
      actions={[
        {
          title: 'Play',
          onPerform: validateUsername
        }
      ]}
    >
      <h2>Create your username to start playing.</h2>
      <TextField
        placeholder="Username"
        onTextChange={(text: string): void => {
          setUsername(text);
          setCurrentState(ComponentState.waitingForUserInput);
        }}
        onEnter={validateUsername}
        focus={true}
      />
      {currentState === ComponentState.invalidUsername ? (
        <div className="error" data-testid="invalid_username_error">
          Username should only contains between 3 and 20 alpha-numeric characters without spaces.
        </div>
      ) : (
        <Empty />
      )}
      {currentState === ComponentState.failedToCreatePlayer ? (
        <div className="error" data-testid="failed_to_create_player_error">
          Failed to create your profile. Please retry.
        </div>
      ) : (
        <Empty />
      )}
    </Modal>
  );
}
