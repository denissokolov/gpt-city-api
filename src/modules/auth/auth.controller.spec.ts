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
            getAuthenticatedUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe('googleAuth', () => {
    it('should return an access token on valid Google ID token', async () => {
      service.authenticateWithGoogle.mockResolvedValue('signed.jwt.token');

      const result = await controller.googleAuth({
        idToken: 'google-id-token',
      });

      expect(result).toEqual({ accessToken: 'signed.jwt.token' });
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
