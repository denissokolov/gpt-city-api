import { Module } from '@nestjs/common';
import { ConfigurationModule } from './common/configuration/configuration.module';
import { DatabaseModule } from './common/database/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, HealthModule],
})
export class AppModule {}
