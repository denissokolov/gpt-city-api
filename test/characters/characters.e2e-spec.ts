import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { CharacterDto } from '../../src/modules/characters/character.dto';
import { CharacterEntity } from '../../src/modules/characters/character.entity';
import { Provider, Sex } from '../../src/modules/characters/character.enum';
import { CharactersController } from '../../src/modules/characters/characters.controller';
import { CharactersService } from '../../src/modules/characters/characters.service';

const mockCharacter: CharacterEntity = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  firstName: 'Albert',
  lastName: 'Einstein',
  title: 'Professor of Physics',
  age: 45,
  sex: Sex.Male,
  personality:
    'Curious, empathetic, and quick-witted with a dry sense of humour.',
  backstory: 'Grew up in a small town, fascinated by the stars.',
  model: 'gpt-4o',
  provider: Provider.OpenAI,
  locationId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  location: undefined as never,
  systemInstructions: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('CharactersController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CharactersController],
      providers: [
        CharactersService,
        {
          provide: getRepositoryToken(CharacterEntity),
          useValue: mockRepository,
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

  describe('GET /characters', () => {
    it('should return an array of characters', async () => {
      mockRepository.find.mockResolvedValue([mockCharacter]);

      return request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .expect((res) => {
          const body = res.body as CharacterDto[];
          expect(body).toHaveLength(1);
          expect(body[0].id).toBe(mockCharacter.id);
          expect(body[0].firstName).toBe(mockCharacter.firstName);
          expect(body[0].lastName).toBe(mockCharacter.lastName);
          expect(body[0].title).toBe(mockCharacter.title);
          expect(body[0].personality).toBe(mockCharacter.personality);
        });
    });

    it('should return an empty array when there are no characters', async () => {
      mockRepository.find.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .expect([]);
    });
  });
});
