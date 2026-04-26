import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigurationService } from '../../common/configuration/configuration.service';
import { UserFacade } from '../users/user.facade';
import { UserEntity } from '../users/user.entity';

export interface JwtPayload {
  sub: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly jwtService: JwtService,
    private readonly userFacade: UserFacade,
  ) {
    this.googleClient = new OAuth2Client(
      this.configurationService.getGoogleClientId(),
    );
  }

  async authenticateWithGoogle(idToken: string): Promise<string> {
    const ticket = await this.googleClient
      .verifyIdToken({
        idToken,
        audience: this.configurationService.getGoogleClientId(),
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid Google ID token');
      });

    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid Google ID token payload');
    }

    const user = await this.userFacade.upsert({
      googleId: payload.sub,
      email: payload.email ?? '',
      name: payload.name ?? '',
    });

    return this.signJwt(user);
  }

  async getAuthenticatedUser(userId: string): Promise<UserEntity> {
    const user = await this.userFacade.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private signJwt(user: UserEntity): string {
    const payload: JwtPayload = { sub: user.id };
    return this.jwtService.sign(payload);
  }
}
