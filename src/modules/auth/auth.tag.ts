export const authTagDescription = `
Authentication via Google Sign-In.

## Flow

1. The client authenticates with Google using the Google Sign-In SDK and receives an **ID token**.
2. The client sends \`POST /auth/google\` with the ID token.
3. The server verifies the token with Google, creates or updates the user record, and returns a signed **JWT**.
4. The client includes the JWT as \`Authorization: Bearer <token>\` on all protected endpoints.

## Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| \`POST /auth/google\` | None | Exchange Google ID token for application JWT |
| \`GET /auth/me\` | Bearer JWT | Return the current authenticated user |
`.trim();
