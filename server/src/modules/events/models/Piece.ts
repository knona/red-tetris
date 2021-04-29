import { Point } from './Point';

export enum PieceType {
  'I' = 'I',
  'O' = 'O',
  'T' = 'T',
  'S' = 'S',
  'Z' = 'Z',
  'J' = 'J',
  'L' = 'L'
}

export interface PieceJSON {
  type: PieceType;
  point: Point;
  points: Point[];
  rotation: number;
}

/**
 * La zone de jeu fait 10x20 lignes
 * Les tetrominos apparaissent sur les lignes 19 / 20
 */
export class Piece {
  private _type: PieceType;
  private _point: Point;
  private _points: Point[];
  private _rotation: number;

  public constructor(type: PieceType, point: Point, points: Point[], rotation: number) {
    this._type = type;
    this._point = point;
    this._points = points;
    this._rotation = rotation;
  }

  public get type(): PieceType {
    return this._type;
  }

  public get point(): Point {
    return this._point;
  }

  public get points(): Point[] {
    return this._points;
  }

  public get rotation(): number {
    return this._rotation;
  }

  public rotateLeft(): void {
    this._points = this._points.map(point => new Point(-point.y, point.x));
    this._rotation = (this._rotation - 1 + 4) % 4;
  }

  public rotateRight(): void {
    this._points = this._points.map(point => new Point(point.y, -point.x));
    this._rotation = (this._rotation + 1) % 4;
  }

  public static generate(type: PieceType, point?: Point): Piece {
    let points: Point[];

    switch (type) {
      case PieceType.I:
        if (!point) {
          point = new Point(5.5, 18.5);
        }
        points = [new Point(-1.5, 0.5), new Point(-0.5, 0.5), new Point(0.5, 0.5), new Point(1.5, 0.5)];
        break;
      case PieceType.O:
        if (!point) {
          point = new Point(5.5, 19.5);
        }
        points = [new Point(-0.5, 0.5), new Point(0.5, 0.5), new Point(-0.5, -0.5), new Point(0.5, -0.5)];
        break;
      case PieceType.T:
        points = [new Point(0, 1), new Point(-1, 0), new Point(0, 0), new Point(1, 0)];
        break;
      case PieceType.S:
        points = [new Point(0, 1), new Point(1, 1), new Point(-1, 0), new Point(0, 0)];
        break;
      case PieceType.Z:
        points = [new Point(-1, 1), new Point(0, 1), new Point(0, 0), new Point(1, 0)];
        break;
      case PieceType.J:
        points = [new Point(-1, 1), new Point(-1, 0), new Point(0, 0), new Point(1, 0)];
        break;
      case PieceType.L:
        points = [new Point(1, 1), new Point(-1, 0), new Point(0, 0), new Point(1, 0)];
        break;
    }
    return new Piece(type, point ?? new Point(5, 19), points, 0);
  }

  public static getRandomBag(): Piece[] {
    const indexes: number[] = Array.from({ length: 7 }, (_v, index) => index);
    const randomIndexes: number[] = [];
    while (indexes.length !== 0) {
      const random: number = Math.floor(Math.random() * indexes.length);
      randomIndexes.push(...indexes.splice(random, 1));
    }
    const pieceTypesArray: PieceType[] = Object.values(PieceType);
    return randomIndexes.map(index => Piece.generate(pieceTypesArray[index]));
  }

  public static getMultipleBag(nb: number): Piece[] {
    const pieces: Piece[] = [];

    for (let i: number = 0; i < nb; i++) {
      pieces.push(...this.getRandomBag());
    }
    return pieces;
  }

  public static fromJSON(pieceJSON: PieceJSON): Piece {
    return new Piece(pieceJSON.type, pieceJSON.point, pieceJSON.points, pieceJSON.rotation);
  }

  public toJSON(): PieceJSON {
    return {
      type: this._type,
      point: this._point,
      points: this._points,
      rotation: this._rotation
    };
  }
}
