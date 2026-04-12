import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { HealthController } from '../../src/modules/health/health.controller';
import { HealthService } from '../../src/modules/health/health.service';
import { ConfigurationModule } from '../../src/common/configuration/configuration.module';
import { HealthResponseDto } from '../../src/modules/health/health.dto';

describe('HealthController (e2e)', () => {
  let app: NestFastifyApplication;

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

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
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
