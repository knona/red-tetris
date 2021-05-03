export enum RoomObserverAction {
  addedRoom = 'addedRoom',
  removedRoom = 'removedRoom',
  playerAddedToRoom = 'playerAddedToRoom',
  playerRemovedFromRoom = 'playerRemovedFromRoom',
  managerChanged = 'managerChanged',
  roomGameStart = 'roomGameStart',
  roomGameOver = 'roomGameOver',
  roomGameEnd = 'roomGameEnd'
}

export const AllRoomObserverAction: RoomObserverAction[] = Object.values(RoomObserverAction);
