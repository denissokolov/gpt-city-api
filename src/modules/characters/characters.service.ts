import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CharacterEntity,
  CreateCharacterEntityInput,
  UpdateCharacterEntityInput,
} from './character.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(CharacterEntity)
    private readonly characterRepository: Repository<CharacterEntity>,
  ) {}

  findAll(): Promise<CharacterEntity[]> {
    return this.characterRepository.find();
  }

  async findOne(id: string): Promise<CharacterEntity> {
    const character = await this.characterRepository.findOneBy({ id });
    if (!character) {
      throw new NotFoundException(`Character with id "${id}" not found`);
    }
    return character;
  }

  create(dto: CreateCharacterEntityInput): Promise<CharacterEntity> {
    const character = this.characterRepository.create(dto);
    return this.characterRepository.save(character);
  }

  async update(dto: UpdateCharacterEntityInput): Promise<CharacterEntity> {
    const character = await this.findOne(dto.id);
    Object.assign(character, dto);
    return this.characterRepository.save(character);
  }

  async remove(id: string): Promise<void> {
    const character = await this.findOne(id);
    await this.characterRepository.remove(character);
  }
}
