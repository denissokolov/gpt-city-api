/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SystemChatEntity } from './systemChat.entity';
import { SystemMessageEntity } from './systemMessage.entity';
import { SystemMessageRole } from './systemMessage.enum';
import { SystemChatsController } from './systemChats.controller';
import { SystemChatsService } from './systemChats.service';

const mockChat = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  avatarId: 'c3d4e5f6-a7b8-4012-bdef-123456789012',
  title: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as SystemChatEntity;

const mockMessage = {
  id: 'd4e5f6a7-b8c9-4012-cdef-123456789012',
  systemChatId: mockChat.id,
  avatarId: mockChat.avatarId,
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
            findAllForAvatar: jest.fn(),
            create: jest.fn(),
            findMessages: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SystemChatsController>(SystemChatsController);
    service = module.get(SystemChatsService);
  });

  describe('list', () => {
    it('should return chats owned by the current avatar', async () => {
      service.findAllForAvatar.mockResolvedValue([mockChat]);

      const result = await controller.list(mockChat.avatarId);

      expect(result).toEqual([mockChat]);
      expect(service.findAllForAvatar).toHaveBeenCalledWith(mockChat.avatarId);
    });
  });

  describe('create', () => {
    it('should create and return a chat with title=null', async () => {
      service.create.mockResolvedValue(mockChat);

      const result = await controller.create(mockChat.avatarId);

      expect(result).toEqual(mockChat);
      expect(service.create).toHaveBeenCalledWith({
        avatarId: mockChat.avatarId,
        title: null,
      });
    });
  });

  describe('remove', () => {
    it('should delete the chat owned by the current avatar', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(mockChat.id, mockChat.avatarId);

      expect(service.remove).toHaveBeenCalledWith(
        mockChat.id,
        mockChat.avatarId,
      );
    });
  });

  describe('listMessages', () => {
    it('should return messages of the chat', async () => {
      service.findMessages.mockResolvedValue([mockMessage]);

      const result = await controller.listMessages(
        mockChat.id,
        mockChat.avatarId,
      );

      expect(result).toEqual([mockMessage]);
      expect(service.findMessages).toHaveBeenCalledWith(
        mockChat.id,
        mockChat.avatarId,
      );
    });
  });
});
