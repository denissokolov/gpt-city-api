import { z } from 'zod';

import { MessageRole } from '../../../modules/chats/message.enum';

export default z.object({
  existingSummary: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(MessageRole),
      content: z.string(),
    }),
  ),
});
