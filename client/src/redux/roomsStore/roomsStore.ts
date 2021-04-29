import { AnyAction, CaseReducerActions, createSlice, PayloadAction, Reducer, Slice } from '@reduxjs/toolkit';
import { Game } from '../../models/Game';
import { GameStatus } from '../../models/GameStatus';
import { GamingRoom } from '../../models/GamingRoom';
import { Player } from '../../models/Player';
import { Room } from '../../models/Room';
import { initialRoomsState, RoomsState } from './roomsState';

type Reducers = {
  setWaitingRoom(state: RoomsState, action: PayloadAction<{ room: Room }>): RoomsState;
  setRooms(state: RoomsState, action: PayloadAction<{ rooms: GamingRoom[] }>): RoomsState;
  addRoom(state: RoomsState, action: PayloadAction<{ room: GamingRoom }>): RoomsState;
  removeRoom(state: RoomsState, action: PayloadAction<{ room: { id: string } }>): RoomsState;
  addPlayerToRoom(
    state: RoomsState,
    action: PayloadAction<{ room: { id: string; nbPlayers: number }; player: Player }>
  ): RoomsState;
  removePlayerFromRoom(
    state: RoomsState,
    action: PayloadAction<{ room: { id: string; nbPlayers: number }; player: { id: string } }>
  ): RoomsState;
  changeRoomManager(state: RoomsState, action: PayloadAction<{ room: { id: string; managerId: string } }>): RoomsState;
  gameStarted(state: RoomsState, { payload }: PayloadAction<{ room: { id: string; game: Game } }>): RoomsState;
  playerLost(
    state: RoomsState,
    { payload }: PayloadAction<{ room: { id: string; game: { aliveIds: string[]; loserIds: string[] } } }>
  ): RoomsState;
  gameEnded(
    state: RoomsState,
    { payload }: PayloadAction<{ room: { id: string; game: { status: GameStatus } } }>
  ): RoomsState;
};

const roomsSlice: Slice<RoomsState, Reducers, 'rooms'> = createSlice<RoomsState, Reducers, 'rooms'>({
  name: 'rooms',
  initialState: initialRoomsState,
  reducers: {
    setWaitingRoom,
    setRooms,
    addRoom,
    removeRoom,
    addPlayerToRoom,
    removePlayerFromRoom,
    changeRoomManager,
    gameStarted,
    playerLost,
    gameEnded
  }
});

function setWaitingRoom(state: RoomsState, { payload }: PayloadAction<{ room: Room }>): RoomsState {
  return { ...state, waitingRoom: payload.room };
}

function setRooms(state: RoomsState, { payload }: PayloadAction<{ rooms: GamingRoom[] }>): RoomsState {
  return { ...state, rooms: payload.rooms };
}

function addRoom(state: RoomsState, { payload }: PayloadAction<{ room: GamingRoom }>): RoomsState {
  const newRoom: GamingRoom = payload.room;
  if (newRoom.id === state.waitingRoom?.id) {
    return { ...state, waitingRoom: newRoom };
  } else {
    return { ...state, rooms: state.rooms.filter(room => room.id !== newRoom.id).concat(newRoom) };
  }
}

function removeRoom(state: RoomsState, { payload }: PayloadAction<{ room: { id: string } }>): RoomsState {
  return { ...state, rooms: state.rooms.filter(room => room.id !== payload.room.id) };
}

function addPlayerToRoom(
  state: RoomsState,
  { payload }: PayloadAction<{ room: { id: string; nbPlayers: number }; player: Player }>
): RoomsState {
  if (payload.room.id === state.waitingRoom?.id) {
    return {
      ...state,
      waitingRoom: {
        ...state.waitingRoom,
        players: [...state.waitingRoom.players.filter(player => player.id !== payload.player.id), payload.player],
        nbPlayers: payload.room.nbPlayers
      }
    };
  } else {
    return {
      ...state,
      rooms: state.rooms.map(room =>
        room.id !== payload.room.id
          ? room
          : {
              ...room,
              players: [...room.players.filter(player => player.id !== payload.player.id), payload.player],
              nbPlayers: payload.room.nbPlayers
            }
      )
    };
  }
}

function removePlayerFromRoom(
  state: RoomsState,
  { payload }: PayloadAction<{ room: { id: string; nbPlayers: number }; player: { id: string } }>
): RoomsState {
  if (payload.room.id === state.waitingRoom?.id && state.waitingRoom) {
    return {
      ...state,
      waitingRoom: {
        ...state.waitingRoom,
        players: state.waitingRoom.players.filter(player => player.id !== payload.player.id),
        nbPlayers: payload.room.nbPlayers
      }
    };
  } else {
    return {
      ...state,
      rooms: state.rooms.map(room =>
        room.id !== payload.room.id
          ? room
          : {
              ...room,
              players: room.players.filter(player => player.id !== payload.player.id),
              nbPlayers: payload.room.nbPlayers
            }
      )
    };
  }
}

function changeRoomManager(
  state: RoomsState,
  { payload }: PayloadAction<{ room: { id: string; managerId: string } }>
): RoomsState {
  return {
    ...state,
    rooms: state.rooms.map(room =>
      room.id !== payload.room.id ? room : { ...room, managerId: payload.room.managerId }
    )
  };
}

function gameStarted(state: RoomsState, { payload }: PayloadAction<{ room: { id: string; game: Game } }>): RoomsState {
  return {
    ...state,
    rooms: state.rooms.map(room => (room.id !== payload.room.id ? room : { ...room, game: payload.room.game }))
  };
}

function playerLost(
  state: RoomsState,
  { payload }: PayloadAction<{ room: { id: string; game: { aliveIds: string[]; loserIds: string[] } } }>
): RoomsState {
  const aliveIds: string[] = payload.room.game.aliveIds;
  const loserIds: string[] = payload.room.game.loserIds;
  return {
    ...state,
    rooms: state.rooms.map(room =>
      room.id !== payload.room.id ? room : { ...room, game: { ...room.game, aliveIds, loserIds } }
    )
  };
}

function gameEnded(
  state: RoomsState,
  { payload }: PayloadAction<{ room: { id: string; game: { status: GameStatus } } }>
): RoomsState {
  return {
    ...state,
    rooms: state.rooms.map(room =>
      room.id !== payload.room.id
        ? room
        : {
            ...room,
            game: {
              ...room.game,
              aliveIds: [],
              loserIds: room.game.loserIds.concat(room.game.aliveIds),
              status: payload.room.game.status
            }
          }
    )
  };
}

export const roomsReducer: Reducer<RoomsState, AnyAction> = roomsSlice.reducer;
export const roomsActions: CaseReducerActions<Reducers> = roomsSlice.actions;
export default roomsActions;
