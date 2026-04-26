import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { ConfigurationService } from '../../common/configuration/configuration.service';
import { UserFacade } from '../users/user.facade';
import { UserEntity } from '../users/user.entity';
import { REFRESH_JWT_TYP } from './auth.constants';
import { RevokedRefreshTokensService } from './revoked-refresh-tokens.service';

export interface JwtPayload {
  sub: string;
}

interface RefreshJwtPayload {
  sub: string;
  typ: typeof REFRESH_JWT_TYP;
  jti: string;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  /** Unix timestamp in seconds (UTC) when the access JWT expires; same as the JWT `exp` claim. */
  accessTokenExpiresAt: number;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly jwtService: JwtService,
    private readonly userFacade: UserFacade,
    private readonly revokedRefreshTokens: RevokedRefreshTokensService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configurationService.getGoogleClientId(),
    );
  }

  async authenticateWithGoogle(idToken: string): Promise<AuthTokens> {
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

    return this.issueTokenPair(user);
  }

  async refreshWithToken(refreshToken: string): Promise<AuthTokens> {
    const secret = this.configurationService.getJwtSecret();
    let decoded: RefreshJwtPayload;
    try {
      decoded = this.jwtService.verify<RefreshJwtPayload>(refreshToken, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (
      decoded.typ !== REFRESH_JWT_TYP ||
      typeof decoded.jti !== 'string' ||
      !decoded.jti
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (await this.revokedRefreshTokens.isRevoked(decoded.jti)) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const user = await this.userFacade.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const ttl = this.refreshRevocationTtlSeconds(decoded);
    await this.revokedRefreshTokens.revoke(decoded.jti, ttl);
    return this.issueTokenPair(user);
  }

  /**
   * Revokes a refresh token when the client sends it, so it cannot be reused.
   * Stateless access JWTs remain valid until they expire.
   */
  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const secret = this.configurationService.getJwtSecret();
    try {
      const decoded = this.jwtService.verify<RefreshJwtPayload>(refreshToken, {
        secret,
        ignoreExpiration: true,
      });
      if (decoded.typ !== REFRESH_JWT_TYP || typeof decoded.jti !== 'string') {
        return;
      }
      const ttl = this.refreshRevocationTtlSeconds(decoded);
      await this.revokedRefreshTokens.revoke(decoded.jti, ttl);
    } catch {
      // Bad signature or malformed token — treat as no-op for idempotent logout.
    }
  }

  async getAuthenticatedUser(userId: string): Promise<UserEntity> {
    const user = await this.userFacade.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private issueTokenPair(user: UserEntity): AuthTokens {
    const accessToken = this.signAccessJwt(user);
    return {
      accessToken,
      accessTokenExpiresAt: this.readAccessJwtExp(accessToken),
      refreshToken: this.signRefreshJwt(user),
    };
  }

  private signAccessJwt(user: UserEntity): string {
    const payload: JwtPayload = { sub: user.id };
    return this.jwtService.sign(payload);
  }

  private readAccessJwtExp(accessToken: string): number {
    const decoded: unknown = this.jwtService.decode(accessToken);
    if (typeof decoded !== 'object' || decoded === null) {
      throw new Error(
        'Access JWT is missing exp; check JwtModule signOptions.expiresIn',
      );
    }
    if (!('exp' in decoded)) {
      throw new Error(
        'Access JWT is missing exp; check JwtModule signOptions.expiresIn',
      );
    }
    const exp = (decoded as { exp: unknown }).exp;
    if (typeof exp !== 'number') {
      throw new Error(
        'Access JWT is missing exp; check JwtModule signOptions.expiresIn',
      );
    }
    return exp;
  }

  private signRefreshJwt(user: UserEntity): string {
    const payload: RefreshJwtPayload = {
      sub: user.id,
      typ: REFRESH_JWT_TYP,
      jti: randomUUID(),
    };
    return this.jwtService.sign(payload, { expiresIn: '30d' });
  }

  /**
   * Remaining lifetime of the refresh JWT in whole seconds, for Redis key TTL.
   * Returns 0 if the token has no exp or is already expired (caller may skip revoke).
   */
  private refreshRevocationTtlSeconds(decoded: RefreshJwtPayload): number {
    if (typeof decoded.exp !== 'number') {
      return 0;
    }
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    return ttl < 1 ? 0 : ttl;
  }
}
