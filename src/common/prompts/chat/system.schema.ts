import { z } from 'zod';

export default z.object({
  character: z.object({
    firstName: z.string(),
    lastName: z.string(),
    title: z.string(),
    age: z.number(),
    sex: z.string(),
    personality: z.string(),
    backstory: z.string(),
  }),
  place: z.object({
    name: z.string(),
    description: z.string(),
  }),
  location: z.object({
    name: z.string(),
    description: z.string(),
    locale: z.string(),
  }),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    age: z.number(),
    sex: z.string(),
    title: z.string(),
    backstory: z.string(),
  }),
  historyIsTruncated: z.boolean(),
  summary: z.string().optional(),
  locale: z.string(),
  previousChats: z.array(
    z.object({
      summary: z.string().optional(),
      placeName: z.string(),
      updatedAt: z.date(),
    }),
  ),
});
