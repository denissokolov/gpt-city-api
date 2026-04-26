import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../../common/redis/redis.constants';

const REVOKED_REFRESH_KEY_PREFIX = 'auth:revoked-refresh:';

@Injectable()
export class RevokedRefreshTokensService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async isRevoked(jti: string): Promise<boolean> {
    const n = await this.redis.exists(this.key(jti));
    return n === 1;
  }

  /**
   * Marks a refresh token JTI as revoked until the JWT would have expired.
   * Uses Redis TTL so keys are removed automatically.
   */
  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds < 1) {
      return;
    }
    await this.redis.set(this.key(jti), '1', 'EX', ttlSeconds);
  }

  private key(jti: string): string {
    return `${REVOKED_REFRESH_KEY_PREFIX}${jti}`;
  }
}
