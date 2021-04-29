import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from 'src/app.controller';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: []
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const appController: AppController = app.get<AppController>(AppController);
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
