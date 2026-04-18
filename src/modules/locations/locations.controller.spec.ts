/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Provider, Sex } from '../characters/character.enum';
import { LocationStateDto } from './location.dto';
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

const mockLocationState: LocationStateDto = {
  id: mockLocationSummary.id,
  name: mockLocationSummary.name,
  description: mockLocationSummary.description,
  locale: mockLocationSummary.locale,
  places: [
    {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      name: 'Central Library',
      description: 'A quiet library with cozy reading nooks.',
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
        },
      ],
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
            getState: jest.fn(),
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

  describe('getState', () => {
    it('should return the location state with places and their characters', async () => {
      service.getState.mockResolvedValue(mockLocationState);

      const result = await controller.getState(mockLocationState.id);

      expect(result).toEqual(mockLocationState);
      expect(result.places).toHaveLength(1);
      expect(result.places[0].characters).toHaveLength(1);
      expect(service.getState).toHaveBeenCalledWith(mockLocationState.id);
    });

    it('should throw when location is not found', async () => {
      service.getState.mockRejectedValue(new NotFoundException());

      await expect(controller.getState('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
