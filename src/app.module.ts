import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [HealthModule, ConfigurationModule],
})
export class AppModule {}
