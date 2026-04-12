import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { ChatDto } from '../../src/modules/chats/chat.dto';
import { ChatEntity } from '../../src/modules/chats/chat.entity';
import { ChatsController } from '../../src/modules/chats/chats.controller';
import { ChatsService } from '../../src/modules/chats/chats.service';

const mockChat: ChatEntity = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  summary: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('ChatsController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        ChatsService,
        {
          provide: getRepositoryToken(ChatEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /chats', () => {
    it('should create a chat and return 201', async () => {
      mockRepository.create.mockReturnValue(mockChat);
      mockRepository.save.mockResolvedValue(mockChat);

      return request(app.getHttpServer())
        .post('/chats')
        .send({
          characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as ChatDto;
          expect(body.id).toBe(mockChat.id);
          expect(body.characterIds).toEqual(mockChat.characterIds);
          expect(body.summary).toBeNull();
        });
    });

    it('should return 400 when characterIds is empty', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .send({ characterIds: [] })
        .expect(400);
    });

    it('should return 400 when characterIds contains invalid UUIDs', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .send({ characterIds: ['not-a-uuid'] })
        .expect(400);
    });

    it('should return 400 when body is empty', () => {
      return request(app.getHttpServer()).post('/chats').send({}).expect(400);
    });
  });
});
