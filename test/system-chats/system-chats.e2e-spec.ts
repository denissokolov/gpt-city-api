import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { ConfigurationModule } from '../../src/common/configuration/configuration.module';
import { PromptsService } from '../../src/common/prompts/prompts.service';
import { JwtStrategy } from '../../src/modules/auth/jwt.strategy';
import {
  SystemChatDto,
  SystemMessageDto,
} from '../../src/modules/systemChats/systemChat.dto';
import { SystemChatEntity } from '../../src/modules/systemChats/systemChat.entity';
import { SystemMessageEntity } from '../../src/modules/systemChats/systemMessage.entity';
import { SystemMessageRole } from '../../src/modules/systemChats/systemMessage.enum';
import { SystemChatsController } from '../../src/modules/systemChats/systemChats.controller';
import { SystemChatsService } from '../../src/modules/systemChats/systemChats.service';
import { SystemChatToolsService } from '../../src/modules/systemChats/systemChatTools.service';
import { AvatarFacade } from '../../src/modules/avatars/avatar.facade';
import { CharacterFacade } from '../../src/modules/characters/character.facade';
import { ChatFacade } from '../../src/modules/chats/chat.facade';
import { LocationFacade } from '../../src/modules/locations/location.facade';

const TEST_JWT_SECRET = 'test-jwt-secret';
const mockOwnerUserId = '11111111-2222-3333-4444-555555555555';
const mockOtherUserId = '22222222-3333-4444-5555-666666666666';
const mockAvatarId = 'c3d4e5f6-a7b8-4012-bdef-123456789012';
const mockChatId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

