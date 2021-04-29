import { Player } from '../models/Player';
import { GamingRoom } from '../models/GamingRoom';
import { Piece } from '../models/Piece';
import { Playfield } from '../models/Playfield';
import { Game } from '../models/Game';
import { GameStatus } from '../models/GameStatus';

export enum ClientEvent {
  test = ':test',
  connection = ':connection',
  getRooms = ':get_rooms',
  getRoom = ':get_room',
  createRoom = ':create_room',
  deleteRoom = ':delete_room',
  joinRoom = ':join_room',
  joinWaitingRoom = ':join_waiting_room',
  startGame = ':start_game',
  nextPieces = ':next_pieces',
  updatePlayerGame = ':update_player_game',
  gameOver = ':game_over'
}

type ClientEventParametersInterface = {
  [key in ClientEvent]: { arguments?: object; response?: object };
};

export interface ClientEventParameters extends ClientEventParametersInterface {
  [ClientEvent.test]: {
    arguments: { message: string };
    response: { incoming: { message: string } };
  };
  [ClientEvent.connection]: {
    arguments: { username: string };
    response: { player: Player; room: GamingRoom };
  };
  [ClientEvent.getRooms]: {
    arguments: undefined;
    response: { rooms: GamingRoom[] };
  };
  [ClientEvent.getRoom]: {
    arguments: { roomId: string };
    response: { room: GamingRoom };
  };
  [ClientEvent.createRoom]: {
    arguments: { name: string };
    response: { room: GamingRoom };
  };
  [ClientEvent.deleteRoom]: {
    arguments: { roomId: string };
    response: undefined;
  };
  [ClientEvent.joinRoom]: {
    arguments: { roomId: string };
    response: undefined;
  };
  [ClientEvent.joinWaitingRoom]: {
    arguments: undefined;
    response: undefined;
  };
  [ClientEvent.startGame]: {
    arguments: undefined;
    response: undefined;
  };
  [ClientEvent.nextPieces]: {
    arguments: undefined;
    response: undefined;
  };
  [ClientEvent.updatePlayerGame]: {
    arguments: { piece?: Piece; playfield?: Playfield; deletedLines?: number };
    response: undefined;
  };
  [ClientEvent.gameOver]: {
    arguments: undefined;
    response: undefined;
  };
}

export enum ServerEvent {
  roomCreated = 'room_created',
  roomDeleted = 'room_deleted',
  playerJoined = 'player_joined',
  playerLeft = 'player_left',
  roomManagerChanged = 'room_manager_changed',
  gameStart = 'game_start',
  gameEnd = 'game_end',
  gameOver = 'game_over',
  nextPieces = 'next_pieces',
  updatePlayerGame = 'update_player_game',
  attack = 'attack'
}

type ServerEventResponsesInterface = {
  [key in ServerEvent]: object;
};

export interface ServerEventResponses extends ServerEventResponsesInterface {
  [ServerEvent.playerJoined]: {
    room: { id: string; nbPlayers: number };
    player: Player;
  };
  [ServerEvent.playerLeft]: {
    room: { id: string; nbPlayers: number };
    player: { id: string };
  };
  [ServerEvent.roomCreated]: {
    room: GamingRoom;
  };
  [ServerEvent.roomDeleted]: {
    room: { id: string };
  };
  [ServerEvent.roomManagerChanged]: {
    room: { id: string; managerId: string };
  };
  [ServerEvent.gameStart]: {
    room: { id: string; game: Game };
    pieces: Piece[];
  };
  [ServerEvent.gameEnd]: {
    room: { id: string; game: { status: GameStatus } };
  };
  [ServerEvent.gameOver]: {
    player: { id: string };
    room: { id: string; game: { aliveIds: string[]; loserIds: string[] } };
  };
  [ServerEvent.nextPieces]: {
    room: { id: string };
    pieces: Piece[];
  };
  [ServerEvent.updatePlayerGame]: {
    room: { id: string };
    player: { id: string };
    piece?: Piece;
    playfield?: Playfield;
  };
  [ServerEvent.attack]: {
    room: { id: string };
    nLines: number;
  };
}
