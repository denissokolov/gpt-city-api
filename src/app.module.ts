import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { ConfigurationModule } from './common/configuration/configuration.module';
import { DatabaseModule } from './common/database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { AvatarsModule } from './modules/avatars/avatars.module';
import { AvatarsTool } from './modules/avatars/avatars.tool';
import { CharactersModule } from './modules/characters/characters.module';
import { CharactersTool } from './modules/characters/characters.tool';
import { ChatsModule } from './modules/chats/chats.module';
import { HealthModule } from './modules/health/health.module';
import { LocationsModule } from './modules/locations/locations.module';
import { LocationsTool } from './modules/locations/locations.tool';
import { SystemChatsModule } from './modules/systemChats/systemChats.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AvatarsModule,
    CharactersModule,
    ChatsModule,
    LocationsModule,
    SystemChatsModule,
    McpModule.forRoot({
      name: 'gpt-city',
      version: '0.0.3',
      instructions:
        'GPT City is a game where a city is inhabited by AI agents. ' +
        'Use the available tools to manage the game: create characters, ' +
        'update their personalities, list them, or remove them from the city.',
    }),
  ],
  providers: [AvatarsTool, CharactersTool, LocationsTool],
})
export class AppModule {}
