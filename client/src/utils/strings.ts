export function playerNumberString(nbPlayers: number): string {
  if (nbPlayers === 0) {
    return 'No player';
  } else if (nbPlayers === 1) {
    return '1 Player';
  } else {
    return `${nbPlayers} Players`;
  }
}
