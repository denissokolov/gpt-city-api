import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ConfigurationService } from '../common/configuration/configuration.service';

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
        {
          provide: DataSource,
          useValue: { query: jest.fn().mockResolvedValue([{ '?column?': 1 }]) },
        },
      ],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return status ok with version and time', async () => {
      const result = await healthController.check();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('0.0.1');
      expect(result.database).toBe('ok');
      expect(new Date(result.time).toISOString()).toBe(result.time);
    });
  });
});
