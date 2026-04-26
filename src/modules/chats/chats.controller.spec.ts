/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import type { FastifyReply } from 'fastify';

import { Locale } from '../../common/enums/locale.enum';
import { ChatActivity } from './chat.activity.enum';
import { ChatDto } from './chat.dto';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatEntity } from './chat.entity';

const mockChatEntity = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  stateId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
  avatarId: 'c3d4e5f6-a7b8-4012-bdef-123456789012',
  characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  summary: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as ChatEntity;

const mockChat = {
  ...mockChatEntity,
  silenceIdleMs: 30_000,
} as ChatDto;

const mockAvatarId = 'c3d4e5f6-a7b8-4012-bdef-123456789012';
const mockChatId = mockChat.id;

function buildMockReply(): FastifyReply {
  return {
    getHeaders: jest.fn().mockReturnValue({}),
    hijack: jest.fn(),
    raw: {
      hasHeader: jest.fn().mockReturnValue(false),
      setHeader: jest.fn(),
    },
  } as unknown as FastifyReply;
}

describe('ChatsController', () => {
  let controller: ChatsController;
  let service: jest.Mocked<ChatsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        {
          provide: ChatsService,
          useValue: {
            create: jest.fn(),
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
    service = module.get(ChatsService);
  });

  describe('create', () => {
    it('should create and return a chat', async () => {
      service.create.mockResolvedValue(mockChatEntity);

      const result = await controller.create(mockAvatarId, {
        characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
        placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
        stateId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      });

      expect(result).toEqual(mockChat);
      expect(service.create).toHaveBeenCalledWith({
        characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
        placeId: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
        stateId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
        avatarId: mockAvatarId,
        summary: null,
      });
    });
  });

  describe('sendMessage', () => {
    const mockStream = {
      pipeUIMessageStreamToResponse: jest.fn(),
    } as unknown as Awaited<ReturnType<ChatsService['sendMessage']>>;

    it('should forward a plain message to the service', async () => {
      service.sendMessage.mockResolvedValue(mockStream);

      const dto = { message: 'Hello' };
      await controller.sendMessage(
        mockChatId,
        mockAvatarId,
        Locale.EnUs,
        dto,
        buildMockReply(),
      );

      expect(service.sendMessage).toHaveBeenCalledWith(
        mockChatId,
        mockAvatarId,
        Locale.EnUs,
        dto,
      );
    });

    it('should forward a silence activity to the service', async () => {
      service.sendMessage.mockResolvedValue(mockStream);

      const dto = { activity: ChatActivity.Silence };
      await controller.sendMessage(
        mockChatId,
        mockAvatarId,
        Locale.EnUs,
        dto,
        buildMockReply(),
      );

      expect(service.sendMessage).toHaveBeenCalledWith(
        mockChatId,
        mockAvatarId,
        Locale.EnUs,
        dto,
      );
    });
  });
});
