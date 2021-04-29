export interface Point {
  x: number;
  y: number;
}

export function arePointsEqual(lhs: Point, rhs: Point): boolean {
  return lhs.x === rhs.x && lhs.y === rhs.y;
}
