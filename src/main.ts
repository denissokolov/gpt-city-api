import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from './app.module';
import { ConfigurationService } from './common/configuration/configuration.service';
import { CharactersModule } from './modules/characters/characters.module';
import { HealthModule } from './modules/health/health.module';

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
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const configService = app.get(ConfigurationService);

  const config = new DocumentBuilder()
    .setTitle('GPT City API')
    .setDescription(
      'GPT City is a simulation game where a city is inhabited by AI-driven characters, ' +
        'each with their own personality, backstory, and role in the community. ' +
        'This API provides endpoints for querying city inhabitants and monitoring service health.',
    )
    .setVersion(configService.getServerVersion())
    .addTag('mcp', mcpTagDescription)
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [HealthModule, CharactersModule],
  });

  app.use('/api', apiReference({ content: document }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
