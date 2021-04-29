import { Piece } from '../models/Piece';
import { Playfield } from '../models/Playfield';
import { Point } from '../models/Point';
import { PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT, PLAYFIELD_BUFFER } from '../utils/constants';
import { translate } from './PieceMovement';
import { playfieldPosition } from './PiecePosition';

function addPiece(piece: Piece, playfieldCopy: Playfield): void {
  playfieldPosition(piece)
    .filter(point => point.x >= 0 && point.y >= 0)
    .forEach(point => {
      playfieldCopy[point.y][point.x] = piece.type;
    });
}

function clearCompletedLines(piece: Piece, playfieldCopy: Playfield): number {
  return uniquePointsByY(piece)
    .map(point => point.y)
    .filter(lineIndex => isLineCompleted(lineIndex, playfieldCopy))
    .sort((lineIndexA, lineIndexB) => lineIndexA - lineIndexB)
    .reduce((acc, cur) => acc + clearLine(cur, playfieldCopy), 0);
}

function clearLine(lineIndex: number, playfieldCopy: Playfield): number {
  for (let i: number = lineIndex; i > 0; i--) {
    playfieldCopy[i] = playfieldCopy[i - 1];
  }
  playfieldCopy[0] = new Array(PLAYFIELD_WIDTH).fill('');
  return 1;
}

function uniquePointsByY(piece: Piece): Point[] {
  const points: Point[] = playfieldPosition(piece);
  return playfieldPosition(piece).filter(
    (point, index) => index === 0 || points.slice(0, index).every(p => p.y !== point.y)
  );
}

function isLineCompleted(lineIndex: number, playfield: Playfield): boolean {
  return playfield[lineIndex].every(cell => cell !== '');
}

export function putPiece(piece: Piece, playfield: Playfield): { playfield: Playfield; deletedLines: number } {
  const playfieldCopy: Playfield = Array.from(playfield, row => Array.from(row, col => col));
  addPiece(piece, playfieldCopy);
  const deletedLines: number = clearCompletedLines(piece, playfieldCopy);
  return { playfield: playfieldCopy, deletedLines };
}

function shouldTranslateTop(piece: Piece, playfield: Playfield): boolean {
  const [res1, res2]: [boolean, boolean] = playfieldPosition(piece).reduce(
    ([every, some], point) => [every && point.y > 0, some || playfield[point.y][point.x] !== ''],
    [true, false] as [boolean, boolean]
  );
  return res1 && res2;
}

export function addGarbageLines(
  piece: Piece,
  playfield: Playfield,
  nLines: number
): { piece: Piece; playfield: Playfield; isGameOver: boolean } {
  const playfieldCopy: Playfield = Array.from(playfield, row => Array.from(row, col => col));
  for (let i: number = 0; i < PLAYFIELD_HEIGHT - nLines; i++) {
    playfieldCopy[i] = playfieldCopy[i + nLines];
  }
  const randCell: number = Math.floor(Math.random() * (PLAYFIELD_WIDTH - 2)) + 1;
  for (let i: number = PLAYFIELD_HEIGHT - nLines; i < PLAYFIELD_HEIGHT; i++) {
    playfieldCopy[i] = new Array(PLAYFIELD_WIDTH).fill('X');
    playfieldCopy[i][randCell] = '';
  }
  let newPiece: Piece = translate(piece, { x: 0, y: 0 });
  while (shouldTranslateTop(newPiece, playfieldCopy)) {
    newPiece = translate(newPiece, { x: 0, y: 1 });
  }
  const playfieldOverflow: boolean = playfield[nLines + PLAYFIELD_BUFFER - 1].some(cell => cell !== '');
  const pieceOverflow: boolean = playfieldPosition(newPiece).some(point => playfieldCopy[point.y][point.x] !== '');
  return { piece: newPiece, playfield: playfieldCopy, isGameOver: playfieldOverflow || pieceOverflow };
}
