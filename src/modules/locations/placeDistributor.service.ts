import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { generateText, Output } from 'ai';

import { LocationEntity } from './location.entity';

export class PlaceOutput {
  placeId: string;
  charactersIds: string[];
}

@Injectable()
export class PlaceDistributorService {
  private MODEL = 'anthropic/claude-opus-4.6';
  private MAX_RETRIES = 3;

  async distributeCharacters(
    location: LocationEntity,
    userTime: string,
  ): Promise<PlaceOutput[]> {
    const { output } = await generateText({
      model: this.MODEL,
      system: this.getSystemPrompt(),
      prompt: this.generateUserPrompt(location, userTime),
      output: this.generateOutputSchema(),
      maxRetries: this.MAX_RETRIES,
    });

    return output;
  }

  getSystemPrompt() {
    return `
You are a place distributor. You are given a location and a list of characters. You need to distribute the characters across the places in the location.

Consider the following rules:
- Each character should be placed in a place that is relevant to their role or personality.
- Consider the characters' relationships with each other. For example, if a character is a friend of another character, they might be placed in the same place.
- Consider current time of day and the characters' activities. For example, if it is morning, the characters might be placed in a cafe or a park.
- Add elements of creativity to the distribution. For example, if a character is a librarian, they might be placed in a library, but they might also be placed in a cafe or a park.
    `;
  }

  generateUserPrompt(location: LocationEntity, userTime: string): string {
    const placeLines = location.places.map((place) =>
      `
<place>
  <id>${place.id}</id>
  <name>${place.name}</name>
  <description>${place.description}</description>
</place>
        `.trim(),
    );

    const characterLines = location.characters.map((character) =>
      `
<character>
  <id>${character.id}</id>
  <firstName>${character.firstName}</firstName>
  <lastName>${character.lastName}</lastName>
  <title>${character.title}</title>
  <age>${character.age}</age>
  <sex>${character.sex}</sex>
  <personality>${character.personality}</personality>
  <backstory>${character.backstory}</backstory>
</character>
      `.trim(),
    );

    return `
<location>
 <name>${location.name}</name>
 <description>${location.description}</description>
</location>

<current-time>
  ${userTime}
</current-time>

<places>
  ${placeLines.join('\n')}
</places>

<characters>
  ${characterLines.join('\n')}
</characters>
  `.trim();
  }

  private generateOutputSchema() {
    return Output.object({
      schema: z.array(
        z.object({
          placeId: z.string(),
          charactersIds: z.array(z.string()),
        }),
      ),
    });
  }
}
