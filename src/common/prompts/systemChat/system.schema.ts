import { z } from 'zod';

export default z.object({
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    title: z.string(),
  }),
  locale: z.string(),
});
