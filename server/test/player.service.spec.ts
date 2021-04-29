/* eslint-disable */
import { Test } from '@nestjs/testing';
import { EventException } from '../src/modules/events/exceptions/event.exception';
import { PlayerService } from '../src/modules/events/player.service';

describe('Room Service', () => {
  let playerService: PlayerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [PlayerService] }).compile();
    await moduleRef.init();
    playerService = await moduleRef.resolve<PlayerService>(PlayerService);
  });

  describe('isPlayerConnected', () => {
    it('should return false', async () => {
      expect(playerService.isPlayerConnected('hello')).toBeFalsy();
    });

    it('should return true', async () => {
      const socketId = 'abcdef';
      playerService.connection('superuser', socketId);
      expect(playerService.isPlayerConnected(socketId)).toBeTruthy();
    });
  });

  describe('getPlayer', () => {
    it('should throw an error', async () => {
      expect(() => playerService.getPlayer('hello')).toThrow(EventException);
    });

    it('should return the player', async () => {
      const socketId = 'abcdef';
      const player = playerService.connection('superuser', socketId);
      expect(playerService.getPlayer(socketId)).toStrictEqual(player);
    });
  });

  describe('connection', () => {
    it('should add the player to the player list', async () => {
      const socketId = 'abcdef';
      const player = playerService.connection('superuser', socketId);
      expect(playerService.players[socketId]).toBe(player);
    });
  });

  describe('disconnection', () => {
    it('should remove the player from the list', async () => {
      const socketId = 'abcdef';
      playerService.connection('superuser', socketId);
      expect(playerService.isPlayerConnected('abcdef')).toBeTruthy();
      playerService.disconnection(socketId);
      expect(playerService.isPlayerConnected('abcdef')).toBeFalsy();
    });
  });
});
