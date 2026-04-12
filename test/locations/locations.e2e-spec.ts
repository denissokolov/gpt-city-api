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
  LocationDto,
  LocationSummaryDto,
} from '../../src/modules/locations/location.dto';
import { LocationEntity } from '../../src/modules/locations/location.entity';
import { Locale } from '../../src/modules/locations/location.enum';
import { LocationsController } from '../../src/modules/locations/locations.controller';
import { LocationsService } from '../../src/modules/locations/locations.service';
import { PlaceEntity } from '../../src/modules/locations/place.entity';

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
          const body = res.body as LocationSummaryDto[];
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

  describe('GET /locations/:id', () => {
    it('should return a location with characters and places', async () => {
      mockLocationRepository.findOne.mockResolvedValue(mockLocation);

      return request(app.getHttpServer())
        .get(`/locations/${mockLocation.id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as LocationDto;
          expect(body.id).toBe(mockLocation.id);
          expect(body.characters).toHaveLength(1);
          expect(body.places).toHaveLength(1);
        });
    });

    it('should return 404 for unknown id', async () => {
      mockLocationRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/locations/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
