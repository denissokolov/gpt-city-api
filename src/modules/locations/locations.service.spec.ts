/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterEntity } from '../characters/character.entity';
import { Provider, Sex } from '../characters/character.enum';
import { Locale } from '../../common/enums/locale.enum';
import { CharacterStateEntity } from './characterState.entity';
import { LocationEntity } from './location.entity';
import { LocationStateEntity } from './locationState.entity';
import { LocationsService } from './locations.service';
import { PlaceEntity } from './place.entity';
import { PlaceDistributorService } from './placeDistributor.service';

const albert: CharacterEntity = {
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
  locationId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  location: undefined as never,
  systemInstructions: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const marie: CharacterEntity = {
  ...albert,
  id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  firstName: 'Marie',
  lastName: 'Curie',
  sex: Sex.Female,
};

const library: PlaceEntity = {
  id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  name: 'Central Library',
  description: 'A quiet library with cozy reading nooks.',
  locationId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  location: undefined as never,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const observatory: PlaceEntity = {
  ...library,
  id: 'd4e5f6a7-b8c9-0123-defa-345678901234',
  name: 'Old Observatory',
};

const mockLocation: LocationEntity = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  name: 'Downtown District',
  description: 'The bustling heart of the city.',
  locale: Locale.EnUs,
  characters: [albert, marie],
  places: [library, observatory],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('LocationsService', () => {
  let service: LocationsService;
  let locationRepository: jest.Mocked<Repository<LocationEntity>>;
  let locationStateRepository: jest.Mocked<Repository<LocationStateEntity>>;
  let characterStateRepository: jest.Mocked<Repository<CharacterStateEntity>>;
  let placeDistributor: jest.Mocked<PlaceDistributorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(LocationEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PlaceEntity),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LocationStateEntity),
          useValue: {
            create: jest.fn((entity: Partial<LocationStateEntity>) => entity),
            save: jest.fn(
              (entity: Partial<LocationStateEntity>) =>
                ({
                  ...entity,
                  id: entity.id ?? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                }) as LocationStateEntity,
            ),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CharacterStateEntity),
          useValue: {
            create: jest.fn((entity: Partial<CharacterStateEntity>) => entity),
            save: jest.fn(
              (rows: Array<Partial<CharacterStateEntity>>) =>
                rows as CharacterStateEntity[],
            ),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: PlaceDistributorService,
          useValue: {
            distributeCharacters: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    locationRepository = module.get(getRepositoryToken(LocationEntity));
    locationStateRepository = module.get(
      getRepositoryToken(LocationStateEntity),
    );
    characterStateRepository = module.get(
      getRepositoryToken(CharacterStateEntity),
    );
    placeDistributor = module.get(PlaceDistributorService);
  });

  describe('getState', () => {
    const userTime = '2026-04-19T10:00:00.000Z';
    const stateId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    beforeEach(() => {
      (locationStateRepository.save as jest.Mock).mockImplementation(
        (entity: Partial<LocationStateEntity>) =>
          ({ ...entity, id: stateId }) as LocationStateEntity,
      );
    });

    it('should map characters onto places using the distributor output', async () => {
      locationRepository.findOne.mockResolvedValue(mockLocation);
      placeDistributor.distributeCharacters.mockResolvedValue([
        {
          placeId: library.id,
          characters: [
            { characterId: albert.id, mood: 'curious', activity: 'reading' },
          ],
        },
        {
          placeId: observatory.id,
          characters: [
            { characterId: marie.id, mood: 'focused', activity: 'observing' },
          ],
        },
      ]);

      const result = await service.getState(mockLocation.id, userTime);

      expect(placeDistributor.distributeCharacters).toHaveBeenCalledWith(
        mockLocation,
        userTime,
      );
      expect(result.id).toBe(mockLocation.id);
      expect(result.stateId).toBe(stateId);
      expect(result.places).toHaveLength(2);
      expect(result.places[0]).toMatchObject({
        id: library.id,
        name: library.name,
      });
      expect(result.places[0].characters).toHaveLength(1);
      expect(result.places[0].characters[0].id).toBe(albert.id);
      expect(result.places[1].characters).toHaveLength(1);
      expect(result.places[1].characters[0].id).toBe(marie.id);
    });

    it('should persist a location state and one character state row per character', async () => {
      locationRepository.findOne.mockResolvedValue(mockLocation);
      placeDistributor.distributeCharacters.mockResolvedValue([
        {
          placeId: library.id,
          characters: [
            { characterId: albert.id, mood: 'curious', activity: 'reading' },
          ],
        },
        {
          placeId: observatory.id,
          characters: [
            {
              characterId: marie.id,
              mood: 'focused',
              activity: 'observing the sky',
            },
          ],
        },
      ]);

      await service.getState(mockLocation.id, userTime);

      expect(locationStateRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          locationId: mockLocation.id,
          userTime: new Date(userTime),
        }),
      );

      const savedRowsCalls = (characterStateRepository.save as jest.Mock).mock
        .calls as Array<[Array<Partial<CharacterStateEntity>>]>;
      expect(savedRowsCalls).toHaveLength(1);
      const savedRows = savedRowsCalls[0][0];
      expect(savedRows).toHaveLength(2);
      expect(savedRows).toContainEqual(
        expect.objectContaining({
          stateId,
          characterId: albert.id,
          placeId: library.id,
          mood: 'curious',
          activity: 'reading',
        }),
      );
      expect(savedRows).toContainEqual(
        expect.objectContaining({
          stateId,
          characterId: marie.id,
          placeId: observatory.id,
          mood: 'focused',
          activity: 'observing the sky',
        }),
      );
    });

    it('should convert character entities to DTOs without timestamps', async () => {
      locationRepository.findOne.mockResolvedValue(mockLocation);
      placeDistributor.distributeCharacters.mockResolvedValue([
        {
          placeId: library.id,
          characters: [
            { characterId: albert.id, mood: 'curious', activity: 'reading' },
          ],
        },
      ]);

      const result = await service.getState(mockLocation.id, userTime);

      const character = result.places[0].characters[0];
      expect(character).not.toHaveProperty('createdAt');
      expect(character).not.toHaveProperty('updatedAt');
      expect(character.id).toBe(albert.id);
      expect(character.firstName).toBe(albert.firstName);
      expect(character.provider).toBe(albert.provider);
    });

    it('should place empty character lists in places not mentioned by the distributor', async () => {
      locationRepository.findOne.mockResolvedValue(mockLocation);
      placeDistributor.distributeCharacters.mockResolvedValue([
        {
          placeId: library.id,
          characters: [
            { characterId: albert.id, mood: 'curious', activity: 'reading' },
            {
              characterId: marie.id,
              mood: 'focused',
              activity: 'taking notes',
            },
          ],
        },
      ]);

      const result = await service.getState(mockLocation.id, userTime);

      const libraryPlace = result.places.find((p) => p.id === library.id)!;
      const observatoryPlace = result.places.find(
        (p) => p.id === observatory.id,
      )!;
      expect(libraryPlace.characters).toHaveLength(2);
      expect(observatoryPlace.characters).toEqual([]);
    });

    it('should silently drop unknown character ids returned by the distributor', async () => {
      locationRepository.findOne.mockResolvedValue(mockLocation);
      placeDistributor.distributeCharacters.mockResolvedValue([
        {
          placeId: library.id,
          characters: [
            { characterId: albert.id, mood: 'curious', activity: 'reading' },
            {
              characterId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
              mood: 'unknown',
              activity: 'unknown',
            },
          ],
        },
      ]);

      const result = await service.getState(mockLocation.id, userTime);

      const libraryPlace = result.places.find((p) => p.id === library.id)!;
      expect(libraryPlace.characters).toHaveLength(1);
      expect(libraryPlace.characters[0].id).toBe(albert.id);
    });

    it('should return an empty places array when the location has no places', async () => {
      locationRepository.findOne.mockResolvedValue({
        ...mockLocation,
        places: [],
      });
      placeDistributor.distributeCharacters.mockResolvedValue([]);

      const result = await service.getState(mockLocation.id, userTime);

      expect(result.places).toEqual([]);
      expect(characterStateRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the location does not exist', async () => {
      locationRepository.findOne.mockResolvedValue(null);

      await expect(service.getState('missing-id', userTime)).rejects.toThrow(
        NotFoundException,
      );
      expect(placeDistributor.distributeCharacters).not.toHaveBeenCalled();
    });
  });

  describe('findState', () => {
    it('should delegate to the location state repository', async () => {
      const stateId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const fakeState = { id: stateId } as LocationStateEntity;
      (locationStateRepository.findOneBy as jest.Mock).mockResolvedValue(
        fakeState,
      );

      const result = await service.findState(stateId);

      expect(result).toBe(fakeState);
      expect(locationStateRepository.findOneBy).toHaveBeenCalledWith({
        id: stateId,
      });
    });
  });

  describe('findCharacterState', () => {
    it('should look up character state by stateId + characterId', async () => {
      const stateId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const fakeRow = { id: 'row-1' } as unknown as CharacterStateEntity;
      (characterStateRepository.findOneBy as jest.Mock).mockResolvedValue(
        fakeRow,
      );

      const result = await service.findCharacterState(stateId, albert.id);

      expect(result).toBe(fakeRow);
      expect(characterStateRepository.findOneBy).toHaveBeenCalledWith({
        stateId,
        characterId: albert.id,
      });
    });
  });
});
