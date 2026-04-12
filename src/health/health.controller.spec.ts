import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ConfigurationService } from '../configuration/configuration.service';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: ConfigurationService,
          useValue: { getServerVersion: () => '0.0.1' },
        },
      ],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return status ok with version and time', () => {
      const result = healthController.check();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('0.0.1');
      expect(new Date(result.time).toISOString()).toBe(result.time);
    });
  });
});
