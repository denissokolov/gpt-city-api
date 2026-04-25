import { z } from 'zod';
import { Sex } from '../../../modules/characters/character.enum';

export default z.object({
  userTime: z.string(),
  location: z.object({
    name: z.string(),
    description: z.string(),
    places: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
      }),
    ),
    characters: z.array(
      z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        title: z.string(),
        age: z.number(),
        sex: z.enum(Sex),
        personality: z.string(),
        backstory: z.string(),
      }),
    ),
  }),
});
