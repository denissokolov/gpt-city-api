import type { ServerResponse } from 'node:http';

import type { FastifyReply } from 'fastify';

interface PipeableUIMessageStream {
  pipeUIMessageStreamToResponse(response: ServerResponse): void;
}

/**
 * Pipes an AI SDK stream (e.g. the result of `streamText`) to a Fastify reply,
 * preserving headers added by Fastify plugins.
 *
 * Fastify plugins like `@fastify/cors` store response headers on the
 * `FastifyReply`, not on the underlying Node `ServerResponse`. The AI SDK
 * writes the streaming body directly to `res.raw` (and calls
 * `res.raw.writeHead`), which would otherwise drop those headers — most
 * notably the CORS headers required by the browser on the streamed body.
 * Forward the reply-level headers onto the raw response, then hijack so
 * Fastify doesn't try to send a second response.
 */
export function pipeAiStreamToReply(
  stream: PipeableUIMessageStream,
  res: FastifyReply,
): void {
  for (const [name, value] of Object.entries(res.getHeaders())) {
    if (value !== undefined && !res.raw.hasHeader(name)) {
      res.raw.setHeader(name, value);
    }
  }
  res.hijack();

  stream.pipeUIMessageStreamToResponse(res.raw);
}
