export const chatsTagDescription = `
Chats are real-time, role-played conversations between an avatar and one or more
GPT City characters at a specific place. Each chat is bound to a place and a
set of characters; messages are streamed back from the AI model that powers the
character, taking into account the location, the character's personality, the
avatar's identity, and the chat history.

The \`POST /chats/:id/message\` endpoint returns a streaming response — clients
should consume it as a server-sent stream rather than waiting for a single
JSON body. Both the \`x-avatar-id\` and \`x-locale\` headers are required.
`.trim();
