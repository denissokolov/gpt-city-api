export const mcpTagDescription = `
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
| \`update-avatar\` | Update an existing avatar profile |
| \`clear-avatar-history\` | Wipe an avatar's chat history with characters (memories, chats, messages) |

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
