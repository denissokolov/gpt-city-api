import { z } from 'zod';

import placeSystemPromptSchema from './place/system.schema';
import placeUserPromptSchema from './place/user.schema';
import chatSystemPromptSchema from './chat/system.schema';
import chatSummaryPromptSchema from './chatSummary/prompt.schema';
import systemChatSystemPromptSchema from './systemChat/system.schema';

export const promptRegistry = {
  'place/system': placeSystemPromptSchema,
  'place/user': placeUserPromptSchema,
  'chat/system': chatSystemPromptSchema,
  'chatSummary/prompt': chatSummaryPromptSchema,
  'systemChat/system': systemChatSystemPromptSchema,
} as const satisfies Record<string, z.ZodObject>;

export type PromptKey = keyof typeof promptRegistry;
export type PromptInput<K extends PromptKey> = z.input<
  (typeof promptRegistry)[K]
>;