const mockChat = {
  id: mockChatId,
  userId: mockOwnerUserId,
  avatarId: mockAvatarId,
  title: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as SystemChatEntity;

const mockMessage = {
  id: 'd4e5f6a7-b8c9-4012-cdef-123456789012',
  systemChatId: mockChatId,
  userId: mockOwnerUserId,
  avatarId: mockAvatarId,
  role: SystemMessageRole.User,
  content: 'Hello system',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as SystemMessageEntity;

const mockSystemChatRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockSystemMessageRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockAvatarFacade = {
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockCharacterFacade = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  removeMemoriesByAvatarId: jest.fn(),
};

const mockChatFacade = {
  removeAllByAvatarId: jest.fn(),
};

const mockLocationFacade = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createPlace: jest.fn(),
  updatePlace: jest.fn(),
  removePlace: jest.fn(),
};

const mockPromptsService = {
  render: jest.fn(),
};

describe('SystemChatsController (e2e)', () => {
  let app: NestFastifyApplication;
  let jwtService: JwtService;
  let ownerBearerToken: string;
  let otherBearerToken: string;

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigurationModule,
        PassportModule,
        JwtModule.register({ secret: TEST_JWT_SECRET }),
      ],
      controllers: [SystemChatsController],
      providers: [
        SystemChatsService,
        SystemChatToolsService,
        JwtStrategy,
        {
          provide: getRepositoryToken(SystemChatEntity),
          useValue: mockSystemChatRepository,
        },
        {
          provide: getRepositoryToken(SystemMessageEntity),
          useValue: mockSystemMessageRepository,
        },
        { provide: AvatarFacade, useValue: mockAvatarFacade },
        { provide: CharacterFacade, useValue: mockCharacterFacade },
        { provide: ChatFacade, useValue: mockChatFacade },
        { provide: LocationFacade, useValue: mockLocationFacade },
        { provide: PromptsService, useValue: mockPromptsService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    jwtService = moduleFixture.get(JwtService);
    ownerBearerToken = jwtService.sign({ sub: mockOwnerUserId });
    otherBearerToken = jwtService.sign({ sub: mockOtherUserId });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /system-chats', () => {
    it('should return chats for the authenticated user', async () => {
      mockSystemChatRepository.find.mockResolvedValue([mockChat]);

      return request(app.getHttpServer())
        .get('/system-chats')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as SystemChatDto[];
          expect(body).toHaveLength(1);
          expect(body[0].id).toBe(mockChat.id);
          expect(body[0].avatarId).toBe(mockAvatarId);
          expect(body[0].userId).toBe(mockOwnerUserId);
        });
    });

    it('should return 401 when the Authorization header is missing', () => {
      return request(app.getHttpServer()).get('/system-chats').expect(401);
    });

    it('should return 401 when the Bearer token is invalid', () => {
      return request(app.getHttpServer())
        .get('/system-chats')
        .set('Authorization', 'Bearer not.a.valid.token')
        .expect(401);
    });

    it('should ignore an invalid x-avatar-id header for this route', async () => {
      mockSystemChatRepository.find.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/system-chats')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', 'not-a-uuid')
        .expect(200)
        .expect([]);
    });
  });

  describe('POST /system-chats', () => {
    it('should create a chat with title=null and return 201', async () => {
      mockAvatarFacade.findOne.mockResolvedValue({ id: mockAvatarId });
      mockSystemChatRepository.create.mockReturnValue(mockChat);
      mockSystemChatRepository.save.mockResolvedValue(mockChat);

      return request(app.getHttpServer())
        .post('/system-chats')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', mockAvatarId)
        .expect(201)
        .expect((res) => {
          const body = res.body as SystemChatDto;
          expect(body.id).toBe(mockChat.id);
          expect(body.avatarId).toBe(mockAvatarId);
          expect(body.title).toBeNull();
          expect(mockSystemChatRepository.create).toHaveBeenCalledWith({
            userId: mockOwnerUserId,
            avatarId: mockAvatarId,
            title: null,
          });
        });
    });

    it('should ignore a title sent by the client', async () => {
      mockAvatarFacade.findOne.mockResolvedValue({ id: mockAvatarId });
      mockSystemChatRepository.create.mockReturnValue(mockChat);
      mockSystemChatRepository.save.mockResolvedValue(mockChat);

      return request(app.getHttpServer())
        .post('/system-chats')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', mockAvatarId)
        .send({ title: 'Admin chat' })
        .expect(201)
        .expect(() => {
          expect(mockSystemChatRepository.create).toHaveBeenCalledWith({
            userId: mockOwnerUserId,
            avatarId: mockAvatarId,
            title: null,
          });
        });
    });

    it('should return 404 when the avatar does not exist', async () => {
      mockAvatarFacade.findOne.mockRejectedValue(
        new NotFoundException('Avatar not found'),
      );

      return request(app.getHttpServer())
        .post('/system-chats')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', mockAvatarId)
        .expect(404);
    });

    it('should return 400 when x-avatar-id header is missing', () => {
      return request(app.getHttpServer())
        .post('/system-chats')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .expect(400);
    });
  });

  describe('DELETE /system-chats/:id', () => {
    it('should delete the chat owned by the current user and return 204', async () => {
      mockSystemChatRepository.findOneBy.mockResolvedValue(mockChat);
      mockSystemChatRepository.remove.mockResolvedValue(mockChat);

      return request(app.getHttpServer())
        .delete(`/system-chats/${mockChatId}`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .expect(204)
        .expect(() => {
          expect(mockSystemChatRepository.remove).toHaveBeenCalledWith(
            mockChat,
          );
        });
    });

    it('should return 404 when the chat does not exist', async () => {
      mockSystemChatRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .delete(`/system-chats/${mockChatId}`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .expect(404);
    });

    it('should return 403 when the user does not own the chat', async () => {
      mockSystemChatRepository.findOneBy.mockResolvedValue(mockChat);

      return request(app.getHttpServer())
        .delete(`/system-chats/${mockChatId}`)
        .set('Authorization', `Bearer ${otherBearerToken}`)
        .expect(403);
    });

    it('should return 400 when chat id is not a UUID', () => {
      return request(app.getHttpServer())
        .delete('/system-chats/not-a-uuid')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .expect(400);
    });

    it('should return 401 when the Authorization header is missing', () => {
      return request(app.getHttpServer())
        .delete(`/system-chats/${mockChatId}`)
        .expect(401);
    });
  });

  describe('GET /system-chats/:id/messages', () => {
    it('should return messages of the chat', async () => {
      mockSystemChatRepository.findOneBy.mockResolvedValue(mockChat);
      mockSystemMessageRepository.find.mockResolvedValue([mockMessage]);

      return request(app.getHttpServer())
        .get(`/system-chats/${mockChatId}/messages`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as SystemMessageDto[];
          expect(body).toHaveLength(1);
          expect(body[0].id).toBe(mockMessage.id);
          expect(body[0].role).toBe(SystemMessageRole.User);
        });
    });

    it('should return 404 when the chat does not exist', async () => {
      mockSystemChatRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get(`/system-chats/${mockChatId}/messages`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .expect(404);
    });

    it('should return 403 when the user does not own the chat', async () => {
      mockSystemChatRepository.findOneBy.mockResolvedValue(mockChat);

      return request(app.getHttpServer())
        .get(`/system-chats/${mockChatId}/messages`)
        .set('Authorization', `Bearer ${otherBearerToken}`)
        .expect(403);
    });

    it('should return 400 when chat id is not a UUID', () => {
      return request(app.getHttpServer())
        .get('/system-chats/not-a-uuid/messages')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .expect(400);
    });
  });

  describe('POST /system-chats/:id/messages', () => {
    it('should return 400 when message is missing', () => {
      return request(app.getHttpServer())
        .post(`/system-chats/${mockChatId}/messages`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', mockAvatarId)
        .set('x-locale', 'en-US')
        .send({})
        .expect(400);
    });

    it('should return 400 when message is empty', () => {
      return request(app.getHttpServer())
        .post(`/system-chats/${mockChatId}/messages`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', mockAvatarId)
        .set('x-locale', 'en-US')
        .send({ message: '' })
        .expect(400);
    });

    it('should return 400 when chat id is not a UUID', () => {
      return request(app.getHttpServer())
        .post('/system-chats/not-a-uuid/messages')
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', mockAvatarId)
        .set('x-locale', 'en-US')
        .send({ message: 'hi' })
        .expect(400);
    });

    it('should return 400 when x-avatar-id is missing', () => {
      return request(app.getHttpServer())
        .post(`/system-chats/${mockChatId}/messages`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-locale', 'en-US')
        .send({ message: 'hi' })
        .expect(400);
    });

    it('should return 400 when x-locale is missing', () => {
      return request(app.getHttpServer())
        .post(`/system-chats/${mockChatId}/messages`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', mockAvatarId)
        .send({ message: 'hi' })
        .expect(400);
    });

    it('should return 400 when x-locale is not a supported value', () => {
      return request(app.getHttpServer())
        .post(`/system-chats/${mockChatId}/messages`)
        .set('Authorization', `Bearer ${ownerBearerToken}`)
        .set('x-avatar-id', mockAvatarId)
        .set('x-locale', 'xx-XX')
        .send({ message: 'hi' })
        .expect(400);
    });
  });
});
