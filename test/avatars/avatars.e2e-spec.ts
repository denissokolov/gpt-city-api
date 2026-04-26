import { ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { ConfigurationModule } from '../../src/common/configuration/configuration.module';
import { JwtStrategy } from '../../src/modules/auth/jwt.strategy';
import { AvatarDto } from '../../src/modules/avatars/avatar.dto';
import { AvatarEntity } from '../../src/modules/avatars/avatar.entity';
import { Sex } from '../../src/modules/avatars/avatar.enum';
import { AvatarsController } from '../../src/modules/avatars/avatars.controller';
import { AvatarsService } from '../../src/modules/avatars/avatars.service';
import { UserEntity } from '../../src/modules/users/user.entity';

const TEST_JWT_SECRET = 'test-jwt-secret';

const mockUser: UserEntity = {
  id: '11111111-2222-3333-4444-555555555555',
  googleId: 'google-id',
  email: 'alice@example.com',
  name: 'Alice Smith',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockAvatar: AvatarEntity = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  user: mockUser,
  userId: mockUser.id,
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
  findBy: jest.fn(),
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
  let jwtService: JwtService;
  let bearerToken: string;

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigurationModule,
        PassportModule,
        JwtModule.register({ secret: TEST_JWT_SECRET }),
      ],
      controllers: [AvatarsController],
      providers: [
        AvatarsService,
        JwtStrategy,
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

    jwtService = moduleFixture.get(JwtService);
    bearerToken = jwtService.sign({ sub: mockUser.id });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /avatars', () => {
    it('should create an avatar for the authenticated user and return 201', async () => {
      mockRepository.create.mockReturnValue(mockAvatar);
      mockRepository.save.mockResolvedValue(mockAvatar);

      return request(app.getHttpServer())
        .post('/avatars')
        .set('Authorization', `Bearer ${bearerToken}`)
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
        })
        .expect(() => {
          expect(mockRepository.create).toHaveBeenCalledWith({
            ...validBody,
            userId: mockUser.id,
          });
        });
    });

    it('should return 401 when Authorization header is missing', () => {
      return request(app.getHttpServer())
        .post('/avatars')
        .send(validBody)
        .expect(401);
    });

    it('should return 400 when body is empty', () => {
      return request(app.getHttpServer())
        .post('/avatars')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when firstName is missing', () => {
      const body = { ...validBody };
      delete (body as Partial<typeof validBody>).firstName;
      return request(app.getHttpServer())
        .post('/avatars')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(body)
        .expect(400);
    });

    it('should return 400 when age is negative', () => {
      return request(app.getHttpServer())
        .post('/avatars')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({ ...validBody, age: -1 })
        .expect(400);
    });

    it('should return 400 when age is not an integer', () => {
      return request(app.getHttpServer())
        .post('/avatars')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({ ...validBody, age: 'old' })
        .expect(400);
    });

    it('should return 400 when sex is not a valid enum value', () => {
      return request(app.getHttpServer())
        .post('/avatars')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send({ ...validBody, sex: 'not-a-sex' })
        .expect(400);
    });
  });

  describe('GET /avatars', () => {
    it("should return the authenticated user's avatars and 200", async () => {
      mockRepository.findBy.mockResolvedValue([mockAvatar]);

      return request(app.getHttpServer())
        .get('/avatars')
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as AvatarDto[];
          expect(body).toHaveLength(1);
          expect(body[0].id).toBe(mockAvatar.id);
          expect(body[0].firstName).toBe(mockAvatar.firstName);
        })
        .expect(() => {
          expect(mockRepository.findBy).toHaveBeenCalledWith({
            userId: mockUser.id,
          });
        });
    });

    it('should return an empty array when the user owns no avatars', async () => {
      mockRepository.findBy.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/avatars')
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as AvatarDto[];
          expect(body).toEqual([]);
        });
    });

    it('should return 401 when Authorization header is missing', () => {
      return request(app.getHttpServer()).get('/avatars').expect(401);
    });

    it('should return 401 when the Bearer token is invalid', () => {
      return request(app.getHttpServer())
        .get('/avatars')
        .set('Authorization', 'Bearer not.a.valid.token')
        .expect(401);
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
