import { Injectable } from '@nestjs/common';
import { CharacterEntity } from './character.entity';
import { CharactersService } from './characters.service';

@Injectable()
export class CharacterFacade {
  constructor(private readonly charactersService: CharactersService) {}

  findByIds(ids: string[]): Promise<CharacterEntity[]> {
    return this.charactersService.findByIds(ids);
  }
}
