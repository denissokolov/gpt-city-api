import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigurationModule } from '../configuration/configuration.module';
import { ConfigurationService } from '../configuration/configuration.service';
import { REDIS_CLIENT } from './redis.constants';
import { RedisShutdownHook } from './redis-shutdown.hook';

@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configurationService: ConfigurationService) =>
        new Redis(configurationService.getRedisUrl()),
      inject: [ConfigurationService],
    },
    RedisShutdownHook,
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
