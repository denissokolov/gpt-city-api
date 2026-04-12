import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { ConfigurationModule } from './common/configuration/configuration.module';
import { DatabaseModule } from './common/database/database.module';
import { CharactersModule } from './modules/characters/characters.module';
import { CharactersTool } from './modules/characters/characters.tool';
import { ChatsModule } from './modules/chats/chats.module';
import { HealthModule } from './modules/health/health.module';
import { LocationsModule } from './modules/locations/locations.module';
import { LocationsTool } from './modules/locations/locations.tool';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    HealthModule,
    CharactersModule,
    ChatsModule,
    LocationsModule,
    McpModule.forRoot({
      name: 'gpt-city',
      version: '0.0.1',
      instructions:
        'GPT City is a game where a city is inhabited by AI agents. ' +
        'Use the available tools to manage the game: create characters, ' +
        'update their personalities, list them, or remove them from the city.',
    }),
  ],
  providers: [CharactersTool, LocationsTool],
})
export class AppModule {}
