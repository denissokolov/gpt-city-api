/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Provider, Sex } from '../characters/character.enum';
import { Locale } from './location.enum';
import { LocationEntity } from './location.entity';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

const mockLocationSummary: LocationEntity = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  name: 'Downtown District',
  description: 'The bustling heart of the city.',
  locale: Locale.EnUs,
  characters: [],
  places: [],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockLocationDetail: LocationEntity = {
  ...mockLocationSummary,
  characters: [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      firstName: 'Albert',
      lastName: 'Einstein',
      title: 'Professor of Physics',
      age: 45,
      sex: Sex.Male,
      personality: 'Curious and quick-witted.',
      backstory: 'Grew up fascinated by the stars.',
      model: 'gpt-4o',
      provider: Provider.OpenAI,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
  places: [
    {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      name: 'Central Library',
      description: 'A quiet library with cozy reading nooks.',
      locationId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      location: undefined as never,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
};

describe('LocationsController', () => {
  let controller: LocationsController;
  let service: jest.Mocked<LocationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
    service = module.get(LocationsService);
  });

  describe('findAll', () => {
    it('should return an array of location summaries', async () => {
      service.findAll.mockResolvedValue([mockLocationSummary]);

      const result = await controller.findAll();

      expect(result).toEqual([mockLocationSummary]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when there are no locations', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a location with characters and places', async () => {
      service.findOne.mockResolvedValue(mockLocationDetail);

      const result = await controller.findOne(mockLocationDetail.id);

      expect(result).toEqual(mockLocationDetail);
      expect(result.characters).toHaveLength(1);
      expect(result.places).toHaveLength(1);
      expect(service.findOne).toHaveBeenCalledWith(mockLocationDetail.id);
    });

    it('should throw when location is not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
