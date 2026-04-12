/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ChatEntity } from './chat.entity';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';

const mockChat: ChatEntity = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  summary: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

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
          },
        },
      ],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
    service = module.get(ChatsService);
  });

  describe('create', () => {
    it('should create and return a chat', async () => {
      service.create.mockResolvedValue(mockChat);

      const result = await controller.create({
        characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
      });

      expect(result).toEqual(mockChat);
      expect(service.create).toHaveBeenCalledWith({
        characterIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
        summary: null,
      });
    });
  });
});
