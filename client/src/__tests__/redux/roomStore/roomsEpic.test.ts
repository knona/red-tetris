import { of, Subject } from 'rxjs';
import {
  createRoomEpic,
  deleteRoomEpic,
  getRoomEpic,
  getRoomsEpic,
  observeAddedRoomEpic,
  observeGameEndEpic,
  observeGameOverEpic,
  observeGameStartEpic,
  observePlayerAddedToRoomEpic,
  observePlayerRemovedFromRoomEpic,
  observeRemovedRoomEpic,
  observeRoomManagerChangesEpic
} from '../../../redux/roomsStore/roomsEpic';
import roomsEpicActions from '../../../redux/roomsStore/roomsEpicActions';
import roomsActions from '../../../redux/roomsStore/roomsStore';
import tetrisActions from '../../../redux/tetrisStore/tetrisStore';
import { emit$, listen$ } from '../../../shared/Socket';
import tests from '../../../utils/tests';

jest.mock('../../../shared/Socket.ts', () => ({
  ...jest.requireActual('../../../shared/Socket.ts'),
  emit$: jest.fn(),
  listen$: jest.fn()
}));

jest.mock('socket.io-client', () => ({
  ...jest.requireActual('socket.io-client'),
  io: jest.fn(() => ({
    on: (): void => {
      return;
    },
    emit: (): void => {
      return;
    }
  }))
}));

describe('Rooms epic', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRoomsEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ rooms: [tests.testGamingRoom()] }));
    });

    it('should return the proper action', done => {
      getRoomsEpic(of(roomsEpicActions.getRooms())).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.setRooms.type);
          done();
        }
      });
    });
  });

  describe('getRoomEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ room: tests.testGamingRoom() }));
    });

    it('should return the proper action', done => {
      getRoomEpic(of(roomsEpicActions.getRoom({ roomId: tests.testGamingRoom().id }))).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.addRoom.type);
          done();
        }
      });
    });
  });

  describe('createRoomEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ room: tests.testGamingRoom() }));
    });

    it('should return the proper action', done => {
      createRoomEpic(of(roomsEpicActions.createRoom({ name: tests.testGamingRoom().name }))).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.addRoom.type);
          done();
        }
      });
    });
  });

  describe('deleteRoomEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = emit$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ roomId: tests.testGamingRoom().id }));
    });

    it('should return the proper action', done => {
      deleteRoomEpic(of(roomsEpicActions.deleteRoom({ roomId: tests.testGamingRoom().id }))).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.removeRoom.type);
          done();
        }
      });
    });
  });

  describe('observeAddedRoomEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = listen$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ room: tests.testGamingRoom() }));
    });

    it('should return the proper action', done => {
      observeAddedRoomEpic(of(roomsEpicActions.observeAddedRoom({ willUnmount$: new Subject<void>() }))).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.addRoom.type);
          done();
        }
      });
    });
  });

  describe('observeRemovedRoomEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = listen$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ room: { id: tests.testGamingRoom().id } }));
    });

    it('should return the proper action', done => {
      observeRemovedRoomEpic(
        of(
          roomsEpicActions.observeRemovedRoom({ roomId: tests.testGamingRoom().id, willUnmount$: new Subject<void>() })
        )
      ).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.removeRoom.type);
          done();
        }
      });
    });
  });

  describe('observePlayerAddedToRoomEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = listen$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(
        of({ room: { id: tests.testGamingRoom().id, nbPlayers: 2 }, player: tests.testPlayer('player_to_add') })
      );
    });

    it('should return the proper action', done => {
      observePlayerAddedToRoomEpic(
        of(
          roomsEpicActions.observePlayerAddedToRoom({
            roomId: tests.testGamingRoom().id,
            willUnmount$: new Subject<void>()
          })
        )
      ).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.addPlayerToRoom.type);
          done();
        }
      });
    });
  });

  describe('observePlayerRemovedFromRoomEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = listen$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(
        of({ room: { id: tests.testGamingRoom().id, nbPlayers: 1 }, player: tests.testPlayer('player_to_remove') })
      );
    });

    it('should return the proper action', done => {
      observePlayerRemovedFromRoomEpic(
        of(
          roomsEpicActions.observePlayerRemovedFromRoom({
            roomId: tests.testGamingRoom().id,
            willUnmount$: new Subject<void>()
          })
        )
      ).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.removePlayerFromRoom.type);
          done();
        }
      });
    });
  });

  describe('observeRoomManagerChangesEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = listen$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ room: { id: tests.testGamingRoom().id, managerId: 'new_manager_id' } }));
    });

    it('should return the proper action', done => {
      observeRoomManagerChangesEpic(
        of(
          roomsEpicActions.observeRoomManagerChanges({
            roomId: tests.testGamingRoom().id,
            willUnmount$: new Subject<void>()
          })
        )
      ).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.changeRoomManager.type);
          done();
        }
      });
    });
  });

  describe('observeGameStartEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = listen$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(
        of({ room: { id: tests.testGamingRoom().id, game: tests.testGame() }, pieces: [] })
      );
    });

    it('should return the proper action', done => {
      observeGameStartEpic(
        of(
          roomsEpicActions.observeRoomGameStart({
            roomId: tests.testGamingRoom().id,
            willUnmount$: new Subject<void>()
          })
        )
      ).subscribe({
        next: action => {
          expect(action.type).toEqual(tetrisActions.start.type || roomsActions.gameStarted.type);
          done();
        }
      });
    });
  });

  describe('observeGameOverEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = listen$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ player: { id: 'player_id' }, room: { id: 'room_id' } }));
    });

    it('should return the proper action', done => {
      observeGameOverEpic(
        of(
          roomsEpicActions.observeRoomGameOver({ roomId: tests.testGamingRoom().id, willUnmount$: new Subject<void>() })
        )
      ).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.playerLost.type);
          done();
        }
      });
    });
  });

  describe('observeGameEndEpic', () => {
    beforeEach(() => {
      const mockedDependency: jest.Mock<any, any> = listen$ as jest.Mock<any, any>;
      mockedDependency.mockReturnValue(of({ player: { id: 'player_id' }, room: { id: 'room_id' } }));
    });

    it('should return the proper action', done => {
      observeGameEndEpic(
        of(
          roomsEpicActions.observeRoomGameEnd({ roomId: tests.testGamingRoom().id, willUnmount$: new Subject<void>() })
        )
      ).subscribe({
        next: action => {
          expect(action.type).toEqual(roomsActions.gameEnded.type);
          done();
        }
      });
    });
  });
});
