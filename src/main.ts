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
import { CharactersModule } from './modules/characters/characters.module';
import { ChatsModule } from './modules/chats/chats.module';
import { HealthModule } from './modules/health/health.module';
import { LocationsModule } from './modules/locations/locations.module';
import { SystemChatsModule } from './modules/systemChats/systemChats.module';
import { UsersModule } from './modules/users/users.module';

const mcpTagDescription = `
This server exposes an [MCP](https://modelcontextprotocol.io/) endpoint that AI
clients (Cursor, Claude Desktop, etc.) can connect to.

## Available tools

| Tool | Description |
|------|-------------|
| \`list-characters\` | List all characters in the city |
| \`get-character\` | Get a single character by ID |
| \`create-character\` | Create a new character |
| \`update-character\` | Update an existing character |
| \`delete-character\` | Delete a character |
| \`list-locations\` | List all locations in the city |
| \`get-location\` | Get a single location by ID |
| \`create-location\` | Create a new location |
| \`update-location\` | Update an existing location |
| \`delete-location\` | Delete a location |
| \`create-place\` | Create a place within a location |
| \`update-place\` | Update an existing place |
| \`delete-place\` | Delete a place |

## Connecting

Add the server to your MCP client configuration.
Replace \`<base-url>\` with the deployment URL or \`http://localhost:3000\` for local development.

**Streamable HTTP (recommended)**

\`\`\`json
{
  "mcpServers": {
    "gpt-city": {
      "url": "<base-url>/mcp"
    }
  }
}
\`\`\`

**SSE**

\`\`\`json
{
  "mcpServers": {
    "gpt-city": {
      "url": "<base-url>/sse"
    }
  }
}
\`\`\`
`.trim();

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
  });

  const config = new DocumentBuilder()
    .setTitle('GPT City API')
    .setDescription(
      'GPT City is a simulation game where a city is inhabited by AI-driven characters, ' +
        'each with their own personality, backstory, and role in the community. ' +
        'This API provides endpoints for managing characters, locations, places, chats, and monitoring service health.',
    )
    .setVersion(configService.getServerVersion())
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

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch(console.error);
