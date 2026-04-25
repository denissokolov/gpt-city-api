import './instrumentation';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from './app.module';
import { ConfigurationService } from './common/configuration/configuration.service';
import { mcpTagDescription } from './mcp.tag';
import { CharactersModule } from './modules/characters/characters.module';
import { charactersTagDescription } from './modules/characters/characters.tag';
import { ChatsModule } from './modules/chats/chats.module';
import { chatsTagDescription } from './modules/chats/chats.tag';
import { HealthModule } from './modules/health/health.module';
import { healthTagDescription } from './modules/health/health.tag';
import { LocationsModule } from './modules/locations/locations.module';
import { locationsTagDescription } from './modules/locations/locations.tag';
import { SystemChatsModule } from './modules/systemChats/systemChats.module';
import { systemChatsTagDescription } from './modules/systemChats/systemChats.tag';
import { UsersModule } from './modules/users/users.module';
import { usersTagDescription } from './modules/users/users.tag';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const configService = app.get(ConfigurationService);

  app.enableCors({
    origin: configService.getWebOrigin(),
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  const config = new DocumentBuilder()
    .setTitle('GPT City API')
    .setDescription(
      'GPT City is a simulation game where a city is inhabited by AI-driven characters, ' +
        'each with their own personality, backstory, and role in the community. ' +
        'This API provides endpoints for managing characters, locations, places, chats, and monitoring service health.',
    )
    .setVersion(configService.getServerVersion())
    .addTag('health', healthTagDescription)
    .addTag('users', usersTagDescription)
    .addTag('characters', charactersTagDescription)
    .addTag('locations', locationsTagDescription)
    .addTag('chats', chatsTagDescription)
    .addTag('system-chats', systemChatsTagDescription)
    .addTag('mcp', mcpTagDescription)
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [
      HealthModule,
      CharactersModule,
      ChatsModule,
      SystemChatsModule,
      LocationsModule,
      UsersModule,
    ],
  });

  app.use('/doc', apiReference({ content: document, withFastify: true }));

  app.getHttpAdapter().get('/openapi.json', (_req, res) => {
    res.send(document);
  });

  // OpenTelemetry (loaded via @pydantic/logfire-node) keeps the event loop
  // alive and intercepts SIGTERM, which prevents `nest start --watch` from
  // restarting the process on file changes. Force-exit on shutdown signals.
  const shutdown = (signal: NodeJS.Signals) => {
    void app
      .close()
      .catch((err) => console.error(`Error during shutdown (${signal})`, err))
      .finally(() => process.exit(0));
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch(console.error);
