import { Game } from '../models/Game';
import { GameStatus } from '../models/GameStatus';
import { GamingRoom } from '../models/GamingRoom';
import { generatePiece, Piece } from '../models/Piece';
import { PieceDirection } from '../models/PieceDirection';
import { PieceType } from '../models/PieceType';
import { Player } from '../models/Player';
import { Playfield } from '../models/Playfield';
import { Room, RoomType } from '../models/Room';
import { Size } from '../models/Size';
import { move } from '../tetris/PieceMovement';
import { canPutPiece } from '../tetris/PiecePosition';
import { EMPTY_PLAYFIELD } from './constants';

function testPlayer(id: string = 'player_id'): Player {
  return {
    id: id,
    username: id
  };
}

function testWaitingRoom({ players = [testPlayer()] }: { players?: Player[] } = {}): Room {
  return {
    id: 'waiting_room_id',
    name: 'waitingRoom',
    nbPlayers: players.length,
    players: players,
    type: RoomType.WaitingRoom
  };
}

function testGamingRoom({
  id = 'room_id',
  name = 'test_room',
  player = testPlayer(),
  players = [],
  game = testGame({})
}: {
  id?: string;
  name?: string;
  player?: Player;
  players?: Player[];
  game?: Game;
} = {}): GamingRoom {
  const playersArray: Player[] = [...(players ?? []), player];
  return {
    id: id,
    name: name,
    nbPlayers: playersArray.length,
    players: playersArray,
    type: RoomType.GamingRoom,
    managerId: player.id,
    maxPlayer: 13,
    game: game
  };
}

function testPiece(type: PieceType): Piece {
  return generatePiece(type);
}

function testPlayfield(): Playfield {
  return EMPTY_PLAYFIELD;
}

function testGame({
  status = GameStatus.finished,
  players = [],
  playerIds = [],
  loserIds = []
}: {
  status?: GameStatus;
  players?: Player[];
  playerIds?: string[];
  loserIds?: string[];
} = {}): Game {
  return {
    status: status,
    players: players,
    aliveIds: playerIds,
    loserIds: loserIds
  };
}

function pieceSize(piece: Piece): Size {
  let defaultPieceSize: Size;
  switch (piece.type) {
    case PieceType.I:
      defaultPieceSize = { width: 4, height: 1 };
      break;
    case PieceType.O:
      defaultPieceSize = { width: 2, height: 2 };
      break;
    default:
      defaultPieceSize = { width: 3, height: 2 };
      break;
  }
  if (piece.rotation % 2 !== 0) {
    return { width: defaultPieceSize.height, height: defaultPieceSize.width };
  }
  return defaultPieceSize;
}

function moveMax(direction: PieceDirection, piece: Piece, playfield: Playfield): Piece {
  let movedPiece: Piece = piece;
  while (canPutPiece(move(direction, movedPiece), playfield)) {
    movedPiece = move(direction, movedPiece);
  }
  return movedPiece;
}

function repeat(count: number, action: () => void): void {
  for (let index: number = 0; index < count; index++) {
    action();
  }
}

export default {
  testPlayer,
  testWaitingRoom,
  testGamingRoom,
  testPiece,
  testPlayfield,
  testGame,
  pieceSize,
  moveMax,
  repeat
};
