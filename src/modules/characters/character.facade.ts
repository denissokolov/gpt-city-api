import { Injectable } from '@nestjs/common';
import {
  CharacterEntity,
  CreateCharacterEntityInput,
  UpdateCharacterEntityInput,
} from './character.entity';
import { CharactersService } from './characters.service';
import { CharacterMemoryEntity } from './characterMemory.entity';
import { CharacterMemoriesService } from './characterMemories.service';
import { MessageEntity } from '../chats/message.entity';
import { UserEntity } from '../users/user.entity';
import { PlaceEntity } from '../locations/place.entity';
import { LocationEntity } from '../locations/location.entity';

@Injectable()
export class CharacterFacade {
  constructor(
    private readonly charactersService: CharactersService,
    private readonly characterMemoriesService: CharacterMemoriesService,
  ) {}

  findAll(): Promise<CharacterEntity[]> {
    return this.charactersService.findAll();
  }

  findOne(id: string): Promise<CharacterEntity> {
    return this.charactersService.findOne(id);
  }

  findByIds(ids: string[]): Promise<CharacterEntity[]> {
    return this.charactersService.findByIds(ids);
  }

  create(dto: CreateCharacterEntityInput): Promise<CharacterEntity> {
    return this.charactersService.create(dto);
  }

  update(dto: UpdateCharacterEntityInput): Promise<CharacterEntity> {
    return this.charactersService.update(dto);
  }

  remove(id: string): Promise<void> {
    return this.charactersService.remove(id);
  }

  findMemory(
    characterId: string,
    userId: string,
  ): Promise<CharacterMemoryEntity | null> {
    return this.characterMemoriesService.findOne(characterId, userId);
  }

  updateMemory(
    character: CharacterEntity,
    user: UserEntity,
    place: PlaceEntity,
    location: LocationEntity,
    existingMemory: CharacterMemoryEntity | null,
    history: MessageEntity[],
  ): Promise<void> {
    return this.characterMemoriesService.update(
      character,
      user,
      place,
      location,
      existingMemory,
      history,
    );
  }
}
