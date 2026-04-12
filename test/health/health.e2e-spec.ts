import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { HealthController } from '../../src/health/health.controller';
import { HealthService } from '../../src/health/health.service';
import { ConfigurationModule } from '../../src/common/configuration/configuration.module';
import { HealthResponseDto } from '../../src/health/health.dto';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigurationModule],
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: DataSource,
          useValue: { query: jest.fn().mockResolvedValue([{ '?column?': 1 }]) },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as HealthResponseDto;
        expect(body.status).toBe('ok');
        expect(body.version).toBe('0.0.1');
        expect(body.database).toBe('ok');
        expect(new Date(body.time).toISOString()).toBe(body.time);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
