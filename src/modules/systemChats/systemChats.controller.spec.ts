/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SystemChatEntity } from './systemChat.entity';
import { SystemMessageEntity } from './systemMessage.entity';
import { SystemMessageRole } from './systemMessage.enum';
import { SystemChatsController } from './systemChats.controller';
import { SystemChatsService } from './systemChats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.service';

const mockUser: JwtPayload = { sub: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' };
const mockAvatarId = 'c3d4e5f6-a7b8-4012-bdef-123456789012';

const mockChat = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  userId: mockUser.sub,
  avatarId: mockAvatarId,
  title: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as SystemChatEntity;

const mockMessage = {
  id: 'd4e5f6a7-b8c9-4012-cdef-123456789012',
  systemChatId: mockChat.id,
  userId: mockUser.sub,
  avatarId: mockAvatarId,
  role: SystemMessageRole.User,
  content: 'Hello system',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as SystemMessageEntity;

describe('SystemChatsController', () => {
  let controller: SystemChatsController;
  let service: jest.Mocked<SystemChatsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemChatsController],
      providers: [
        {
          provide: SystemChatsService,
          useValue: {
            findAllForUser: jest.fn(),
            create: jest.fn(),
            findMessages: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SystemChatsController>(SystemChatsController);
    service = module.get(SystemChatsService);
  });

  describe('list', () => {
    it('should return chats owned by the current user', async () => {
      service.findAllForUser.mockResolvedValue([mockChat]);

      const result = await controller.list(mockUser);

      expect(result).toEqual([mockChat]);
      expect(service.findAllForUser).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('create', () => {
    it('should create and return a chat with title=null', async () => {
      service.create.mockResolvedValue(mockChat);

      const result = await controller.create(mockUser, mockAvatarId);

      expect(result).toEqual(mockChat);
      expect(service.create).toHaveBeenCalledWith({
        userId: mockUser.sub,
        avatarId: mockAvatarId,
        title: null,
      });
    });
  });

  describe('remove', () => {
    it('should delete the chat owned by the current user', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(mockChat.id, mockUser);

      expect(service.remove).toHaveBeenCalledWith(mockChat.id, mockUser.sub);
    });
  });

  describe('listMessages', () => {
    it('should return messages of the chat', async () => {
      service.findMessages.mockResolvedValue([mockMessage]);

      const result = await controller.listMessages(mockChat.id, mockUser);

      expect(result).toEqual([mockMessage]);
      expect(service.findMessages).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
      );
    });
  });
});
