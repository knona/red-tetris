import { playerNumberString } from '../../utils/strings';

describe('player number string', () => {
  it('should display no player if nbPlayer == 0', () => {
    expect(playerNumberString(0)).toEqual('No player');
  });

  it('should display the player number in the singular', () => {
    expect(playerNumberString(1)).toEqual('1 Player');
  });

  it('should display the player number in the plural', () => {
    expect(playerNumberString(2)).toEqual('2 Players');
  });
});
