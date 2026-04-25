import type { ServerResponse } from 'node:http';

import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { CharacterFacade } from '../../src/modules/characters/character.facade';
import { ChatActivity } from '../../src/modules/chats/chat.activity.enum';
import { ChatDto } from '../../src/modules/chats/chat.dto';
import { ChatEntity } from '../../src/modules/chats/chat.entity';
import { ChatsController } from '../../src/modules/chats/chats.controller';
import { ChatsService } from '../../src/modules/chats/chats.service';
import { MessageEntity } from '../../src/modules/chats/message.entity';
import { MessageRole } from '../../src/modules/chats/message.enum';
import { LocationFacade } from '../../src/modules/locations/location.facade';
import { UserFacade } from '../../src/modules/users/user.facade';
import { PromptsService } from '../../src/common/prompts/prompts.service';

const mockStreamText = jest.fn();
const mockGenerateText = jest.fn();

jest.mock('ai', () => ({
  streamText: (...args: unknown[]) =>
    (mockStreamText as (...args: unknown[]) => unknown)(...args),
  generateText: (...args: unknown[]) =>
    (mockGenerateText as (...args: unknown[]) => unknown)(...args),
}));

const mockChat = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
  userId: 'c3d4e5f6-a7b8-4012-bdef-123456789012',
  characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  summary: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as ChatEntity;

const mockChatRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
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
  findMemory: jest.fn(),
  updateMemory: jest.fn(),
};

const mockLocationFacade = {
  findPlace: jest.fn(),
};

const mockUserFacade = {
  findOne: jest.fn(),
};

