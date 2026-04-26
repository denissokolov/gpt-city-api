export const systemChatsTagDescription = `
System chats are AI-driven conversations that let an authenticated avatar manage
the GPT City world through natural language. The assistant has access to a set
of tools that can read and modify characters, locations, and places, so an avatar
can ask things like "create a new character" or "list all locations" instead of
calling the REST endpoints directly.

## Available tools

| Tool | Description |
|------|-------------|
| \`list_characters\` | List all characters in the city |
| \`get_character\` | Get a single character by ID |
| \`create_character\` | Create a new character in the city |
| \`update_character\` | Update an existing character by ID |
| \`delete_character\` | Delete a character by ID |
| \`list_locations\` | List all locations in the city (without characters or places) |
| \`get_location\` | Get a single location by ID with its characters and places |
| \`create_location\` | Create a new location in the city |
| \`update_location\` | Update an existing location by ID |
| \`delete_location\` | Delete a location by ID (also deletes its places) |
| \`create_place\` | Create a new place within a location |
| \`update_place\` | Update an existing place by ID |
| \`delete_place\` | Delete a place by ID |
| \`update_avatar\` | Update an existing avatar profile by ID |
| \`clear_avatar_history\` | Wipe an avatar's chat history with characters |
`.trim();
