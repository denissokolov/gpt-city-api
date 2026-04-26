/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAvatarDto, UpdateAvatarDto } from './avatar.dto';
import { AvatarEntity } from './avatar.entity';
import { Sex } from './avatar.enum';
import { AvatarsController } from './avatars.controller';
import { AvatarsService } from './avatars.service';

const mockAvatar: AvatarEntity = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  firstName: 'Ada',
  lastName: 'Lovelace',
  age: 36,
  sex: Sex.Female,
  title: 'Mathematician',
  backstory:
    'Pioneering mathematician who wrote the first algorithm intended for a machine.',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('AvatarsController', () => {
  let controller: AvatarsController;
  let service: jest.Mocked<AvatarsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarsController],
      providers: [
        {
          provide: AvatarsService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AvatarsController>(AvatarsController);
    service = module.get(AvatarsService);
  });

  describe('create', () => {
    it('should create an avatar and return it', async () => {
      const dto: CreateAvatarDto = {
        firstName: mockAvatar.firstName,
        lastName: mockAvatar.lastName,
        age: mockAvatar.age,
        sex: mockAvatar.sex,
        title: mockAvatar.title,
        backstory: mockAvatar.backstory,
      };
      service.create.mockResolvedValue(mockAvatar);

      const result = await controller.create(dto);

      expect(result).toEqual(mockAvatar);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findCurrent', () => {
    it('should return the current avatar by header id', async () => {
      service.findOne.mockResolvedValue(mockAvatar);

      const result = await controller.findCurrent(mockAvatar.id);

      expect(result).toEqual(mockAvatar);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(mockAvatar.id);
    });
  });

  describe('update', () => {
    it('should update an avatar and return it', async () => {
      const dto: UpdateAvatarDto = {
        title: 'Senior Mathematician',
        backstory: 'Updated backstory.',
      };
      const updatedAvatar: AvatarEntity = { ...mockAvatar, ...dto };
      service.update.mockResolvedValue(updatedAvatar);

      const result = await controller.update(mockAvatar.id, dto);

      expect(result).toEqual(updatedAvatar);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith({
        id: mockAvatar.id,
        ...dto,
      });
    });
  });
});
