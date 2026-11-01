# GPT City API

Backend for **GPT City**, a chat game set in a city where every character is an AI actor. Each NPC has its own personality, backstory, mood and long-term memory of the people it has met, and runs on its own LLM. Players walk the city as an avatar and talk to whoever is around. Using an admin assistant with tools, they can also build their own world: locations, places, and the characters who live there.

The browser client lives in [gpt-city-game-poc](https://github.com/denissokolov/gpt-city-game-poc).

## How it works

- **Characters as actors.** Each character has a name, role, age, personality, backstory, optional per-character instructions, and its own `provider` + `model` (OpenAI, Anthropic or Google, routed through the Vercel AI Gateway). The in-character system prompt keeps them in role: no AI talk, no fourth-wall breaks, replies in the player's language.
- **Memory.** After every exchange, the character's long-term memory of that avatar (relationship, sentiment, familiarity, key facts) is updated. Each chat is also summarised, so characters remember earlier conversations in other places, and long chats survive history truncation.
- **A living city.** When a player opens a location, an LLM distributes its characters across its places based on their roles, relationships and the player's local time of day, and gives each one a current mood and activity. The result is cached for an hour.
- **Silence events.** If the player stays quiet, the client sends an activity event and the character reacts to the pause in character.
- **World building through chat.** A separate *system chat* is an admin co-pilot with tools to list, create, update and delete characters, locations and places, and to manage the avatar. It confirms before destructive actions.
- **MCP server.** The same world-building tools are exposed over the [Model Context Protocol](https://modelcontextprotocol.io/), so you can also build the city from Claude Desktop, Cursor or any other MCP client.

## Stack

NestJS 11 on Fastify · TypeORM + PostgreSQL · Redis · Vercel AI SDK (`ai`) via the AI Gateway · `@rekog/mcp-nest` · Handlebars prompt templates with zod-validated inputs · Google sign-in + JWT · OpenAPI with a Scalar explorer · Logfire (OpenTelemetry) tracing · Heroku.

### Code layout

```
src/
  modules/        one folder per feature: auth, avatars, characters, chats,
                  locations, systemChats, health
                  (modules talk to each other only through *.facade.ts)
  common/
    prompts/      Handlebars templates + zod schemas for every LLM call
    database/     data source and migrations
    redis/        Redis client (refresh-token revocation)
  mcp.tag.ts      MCP tool list and connection docs
```

## Getting started

```bash
npm install
cp .env.example .env    # fill in JWT_SECRET, GOOGLE_CLIENT_ID, AI_GATEWAY_API_KEY
npm run start:docker    # local Postgres + Redis via docker compose
npm run migration:run
npm run start:dev       # http://localhost:3000
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DATABASE_SSL` | PostgreSQL connection |
| `REDIS_URL` | Redis connection |
| `JWT_SECRET` | Signs application access/refresh tokens |
| `GOOGLE_CLIENT_ID` | Verifies Google ID tokens at `POST /auth/google` |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key for all model calls |
| `LOGFIRE_WRITE_TOKEN` | Optional tracing |

## API explorer

The full OpenAPI spec is served at `/openapi.json`, with an interactive [Scalar](https://scalar.com/) explorer at `/doc` for browsing endpoints, schemas, and sending requests from the browser.

- Staging: https://gpt-city-api-5950170b319a.herokuapp.com/doc
- Local: http://localhost:3000/doc

## Connecting an MCP client

```json
{
  "mcpServers": {
    "gpt-city": { "url": "http://localhost:3000/mcp" }
  }
}
```

Streamable HTTP is served at `/mcp` and SSE at `/sse`. The tool list is in `src/mcp.tag.ts` and in the `mcp` section of the API explorer.

## Checks

```bash
npm run check       # typecheck + lint + unit tests + e2e tests (same as CI)
npm run test        # unit tests only
npm run test:e2e    # e2e tests only
```

## Database migrations

```bash
npm run migration:generate -- src/common/database/migrations/<Name>
npm run migration:run
npm run migration:revert
```

Migrations also run automatically on every Heroku release (`Procfile`).

## Deployment

Pushes to `main` that pass CI are deployed to [Heroku](https://www.heroku.com/) by GitHub Actions.

1. Create a Heroku app with the **Heroku Postgres** and Redis add-ons, and set the environment variables above.
2. In the GitHub repo, set the secret `HEROKU_API_KEY` and the variables `HEROKU_APP_NAME` and `HEROKU_EMAIL`.

Manual deploy: `git push heroku main`. Logs: `heroku logs --tail --app gpt-city-api`.
