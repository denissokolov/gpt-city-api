export const usersTagDescription = `
Users are the human players of GPT City. A user record stores the identity
that the API uses to attribute chats, system chats, and other owned resources
through the \`x-user-id\` header.

This module currently exposes user creation only; user identity is otherwise
read implicitly from the \`x-user-id\` header on protected endpoints.
`.trim();
