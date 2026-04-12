/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Character } from './character.entity';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

const mockCharacter: Character = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Aria',
  personality:
    'Curious, empathetic, and quick-witted with a dry sense of humour.',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('CharactersController', () => {
  let controller: CharactersController;
  let service: jest.Mocked<CharactersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharactersController],
      providers: [
        {
          provide: CharactersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CharactersController>(CharactersController);
    service = module.get(CharactersService);
  });

  describe('findAll', () => {
    it('should return an array of characters', async () => {
      service.findAll.mockResolvedValue([mockCharacter]);

      const result = await controller.findAll();

      expect(result).toEqual([mockCharacter]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when there are no characters', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a character by id', async () => {
      service.findOne.mockResolvedValue(mockCharacter);

      const result = await controller.findOne(mockCharacter.id);

      expect(result).toEqual(mockCharacter);
      expect(service.findOne).toHaveBeenCalledWith(mockCharacter.id);
    });

    it('should propagate NotFoundException when character is not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a character', async () => {
      const dto = {
        name: 'Aria',
        personality:
          'Curious, empathetic, and quick-witted with a dry sense of humour.',
      };
      service.create.mockResolvedValue(mockCharacter);

      const result = await controller.create(dto);

      expect(result).toEqual(mockCharacter);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update and return a character', async () => {
      const dto = { name: 'Aria Updated' };
      const updated: Character = { ...mockCharacter, name: 'Aria Updated' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(mockCharacter.id, dto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(mockCharacter.id, dto);
    });

    it('should propagate NotFoundException when character is not found', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('unknown-id', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a character', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(mockCharacter.id);

      expect(service.remove).toHaveBeenCalledWith(mockCharacter.id);
    });

    it('should propagate NotFoundException when character is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
