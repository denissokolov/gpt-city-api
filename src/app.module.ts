import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { ConfigurationModule } from './common/configuration/configuration.module';
import { DatabaseModule } from './common/database/database.module';
import { CharactersModule } from './modules/characters/characters.module';
import { CharactersTool } from './modules/characters/characters.tool';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    HealthModule,
    CharactersModule,
    McpModule.forRoot({
      name: 'gpt-city',
      version: '0.0.1',
      instructions:
        'GPT City is a game where a city is inhabited by AI agents. ' +
        'Use the available tools to manage the game: create characters, ' +
        'update their personalities, list them, or remove them from the city.',
    }),
  ],
  providers: [CharactersTool],
})
export class AppModule {}
