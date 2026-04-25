import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { generateText, Output } from 'ai';

import { PromptsService } from '../../common/prompts/prompts.service';
import { LocationEntity } from './location.entity';

export class PlaceOutput {
  placeId: string;
  charactersIds: string[];
}

@Injectable()
export class PlaceDistributorService {
  private MODEL = 'anthropic/claude-opus-4.7';
  private MAX_RETRIES = 3;

  constructor(private readonly promptsService: PromptsService) {}

  async distributeCharacters(
    location: LocationEntity,
    userTime: string,
  ): Promise<PlaceOutput[]> {
    const { output } = await generateText({
      model: this.MODEL,
      system: this.promptsService.render('place/system', {}),
      prompt: this.promptsService.render('place/user', {
        userTime,
        location,
      }),
      output: this.generateOutputSchema(),
      maxRetries: this.MAX_RETRIES,
    });

    return output;
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