const mockPromptsService = {
  render: jest.fn(),
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
          provide: UserFacade,
          useValue: mockUserFacade,
        },
        {
          provide: PromptsService,
          useValue: mockPromptsService,
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
    const validUserId = 'c3d4e5f6-a7b8-4012-bdef-123456789012';
    const validBody = {
      characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
      placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
    };

    it('should create a chat and return 201', async () => {
      mockLocationFacade.findPlace.mockResolvedValue({ id: mockChat.placeId });
      mockUserFacade.findOne.mockResolvedValue({ id: mockChat.userId });
      mockCharacterFacade.findByIds.mockResolvedValue(
        mockChat.characterIds.map((id) => ({ id })),
      );
      mockChatRepository.create.mockReturnValue(mockChat);
      mockChatRepository.save.mockResolvedValue(mockChat);

      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send(validBody)
        .expect(201)
        .expect((res) => {
          const body = res.body as ChatDto;
          expect(body.id).toBe(mockChat.id);
          expect(body.characterIds).toEqual(mockChat.characterIds);
          expect(body.placeId).toBe(mockChat.placeId);
          expect(body.userId).toBe(mockChat.userId);
          expect(body.summary).toBeNull();
        });
    });

    it('should return 404 when the place does not exist', async () => {
      mockLocationFacade.findPlace.mockRejectedValue(
        new NotFoundException('Place not found'),
      );

      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send(validBody)
        .expect(404);
    });

    it('should return 404 when the user does not exist', async () => {
      mockLocationFacade.findPlace.mockResolvedValue({ id: mockChat.placeId });
      mockUserFacade.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send(validBody)
        .expect(404);
    });

    it('should return 404 when a characterId does not exist', async () => {
      mockLocationFacade.findPlace.mockResolvedValue({ id: mockChat.placeId });
      mockUserFacade.findOne.mockResolvedValue({ id: mockChat.userId });
      mockCharacterFacade.findByIds.mockResolvedValue([]);

      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send(validBody)
        .expect(404);
    });

    it('should return 400 when placeId is missing', () => {
      const body = { ...validBody };
      delete (body as Partial<typeof validBody>).placeId;
      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send(body)
        .expect(400);
    });

    it('should return 400 when x-user-id header is missing', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .send(validBody)
        .expect(400);
    });

    it('should return 400 when x-user-id header is not a valid UUID', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', 'not-a-uuid')
        .send(validBody)
        .expect(400);
    });

    it('should return 400 when characterIds is empty', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send({ ...validBody, characterIds: [] })
        .expect(400);
    });

    it('should return 400 when characterIds contains invalid UUIDs', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send({ ...validBody, characterIds: ['not-a-uuid'] })
        .expect(400);
    });

    it('should return 400 when placeId is not a valid UUID', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send({ ...validBody, placeId: 'not-a-uuid' })
        .expect(400);
    });

    it('should return 400 when body is empty', () => {
      return request(app.getHttpServer())
        .post('/chats')
        .set('x-user-id', validUserId)
        .send({})
        .expect(400);
    });
  });

  describe('POST /chats/:id/message', () => {
    const validUserId = 'c3d4e5f6-a7b8-4012-bdef-123456789012';
    const validLocale = 'en-US';
    const characterId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    const mockCharacter = {
      id: characterId,
      provider: 'openai',
      model: 'gpt-4o',
    };

    const mockChatWithRelations = {
      ...mockChat,
      place: {
        id: mockChat.placeId,
        name: 'Central Library',
        description: 'A quiet library.',
        location: {
          id: 'l1',
          name: 'Downtown',
          description: 'Bustling.',
          locale: 'en-US',
        },
      },
    } as unknown as ChatEntity;

    function setupHappyPath(history: MessageEntity[] = []) {
      mockChatRepository.findOne.mockResolvedValue(mockChatWithRelations);
      mockChatRepository.find.mockResolvedValue([]);
      mockChatRepository.update.mockResolvedValue({ affected: 1 });
      mockUserFacade.findOne.mockResolvedValue({ id: mockChat.userId });
      mockMessageRepository.find.mockResolvedValue(history);
      mockMessageRepository.create.mockImplementation(
        (input: Partial<MessageEntity>) => input as MessageEntity,
      );
      mockMessageRepository.save.mockImplementation(
        (entity: MessageEntity) =>
          ({
            ...entity,
            id: 'msg-id',
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
            updatedAt: new Date('2026-01-02T00:00:00.000Z'),
          }) as MessageEntity,
      );
      mockCharacterFacade.findByIds.mockResolvedValue([mockCharacter]);
      mockCharacterFacade.findMemory.mockResolvedValue(null);
      mockCharacterFacade.updateMemory.mockResolvedValue(undefined);
      mockPromptsService.render.mockReturnValue('rendered prompt');
      mockStreamText.mockImplementation(() => ({
        pipeUIMessageStreamToResponse: (res: ServerResponse) => {
          res.writeHead(200, { 'content-type': 'text/event-stream' });
          res.end('streamed-body');
        },
      }));
      mockGenerateText.mockResolvedValue({ text: 'summary' });
    }

    it('should stream a response when only message is sent', async () => {
      setupHappyPath();

      await request(app.getHttpServer())
        .post(`/chats/${mockChat.id}/message`)
        .set('x-user-id', validUserId)
        .set('x-locale', validLocale)
        .send({ message: 'Hello' })
        .expect(200);

      const savedRoles = mockMessageRepository.create.mock.calls.map(
        ([input]: [Partial<MessageEntity>]) => input.role,
      );
      expect(savedRoles).toContain(MessageRole.User);
      expect(savedRoles).not.toContain(MessageRole.System);
    });

    it('should stream a response and persist a system silence message when only activity is sent', async () => {
      const lastMessageDate = new Date(Date.now() - 5 * 60 * 1000);
      setupHappyPath([
        {
          id: 'prev-msg',
          chatId: mockChat.id,
          userId: mockChat.userId,
          role: MessageRole.Assistant,
          content: 'Earlier message',
          characterId,
          createdAt: lastMessageDate,
          updatedAt: lastMessageDate,
        } as MessageEntity,
      ]);

      await request(app.getHttpServer())
        .post(`/chats/${mockChat.id}/message`)
        .set('x-user-id', validUserId)
        .set('x-locale', validLocale)
        .send({ activity: ChatActivity.Silence })
        .expect(200);

      const createCalls = mockMessageRepository.create.mock.calls.map(
        ([input]: [Partial<MessageEntity>]) => input,
      );
      const systemMessage = createCalls.find(
        (c: Partial<MessageEntity>) => c.role === MessageRole.System,
      );
      expect(systemMessage).toBeDefined();
      expect(systemMessage?.content).toMatch(
        /^<activity type="silence" durationSeconds="\d+" \/>$/,
      );
      expect(systemMessage?.characterId).toBeNull();
      expect(
        createCalls.some(
          (c: Partial<MessageEntity>) => c.role === MessageRole.User,
        ),
      ).toBe(false);

      const streamCallArgs = mockStreamText.mock.calls[0] as [
        { messages: { role: string; content: string }[] },
      ];
      const streamArgs = streamCallArgs[0];
      const lastMessage = streamArgs.messages[streamArgs.messages.length - 1];
      expect(lastMessage.role).toBe(MessageRole.User);
      expect(lastMessage.content).toMatch(/^<activity type="silence"/);
    });

    it('should persist both system and user messages when message and activity are sent together', async () => {
      setupHappyPath();

      await request(app.getHttpServer())
        .post(`/chats/${mockChat.id}/message`)
        .set('x-user-id', validUserId)
        .set('x-locale', validLocale)
        .send({ message: 'Hi', activity: ChatActivity.Silence })
        .expect(200);

      const savedRoles = mockMessageRepository.create.mock.calls.map(
        ([input]: [Partial<MessageEntity>]) => input.role,
      );
      expect(savedRoles).toContain(MessageRole.System);
      expect(savedRoles).toContain(MessageRole.User);
    });

    it('should return 400 when neither message nor activity is provided', () => {
      return request(app.getHttpServer())
        .post(`/chats/${mockChat.id}/message`)
        .set('x-user-id', validUserId)
        .set('x-locale', validLocale)
        .send({})
        .expect(400);
    });

    it('should return 400 when activity is not a known enum value', () => {
      return request(app.getHttpServer())
        .post(`/chats/${mockChat.id}/message`)
        .set('x-user-id', validUserId)
        .set('x-locale', validLocale)
        .send({ activity: 'unknown-activity' })
        .expect(400);
    });

    it('should return 400 when message is sent as an empty string alongside activity', () => {
      return request(app.getHttpServer())
        .post(`/chats/${mockChat.id}/message`)
        .set('x-user-id', validUserId)
        .set('x-locale', validLocale)
        .send({ message: '', activity: ChatActivity.Silence })
        .expect(400);
    });

    it('should return 400 when x-locale is missing', () => {
      return request(app.getHttpServer())
        .post(`/chats/${mockChat.id}/message`)
        .set('x-user-id', validUserId)
        .send({ activity: ChatActivity.Silence })
        .expect(400);
    });
  });
});
