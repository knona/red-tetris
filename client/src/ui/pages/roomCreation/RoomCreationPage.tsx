import { History } from 'history';
import { Dispatch, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { AnyAction } from 'redux';
import { GamingRoom } from '../../../models/GamingRoom';
import { DispatchObserve } from '../../../redux/observableActions';
import roomsEpicActions from '../../../redux/roomsStore/roomsEpicActions';
import { Component, State } from '../../../shared/Types';
import { isRoomNameValid } from '../../../utils/validator';
import { Empty } from '../../components/empty/Empty';
import { Modal } from '../../components/modal/Modal';
import { TextField } from '../../components/textField/TextField';

enum ComponentState {
  waitingForUserInput = 'waitingForUserInput',
  invalidRoomName = 'invalidRoomName',
  failedToCreateRoom = 'failedToCreateRoom'
}

export function RoomCreationPage(): Component {
  const [roomName, setRoomName]: State<string> = useState('');
  const [currentState, setCurrentState]: State<ComponentState> = useState<ComponentState>(
    ComponentState.waitingForUserInput
  );
  const history: History = useHistory();
  const dispatch: Dispatch<AnyAction> = useDispatch();

  function validateRoomName(): void {
    if (isRoomNameValid(roomName)) {
      createRoom();
    } else {
      setCurrentState(ComponentState.invalidRoomName);
    }
  }

  function createRoom(): void {
    (dispatch as DispatchObserve)(roomsEpicActions.createRoom({ name: roomName })).subscribe({
      next: (response: { room: GamingRoom }) => goToRoomWithId(response.room.id),
      error: () => setCurrentState(ComponentState.failedToCreateRoom)
    });
  }

  function updateRoomName(text: string): void {
    setRoomName(text);
  }

  function goToRooms(): void {
    history.push('/rooms');
  }

  function goToRoomWithId(roomId: string): void {
    history.replace(`/rooms/${roomId}`);
  }

  return (
    <Modal
      title="New Room"
      actions={[{ title: 'Create', onPerform: validateRoomName }]}
      cancelAction={{ title: 'Cancel', onPerform: goToRooms }}
    >
      <TextField placeholder="Room Name" onTextChange={updateRoomName} onEnter={validateRoomName} focus={true} />
      {currentState === ComponentState.invalidRoomName ? (
        <div className="error" data-testid="invalid_room_name">
          Room name should only contains between 3 and 40 alpha-numeric characters.
        </div>
      ) : (
        <Empty />
      )}
      {currentState === ComponentState.failedToCreateRoom ? (
        <div className="error">Failed to create room. Please retry.</div>
      ) : (
        <Empty />
      )}
    </Modal>
  );
}
