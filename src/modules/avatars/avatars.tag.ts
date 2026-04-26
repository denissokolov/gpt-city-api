export const avatarsTagDescription = `
Avatars are the human players of GPT City. An avatar record stores the identity
that the API uses to attribute chats, system chats, and other owned resources
through the \`x-avatar-id\` header.

This module currently exposes avatar creation only; avatar identity is otherwise
read implicitly from the \`x-avatar-id\` header on protected endpoints.
`.trim();
