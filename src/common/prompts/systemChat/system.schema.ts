import { z } from 'zod';

export default z.object({
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    title: z.string(),
  }),
  locale: z.string(),
});
