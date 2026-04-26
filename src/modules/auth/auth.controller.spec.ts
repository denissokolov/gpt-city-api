/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'alice@example.com',
  name: 'Alice Smith',
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticateWithGoogle: jest.fn(),
            refreshWithToken: jest.fn(),
            logout: jest.fn(),
            getAuthenticatedUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe('googleAuth', () => {
    it('should return access and refresh tokens on valid Google ID token', async () => {
      service.authenticateWithGoogle.mockResolvedValue({
        accessToken: 'access.jwt',
        accessTokenExpiresAt: 1735689600,
        refreshToken: 'refresh.jwt',
      });

      const result = await controller.googleAuth({
        idToken: 'google-id-token',
      });

      expect(result).toEqual({
        accessToken: 'access.jwt',
        accessTokenExpiresAt: 1735689600,
        refreshToken: 'refresh.jwt',
      });
      expect(service.authenticateWithGoogle).toHaveBeenCalledWith(
        'google-id-token',
      );
    });

    it('should propagate UnauthorizedException when the token is invalid', async () => {
      service.authenticateWithGoogle.mockRejectedValue(
        new UnauthorizedException('Invalid Google ID token'),
      );

      await expect(
        controller.googleAuth({ idToken: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens from refreshWithToken', async () => {
      service.refreshWithToken.mockResolvedValue({
        accessToken: 'new.access',
        accessTokenExpiresAt: 1735776000,
        refreshToken: 'new.refresh',
      });

      const result = await controller.refresh({
        refreshToken: 'old.refresh',
      });

      expect(result).toEqual({
        accessToken: 'new.access',
        accessTokenExpiresAt: 1735776000,
        refreshToken: 'new.refresh',
      });
      expect(service.refreshWithToken).toHaveBeenCalledWith('old.refresh');
    });
  });

  describe('logout', () => {
    it('should call logout with refresh token', async () => {
      service.logout.mockResolvedValue(undefined);
      await controller.logout({ refreshToken: 'rt' });

      expect(service.logout).toHaveBeenCalledWith('rt');
    });

    it('should call logout with undefined when body omits refresh token', async () => {
      service.logout.mockResolvedValue(undefined);
      await controller.logout({});

      expect(service.logout).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getMe', () => {
    it('should return the authenticated user profile', async () => {
      service.getAuthenticatedUser.mockResolvedValue(mockUser as never);

      const result = await controller.getMe({ sub: mockUser.id });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(service.getAuthenticatedUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should propagate UnauthorizedException when user is not found', async () => {
      service.getAuthenticatedUser.mockRejectedValue(
        new UnauthorizedException('User not found'),
      );

      await expect(controller.getMe({ sub: 'nonexistent-id' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
