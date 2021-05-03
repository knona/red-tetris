import { Component } from '../../../shared/Types';
import { RoomList } from './roomList/RoomList';
import { RoomsPageProps } from './RoomsPageProps';
import { WaitingRoom } from './waitingRoom/WaitingRoom';
import './RoomsPage.css';
import { RoomObserver } from '../../components/roomObserver/RoomObserver';
import { AllRoomObserverAction } from '../../components/roomObserver/models/RoomObserverAction';

export function RoomsPage(props: RoomsPageProps): Component {
  return (
    <div className="rooms_page">
      <div className="rooms_container">
        <div className="rooms">
          <div className="room_list" data-testid="room_list">
            <RoomObserver actions={AllRoomObserverAction}>
              <RoomList />
            </RoomObserver>
          </div>
          <div className="sidebar" data-testid="waiting_room">
            <RoomObserver roomId={props.waitingRoom.id} actions={AllRoomObserverAction}>
              <WaitingRoom waitingRoom={props.waitingRoom} />
            </RoomObserver>
          </div>
        </div>
      </div>
    </div>
  );
}
