import { Module } from '@nestjs/common';
import { ConfigurationModule } from './common/configuration/configuration.module';
import { DatabaseModule } from './common/database/database.module';
import { CharactersModule } from './modules/characters/characters.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    HealthModule,
    CharactersModule,
  ],
})
export class AppModule {}
