import { useHistory } from 'react-router';
import { Component } from '../../../shared/Types';
import { Modal } from '../../components/modal/Modal';
import { History } from 'history';

export function DisconnectedPage(): Component {
  const history: History = useHistory();

  function goToStart(): void {
    history.push('/');
  }

  return (
    <Modal title="Oops" actions={[{ title: 'OK', onPerform: goToStart }]}>
      <h3>You have been disconnected.</h3>
    </Modal>
  );
}
