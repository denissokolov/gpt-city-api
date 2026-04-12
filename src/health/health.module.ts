import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ConfigurationModule } from '../configuration/configuration.module';

@Module({
  imports: [ConfigurationModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
