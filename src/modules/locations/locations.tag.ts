export const locationsTagDescription = `
Locations are the physical areas of GPT City (a café, a park, a town square,
…). Each location contains one or more places where characters can gather and
chats can happen.

This module exposes read-only views over the world: listing all locations and
fetching a single location's current state, including which characters are
distributed across its places at the user's local time. Locations and places
are created and modified through the System Chats assistant or via the MCP
server.
`.trim();
