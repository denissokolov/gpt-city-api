/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SystemChatEntity } from './systemChat.entity';
import { SystemMessageEntity } from './systemMessage.entity';
import { SystemMessageRole } from './systemMessage.enum';
import { SystemChatsController } from './systemChats.controller';
import { SystemChatsService } from './systemChats.service';

const mockChat = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  userId: 'c3d4e5f6-a7b8-4012-bdef-123456789012',
  title: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as SystemChatEntity;

const mockMessage = {
  id: 'd4e5f6a7-b8c9-4012-cdef-123456789012',
  systemChatId: mockChat.id,
  userId: mockChat.userId,
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
          },
        },
      ],
    }).compile();

    controller = module.get<SystemChatsController>(SystemChatsController);
    service = module.get(SystemChatsService);
  });

  describe('list', () => {
    it('should return chats owned by the current user', async () => {
      service.findAllForUser.mockResolvedValue([mockChat]);

      const result = await controller.list(mockChat.userId);

      expect(result).toEqual([mockChat]);
      expect(service.findAllForUser).toHaveBeenCalledWith(mockChat.userId);
    });
  });

  describe('create', () => {
    it('should create and return a chat with title=null', async () => {
      service.create.mockResolvedValue(mockChat);

      const result = await controller.create(mockChat.userId);

      expect(result).toEqual(mockChat);
      expect(service.create).toHaveBeenCalledWith({
        userId: mockChat.userId,
        title: null,
      });
    });
  });

  describe('listMessages', () => {
    it('should return messages of the chat', async () => {
      service.findMessages.mockResolvedValue([mockMessage]);

      const result = await controller.listMessages(
        mockChat.id,
        mockChat.userId,
      );

      expect(result).toEqual([mockMessage]);
      expect(service.findMessages).toHaveBeenCalledWith(
        mockChat.id,
        mockChat.userId,
      );
    });
  });
});
