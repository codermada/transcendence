import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckController } from './health-check.controller.js';
import { HealthCheckService } from './health-check.service.js';

describe('HealthCheckController', () => {
  let appController: HealthCheckController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [HealthCheckService],
    }).compile();

    appController = app.get<HealthCheckController>(HealthCheckController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
