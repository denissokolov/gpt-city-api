import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { CharacterFacade } from '../../src/modules/characters/character.facade';
import { ChatDto } from '../../src/modules/chats/chat.dto';
import { ChatEntity } from '../../src/modules/chats/chat.entity';
import { ChatPromptHelper } from '../../src/modules/chats/chatPrompt.helper';
import { ChatsController } from '../../src/modules/chats/chats.controller';
import { ChatsService } from '../../src/modules/chats/chats.service';
import { MessageEntity } from '../../src/modules/chats/message.entity';
import { LocationFacade } from '../../src/modules/locations/location.facade';

const mockChat = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
  characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  summary: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as ChatEntity;

const mockChatRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockMessageRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockCharacterFacade = {
  findByIds: jest.fn(),
};

const mockLocationFacade = {
  findPlace: jest.fn(),
};

const mockChatPromptHelper = {
  buildSystemPrompt: jest.fn(),
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
          useValue: mockChatRepository,
        },
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: mockMessageRepository,
        },
        {
          provide: CharacterFacade,
          useValue: mockCharacterFacade,
        },
        {
          provide: LocationFacade,
          useValue: mockLocationFacade,
        },
        {
          provide: ChatPromptHelper,
          useValue: mockChatPromptHelper,
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
      mockLocationFacade.findPlace.mockResolvedValue({ id: mockChat.placeId });
      mockCharacterFacade.findByIds.mockResolvedValue(
        mockChat.characterIds.map((id) => ({ id })),
      );
      mockChatRepository.create.mockReturnValue(mockChat);
      mockChatRepository.save.mockResolvedValue(mockChat);

      return request(app.getHttpServer())
        .post('/chats')
        .send({
          characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
          placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as ChatDto;
          expect(body.id).toBe(mockChat.id);
          expect(body.characterIds).toEqual(mockChat.characterIds);
          expect(body.placeId).toBe(mockChat.placeId);
          expect(body.summary).toBeNull();
        });
    });

    it('should return 404 when the place does not exist', async () => {
      mockLocationFacade.findPlace.mockRejectedValue(
        new NotFoundException('Place not found'),
      );

      return request(app.getHttpServer())
        .post('/chats')
        .send({
          characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
          placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
        })
        .expect(404);
    });

    it('should return 404 when a characterId does not exist', async () => {
      mockLocationFacade.findPlace.mockResolvedValue({ id: mockChat.placeId });
      mockCharacterFacade.findByIds.mockResolvedValue([]);

      return request(app.getHttpServer())
        .post('/chats')
        .send({
          characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
          placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
        })
        .expect(404);
    });

    it('should return 400 when placeId is missing', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .send({ characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] })
        .expect(400);
    });

    it('should return 400 when characterIds is empty', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .send({
          characterIds: [],
          placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
        })
        .expect(400);
    });

    it('should return 400 when characterIds contains invalid UUIDs', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .send({
          characterIds: ['not-a-uuid'],
          placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
        })
        .expect(400);
    });

    it('should return 400 when placeId is not a valid UUID', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .send({
          characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
          placeId: 'not-a-uuid',
        })
        .expect(400);
    });

    it('should return 400 when body is empty', () => {
      return request(app.getHttpServer()).post('/chats').send({}).expect(400);
    });
  });
});
