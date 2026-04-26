export const avatarsTagDescription = `
Avatars are the human players of GPT City. Each avatar belongs to an authenticated
user (linked by \`userId\` and resolved from the JWT) and acts as the identity that
the API uses to attribute chats, system chats, and other owned resources through
the \`x-avatar-id\` header.

\`POST /avatars\` creates a new avatar owned by the caller of the JWT, and
\`GET /avatars\` lists all avatars owned by the caller. Other endpoints continue
to read the active avatar from the \`x-avatar-id\` header.
`.trim();
