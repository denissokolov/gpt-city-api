import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { CharacterEntity } from '../../src/modules/characters/character.entity';
import { Provider, Sex } from '../../src/modules/characters/character.enum';
import {
  LocationStateDto,
  LocationDto,
} from '../../src/modules/locations/location.dto';
import { LocationEntity } from '../../src/modules/locations/location.entity';
import { Locale } from '../../src/modules/locations/location.enum';
import { LocationsController } from '../../src/modules/locations/locations.controller';
import { LocationsService } from '../../src/modules/locations/locations.service';
import { PlaceEntity } from '../../src/modules/locations/place.entity';
import { PlaceDistributorService } from '../../src/modules/locations/placeDistributor.service';

const mockLocation: LocationEntity = {
  id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  name: 'Downtown District',
  description: 'The bustling heart of the city.',
  locale: Locale.EnUs,
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
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockLocationSummary = {
  id: mockLocation.id,
  name: mockLocation.name,
  description: mockLocation.description,
  locale: mockLocation.locale,
  createdAt: mockLocation.createdAt,
  updatedAt: mockLocation.updatedAt,
};

const mockLocationRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockPlaceRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockCharacterRepository = {
  findBy: jest.fn(),
};

const mockPlaceDistributorService = {
  distributeCharacters: jest.fn(),
};

describe('LocationsController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(LocationEntity),
          useValue: mockLocationRepository,
        },
        {
          provide: getRepositoryToken(PlaceEntity),
          useValue: mockPlaceRepository,
        },
        {
          provide: getRepositoryToken(CharacterEntity),
          useValue: mockCharacterRepository,
        },
        {
          provide: PlaceDistributorService,
          useValue: mockPlaceDistributorService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /locations', () => {
    it('should return location summaries without characters or places', async () => {
      mockLocationRepository.find.mockResolvedValue([mockLocationSummary]);

      return request(app.getHttpServer())
        .get('/locations')
        .expect(200)
        .expect((res) => {
          const body = res.body as LocationDto[];
          expect(body).toHaveLength(1);
          expect(body[0].id).toBe(mockLocation.id);
          expect(body[0].name).toBe(mockLocation.name);
          expect(body[0]).not.toHaveProperty('characters');
          expect(body[0]).not.toHaveProperty('places');
        });
    });

    it('should return an empty array when there are no locations', async () => {
      mockLocationRepository.find.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/locations')
        .expect(200)
        .expect([]);
    });
  });

  describe('GET /locations/:id/state', () => {
    const userTime = '2026-04-19T10:00:00.000Z';

    it('should return the location state with characters distributed across places', async () => {
      mockLocationRepository.findOne.mockResolvedValue(mockLocation);
      mockPlaceDistributorService.distributeCharacters.mockResolvedValue([
        {
          placeId: mockLocation.places[0].id,
          charactersIds: [mockLocation.characters[0].id],
        },
      ]);

      return request(app.getHttpServer())
        .get(`/locations/${mockLocation.id}/state`)
        .set('x-user-time', userTime)
        .expect(200)
        .expect((res) => {
          const body = res.body as LocationStateDto;
          expect(body.id).toBe(mockLocation.id);
          expect(body.name).toBe(mockLocation.name);
          expect(body).not.toHaveProperty('characters');
          expect(body.places).toHaveLength(1);
          expect(body.places[0].id).toBe(mockLocation.places[0].id);
          expect(body.places[0].characters).toHaveLength(1);
          expect(body.places[0].characters[0].id).toBe(
            mockLocation.characters[0].id,
          );
        });
    });

    it('should forward the x-user-time header to the distributor', async () => {
      mockLocationRepository.findOne.mockResolvedValue(mockLocation);
      mockPlaceDistributorService.distributeCharacters.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get(`/locations/${mockLocation.id}/state`)
        .set('x-user-time', userTime)
        .expect(200);

      expect(
        mockPlaceDistributorService.distributeCharacters,
      ).toHaveBeenCalledTimes(1);
      const firstCall = mockPlaceDistributorService.distributeCharacters.mock
        .calls[0] as unknown[];
      expect(firstCall[1]).toBe(userTime);
    });

    it('should distribute characters across multiple places according to the distributor', async () => {
      const extraCharacter = {
        ...mockLocation.characters[0],
        id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        firstName: 'Marie',
        lastName: 'Curie',
      };
      const extraPlace = {
        ...mockLocation.places[0],
        id: 'd4e5f6a7-b8c9-0123-defa-345678901234',
        name: 'Old Observatory',
      };
      mockLocationRepository.findOne.mockResolvedValue({
        ...mockLocation,
        characters: [...mockLocation.characters, extraCharacter],
        places: [...mockLocation.places, extraPlace],
      });
      mockPlaceDistributorService.distributeCharacters.mockResolvedValue([
        {
          placeId: mockLocation.places[0].id,
          charactersIds: [mockLocation.characters[0].id],
        },
        {
          placeId: extraPlace.id,
          charactersIds: [extraCharacter.id],
        },
      ]);

      return request(app.getHttpServer())
        .get(`/locations/${mockLocation.id}/state`)
        .set('x-user-time', userTime)
        .expect(200)
        .expect((res) => {
          const body = res.body as LocationStateDto;
          expect(body.places).toHaveLength(2);
          const totalCharacters = body.places.reduce(
            (sum, place) => sum + place.characters.length,
            0,
          );
          expect(totalCharacters).toBe(2);
        });
    });

    it('should return empty places array when location has no places', async () => {
      mockLocationRepository.findOne.mockResolvedValue({
        ...mockLocation,
        places: [],
      });
      mockPlaceDistributorService.distributeCharacters.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get(`/locations/${mockLocation.id}/state`)
        .set('x-user-time', userTime)
        .expect(200)
        .expect((res) => {
          const body = res.body as LocationStateDto;
          expect(body.places).toEqual([]);
        });
    });

    it('should return 404 for unknown id', async () => {
      mockLocationRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/locations/00000000-0000-0000-0000-000000000000/state')
        .set('x-user-time', userTime)
        .expect(404);
    });
  });
});
