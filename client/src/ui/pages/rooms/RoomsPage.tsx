import { Component } from '../../../shared/Types';
import { RoomList } from './roomList/RoomList';
import { RoomsPageProps } from './RoomsPageProps';
import { WaitingRoom } from './waitingRoom/WaitingRoom';
import './RoomsPage.css';

export function RoomsPage(props: RoomsPageProps): Component {
  return (
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
  );
}
