import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AvatarDto } from '../../src/modules/avatars/avatar.dto';
import { AvatarEntity } from '../../src/modules/avatars/avatar.entity';
import { Sex } from '../../src/modules/avatars/avatar.enum';
import { AvatarsController } from '../../src/modules/avatars/avatars.controller';
import { AvatarsService } from '../../src/modules/avatars/avatars.service';

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

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const validBody = {
  firstName: mockAvatar.firstName,
  lastName: mockAvatar.lastName,
  age: mockAvatar.age,
  sex: mockAvatar.sex,
  title: mockAvatar.title,
  backstory: mockAvatar.backstory,
};

describe('AvatarsController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AvatarsController],
      providers: [
        AvatarsService,
        {
          provide: getRepositoryToken(AvatarEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /avatars', () => {
    it('should create an avatar and return 201', async () => {
      mockRepository.create.mockReturnValue(mockAvatar);
      mockRepository.save.mockResolvedValue(mockAvatar);

      return request(app.getHttpServer())
        .post('/avatars')
        .send(validBody)
        .expect(201)
        .expect((res) => {
          const body = res.body as AvatarDto;
          expect(body.id).toBe(mockAvatar.id);
          expect(body.firstName).toBe(mockAvatar.firstName);
          expect(body.lastName).toBe(mockAvatar.lastName);
          expect(body.age).toBe(mockAvatar.age);
          expect(body.sex).toBe(mockAvatar.sex);
          expect(body.title).toBe(mockAvatar.title);
          expect(body.backstory).toBe(mockAvatar.backstory);
        });
    });

    it('should return 400 when body is empty', () => {
      return request(app.getHttpServer()).post('/avatars').send({}).expect(400);
    });

    it('should return 400 when firstName is missing', () => {
      const body = { ...validBody };
      delete (body as Partial<typeof validBody>).firstName;
      return request(app.getHttpServer())
        .post('/avatars')
        .send(body)
        .expect(400);
    });

    it('should return 400 when age is negative', () => {
      return request(app.getHttpServer())
        .post('/avatars')
        .send({ ...validBody, age: -1 })
        .expect(400);
    });

    it('should return 400 when age is not an integer', () => {
      return request(app.getHttpServer())
        .post('/avatars')
        .send({ ...validBody, age: 'old' })
        .expect(400);
    });

    it('should return 400 when sex is not a valid enum value', () => {
      return request(app.getHttpServer())
        .post('/avatars')
        .send({ ...validBody, sex: 'not-a-sex' })
        .expect(400);
    });
  });

  describe('GET /avatars/current', () => {
    it('should return the current avatar and 200', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockAvatar);

      return request(app.getHttpServer())
        .get('/avatars/current')
        .set('x-avatar-id', mockAvatar.id)
        .expect(200)
        .expect((res) => {
          const body = res.body as AvatarDto;
          expect(body.id).toBe(mockAvatar.id);
          expect(body.firstName).toBe(mockAvatar.firstName);
          expect(body.lastName).toBe(mockAvatar.lastName);
          expect(body.age).toBe(mockAvatar.age);
          expect(body.sex).toBe(mockAvatar.sex);
          expect(body.title).toBe(mockAvatar.title);
          expect(body.backstory).toBe(mockAvatar.backstory);
        });
    });

    it('should return 404 when avatar does not exist', () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/avatars/current')
        .set('x-avatar-id', mockAvatar.id)
        .expect(404);
    });

    it('should return 400 when x-avatar-id header is missing', () => {
      return request(app.getHttpServer()).get('/avatars/current').expect(400);
    });

    it('should return 400 when x-avatar-id header is not a UUID', () => {
      return request(app.getHttpServer())
        .get('/avatars/current')
        .set('x-avatar-id', 'not-a-uuid')
        .expect(400);
    });
  });

  describe('PATCH /avatars/:id', () => {
    const updateBody = {
      title: 'Senior Mathematician',
      backstory: 'Updated backstory.',
    };

    it('should update an avatar and return 200', async () => {
      const updatedAvatar: AvatarEntity = { ...mockAvatar, ...updateBody };
      mockRepository.findOneBy.mockResolvedValue(mockAvatar);
      mockRepository.save.mockResolvedValue(updatedAvatar);

      return request(app.getHttpServer())
        .patch(`/avatars/${mockAvatar.id}`)
        .send(updateBody)
        .expect(200)
        .expect((res) => {
          const body = res.body as AvatarDto;
          expect(body.id).toBe(mockAvatar.id);
          expect(body.title).toBe(updateBody.title);
          expect(body.backstory).toBe(updateBody.backstory);
        });
    });

    it('should return 404 when avatar does not exist', () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .patch(`/avatars/${mockAvatar.id}`)
        .send(updateBody)
        .expect(404);
    });

    it('should return 400 when id is not a UUID', () => {
      return request(app.getHttpServer())
        .patch('/avatars/not-a-uuid')
        .send(updateBody)
        .expect(400);
    });

    it('should return 400 when age is negative', () => {
      return request(app.getHttpServer())
        .patch(`/avatars/${mockAvatar.id}`)
        .send({ age: -1 })
        .expect(400);
    });

    it('should return 400 when sex is not a valid enum value', () => {
      return request(app.getHttpServer())
        .patch(`/avatars/${mockAvatar.id}`)
        .send({ sex: 'not-a-sex' })
        .expect(400);
    });
  });
});
