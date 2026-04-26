import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigurationService } from '../../common/configuration/configuration.service';
import { REFRESH_JWT_TYP } from './auth.constants';
import type { JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configurationService: ConfigurationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configurationService.getJwtSecret(),
    });
  }

  validate(payload: JwtPayload & { typ?: string }): JwtPayload {
    if (payload.typ === REFRESH_JWT_TYP) {
      throw new UnauthorizedException(
        'Use an access token, not a refresh token',
      );
    }
    return { sub: payload.sub };
  }
}
