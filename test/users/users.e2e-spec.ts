import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { UserDto } from '../../src/modules/users/user.dto';
import { UserEntity } from '../../src/modules/users/user.entity';
import { Sex } from '../../src/modules/users/user.enum';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersService } from '../../src/modules/users/users.service';

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

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const validBody = {
  firstName: mockUser.firstName,
  lastName: mockUser.lastName,
  age: mockUser.age,
  sex: mockUser.sex,
  title: mockUser.title,
  backstory: mockUser.backstory,
};

describe('UsersController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
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

  describe('POST /users', () => {
    it('should create a user and return 201', async () => {
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post('/users')
        .send(validBody)
        .expect(201)
        .expect((res) => {
          const body = res.body as UserDto;
          expect(body.id).toBe(mockUser.id);
          expect(body.firstName).toBe(mockUser.firstName);
          expect(body.lastName).toBe(mockUser.lastName);
          expect(body.age).toBe(mockUser.age);
          expect(body.sex).toBe(mockUser.sex);
          expect(body.title).toBe(mockUser.title);
          expect(body.backstory).toBe(mockUser.backstory);
        });
    });

    it('should return 400 when body is empty', () => {
      return request(app.getHttpServer()).post('/users').send({}).expect(400);
    });

    it('should return 400 when firstName is missing', () => {
      const body = { ...validBody };
      delete (body as Partial<typeof validBody>).firstName;
      return request(app.getHttpServer()).post('/users').send(body).expect(400);
    });

    it('should return 400 when age is negative', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ ...validBody, age: -1 })
        .expect(400);
    });

    it('should return 400 when age is not an integer', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ ...validBody, age: 'old' })
        .expect(400);
    });

    it('should return 400 when sex is not a valid enum value', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ ...validBody, sex: 'not-a-sex' })
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    const updateBody = {
      title: 'Senior Mathematician',
      backstory: 'Updated backstory.',
    };

    it('should update a user and return 200', async () => {
      const updatedUser: UserEntity = { ...mockUser, ...updateBody };
      mockRepository.findOneBy.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      return request(app.getHttpServer())
        .patch(`/users/${mockUser.id}`)
        .send(updateBody)
        .expect(200)
        .expect((res) => {
          const body = res.body as UserDto;
          expect(body.id).toBe(mockUser.id);
          expect(body.title).toBe(updateBody.title);
          expect(body.backstory).toBe(updateBody.backstory);
        });
    });

    it('should return 404 when user does not exist', () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .patch(`/users/${mockUser.id}`)
        .send(updateBody)
        .expect(404);
    });

    it('should return 400 when id is not a UUID', () => {
      return request(app.getHttpServer())
        .patch('/users/not-a-uuid')
        .send(updateBody)
        .expect(400);
    });

    it('should return 400 when age is negative', () => {
      return request(app.getHttpServer())
        .patch(`/users/${mockUser.id}`)
        .send({ age: -1 })
        .expect(400);
    });

    it('should return 400 when sex is not a valid enum value', () => {
      return request(app.getHttpServer())
        .patch(`/users/${mockUser.id}`)
        .send({ sex: 'not-a-sex' })
        .expect(400);
    });
  });
});
