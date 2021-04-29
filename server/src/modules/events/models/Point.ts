export class Point {
  public constructor(public x: number, public y: number) {}

  public isEqualTo(point: Point): boolean {
    return point.x === this.x && point.y === this.y;
  }
}
