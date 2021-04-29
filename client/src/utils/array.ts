export function nArray(n: number): Array<number> {
  return Array.from({ length: n }, (_value, index) => index);
}
