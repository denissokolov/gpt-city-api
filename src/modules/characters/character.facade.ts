import { Injectable } from '@nestjs/common';
import {
  CharacterEntity,
  CreateCharacterEntityInput,
  UpdateCharacterEntityInput,
} from './character.entity';
import { CharactersService } from './characters.service';

@Injectable()
export class CharacterFacade {
  constructor(private readonly charactersService: CharactersService) {}

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
}
