import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateText, Output } from 'ai';
import { z } from 'zod';

import { CharacterEntity } from './character.entity';
import { CharacterMemoryEntity } from './characterMemory.entity';
import { MessageEntity } from '../chats/message.entity';
import { UserEntity } from '../users/user.entity';
import { PromptsService } from '../../common/prompts/prompts.service';
import { LocationEntity } from '../locations/location.entity';
import { PlaceEntity } from '../locations/place.entity';

export type UpsertCharacterMemoryInput = {
  characterId: string;
  userId: string;
  relationship: string | null;
  sentiment: string | null;
  familiarity: string | null;
  keyFacts: string | null;
};

@Injectable()
export class CharacterMemoriesService {
  private readonly logger = new Logger(CharacterMemoriesService.name);

  private readonly RECENT_MESSAGES = 20;
  private readonly FIELD_MAX_LENGTH = 200;
  private readonly KEY_FACTS_MAX_LENGTH = 9800;
  private readonly MODEL = 'anthropic/claude-haiku-4.5';

  constructor(
    @InjectRepository(CharacterMemoryEntity)
    private readonly characterMemoryRepository: Repository<CharacterMemoryEntity>,
    private readonly promptsService: PromptsService,
  ) {}

  findOne(
    characterId: string,
    userId: string,
  ): Promise<CharacterMemoryEntity | null> {
    return this.characterMemoryRepository.findOneBy({ characterId, userId });
  }

  async upsert(
    input: UpsertCharacterMemoryInput,
  ): Promise<CharacterMemoryEntity> {
    const existing = await this.findOne(input.characterId, input.userId);
    if (existing) {
      existing.relationship = input.relationship || existing.relationship;
      existing.sentiment = input.sentiment || existing.sentiment;
      existing.familiarity = input.familiarity || existing.familiarity;
      existing.keyFacts = input.keyFacts || existing.keyFacts;
      return this.characterMemoryRepository.save(existing);
    }

    const memory = this.characterMemoryRepository.create(input);
    return this.characterMemoryRepository.save(memory);
  }

  async update(
    character: CharacterEntity,
    user: UserEntity,
    place: PlaceEntity,
    location: LocationEntity,
    existingMemory: CharacterMemoryEntity | null,
    history: MessageEntity[],
  ): Promise<void> {
    if (history.length === 0) {
      return;
    }

    const recentMessages = history.slice(-this.RECENT_MESSAGES);

    let memory: {
      relationship: string;
      sentiment: string;
      familiarity: string;
      keyFacts: string;
    };
    try {
      const result = await generateText({
        model: this.MODEL,
        prompt: this.promptsService.render('characterMemory/prompt', {
          character,
          user,
          place,
          location,
          existingMemory: existingMemory ?? undefined,
          messages: recentMessages,
        }),
        experimental_telemetry: {
          isEnabled: true,
        },
        output: Output.object({
          schema: z.object({
            relationship: z.string(),
            sentiment: z.string(),
            familiarity: z.string(),
            keyFacts: z.string(),
          }),
        }),
      });
      memory = result.output;
    } catch (error) {
      this.logger.warn(
        `Failed to generate memory for character "${character.id}" and user "${user.id}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return;
    }

    await this.upsert({
      characterId: character.id,
      userId: user.id,
      relationship: this.normalizeField(
        memory.relationship,
        this.FIELD_MAX_LENGTH,
      ),
      sentiment: this.normalizeField(memory.sentiment, this.FIELD_MAX_LENGTH),
      familiarity: this.normalizeField(
        memory.familiarity,
        this.FIELD_MAX_LENGTH,
      ),
      keyFacts: this.normalizeField(memory.keyFacts, this.KEY_FACTS_MAX_LENGTH),
    });
  }

  private normalizeField(value: string, maxLength: number): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (trimmed.length <= maxLength) {
      return trimmed;
    }
    return trimmed.slice(0, maxLength - 1).trimEnd() + '…';
  }
}
