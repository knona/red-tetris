import { Component } from '../../../shared/Types';
import { AllRoomObserverAction } from '../../components/roomObserver/models/RoomObserverAction';
import { RoomObserver } from '../../components/roomObserver/RoomObserver';
import { RoomList } from './roomList/RoomList';
import './RoomsPage.css';
import { RoomsPageProps } from './RoomsPageProps';
import { WaitingRoom } from './waitingRoom/WaitingRoom';

export function RoomsPage(props: RoomsPageProps): Component {
  return (
    <RoomObserver roomId={props.waitingRoom.id} actions={AllRoomObserverAction}>
      <div className="rooms_page">
        <div className="rooms_container">
          <div className="rooms">
            <div className="room_list" data-testid="room_list">
              <RoomList />
            </div>
            <div className="sidebar" data-testid="waiting_room">
              <WaitingRoom waitingRoom={props.waitingRoom} />
            </div>
          </div>
        </div>
      </div>
    </RoomObserver>
  );
}
