/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserEntity } from './user.entity';
import { Sex } from './user.enum';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUser: UserEntity = {
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

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      const dto: CreateUserDto = {
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        age: mockUser.age,
        sex: mockUser.sex,
        title: mockUser.title,
        backstory: mockUser.backstory,
      };
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a user and return it', async () => {
      const dto: UpdateUserDto = {
        title: 'Senior Mathematician',
        backstory: 'Updated backstory.',
      };
      const updatedUser: UserEntity = { ...mockUser, ...dto };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, dto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith({ id: mockUser.id, ...dto });
    });
  });
});
