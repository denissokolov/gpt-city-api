import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { CharacterDto } from '../../src/modules/characters/character.dto';
import { Character } from '../../src/modules/characters/character.entity';
import { CharactersController } from '../../src/modules/characters/characters.controller';
import { CharactersService } from '../../src/modules/characters/characters.service';

const mockCharacter: Character = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Aria',
  personality:
    'Curious, empathetic, and quick-witted with a dry sense of humour.',
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
  let app: INestApplication<App>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CharactersController],
      providers: [
        CharactersService,
        {
          provide: getRepositoryToken(Character),
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
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
          expect(body[0].name).toBe(mockCharacter.name);
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

  describe('GET /characters/:id', () => {
    it('should return a character by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCharacter);

      return request(app.getHttpServer())
        .get(`/characters/${mockCharacter.id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as CharacterDto;
          expect(body.id).toBe(mockCharacter.id);
          expect(body.name).toBe(mockCharacter.name);
        });
    });

    it('should return 404 when character is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/characters/unknown-id')
        .expect(404);
    });
  });

  describe('POST /characters', () => {
    it('should create and return a character', async () => {
      const dto = {
        name: 'Aria',
        personality:
          'Curious, empathetic, and quick-witted with a dry sense of humour.',
      };
      mockRepository.create.mockReturnValue(mockCharacter);
      mockRepository.save.mockResolvedValue(mockCharacter);

      return request(app.getHttpServer())
        .post('/characters')
        .send(dto)
        .expect(201)
        .expect((res) => {
          const body = res.body as CharacterDto;
          expect(body.id).toBe(mockCharacter.id);
          expect(body.name).toBe(dto.name);
          expect(body.personality).toBe(dto.personality);
        });
    });

    it('should return 400 when name is missing', async () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ personality: 'Some personality' })
        .expect(400);
    });

    it('should return 400 when personality is missing', async () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Aria' })
        .expect(400);
    });

    it('should return 400 when body is empty', async () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({})
        .expect(400);
    });
  });

  describe('PATCH /characters/:id', () => {
    it('should update and return a character', async () => {
      const updated: Character = { ...mockCharacter, name: 'Aria Updated' };
      mockRepository.findOneBy.mockResolvedValue(mockCharacter);
      mockRepository.save.mockResolvedValue(updated);

      return request(app.getHttpServer())
        .patch(`/characters/${mockCharacter.id}`)
        .send({ name: 'Aria Updated' })
        .expect(200)
        .expect((res) => {
          const body = res.body as CharacterDto;
          expect(body.name).toBe('Aria Updated');
        });
    });

    it('should return 404 when character is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .patch('/characters/unknown-id')
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /characters/:id', () => {
    it('should delete a character and return 204', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCharacter);
      mockRepository.remove.mockResolvedValue(undefined);

      return request(app.getHttpServer())
        .delete(`/characters/${mockCharacter.id}`)
        .expect(204);
    });

    it('should return 404 when character is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .delete('/characters/unknown-id')
        .expect(404);
    });
  });
});
