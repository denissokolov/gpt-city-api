export const authTagDescription = `
Authentication via Google Sign-In.

## Flow

1. The client authenticates with Google using the Google Sign-In SDK and receives an **ID token**.
2. The client sends \`POST /auth/google\` with the ID token.
3. The server verifies the token with Google, creates or updates the user record, and returns an **access JWT** and a **refresh token**.
4. The client includes the access JWT as \`Authorization: Bearer <token>\` on protected endpoints.
5. Before the access token expires, the client can call \`POST /auth/refresh\` with the refresh token to obtain a new pair without Google.
6. On sign-out, the client calls \`POST /auth/logout\` with the refresh token (optional but recommended) and clears stored tokens locally.

## Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| \`POST /auth/google\` | None | Exchange Google ID token for access and refresh tokens |
| \`POST /auth/refresh\` | None | Exchange refresh token for a new access and refresh token |
| \`POST /auth/logout\` | None | Revoke the given refresh token on the server |
| \`GET /auth/me\` | Bearer JWT | Return the current authenticated user |
`.trim();
