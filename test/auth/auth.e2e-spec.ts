import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { ConfigurationModule } from '../../src/common/configuration/configuration.module';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtStrategy } from '../../src/modules/auth/jwt.strategy';
import { AuthTokenDto, AuthUserDto } from '../../src/modules/auth/auth.dto';

const TEST_JWT_SECRET = 'test-jwt-secret';

const mockUser: AuthUserDto = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'alice@example.com',
  name: 'Alice Smith',
};

const mockAuthService = {
  authenticateWithGoogle: jest.fn(),
  getAuthenticatedUser: jest.fn(),
};

describe('AuthController (e2e)', () => {
  let app: NestFastifyApplication;
  let jwtService: JwtService;

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
      controllers: [AuthController],
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
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
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/google', () => {
    it('should return an access token for a valid Google ID token', async () => {
      mockAuthService.authenticateWithGoogle.mockResolvedValue('app.jwt.token');

      return request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'google-id-token' })
        .expect(200)
        .expect((res) => {
          const body = res.body as AuthTokenDto;
          expect(body.accessToken).toBe('app.jwt.token');
        });
    });

    it('should return 400 when idToken is missing', () => {
      return request(app.getHttpServer())
        .post('/auth/google')
        .send({})
        .expect(400);
    });

    it('should return 401 when the Google ID token is invalid', async () => {
      mockAuthService.authenticateWithGoogle.mockRejectedValue(
        new UnauthorizedException('Invalid Google ID token'),
      );

      return request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'bad-token' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return the current user for a valid Bearer token', async () => {
      mockAuthService.getAuthenticatedUser.mockResolvedValue(mockUser);

      const token = jwtService.sign({ sub: mockUser.id });

      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as AuthUserDto;
          expect(body.id).toBe(mockUser.id);
          expect(body.email).toBe(mockUser.email);
          expect(body.name).toBe(mockUser.name);
        });
    });

    it('should return 401 when Authorization header is missing', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should return 401 when the Bearer token is invalid', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer not.a.valid.token')
        .expect(401);
    });
  });
});
