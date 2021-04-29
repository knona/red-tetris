import { useHistory } from 'react-router';
import { History } from 'history';
import { Modal } from '../../components/modal/Modal';
import { Component } from '../../../shared/Types';

export function MissingRoomPage(): Component {
  const history: History = useHistory();

  function goToRooms(): void {
    history.replace('rooms');
  }

  return (
    <Modal title="Opps" actions={[{ title: 'OK', onPerform: goToRooms }]}>
      <h2>This rooms does not exists</h2>
    </Modal>
  );
}
